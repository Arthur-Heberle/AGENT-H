# Claude Code Prompt — WhatsApp AI Agent Backend (FastAPI)

> Paste this entire prompt into a Claude Code session.
> Also attach: WHATSAPP_AGENT_ARCHITECTURE.md (the full architecture spec).
> START IN PLAN MODE. Read the spec fully before planning.

---

## FIRST INSTRUCTION

Read `WHATSAPP_AGENT_ARCHITECTURE.md` completely before doing anything. It defines the database schema, the API contract with n8n, the data-ownership rules, and the full system architecture. This prompt and that spec must agree — if you find any contradiction between them, STOP and ask me before proceeding.

Then enter Plan Mode and produce a build plan. Do not write code until I approve the plan.

**Do NOT use subagents.** This is a small, tightly-coupled backend (~6-8 files) where every component shares the same database models, connection pool, and config. Parallel subagents would each reinvent these and create inconsistencies. Build sequentially in dependency order with one agent: foundation first (config → database → models), then endpoints on top.

---

## WHAT YOU ARE BUILDING

The Python FastAPI backend for a WhatsApp AI agent SaaS. The frontend dashboard already exists (`dashboard.html`, `login.html`, `dashboard.css`, `dashboard.js` in `/static`). You are building the backend that:

1. Serves the existing dashboard files
2. Provides the REST API the dashboard calls
3. Provides the `/process` endpoint that n8n calls to run RAG + LLM
4. Handles product embedding for vector search

This runs as a service on Railway alongside n8n and Postgres.

---

## CONFIRMED DECISIONS (do not deviate)

- **Message storage:** store ALL messages — customer, assistant (AI), and owner (manual replies). The `messages.role` column distinguishes them: `'customer' | 'assistant' | 'owner'`.
- **Reply LLM:** configurable via environment variable `LLM_MODEL` and `LLM_API_KEY` / `LLM_BASE_URL`. Do NOT hardcode DeepSeek or any specific provider. Use an OpenAI-compatible client so any provider (DeepSeek, Gemini, OpenAI, Claude via proxy) works by swapping env vars.
- **Embedding model:** OpenAI `text-embedding-3-small`, 1536 dimensions, via env var `EMBEDDING_API_KEY`.
- **Authentication:** Build it LAST, after everything else works. The `login.html` exists, so build JWT-based auth as the final step. Until then, leave a clearly-marked `# TODO: AUTH` dependency stub that allows all requests, so the dashboard works during development.
- **Categories:** 8 furniture defaults, hardcoded in a `categories.py` module, owner can add custom ones (stored as plain text in `products.category`).

---

## DATABASE SCHEMA (already defined in spec — this is the authoritative version)

```sql
-- conversations: per-customer AI on/off
CREATE TABLE conversations (
  customer_phone  VARCHAR(30) NOT NULL,
  customer_name   VARCHAR(200),
  business_phone  VARCHAR(30) NOT NULL,
  ai_enabled      BOOLEAN DEFAULT TRUE,
  updated_at      TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (customer_phone, business_phone)
);

-- messages: all messages (customer, assistant, owner)
CREATE TABLE messages (
  id                SERIAL PRIMARY KEY,
  customer_phone    VARCHAR(30) NOT NULL,
  business_phone    VARCHAR(30) NOT NULL,
  message_time      TIMESTAMP DEFAULT NOW(),
  message           TEXT NOT NULL,
  role              VARCHAR(20) DEFAULT 'customer',  -- customer | assistant | owner
  processing_status VARCHAR(20) DEFAULT 'pending'    -- pending | in_progress | done
);
CREATE INDEX idx_messages_status_time ON messages(processing_status, message_time);
CREATE INDEX idx_messages_conversation ON messages(customer_phone, business_phone, message_time DESC);

-- products: catalog with vector embeddings
CREATE TABLE products (
  id             SERIAL PRIMARY KEY,
  business_phone VARCHAR(30) NOT NULL,
  name           VARCHAR(200) NOT NULL,
  category       VARCHAR(100),
  price          NUMERIC(10,2),
  quantity       INTEGER DEFAULT 0,
  description    TEXT,
  specs          TEXT,
  active         BOOLEAN DEFAULT TRUE,
  embedding      VECTOR(1536),
  updated_at     TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_products_business ON products(business_phone, active);
CREATE INDEX idx_products_embedding ON products USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

Provide these as a `schema.sql` file AND an idempotent init function that runs `CREATE EXTENSION IF NOT EXISTS vector;` and the table creation on startup if tables don't exist.

---

## PROJECT STRUCTURE TO PRODUCE

```
backend/
├── main.py            # FastAPI app, route registration, startup
├── config.py          # env var loading, settings (pydantic-settings)
├── database.py        # asyncpg connection pool, query helpers
├── models.py          # Pydantic request/response models
├── categories.py      # the 8 default categories
├── routes/
│   ├── products.py     # CRUD + embedding
│   ├── conversations.py# list, detail, toggle AI
│   ├── stats.py        # overview KPIs
│   ├── process.py      # the n8n RAG endpoint
│   └── auth.py         # JWT login (built LAST)
├── services/
│   ├── embedding.py    # OpenAI embedding calls
│   ├── rag.py          # vector search + LLM call (LangChain)
│   └── llm.py          # OpenAI-compatible LLM client (provider-agnostic)
├── static/             # existing dashboard files go here
├── schema.sql
├── requirements.txt
├── Dockerfile
├── .env.example
└── README.md
```

---

## API ENDPOINTS TO BUILD

### Dashboard-facing (called by dashboard.js)

```
GET  /api/stats
  → returns overview KPIs for the logged-in business
  → { conversations_today, conversations_delta_pct, avg_response_time_s,
      human_handoffs_today, leads_today, leads_delta_pct,
      volume_7d: [{date, count}, ...] }

