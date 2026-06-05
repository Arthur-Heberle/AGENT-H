# CLAUDE.md — WhatsApp AI Agent SaaS

## What This Project Is

A SaaS dashboard that lets small business owners run a WhatsApp AI sales agent. Customers message the business on WhatsApp → n8n workflow receives the message → calls this backend's `/process` endpoint → AI responds using the business's product catalog (RAG) → reply sent back via Evolution API.

Business owners manage everything via a web dashboard: product catalog, conversation history, AI configuration, business hours.

## How to Run

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Dashboard: http://localhost:8000/dashboard  
Login: http://localhost:8000/login  
Health: http://localhost:8000/health

Seed the first admin user:
```bash
cd backend
python seed.py
```

## Directory Structure

```
ai_agent_whatsapp/
├── backend/                    # FastAPI Python service
│   ├── main.py                 # App entry point, router registration, static file serving
│   ├── schema.sql              # PostgreSQL DDL (run once via database.py on startup)
│   ├── seed.py                 # CLI to create first admin user from .env
│   ├── categories.py           # Default furniture category list
│   ├── requirements.txt
│   ├── .env                    # NOT in git — see ARCHITECTURE.md for all env vars
│   ├── api/routes/             # HTTP route handlers (controllers)
│   ├── core/                   # Infrastructure: config, database pool, security, deps
│   ├── models/                 # Pydantic DTOs (request/response shapes)
│   ├── services/               # Business logic and external API calls
│   ├── repositories/           # All SQL queries (data access layer)
│   └── static/                 # Frontend: dashboard.html, login.html, dashboard.js, dashboard.css
├── CLAUDE.md                   # This file
├── ARCHITECTURE.md             # System flow + DB schema
├── backend/CLAUDE.md           # Backend deep-dive
└── backend/static/CLAUDE.md    # Frontend deep-dive
```

## Key Conventions

- **Multi-tenancy key:** `business_phone` (a WhatsApp phone number like `+5511999999999`). Every DB query is filtered by it. It is extracted from the JWT token or falls back to `DEFAULT_BUSINESS_PHONE` env var.
- **Auth:** JWT (HS256). Token stored in browser `localStorage` as `agente_token`. Sent as `Authorization: Bearer <token>`. Backend `require_auth()` dependency validates it.
- **Async everywhere:** FastAPI + asyncpg + httpx + openai async client. No sync DB calls.
- **Database schema auto-applied:** `core/database.py` runs `schema.sql` on startup via `init_db()`.
- **n8n owns message writes:** The Python backend never writes to `messages` or `conversations` tables directly during chat. n8n does that. Python only reads from them (for context, history, stats).
- **Products are the exception:** Python writes products (with embeddings) and reads them for RAG.

## Navigation to Deeper Docs

- System data flow, DB schema, env vars → `ARCHITECTURE.md`
- Adding backend routes, services, repositories → `backend/CLAUDE.md`
- Adding frontend pages, components, i18n strings → `backend/static/CLAUDE.md`
