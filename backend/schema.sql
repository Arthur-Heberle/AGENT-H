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
  role              VARCHAR(20)  DEFAULT 'customer',  -- customer | assistant | employee
  processing_status VARCHAR(20)  DEFAULT 'pending',   -- pending | in_progress | done
  classification    VARCHAR(30),                      -- QUALIFIED_LEAD | GENERAL_QUESTION | GREETING | OUT_OF_SCOPE
  created_at        TIMESTAMP    DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_messages_status_time
  ON messages(processing_status, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_conversation
  ON messages(customer_phone, business_phone, created_at DESC);

-- Idempotent migration: classification column added after initial deploy
ALTER TABLE messages ADD COLUMN IF NOT EXISTS classification VARCHAR(30);

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

-- Idempotent UNIQUE constraint on clients.business_phone (required for multi-tenancy and FK integrity).
-- CREATE TABLE IF NOT EXISTS won't add this to an existing table, so we use a DO block.
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'clients_business_phone_unique'
  ) THEN
    ALTER TABLE clients ADD CONSTRAINT clients_business_phone_unique UNIQUE (business_phone);
  END IF;
END $$;

-- Normalize Brazilian mobile numbers: strip the 9th-digit mobile prefix added in 2012.
-- Evolution API stores numbers without it: 55+DDD(2)+local(8) = 12 digits.
-- Registrations done before this fix may have 13-digit format: 55+DDD(2)+9+local(8).
DO $$
BEGIN
  UPDATE clients
  SET business_phone = LEFT(business_phone, 4) || SUBSTRING(business_phone FROM 6)
  WHERE LENGTH(business_phone) = 13 AND LEFT(business_phone, 2) = '55';

  UPDATE client_settings
  SET business_phone = LEFT(business_phone, 4) || SUBSTRING(business_phone FROM 6)
  WHERE LENGTH(business_phone) = 13 AND LEFT(business_phone, 2) = '55';
END $$;

CREATE TABLE IF NOT EXISTS client_settings (
  business_phone  VARCHAR(30)  PRIMARY KEY,  -- no FK: avoids creation failure on DBs missing the UNIQUE constraint above
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