GET  /api/conversations?limit=50
  → list conversations for the business, most recent first
  → [{ customer_phone, customer_name, last_message, last_message_time,
       status, ai_enabled }, ...]
  → status derived: 'active' if ai_enabled, 'paused' if not

GET  /api/conversations/{customer_phone}/messages
  → full message history for one conversation, chronological
  → [{ message, role, message_time }, ...]

PUT  /api/conversations/{customer_phone}/toggle-ai
  → body: { ai_enabled: bool }
  → upserts the conversations row, returns updated state

GET  /api/products
  → all products for the business
  → [{ id, name, category, price, quantity, description, specs, active }, ...]

POST /api/products
  → body: { name, category, price, quantity, description, specs }
  → inserts product, GENERATES EMBEDDING, returns created product

PUT  /api/products/{id}
  → body: same as POST
  → updates product, RE-GENERATES EMBEDDING if name/description/specs/category changed
  → returns updated product

DELETE /api/products/{id}
  → soft delete: sets active = false
  → returns { success: true }

GET  /api/categories
  → returns the 8 defaults merged with distinct custom categories already in products
  → [string, ...]
```

### n8n-facing (called by n8n Workflow 2)

```
POST /process
  → body: { customer_phone, business_phone, messages: [{role, content}, ...] }
  → runs RAG: compact query → embed → pgvector search → LLM call
  → returns { reply: string, classification: string }
  → on any failure (embedding/LLM/db) return HTTP 503 so n8n retries
