# WhatsApp AI Agent — FastAPI Backend

Python FastAPI service for the WhatsApp AI agent SaaS. Serves the dashboard UI, REST API for the dashboard, and the `/process` RAG endpoint called by n8n.

## Quick start (local)

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in real values
uvicorn main:app --reload --port 8000
```

Open <http://localhost:8000/dashboard>.

## Seeding a client (first-time auth)

```python
# run once in a Python shell with the venv active and .env loaded
import asyncio, asyncpg
from core.config import settings
from core.security import hash_password

async def seed():
    conn = await asyncpg.connect(settings.DATABASE_URL)
    await conn.execute(
        "INSERT INTO clients (email, password_hash, business_phone, business_name) VALUES ($1,$2,$3,$4)",
        "admin@yourstore.com",
        hash_password("change-me"),
        settings.DEFAULT_BUSINESS_PHONE,
        "Minha Loja",
    )
    await conn.close()

asyncio.run(seed())
```

## Railway deployment

1. Create a new Railway service from this repo (or push from CLI with `railway up`).
2. Set all environment variables from `.env.example` in Railway → Variables.
3. Railway auto-detects the `Dockerfile`.
4. Add a health check: `GET /health` → expects `{"status":"ok"}`.
5. Note the internal Railway URL for n8n → Python calls (faster, no egress):
   `http://<service-name>.railway.internal:8000`

## Environment variables

See `.env.example` for the full list. Minimum required:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (Railway provides this) |
| `EMBEDDING_API_KEY` | OpenAI API key for `text-embedding-3-small` |
| `LLM_API_KEY` | LLM provider API key (OpenAI-compatible) |
| `LLM_BASE_URL` | LLM provider base URL (e.g. `https://api.deepseek.com/v1`) |
| `LLM_MODEL` | Model name (e.g. `deepseek-chat`) |
| `PROCESS_SECRET` | Shared secret between n8n and this service |
| `DEFAULT_BUSINESS_PHONE` | Business phone until multi-tenant JWT is in use |
| `JWT_SECRET` | Secret for signing JWT tokens |

## n8n integration contract

Build n8n workflows to use these **exact SQL queries** against the shared Postgres database.

### Workflow 1 — WhatsApp Receiver (save incoming message)

```sql
INSERT INTO messages (customer_phone, business_phone, message, role, processing_status)
VALUES ($1, $2, $3, 'customer', 'pending');
-- $1 = customerPhone, $2 = businessPhone, $3 = messageText
```

### Workflow 2 — Processor (every 30s)

**Step 1 — Find ready conversations (>30s debounce):**
```sql
SELECT customer_phone, business_phone, MAX(created_at) AS last_message_at
FROM messages
WHERE processing_status = 'pending'
  AND created_at < NOW() - INTERVAL '30 seconds'
GROUP BY customer_phone, business_phone;
```

**Step 2 — Lock (prevent double-processing):**
```sql
UPDATE messages
SET processing_status = 'in_progress'
WHERE customer_phone = $1
  AND business_phone = $2
  AND processing_status = 'pending';
```

**Step 3 — Fetch last 8 messages for context:**
```sql
SELECT message, role, created_at
FROM messages
WHERE customer_phone = $1 AND business_phone = $2
ORDER BY created_at DESC LIMIT 8;
-- Reverse to chronological order before sending to /process
-- Map role: customer → "user", anything else → "assistant"
-- Send as [{role, content: message}]
```

**Step 4 — Call `/process` (HTTP POST):**
```
POST http://<internal-url>:8000/process
Header: X-Process-Secret: <PROCESS_SECRET>
Body: {
  "customer_phone": "...",
  "business_phone": "...",
  "messages": [{"role":"user","content":"..."}]
}
Response: { "reply": "...", "classification": "QUALIFIED_LEAD|GENERAL_QUESTION|GREETING|OUT_OF_SCOPE" }
```
- Timeout: 45 000ms. Retry on fail: 2 retries, 3 000ms wait.
- On failure → reset to pending (Step 4b below) so next trigger retries.

**Step 4b — Reset on failure:**
```sql
UPDATE messages SET processing_status = 'pending'
WHERE customer_phone = $1 AND business_phone = $2
  AND processing_status = 'in_progress';
```

**Step 5 — Save AI reply (includes classification for leads KPI):**
```sql
INSERT INTO messages (customer_phone, business_phone, message, role, processing_status, classification)
VALUES ($1, $2, $3, 'assistant', 'done', $4);
-- $3 = reply text, $4 = classification string
```

**Step 6 — Mark original messages done:**
```sql
UPDATE messages SET processing_status = 'done'
WHERE customer_phone = $1 AND business_phone = $2
  AND processing_status = 'in_progress';
```

**Step 7 — Send via Evolution API:**
```
POST https://<evolution-url>/message/sendText/<businessPhone>
Header: apikey: <EVOLUTION_KEY>
Body: { "number": "<customerPhone>", "text": "<reply>" }
```

## API endpoints (dashboard)

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/stats` | Overview KPIs |
| `GET` | `/api/conversations` | List conversations |
| `GET` | `/api/conversations/{phone}/messages` | Message history |
| `PUT` | `/api/conversations/{phone}/toggle-ai` | Toggle AI on/off |
| `GET` | `/api/products` | List products |
| `POST` | `/api/products` | Create + embed product |
| `PUT` | `/api/products/{id}` | Update + re-embed if needed |
| `DELETE` | `/api/products/{id}` | Soft delete |
| `GET` | `/api/categories` | Default + custom categories |
| `POST` | `/api/auth/login` | Get JWT token |
| `POST` | `/api/auth/logout` | Logout (client discards token) |
| `GET` | `/health` | Railway healthcheck |

## Architecture

```
api/routes/      ← thin HTTP controllers (validate → call service → return DTO)
services/        ← business logic (RAG, embedding, stats, product service)
repositories/    ← all SQL (asyncpg, no business logic)
core/            ← config, DB pool, deps/DI, security
models/          ← Pydantic DTOs
```
