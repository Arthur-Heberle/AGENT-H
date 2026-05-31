# WhatsApp AI Agent — Architecture Spec
### Version 2 — All decisions confirmed. Ready for implementation.

> **How to use this file:**
> Load into a new Claude session. Say:
> *"I'm building this system step by step. Follow the BUILD ORDER exactly.
> Don't skip ahead. When I confirm a step works, move to the next one."*

---

## WHAT THIS IS

A WhatsApp AI agent for product-catalog customer service.
Receives customer messages → waits for them to finish typing → searches the product catalog semantically → replies via LLM.

Built to be sold as a SaaS to Brazilian SMEs (furniture stores, clothing shops, food businesses, etc).

---

## CONFIRMED STACK

| Component | Technology | Hosting |
|---|---|---|
| Orchestration | n8n | Railway (existing project) |
| Python brain + dashboard | FastAPI | Railway (new service, same project) |
| Database (SQL + vector) | Postgres + pgvector | Railway (existing Postgres) |
| WhatsApp gateway | Evolution API v2.3+ | Railway (separate project) |
| Embedding model | OpenAI text-embedding-3-small | API call (external) |
| Reply LLM | DeepSeek V4 Flash | API call (external) |
| Dashboard UI | HTML + JS served by FastAPI | Same Railway Python service |

**No Vercel. No separate vector DB. No load balancer.**
One Railway project: n8n + Python + Postgres. Everything on the same internal network.

---

## HOW EACH PIECE TALKS TO THE OTHERS

```
[WhatsApp customer]
      ↓ message
[Evolution API] ──webhook──→ [n8n Workflow 1] ──INSERT──→ [Postgres]
                                                                ↑
[n8n Workflow 2] ──SELECT──────────────────────────────────────┘
      │ every 30s, checks for ready conversations
      │
      ├──HTTP POST /process──→ [Python FastAPI]
      │                              │
      │                         LangChain RAG:
      │                         1. compact messages
      │                         2. embed query
      │                         3. pgvector search → products
      │                         4. LLM call → reply
      │                              │
      ←────────── { reply } ─────────┘
      │
      ├──INSERT reply──→ [Postgres]
      └──HTTP POST──→ [Evolution API] ──→ [WhatsApp customer]

[Owner browser]
      ↓ opens URL
[Python FastAPI /dashboard] → serves HTML page
      ↓ clicks add/edit product
[Python FastAPI /products] → INSERT/UPDATE Postgres + re-embed
```

**Data ownership rule (never break this):**
- Only n8n writes to: `messages`, `conversations`
- Only Python writes to: `products`, vector embeddings
- Both READ from everything they need

---

## RAILWAY PROJECT LAYOUT

```
Railway Project: "whatsapp-agent"
├── n8n              (existing)
├── Python FastAPI   (new service to create)
└── Postgres         (existing, add pgvector extension)

Railway Project: "evolution-api"  (separate, already exists)
└── Evolution API
```

**How services find each other inside Railway:**
Railway gives each service an internal hostname like `python-service.railway.internal`.
Use internal URLs for n8n → Python calls (faster, no egress cost).
Python FastAPI gets a public URL automatically: `https://your-python.up.railway.app`
That public URL is what you open in your browser for the dashboard.

---

## DATABASE SCHEMA

### Enable pgvector (run once in Railway Postgres query runner)
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### messages table (exists — migrate processing column)
```sql
-- Add new status column
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS processing_status VARCHAR(20) DEFAULT 'idle';

-- Migrate existing data from old boolean column
UPDATE messages SET processing_status = CASE
  WHEN processing = true THEN 'pending'
  ELSE 'idle'
END;

-- After new workflow confirmed working, drop old column:
-- ALTER TABLE messages DROP COLUMN processing;

-- Add index for the poller query (critical for performance at scale)
CREATE INDEX IF NOT EXISTS idx_messages_status_created
ON messages(processing_status, created_at);
```

**processing_status states:**
- `idle` → AI disabled for this conversation, skip
- `pending` → waiting to be processed (customer message saved, not yet answered)
- `in_progress` → poller picked it up, LLM running right now (lock state)
- `done` → reply sent successfully

### conversations table (human takeover + AI pause per customer)
```sql
CREATE TABLE IF NOT EXISTS conversations (
  customer_phone  VARCHAR(30) NOT NULL,
  business_phone  VARCHAR(30) NOT NULL,
  ai_enabled      BOOLEAN DEFAULT TRUE,
  human_took_over BOOLEAN DEFAULT FALSE,
  auto_resume_at  TIMESTAMP NULL,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (customer_phone, business_phone)
);
```

