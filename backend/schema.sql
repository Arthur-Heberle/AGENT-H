CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS conversations (
  customer_phone VARCHAR(30)  NOT NULL,
  customer_name  VARCHAR(200),
  business_phone VARCHAR(30)  NOT NULL,
  ai_enabled     BOOLEAN      DEFAULT TRUE,
  created_at     TIMESTAMP    DEFAULT NOW(),
  updated_at     TIMESTAMP    DEFAULT NOW(),
  PRIMARY KEY (customer_phone, business_phone)
);

CREATE TABLE IF NOT EXISTS messages (
  id                SERIAL       PRIMARY KEY,
  customer_phone    VARCHAR(30)  NOT NULL,
  business_phone    VARCHAR(30)  NOT NULL,
  message           TEXT         NOT NULL,
  role              VARCHAR(20)  DEFAULT 'customer',  -- customer | assistant | owner
  processing_status VARCHAR(20)  DEFAULT 'pending',   -- pending | in_progress | done | idle
  classification    VARCHAR(30),                      -- QUALIFIED_LEAD | GENERAL_QUESTION | GREETING | OUT_OF_SCOPE
  created_at        TIMESTAMP    DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_messages_status_time
  ON messages(processing_status, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_conversation
  ON messages(customer_phone, business_phone, created_at DESC);

CREATE TABLE IF NOT EXISTS products (
  id             SERIAL        PRIMARY KEY,
  business_phone VARCHAR(30)   NOT NULL,
  name           VARCHAR(200)  NOT NULL,
  category       VARCHAR(100),
  price          NUMERIC(10,2),
  quantity       INTEGER       DEFAULT 0,
  description    TEXT,
  specs          TEXT,
  active         BOOLEAN       DEFAULT TRUE,
  embedding      VECTOR(1536),
  updated_at     TIMESTAMP     DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_products_business
  ON products(business_phone, active);
CREATE INDEX IF NOT EXISTS idx_products_embedding
  ON products USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE TABLE IF NOT EXISTS clients (
  id             SERIAL        PRIMARY KEY,
  email          VARCHAR(200)  UNIQUE NOT NULL,
  password_hash  TEXT          NOT NULL,
  business_phone VARCHAR(30)   UNIQUE NOT NULL,
  business_name  VARCHAR(200),
  created_at     TIMESTAMP     DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS client_settings (
  business_phone  VARCHAR(30)  PRIMARY KEY REFERENCES clients(business_phone),
  system_prompt   TEXT,
  ai_language     VARCHAR(10)  DEFAULT 'auto',
  business_hours  JSONB        NOT NULL DEFAULT '{
    "mon": {"enabled": true,  "open": "09:00", "close": "18:00"},
    "tue": {"enabled": true,  "open": "09:00", "close": "18:00"},
    "wed": {"enabled": true,  "open": "09:00", "close": "18:00"},
    "thu": {"enabled": true,  "open": "09:00", "close": "18:00"},
    "fri": {"enabled": true,  "open": "09:00", "close": "18:00"},
    "sat": {"enabled": true,  "open": "09:00", "close": "13:00"},
    "sun": {"enabled": false, "open": "09:00", "close": "12:00"}
  }'::jsonb,
  updated_at      TIMESTAMP    DEFAULT NOW()
);
