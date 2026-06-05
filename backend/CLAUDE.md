# backend/CLAUDE.md — Backend Deep-Dive

## Architecture: Layered (Routes → Services → Repositories)

```
api/routes/      HTTP handlers (FastAPI routers) — validate input, call service, return response
services/        Business logic + external API calls (LLM, embeddings, Evolution API)
repositories/    SQL queries only — accept conn + params, return rows
core/            Infrastructure (config, DB pool, security, DI)
models/          Pydantic DTOs (request bodies + response shapes)
```

**Never put SQL in routes or services.** Repositories are the only SQL layer.  
**Never put HTTP logic in services.** Services return data, not HTTP responses.

## Entry Point: main.py

Registers 6 routers with `/api` prefix:
- `auth` → `/api/auth/*`
- `conversations` → `/api/conversations/*`
- `products` → `/api/products/*`
- `stats` → `/api/stats`
- `settings` → `/api/profile`, `/api/settings`
- `process` → `/process` (no `/api` prefix — called by n8n)

Mounts `/static` directory. Serves `/dashboard` and `/login` HTML pages.

## How to Add a New Feature

**Example: adding a `notes` field to products**

1. **Schema change:** Add column to `schema.sql`. Schema runs on startup via `core/database.py:init_db()`.
2. **Model change:** Update `models/product.py` — add field to `ProductIn` and `ProductOut`.
3. **Repository change:** Update SQL in `repositories/products.py` — add to INSERT, UPDATE, SELECT.
4. **Service change:** If embedding logic affected, update `services/product_service.py`.
5. **Route change:** Usually nothing — routes just pass models through.

## API Endpoints Reference

| Method | Path | Auth | Service | Purpose |
|--------|------|------|---------|---------|
| POST | `/api/auth/login` | None | — | Email+password → JWT |
| POST | `/api/auth/logout` | None | — | Clears session (client-side only) |
| POST | `/api/auth/register` | None | `sms.send_otp()` | Start OTP flow |
| POST | `/api/auth/verify-otp` | None | — | Complete registration, return JWT |
| GET | `/api/conversations` | JWT soft | `stats_service` | List conversations (JOIN last message) |
| GET | `/api/conversations/{phone}/messages` | JWT soft | — | Full message history |
| PUT | `/api/conversations/{phone}/toggle-ai` | JWT soft | — | Toggle `ai_enabled` flag |
| GET | `/api/products` | JWT soft | — | List active products |
| POST | `/api/products` | JWT soft | `product_service.create_product()` | Create + embed |
| PUT | `/api/products/{id}` | JWT soft | `product_service.update_product()` | Update + conditionally re-embed |
| DELETE | `/api/products/{id}` | JWT soft | — | Soft delete (active=false) |
| GET | `/api/categories` | JWT soft | — | Default + custom categories merged |
| GET | `/api/stats` | JWT soft | `stats_service.get_stats()` | KPI metrics |
| GET | `/api/profile` | JWT required | — | Business profile |
| PUT | `/api/profile` | JWT required | — | Update business name |
| DELETE | `/api/account` | JWT required | — | Delete account (cascades) |
| GET | `/api/settings` | JWT required | — | AI settings |
| PUT | `/api/settings` | JWT required | — | Upsert AI settings |
| POST | `/process` | X-Process-Secret | `rag.process_message()` | n8n RAG call |
| GET | `/health` | None | — | `{"status": "ok"}` |

**"JWT soft"** = auth is attempted but not required; falls back to `DEFAULT_BUSINESS_PHONE` env var.  
**"JWT required"** = 401 if no valid token.

## Authentication Pattern

```python
# core/deps.py
async def get_business_phone(token: str = Depends(oauth2_scheme)) -> str:
    # Decodes JWT → returns business_phone (JWT sub claim)
    # Falls back to DEFAULT_BUSINESS_PHONE if no token

async def require_auth(token: str = Depends(oauth2_scheme)) -> str:
    # Same but raises 401 if token missing/invalid

async def require_process_secret(secret: str = Header(alias="X-Process-Secret")) -> str:
    # Used only on /process endpoint — shared secret with n8n
```

OTP storage is **in-memory** (`dict` in `api/routes/auth.py`): `{phone: {code, expires_at, data}}`. Resets on restart — acceptable for MVP but needs Redis or DB for production scale.

## RAG Pipeline: services/rag.py

`process_message(business_phone, customer_phone, messages)` orchestrates:

1. Load `client_settings` (system prompt, language, business hours)
2. Check business hours (São Paulo timezone, `America/Sao_Paulo`) — returns canned out-of-hours reply if closed
3. Build query string from last 3 customer messages
4. `embedding.embed(query)` → 1536-dim float list
5. `products_repo.similarity_search(vector, business_phone, limit=8)` → pgvector cosine distance
6. Assemble prompt: custom system prompt + formatted product block + classification instructions
7. `llm.chat(messages)` → LLM reply (OpenAI-compatible API)
8. Parse `CLASSIFICATION: <type>` from reply end — strips it from user-visible reply
9. Return `ProcessOut(reply=..., classification=...)`

Classifications: `QUALIFIED_LEAD | GENERAL_QUESTION | GREETING | OUT_OF_SCOPE`

## Repositories Pattern

All repository functions:
- Accept `conn: asyncpg.Connection` as first arg (passed from route via `get_db()` dependency)
- Accept `business_phone: str` for multi-tenancy filtering
- Return `asyncpg.Record` or `list[asyncpg.Record]`
- Never raise HTTP exceptions — that's the route/service layer's job

```python
# Pattern (repositories/products.py)
async def list_products(conn: asyncpg.Connection, business_phone: str) -> list[asyncpg.Record]:
    return await conn.fetch(
        "SELECT * FROM products WHERE business_phone = $1 AND active = true ORDER BY id DESC",
        business_phone
    )
```

## Core Infrastructure

| File | Purpose |
|------|---------|
| `core/config.py` | Pydantic `Settings` class — loads all env vars. Import: `from core.config import settings` |
| `core/database.py` | Creates asyncpg pool (`init_db()`), stores in `app.state.db`. `get_db()` yields a connection. Runs `schema.sql` on startup. |
| `core/security.py` | `hash_password(plain)`, `verify_password(plain, hashed)`, `create_token(business_phone)`, `decode_token(token)` |
| `core/deps.py` | FastAPI dependencies: `get_db`, `get_business_phone`, `require_auth`, `require_process_secret` |

## Services Reference

| Service | Key Function | What It Does |
|---------|-------------|--------------|
| `services/rag.py` | `process_message()` | Full RAG pipeline (see above) |
| `services/llm.py` | `chat(messages, system)` | OpenAI-compatible chat completion |
| `services/embedding.py` | `embed(text)` | Returns 1536-dim float list |
| `services/product_service.py` | `create_product()`, `update_product()` | Handles embedding logic + repo calls |
| `services/stats_service.py` | `get_stats()` | Aggregates KPI metrics from DB |
| `services/sms.py` | `send_otp(phone, code)` | POST to Evolution API WhatsApp send endpoint |

## Categories

Default categories: `categories.py` → `DEFAULT_CATEGORIES` (furniture list in Portuguese).  
Custom categories: `SELECT DISTINCT category FROM products WHERE business_phone = $1`.  
`GET /api/categories` merges both lists and deduplicates.