```

### Health

```
GET /health → { status: "ok" }  (for Railway healthcheck)
```

### Auth (BUILD LAST)

```
POST /api/auth/login → body: { email, password } → { token, business_phone }
POST /api/auth/logout
  → JWT-based. Store business owners in a `clients` table (add to schema when building auth).
  → All /api/* routes require valid JWT (dependency injection). /process uses a separate
    shared secret header (n8n → Python), NOT JWT.
```

---

## THE /process ENDPOINT — DETAILED LOGIC

This is the most important endpoint. Build it carefully.

```
1. Receive { customer_phone, business_phone, messages }

2. Build search query:
   - Take customer messages (role='user'/'customer'), last 3
   - If the last message is very short (<20 chars, likely a greeting),
     include the previous customer message too
   - Join into one string. Do NOT remove stop words.

3. Embed the query string via OpenAI text-embedding-3-small (services/embedding.py)

4. pgvector similarity search (services/rag.py):
   SELECT name, category, price, quantity, description, specs,
          1 - (embedding <=> $1) AS similarity
   FROM products
   WHERE business_phone = $2 AND active = true
   ORDER BY embedding <=> $1
   LIMIT 8;

5. Build the LLM prompt:
   - System prompt: business assistant instructions in pt-BR
     + the retrieved products in a compact text format
   - CRITICAL RULE in system prompt: "Se nenhum produto corresponder ao que
     o cliente pediu, diga isso e faça uma pergunta de esclarecimento. NÃO
     recomende um produto errado."
   - Append: "Ao final, em uma linha separada:
     CLASSIFICATION: [QUALIFIED_LEAD|GENERAL_QUESTION|GREETING|OUT_OF_SCOPE]"
   - Messages: the full conversation history from the request

6. Call the LLM (services/llm.py — provider-agnostic OpenAI-compatible client)

7. Parse: split reply on "CLASSIFICATION:", return { reply, classification }

8. Error handling: wrap embedding, search, and LLM in try/except.
   On failure raise HTTPException(503) with a clear detail message.
   Log the error. Never return a 500 that loses the message — n8n needs 503 to retry.
```

The LLM client must be **provider-agnostic**:
```python
# services/llm.py — works with DeepSeek, OpenAI, Gemini (OpenAI-compat), etc.
from openai import AsyncOpenAI
client = AsyncOpenAI(
    api_key=settings.LLM_API_KEY,
    base_url=settings.LLM_BASE_URL,  # e.g. https://api.deepseek.com/v1
)
# model = settings.LLM_MODEL  # e.g. "deepseek-chat"
```

---

## EMBEDDING ON PRODUCT SAVE

When a product is created or updated (POST/PUT /api/products):
1. Concatenate: `f"{name}. {category}. {description}. {specs}"`
2. Call OpenAI text-embedding-3-small
3. Store the returned 1536-dim vector in `products.embedding`
4. Do this synchronously within the request (catalog is small, it's fast)
5. On PUT: only re-embed if name/category/description/specs changed (compare old vs new)

---

## TECHNICAL REQUIREMENTS

- **Async throughout:** use `asyncpg` for Postgres (not psycopg2), `AsyncOpenAI` for API calls. FastAPI async routes. This lets n8n's parallel /process calls run concurrently.
- **Connection pooling:** one asyncpg pool created on startup, reused across requests. Min 2, max 10 connections.
- **Config via pydantic-settings:** all secrets and config from env vars, validated on startup. Fail fast if a required var is missing.
- **CORS:** allow the dashboard origin (same origin since FastAPI serves it, but configure for safety).
- **Multi-tenancy:** every query filters by `business_phone`. For now, since auth is built last, use a single hardcoded `business_phone` from an env var `DEFAULT_BUSINESS_PHONE` until JWT auth provides it per-request. Mark this clearly with `# TODO: replace with JWT-derived business_phone`.
- **Static files:** mount `/static`, serve `dashboard.html` at `/dashboard` and `login.html` at `/login`. Root `/` redirects to `/dashboard`.

---

## ENVIRONMENT VARIABLES (.env.example)

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Embedding (OpenAI)
EMBEDDING_API_KEY=sk-...
EMBEDDING_MODEL=text-embedding-3-small

# Reply LLM (provider-agnostic, OpenAI-compatible)
LLM_API_KEY=...
LLM_BASE_URL=https://api.deepseek.com/v1
LLM_MODEL=deepseek-chat

# n8n → Python shared secret (for /process auth)
PROCESS_SECRET=change-me-to-random-string

# Multi-tenancy stopgap (until JWT auth)
DEFAULT_BUSINESS_PHONE=5547999998888

# Auth (used when auth is built)
JWT_SECRET=change-me
JWT_EXPIRY_HOURS=24
```

---

## requirements.txt

```
fastapi
uvicorn[standard]
asyncpg
pgvector
openai
pydantic
pydantic-settings
python-jose[cryptography]
passlib[bcrypt]
python-multipart
```

(LangChain is optional here — the RAG is simple enough to do with direct asyncpg + openai calls. Only add langchain if it genuinely simplifies. Prefer direct calls for fewer dependencies and lower memory on Railway. Note this decision in the plan.)

---

## Dockerfile

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## BUILD ORDER (sequential, no subagents)

1. **Foundation:** config.py → database.py (pool + init) → models.py → categories.py
2. **schema.sql** + startup init function
3. **Products endpoints** (CRUD + embedding) — test with curl, confirm embeddings populate
4. **Conversations endpoints** (list, detail, toggle) — test with curl
5. **Stats endpoint** — test with curl
6. **/process endpoint** (RAG + LLM) — the core; test with a sample n8n payload
7. **Static file serving** — confirm dashboard.html loads and calls work
8. **Auth (LAST):** clients table, JWT login, protect /api/* routes, wire login.html
9. **README** with setup + Railway deploy steps

After each step, give me a curl command to verify it works before moving on.

---

## WHAT TO DELIVER IN PLAN MODE FIRST

Before writing code, show me:
1. The complete file tree you'll create
2. Your decision on LangChain vs direct calls (with reasoning)
3. The order you'll build in
4. Any contradictions you found between this prompt and the architecture spec
5. Any decisions you need me to make

Wait for my approval before building.

---

## SELF-REVIEW BEFORE DELIVERING

After building, verify:
- Every query filters by business_phone (multi-tenancy)
- /process returns 503 on failure, never 500
- Embeddings are generated on both POST and PUT (when relevant fields change)
- The LLM client is provider-agnostic (no hardcoded DeepSeek)
- Auth protects /api/* but /process uses the shared secret instead
- asyncpg pool is reused, not recreated per request
- All secrets come from env vars, nothing hardcoded
