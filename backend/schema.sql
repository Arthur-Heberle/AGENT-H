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
  created_at        TIMESTAMP    DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_messages_status_time
  ON messages(processing_status, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_conversation
  ON messages(customer_phone, business_phone, created_at DESC);

-- Idempotent migration: classification column added after initial deploy
ALTER TABLE messages ADD COLUMN IF NOT EXISTS classification VARCHAR(30);

-- Idempotent migration: some n8n writes stored the role JSON-quoted ('"customer"')
UPDATE messages SET role = btrim(role, '"') WHERE role LIKE '"%"';

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

-- Canonical business_phone: digits only, Brazilian 9th-digit mobile prefix removed
-- (matches the WhatsApp JID format n8n/Evolution sends). Must mirror
-- core/phone.py:normalize_phone exactly.
CREATE OR REPLACE FUNCTION normalize_business_phone(p TEXT) RETURNS TEXT AS $$
DECLARE
  d TEXT := regexp_replace(coalesce(p, ''), '\D', '', 'g');
BEGIN
  IF length(d) = 13 AND left(d, 2) = '55' AND substr(d, 5, 1) = '9' THEN
    d := left(d, 4) || substr(d, 6);
  END IF;
  RETURN d;
END $$ LANGUAGE plpgsql IMMUTABLE;

-- Idempotent migration: product images added after initial deploy
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Idempotent migration: rows written before normalization existed may have '+'
-- prefixes or the 13-digit 9th-digit format. Tables with uniqueness on
-- business_phone skip rows whose normalized value already exists (no collisions).
DO $$
BEGIN
  UPDATE clients c
  SET business_phone = normalize_business_phone(business_phone)
  WHERE business_phone <> normalize_business_phone(business_phone)
    AND NOT EXISTS (
      SELECT 1 FROM clients c2
      WHERE c2.business_phone = normalize_business_phone(c.business_phone)
    );

  UPDATE client_settings s
  SET business_phone = normalize_business_phone(business_phone)
  WHERE business_phone <> normalize_business_phone(business_phone)
    AND NOT EXISTS (
      SELECT 1 FROM client_settings s2
      WHERE s2.business_phone = normalize_business_phone(s.business_phone)
    );

  UPDATE products
  SET business_phone = normalize_business_phone(business_phone)
  WHERE business_phone <> normalize_business_phone(business_phone);

  UPDATE conversations cv
  SET business_phone = normalize_business_phone(business_phone)
  WHERE business_phone <> normalize_business_phone(business_phone)
    AND NOT EXISTS (
      SELECT 1 FROM conversations cv2
      WHERE cv2.customer_phone = cv.customer_phone
        AND cv2.business_phone = normalize_business_phone(cv.business_phone)
    );

  UPDATE messages
  SET business_phone = normalize_business_phone(business_phone)
  WHERE business_phone <> normalize_business_phone(business_phone);
END $$;
