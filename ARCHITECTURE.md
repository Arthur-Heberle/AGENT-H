# ARCHITECTURE.md — System Architecture

## System Overview

```
Customer (WhatsApp)
    │ sends message
    ▼
Evolution API (WhatsApp Gateway)
    │ webhook
    ▼
n8n Workflow
    │ 1. Waits 30s debounce (prevents replying mid-sentence)
    │ 2. Writes customer message to `messages` table (status=pending)
    │ 3. POST /process  {customer_phone, business_phone, messages[]}
    ▼
FastAPI Backend (/process endpoint)
    │ 1. Check business hours (from client_settings.business_hours JSONB)
    │ 2. Extract last 3 customer messages → query string
    │ 3. Embed query (OpenAI text-embedding-3-small, 1536 dims)
    │ 4. pgvector similarity search → top 8 products
    │ 5. Build prompt: system_prompt + products + conversation history
    │ 6. LLM call (OpenAI-compatible, configurable provider e.g. DeepSeek)
    │ 7. Parse classification from LLM reply
    │ 8. If QUALIFIED_LEAD → upsert into `leads` table (Python-owned, n8n does not touch it)
    │ Returns: {reply, classification}
    ▼
n8n Workflow (resumes)
    │ 1. Writes assistant message to `messages` table (status=done, classification=...)
    │ 2. POST Evolution API → sends reply to customer
    ▼
Customer receives reply on WhatsApp
```

Dashboard users interact with the FastAPI backend directly (JWT-authenticated REST API).

## Database Schema

**PostgreSQL + pgvector extension**

### `clients` — SaaS users (one row per registered business)

| Column | Type | Notes |
|--------|------|-------|
| id | SERIAL PK | |
| email | VARCHAR(200) UNIQUE | Login credential |
| password_hash | TEXT | bcrypt |
| business_phone | VARCHAR(30) UNIQUE | Multi-tenancy key (also JWT sub) |
| business_name | VARCHAR(200) | |
| created_at | TIMESTAMP | |

### `client_settings` — Per-business AI configuration

| Column | Type | Notes |
|--------|------|-------|
| business_phone | VARCHAR(30) PK | FK to clients.business_phone |
| system_prompt | TEXT | Agent persona/behavior instructions |
| ai_language | VARCHAR(10) | `'auto'` \| `'pt'` \| `'en'` |
| business_hours | JSONB | `{"mon": {"enabled": true, "open": "09:00", "close": "18:00"}, ...}` |
| updated_at | TIMESTAMP | |

### `conversations` — One row per customer per business

| Column | Type | Notes |
|--------|------|-------|
| customer_phone | VARCHAR(30) | Composite PK |
| business_phone | VARCHAR(30) | Composite PK |
| customer_name | VARCHAR(200) | |
| ai_enabled | BOOLEAN | Default true; toggled by dashboard user |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### `messages` — All conversation history

| Column | Type | Notes |
|--------|------|-------|
| id | SERIAL PK | |
| customer_phone | VARCHAR(30) | |
| business_phone | VARCHAR(30) | |
| message | TEXT | |
| role | VARCHAR(20) | `'customer'` \| `'assistant'` \| `'employee'` |
| processing_status | VARCHAR(20) | `'pending'` → `'in_progress'` → `'done'` |
| classification | VARCHAR(30) | `QUALIFIED_LEAD` \| `GENERAL_QUESTION` \| `GREETING` \| `OUT_OF_SCOPE` |
| created_at | TIMESTAMP | |

Indexes: `idx_messages_status_time(processing_status, created_at)`, `idx_messages_conversation(customer_phone, business_phone, created_at DESC)`

### `products` — Product catalog with embeddings

| Column | Type | Notes |
|--------|------|-------|
| id | SERIAL PK | |
| business_phone | VARCHAR(30) | Multi-tenancy filter |
| name | VARCHAR(200) | Included in embedding |
| category | VARCHAR(100) | Default list in `categories.py` or custom |
| price | NUMERIC(10,2) | Not embedded |
| quantity | INTEGER | Not embedded |
| description | TEXT | Included in embedding |
| specs | TEXT | Included in embedding |
| active | BOOLEAN | Soft delete flag |
| embedding | VECTOR(1536) | OpenAI text-embedding-3-small |
| image_url | TEXT | Optional. Path like `/static/uploads/{biz_phone}/{id}.{ext}` |
| updated_at | TIMESTAMP | |

Indexes: `idx_products_business(business_phone, active)`, IVFFlat index on embedding (cosine, lists=100)

**Embedding strategy:** Re-embed only when `name`, `description`, or `specs` change. Price/quantity changes do NOT trigger re-embedding.

**Image uploads:** Stored at `backend/static/uploads/{business_phone}/{product_id}.{ext}` and served via the existing `/static` mount. URL saved in `products.image_url`. Ephemeral on Railway — swap `backend/api/routes/products.py:upload_product_image` to write to object storage (S3, R2) when needed.

### `leads` — Qualified leads captured by the AI agent

| Column | Type | Notes |
|--------|------|-------|
| business_phone | VARCHAR(30) | Composite PK |
| customer_phone | VARCHAR(30) | Composite PK |
| customer_name | VARCHAR(200) | Copied from `conversations` at upsert time |
| summary | TEXT | Lead summary from LLM, refreshed on each QUALIFIED_LEAD |
| status | VARCHAR(20) | `new` \| `contacted` \| `won` \| `lost` (default `new`) |
| created_at | TIMESTAMP | Row first created |
| updated_at | TIMESTAMP | Updated on each AI upsert or manual status change |

**Write path:** `services/rag.py` upserts into `leads` every time the LLM classifies a conversation as `QUALIFIED_LEAD`. Manual status changes come from `PUT /api/leads/{customer_phone}` (dashboard only — n8n does not touch this table).

## Environment Variables

File: `backend/.env` (never committed)

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | `postgresql://user:pass@localhost:5432/db` | asyncpg connection string |
| `EMBEDDING_API_KEY` | Yes | `sk-...` | OpenAI key for text-embedding-3-small |
| `EMBEDDING_MODEL` | No | `text-embedding-3-small` | Defaults to this value |
| `LLM_API_KEY` | Yes | `sk-...` | Key for LLM provider (OpenAI-compatible) |
| `LLM_BASE_URL` | Yes | `https://api.deepseek.com/v1` | Provider base URL |
| `LLM_MODEL` | Yes | `deepseek-chat` | Model name at provider |
| `PROCESS_SECRET` | Yes | `random-string-32chars` | Shared secret n8n sends in `X-Process-Secret` header |
| `DEFAULT_BUSINESS_PHONE` | Yes | `+5511999999999` | Fallback business_phone when JWT not present |
| `JWT_SECRET` | Yes | `random-string-32chars` | JWT signing secret (HS256) |
| `JWT_EXPIRY_HOURS` | No | `24` | Token TTL, defaults to 24 |
| `EVOLUTION_API_URL` | No | `https://evolution.railway.app` | WhatsApp gateway base URL |
| `EVOLUTION_API_KEY` | No | `evolution-key` | Evolution API key |
| `EVOLUTION_INSTANCE` | No | `my-instance` | Evolution instance name |

## Multi-Tenancy Pattern

Every resource belongs to a `business_phone`. The JWT token's `sub` claim IS the `business_phone`. All repository queries filter by it:

```python
# Pattern used in every repository function
await conn.fetch(
    "SELECT * FROM products WHERE business_phone = $1 AND active = true",
    business_phone
)
```

The `business_phone` is injected via FastAPI dependency `get_business_phone()` in `core/deps.py`.