### products table (Python owns; migrate from Google Sheets)
```sql
CREATE TABLE IF NOT EXISTS products (
  id            SERIAL PRIMARY KEY,
  business_phone VARCHAR(30) NOT NULL,
  name          VARCHAR(200) NOT NULL,
  category      VARCHAR(100),
  price         NUMERIC(10,2),
  stock         INTEGER DEFAULT 0,
  description   TEXT,
  specs         TEXT,
  active        BOOLEAN DEFAULT TRUE,
  embedding     VECTOR(1536),  -- OpenAI text-embedding-3-small = 1536 dimensions
  updated_at    TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_business
ON products(business_phone, active);

-- pgvector index for similarity search
CREATE INDEX IF NOT EXISTS idx_products_embedding
ON products USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

### settings table (global flags like business hours, AI on/off)
```sql
CREATE TABLE IF NOT EXISTS settings (
  key        VARCHAR(50) PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO settings (key, value) VALUES
  ('ai_enabled_global', 'true'),
  ('business_hours_start', '6'),
  ('business_hours_end', '22')
ON CONFLICT (key) DO NOTHING;
```

---

## N8N WORKFLOW 1 — "WA Receiver"

**Purpose:** receive fast, save fast, end. Target execution: < 0.5s.
**Trigger:** WhatsApp webhook POST from Evolution API.

### Nodes in order:

**1. Webhook**
- Path: `/whatsapp-receiver`
- Method: POST
- Response Mode: `Immediately` ← critical, returns 200 to Evolution before doing anything

**2. Validate Message (IF — ALL conditions must be true)**
- `{{ $json.body.event }}` equals `messages.upsert`
- `{{ $json.body.data.key.fromMe }}` equals `false`
- `{{ $json.body.data.key.remoteJid }}` does not contain `@g.us`
- FALSE → NoOp (end silently)

**3. Check Business Hours (IF)**
- `{{ new Date().getHours() >= 6 && new Date().getHours() < 22 }}` equals `true`
- FALSE → (optional) send "estamos fechados, retornamos às 6h" via Evolution API, then end
- TRUE → continue

**4. Extract Data (Set — Keep Only Set: ON)**

| Field | Expression |
|---|---|
| customerPhone | `{{ $json.body.data.key.remoteJid.replace('@s.whatsapp.net','') }}` |
| businessPhone | `{{ $json.body.instance }}` |
| messageText | `{{ $json.body.data.message.conversation \|\| $json.body.data.message.extendedTextMessage?.text \|\| '' }}` |

**5. Skip If Empty (IF)**
- `{{ $json.messageText }}` is not empty → TRUE continues
- FALSE → NoOp (image/sticker/audio without caption, skip silently)

**6. Save to DB (Postgres — parameterized query)**
```sql
INSERT INTO messages
  (customer_phone, business_phone, content, role, from_me, processing_status)
VALUES ($1, $2, $3, 'customer', false, 'pending');
```
Parameters: `$1`=customerPhone, `$2`=businessPhone, `$3`=messageText

---

## N8N WORKFLOW 2 — "WA Processor"

**Purpose:** every 30s, find conversations ready to answer, call Python, send reply.
**Trigger:** Schedule, every 30 seconds.

### Nodes in order:

**1. Schedule Trigger**
- Every 30 seconds

**2. Find Ready Conversations (Postgres)**
```sql
SELECT
  customer_phone,
  business_phone,
  MAX(created_at) AS last_message_at,
  COUNT(*) AS pending_count
FROM messages
WHERE processing_status = 'pending'
  AND created_at < NOW() - INTERVAL '30 seconds'
GROUP BY customer_phone, business_phone;
```

**3. Any Results? (IF) ← THE COST SAVER**
- `{{ $input.all().length > 0 }}` equals `true`
- FALSE → END IMMEDIATELY (idle exit, ~50ms, costs almost nothing)
- TRUE → continue, n8n fans out one item per conversation

**4. Lock Conversation (Postgres) ← MANDATORY**
Prevents double-processing if LLM call takes > 30s.
```sql
UPDATE messages
SET processing_status = 'in_progress'
WHERE customer_phone = $1
  AND business_phone = $2
  AND processing_status = 'pending';
```
Parameters: `$1`=customerPhone, `$2`=businessPhone

**5. Fetch Last 8 Messages (Postgres)**
```sql
SELECT content, role, created_at
FROM messages
WHERE customer_phone = $1
  AND business_phone = $2
ORDER BY created_at DESC
LIMIT 8;
```

**6. Format Messages for Python (Code node)**
```javascript
const rows = $input.all().map(i => i.json).reverse(); // chronological order
const messages = rows.map(r => ({
  role: r.role === 'customer' ? 'user' : 'assistant',
  content: r.content
}));
const conv = $('Find Ready Conversations').item.json;
return [{ json: {
  customer_phone: conv.customer_phone,
  business_phone: conv.business_phone,
  messages
}}];
```

**7. Call Python /process (HTTP Request)**
- Method: POST
- URL: `http://python-service.railway.internal:8000/process`
  *(use Railway internal URL — faster, no egress)*
- Body (JSON):
```json
{
  "customer_phone": "{{ $json.customer_phone }}",
  "business_phone": "{{ $json.business_phone }}",
  "messages": {{ JSON.stringify($json.messages) }}
}
```
- Timeout: 45000ms (LLM can be slow)
- Retry on Fail: ON, max 2 tries, wait 3000ms
- On error → go to node 8b (failure handler)

**8a. Save AI Reply (Postgres) — success path**
```sql
INSERT INTO messages
  (customer_phone, business_phone, content, role, from_me, processing_status)
VALUES ($1, $2, $3, 'assistant', true, 'done');
```
Parameters: `$1`=customerPhone, `$2`=businessPhone, `$3`=`{{ $json.reply }}`

**8b. Reset to Pending (Postgres) — failure path**
If Python is down or timed out: reset so next 30s trigger retries.
```sql
UPDATE messages SET processing_status = 'pending'
WHERE customer_phone = $1
  AND business_phone = $2
  AND processing_status = 'in_progress';
```

**9. Mark Conversation Done (Postgres)**
```sql
UPDATE messages SET processing_status = 'done'
WHERE customer_phone = $1
  AND business_phone = $2
  AND processing_status = 'in_progress';
```

**10. Send Reply via Evolution API (HTTP Request)**
- Method: POST
- URL: `https://YOUR-EVOLUTION.up.railway.app/message/sendText/{{ $json.business_phone }}`
- Header Auth credential: `apikey: YOUR_EVOLUTION_KEY`
- Body:
```json
{
  "number": "{{ $json.customer_phone }}",
  "text": "{{ $json.reply }}"
}
```
- Retry on Fail: ON, max 3, wait 2000ms

---

## PYTHON FASTAPI SERVICE

### What it does
- Serves the dashboard HTML at `/dashboard`
- Handles product CRUD API at `/products`
- Handles RAG + LLM at `/process` (called by n8n)
- Handles catalog embedding when products change

### Project structure
```
python-service/
├── main.py           ← FastAPI app, all routes
├── rag.py            ← LangChain RAG logic
├── database.py       ← Postgres connection
├── models.py         ← Pydantic request/response models
├── static/
│   └── dashboard.html ← dashboard UI (HTML + JS)
├── requirements.txt
└── Dockerfile        ← for Railway deployment
```

### Key routes

```
GET  /dashboard          → serves dashboard.html
GET  /products           → list all products (JSON)
POST /products           → add product + embed it
PUT  /products/{id}      → edit product + re-embed
DELETE /products/{id}    → soft delete (active=false)
POST /process            → called by n8n, runs RAG + LLM
GET  /health             → Railway health check (returns 200)
```

### /process endpoint contract

**Request from n8n:**
```json
{
  "customer_phone": "5511999999999",
  "business_phone": "5511888888888",
  "messages": [
    {"role": "user", "content": "oi, tem sofá de couro?"},
    {"role": "assistant", "content": "Olá! Sim, temos..."},
    {"role": "user", "content": "qual o preço?"}
  ]
}
```

**Response to n8n:**
```json
{
  "reply": "Temos o Sofá Milano de couro por R$2.890...",
  "classification": "QUALIFIED_LEAD"
}
```

### /process internal steps (LangChain)

1. **Compact messages into one query string**
   Concatenate the last 3 customer messages (role=user) into one string.
   Example: "oi, tem sofá de couro? qual o preço?" → this becomes the search query.
   Do NOT remove stop words — embeddings handle natural language fine.

2. **Embed the query**
   OpenAI `text-embedding-3-small` → 1536-dimension vector.

3. **pgvector similarity search**
   ```sql
   SELECT name, category, price, stock, description, specs,
          1 - (embedding <=> $1) AS similarity
   FROM products
   WHERE business_phone = $2
     AND active = true
   ORDER BY embedding <=> $1
   LIMIT 8;
   ```
   Returns top 8 most semantically similar products.

4. **Build prompt**
   System: business instructions + retrieved products (compressed format)
   Messages: full conversation history from request

5. **LLM call (DeepSeek V4 Flash)**
   Prompt rule: *"If none of the retrieved products match what the customer asked,
   say so and ask a clarifying question. Do NOT recommend a wrong product."*
   End of reply must include: `CLASSIFICATION: [QUALIFIED_LEAD|GENERAL_QUESTION|GREETING|OUT_OF_SCOPE]`

6. **Parse and return**
   Split reply on `CLASSIFICATION:`, return both parts.

### Embedding on product create/edit
When a product is saved via the dashboard:
1. Concatenate: `name + category + description + specs`
2. Call OpenAI embedding API
3. Store the vector in `products.embedding`
This runs synchronously on save (catalog is small, it's fast).

### Railway deployment (Dockerfile)
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### requirements.txt
```
fastapi
uvicorn
psycopg2-binary
pgvector
langchain
langchain-openai
openai
pydantic
python-dotenv
httpx
```

### Environment variables (set in Railway)
```
DATABASE_URL=postgresql://user:pass@host/dbname
OPENAI_API_KEY=sk-...
DEEPSEEK_API_KEY=...
EVOLUTION_API_URL=https://your-evolution.up.railway.app
EVOLUTION_API_KEY=...
```

---

## DASHBOARD UI (HTML served by FastAPI)

Simple single-page HTML with a product table and add/edit form.
No React, no build step, no Vercel.
FastAPI serves the file at `/dashboard`.
JavaScript fetches from `/products` endpoints.

Features:
- List all products (name, category, price, stock, active toggle)
- Add new product (form → POST /products → auto-embeds)
- Edit product (inline or modal → PUT /products/{id} → re-embeds)
- Toggle active/inactive (checkbox → soft delete)

The owner opens `https://your-python.up.railway.app/dashboard` in their browser.
That's it. No login for v1 (add later when multi-tenant).

---

## COST ESTIMATES

### Assumptions
- 200 messages/day arriving through the day
- Average 5 messages per conversation package = 40 Python calls/day
- Postgres query every 30s = 2,880 queries/day
- Business hours only: 6am-10pm = 16h active → 1,920 poller fires/day

### Railway compute

| Service | Idle memory | Daily cost | Monthly |
|---|---|---|---|
| n8n | ~200MB | $1.11 | $33.30 |
| Python FastAPI | ~120MB | $0.65 | $19.50 |
| Postgres | ~256MB | $0.14 | $4.20 |
| **Railway total** | | **$1.90** | **$57.00** |

### API costs

| Service | Volume | Daily | Monthly |
|---|---|---|---|
| OpenAI embeddings | 40 calls × 500 tokens | $0.0004 | $0.01 |
| DeepSeek V4 Flash | 40 calls × 2,500 in + 300 out tokens | $0.017 | $0.51 |
| **API total** | | **$0.017** | **$0.52** |

### Grand total: ~$57.52/month

**Key insight: 99% of cost is fixed infrastructure, not usage.**
Going from 1 client to 5 clients: +~$2-3/month in API calls, same infrastructure.
At 5 clients charging R$400/month each: R$2,000 revenue vs ~R$320 cost = healthy margin.

### What saves the most money (in order of impact)
1. Phase 2 native debounce migration → eliminates 1,920 poller fires/day → saves ~$10/month
2. Business hours restriction (already in Workflow 1) → 33% fewer idle fires
3. `EXECUTIONS_DATA_SAVE_ON_SUCCESS=none` n8n env var → saves Postgres writes + memory

---

## N8N ENVIRONMENT VARIABLES (apply before building)

Set these in Railway → n8n service → Variables:

```bash
EXECUTIONS_DATA_SAVE_ON_SUCCESS=none
EXECUTIONS_DATA_SAVE_ON_ERROR=all
EXECUTIONS_DATA_PRUNE=true
EXECUTIONS_DATA_MAX_AGE=168
EXECUTIONS_DATA_SAVE_MANUAL_EXECUTIONS=false
N8N_PAYLOAD_SIZE_MAX=8
N8N_DIAGNOSTICS_ENABLED=false
N8N_VERSION_NOTIFICATIONS_ENABLED=false
N8N_TEMPLATES_ENABLED=false
GENERIC_TIMEZONE=America/Sao_Paulo
TZ=America/Sao_Paulo
```

---

## BUILD ORDER (follow exactly, don't skip ahead)

**Rule: prove the plumbing works with a hardcoded reply before touching RAG.**

### Step 1 — Database prep
- Run `CREATE EXTENSION IF NOT EXISTS vector;` in Railway Postgres
- Run the schema SQL above (processing_status column, conversations table, products table, settings table)
- Verify with: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`

### Step 2 — n8n env vars
- Apply all env vars listed above in Railway → n8n → Variables
- Wait for redeploy (~2 min)

### Step 3 — Workflow 1 (webhook receiver)
- Build in n8n, test by sending a WhatsApp message
- Confirm: row appears in messages table with `processing_status='pending'`
- Don't move on until this works

### Step 4 — Python stub (NO RAG yet)
Create the simplest possible FastAPI service:
```python
from fastapi import FastAPI
app = FastAPI()

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/process")
def process(data: dict):
    return {"reply": "Olá! Recebi sua mensagem. [STUB]", "classification": "GREETING"}
```
Deploy to Railway as a new service in the same project.
Confirm the `/health` endpoint returns 200.

### Step 5 — Workflow 2 (poller, calling the stub)
- Build the full Workflow 2 in n8n, pointing at the Python stub
- Send a WhatsApp message, wait 35 seconds
- Confirm: the hardcoded "Olá! Recebi sua mensagem." arrives in WhatsApp
- This proves: n8n trigger ✓, debounce check ✓, Python HTTP call ✓, Evolution reply ✓
- **This is your most important test. Don't skip it.**

### Step 6 — Catalog migration
- One-time n8n workflow: Google Sheets → read all → transform → INSERT into products table
- Verify rows appear in products table
- Delete the migration workflow after it runs

### Step 7 — Dashboard UI
- Build `static/dashboard.html` with product table + add/edit form
- Build `/products` GET/POST/PUT routes in FastAPI
- Test: open the dashboard URL, add a product, confirm it appears in Postgres

### Step 8 — Embedding on save
- Add OpenAI embedding call to the POST/PUT product routes
- After saving a product, confirm the `embedding` column is populated (not null)

### Step 9 — RAG in /process
- Replace the stub reply with real LangChain RAG logic in `rag.py`
- Test with real WhatsApp messages
- Tune: check that retrieved products are relevant, adjust LIMIT if needed

### Step 10 — Tune and observe
- Watch Railway metrics for actual memory/cost
- Check DeepSeek API usage dashboard
- Decide: is hybrid search needed? (only if customers say "até R$X" and get wrong results)

---

## OPEN DECISIONS (remaining, resolve during build)

- [ ] Hybrid search: add structured price/stock filters to pgvector query?
      → Decide after Step 9 based on real customer messages
- [ ] Conversations table / human takeover: include in v1 or later?
- [ ] Dashboard auth (login per client): v1 is no auth, add when multi-tenant
- [ ] Phase 2 native debounce: migrate after 100+ messages with no double-reply issues

---

## PHASE 2 — NATIVE DEBOUNCE MIGRATION (later, ~30 min of work)

When Evolution native debounce is confirmed reliable:
1. In Evolution Manager: set `debounceTime: 8000` (8 seconds)
2. In n8n: create new Workflow "WA Processor v2" with a Webhook trigger (not Schedule)
3. Remove the `processing_status` lock logic (not needed without polling)
4. Point Evolution webhook URL at the new webhook path
5. Disable old Workflow 2
6. After 1 week stable, delete old workflow

**Result:** zero idle poller fires, ~$10/month saved, 8s reply latency instead of 30s.

---

## PARALLEL PROCESSING NOTE

When multiple customers are ready at the same 30s trigger:
- Workflow 2's Postgres query returns multiple rows (one per ready conversation)
- n8n fans them out automatically as separate items
- The HTTP Request node calls Python once per item
- Set n8n HTTP node **Batch Size: 5** to process 5 conversations simultaneously
- Each Python call is independent (async FastAPI handles them concurrently)
- Cost is the same whether sequential or parallel — you pay per LLM call either way
- Parallel is strictly better for customer experience (everyone answers at the same time)

---

**END OF SPEC — Version 2**
All decisions confirmed. No [REVIEW] items remaining except the optional ones marked above.
Load this into a fresh Claude session and follow the BUILD ORDER step by step.
