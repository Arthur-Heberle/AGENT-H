# AI AGENT TO WHATSAPP ANNOTATIONS

## POSTGRES SETUP:
 - conversations table:
    CREATE TABLE IF NOT EXISTS conversations (
      customer_phone  VARCHAR(30)  NOT NULL,
      customer_name   VARCHAR(200),          -- nullable, filled if customer gives name
      business_phone  VARCHAR(30)  NOT NULL,
      business_name   VARCHAR(200),          -- your client's business name
      ai_enabled      BOOLEAN      DEFAULT TRUE,
      created_at      TIMESTAMP    DEFAULT NOW(),
      updated_at      TIMESTAMP    DEFAULT NOW(),
      PRIMARY KEY (customer_phone, business_phone)
    );
 
 - messages table:
   CREATE TABLE IF NOT EXISTS messages (
      id                SERIAL       PRIMARY KEY,
      customer_phone    VARCHAR(30)  NOT NULL,
      business_phone    VARCHAR(30)  NOT NULL,
      message           TEXT         NOT NULL,
      processing_status VARCHAR(20)  DEFAULT 'pending',  -- pending | in_progress | done
      created_at        TIMESTAMP    DEFAULT NOW()
    );

    -- Critical indexes for the poller query performance
    CREATE INDEX IF NOT EXISTS idx_messages_status_time
    ON messages(processing_status, message_time);

    CREATE INDEX IF NOT EXISTS idx_messages_conversation
    ON messages(customer_phone, business_phone, message_time DESC);
    
 - products table:
    CREATE EXTENSION IF NOT EXISTS vector;

    CREATE TABLE IF NOT EXISTS products (
      id              SERIAL        PRIMARY KEY,
      business_phone  VARCHAR(30)   NOT NULL,
      name            VARCHAR(200)  NOT NULL,
      category        VARCHAR(100),
      price           NUMERIC(10,2),
      quantity        INTEGER       DEFAULT 0,
      description     TEXT,         -- rich natural language:
      specs           TEXT,         
      active          BOOLEAN       DEFAULT TRUE,
      embedding       VECTOR(1536), -- OpenAI text-embedding-3-small dimension
      updated_at      TIMESTAMP     DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_products_business
    ON products(business_phone, active);

    -- pgvector index for fast similarity search
    CREATE INDEX IF NOT EXISTS idx_products_embedding
    ON products USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);
    
    
    >>  on embedding product:
    # Concatenate everything into one natural-language string for embedding
    embed_text = f"{product.name}. {product.category}. {product.description}. {product.specs}"
    # Example: "Sofá Milano 3 lugares. Sala de estar. Sofá retrátil de couro marrom com
    # enchimento D33, estrutura madeira maciça. Cor: marrom | Material: couro | Largura: 2.10m"
    
    
### POSTGRES WHAT TO RUN 
     -- 1. Enable pgvector
    CREATE EXTENSION IF NOT EXISTS vector;

    -- 2. conversations
    CREATE TABLE IF NOT EXISTS conversations (
      customer_phone VARCHAR(30) NOT NULL,
      customer_name  VARCHAR(200),
      business_phone VARCHAR(30) NOT NULL,
      business_name  VARCHAR(200),
      ai_enabled     BOOLEAN DEFAULT TRUE,
      created_at     TIMESTAMP DEFAULT NOW(),
      updated_at     TIMESTAMP DEFAULT NOW(),
      PRIMARY KEY (customer_phone, business_phone)
    );

    -- 3. messages
    CREATE TABLE IF NOT EXISTS messages (
      id                SERIAL PRIMARY KEY,
      customer_phone    VARCHAR(30) NOT NULL,
      business_phone    VARCHAR(30) NOT NULL,
      message           TEXT NOT NULL,
      processing_status VARCHAR(20) DEFAULT 'idle',
      created_at        TIMESTAMP DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_messages_status_time
    ON messages(processing_status, message_time);
    CREATE INDEX IF NOT EXISTS idx_messages_conversation
    ON messages(customer_phone, business_phone, message_time DESC);

    -- 4. products
    CREATE TABLE IF NOT EXISTS products (
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
    CREATE INDEX IF NOT EXISTS idx_products_business
    ON products(business_phone, active);
    CREATE INDEX IF NOT EXISTS idx_products_embedding
    ON products USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

    -- 5. settings (per client config)
    CREATE TABLE IF NOT EXISTS settings (
      business_phone VARCHAR(30) NOT NULL,
      key            VARCHAR(50) NOT NULL,
      value          TEXT NOT NULL,
      updated_at     TIMESTAMP DEFAULT NOW(),
      PRIMARY KEY (business_phone, key)
    );


## Step 1 — Poller finds ready conversations (SELECT only, no UPDATE yet):
  SELECT customer_phone, business_phone, MAX(created_at) AS last_message_at
  FROM messages
  WHERE processing_status = 'pending' AND created_at < NOW() - INTERVAL '30 seconds'
  GROUP BY customer_phone, business_phone;
- Returns one row: 5511999. The GROUP BY collapses all 3 pending rows into one result — you get one conversation to process, not three.

## Step 2 — Lock the conversation (UPDATE pending → in_progress):
  UPDATE messages
  SET processing_status = 'in_progress'
  WHERE customer_phone = $1
    AND business_phone = $2
    AND processing_status = 'pending';

- This updates all 3 pending rows at once to in_progress. The done rows are untouched. Now if the 30s trigger fires again before the LLM finishes, it finds zero pending rows for this conversation and skips it.

## Step 3 — Fetch last 8 messages (SELECT, no UPDATE):
  SELECT message, role, created_at
  FROM messages
  WHERE customer_phone = $1 AND business_phone = $2
  ORDER BY created_at DESC
  LIMIT 8;

- This fetches ALL recent messages regardless of status — the 3 in_progress ones plus the 5 done ones before them. You want the full context for the LLM, not just the new ones.

## Step 4 — Call Python, get reply. Then UPDATE in_progress → done:
  UPDATE messages
  SET processing_status = 'done'
  WHERE customer_phone = $1
    AND business_phone = $2
    AND processing_status = 'in_progress';

- Again, only touches the 3 in_progress rows. The old done rows are untouched.

## Step 5 — Insert the AI reply as a new done row:
  INSERT INTO messages (customer_phone, business_phone, message, role, processing_status)
  VALUES ($1, $2, $3, 'assistant', 'done');

- The AI's reply goes straight to done — it was never pending because you never need to process your own replies.