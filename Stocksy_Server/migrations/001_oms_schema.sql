-- =============================================================
-- Stocksy OMS — PostgreSQL Schema v1.0
-- Run once against your stocksy database
-- =============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";     -- fast symbol search

-- =============================================================
-- USERS (shadow table — source of truth stays in MongoDB)
-- We mirror just the PK so FK constraints work in PostgreSQL
-- =============================================================
CREATE TABLE IF NOT EXISTS users (

    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    full_name VARCHAR(150) NOT NULL,

    username VARCHAR(50) NOT NULL,

    email VARCHAR(255) UNIQUE NOT NULL,

    password TEXT NOT NULL,

    provider VARCHAR(20) NOT NULL DEFAULT 'local',

    google_id TEXT,

    avatar TEXT DEFAULT '',

    demo_balance NUMERIC(18,2) NOT NULL DEFAULT 1000000,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()

);

-- =============================================================
-- WALLETS
-- =============================================================
CREATE TABLE IF NOT EXISTS wallets (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name            VARCHAR(100) NOT NULL,
  balance         NUMERIC(18, 2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
  initial_balance NUMERIC(18, 2) NOT NULL DEFAULT 0,
  color           VARCHAR(20) NOT NULL DEFAULT '#3B82F6',
  is_default      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_wallets_user ON wallets(user_id);

-- =============================================================
-- WALLET TRANSACTIONS (ledger — immutable audit trail)
-- =============================================================
CREATE TYPE wallet_tx_type AS ENUM (
  'credit', 'debit', 'order_reserve', 'order_release',
  'order_fill', 'transfer_in', 'transfer_out'
);

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id      UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  type           wallet_tx_type NOT NULL,
  amount         NUMERIC(18, 2) NOT NULL,
  balance_after  NUMERIC(18, 2) NOT NULL,
  ref_order_id   UUID,                          -- FK added after orders table
  note           TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_wallet_tx_wallet ON wallet_transactions(wallet_id);
CREATE INDEX idx_wallet_tx_created ON wallet_transactions(created_at DESC);

-- =============================================================
-- ORDERS
-- =============================================================
CREATE TYPE order_type AS ENUM ('MARKET', 'LIMIT', 'SL', 'SL_M');
CREATE TYPE order_side AS ENUM ('BUY', 'SELL');
CREATE TYPE order_status AS ENUM (
  'PENDING', 'OPEN', 'PARTIALLY_FILLED',
  'FILLED', 'CANCELLED', 'REJECTED'
);

CREATE TABLE IF NOT EXISTS orders (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wallet_id       UUID NOT NULL REFERENCES wallets(id),
  instrument_key  VARCHAR(100) NOT NULL,        -- e.g. NSE_EQ|INE002A01018
  symbol          VARCHAR(30) NOT NULL,          -- e.g. RELIANCE
  name            VARCHAR(200),
  order_type      order_type NOT NULL,
  side            order_side NOT NULL,
  quantity        NUMERIC(12, 4) NOT NULL CHECK (quantity > 0),
  price           NUMERIC(18, 4),               -- NULL for MARKET orders
  trigger_price   NUMERIC(18, 4),               -- for SL orders
  status          order_status NOT NULL DEFAULT 'PENDING',
  filled_qty      NUMERIC(12, 4) NOT NULL DEFAULT 0,
  avg_fill_price  NUMERIC(18, 4),
  total_value     NUMERIC(18, 2),               -- filled_qty * avg_fill_price
  margin_used     NUMERIC(18, 2) NOT NULL DEFAULT 0,
  placed_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  filled_at       TIMESTAMPTZ,
  cancelled_at    TIMESTAMPTZ,
  rejection_reason TEXT,
  metadata        JSONB NOT NULL DEFAULT '{}'
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_wallet ON orders(wallet_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_instrument ON orders(instrument_key);
CREATE INDEX idx_orders_placed ON orders(placed_at DESC);
CREATE INDEX idx_orders_user_status ON orders(user_id, status);

-- Add FK from wallet_transactions to orders (now that orders exists)
ALTER TABLE wallet_transactions
  ADD CONSTRAINT fk_wallet_tx_order
  FOREIGN KEY (ref_order_id) REFERENCES orders(id) ON DELETE SET NULL;

-- =============================================================
-- POSITIONS (current open holdings per wallet)
-- =============================================================
CREATE TABLE IF NOT EXISTS positions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wallet_id       UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  instrument_key  VARCHAR(100) NOT NULL,
  symbol          VARCHAR(30) NOT NULL,
  name            VARCHAR(200),
  quantity        NUMERIC(12, 4) NOT NULL DEFAULT 0,
  avg_cost        NUMERIC(18, 4) NOT NULL DEFAULT 0,   -- weighted avg buy price
  realised_pnl    NUMERIC(18, 2) NOT NULL DEFAULT 0,
  -- current_price & unrealised_pnl are LIVE — updated from Redis, not stored here
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(wallet_id, instrument_key)
);

CREATE INDEX idx_positions_user ON positions(user_id);
CREATE INDEX idx_positions_wallet ON positions(wallet_id);
CREATE INDEX idx_positions_instrument ON positions(instrument_key);

-- =============================================================
-- TRADES (immutable fill records — one per execution)
-- =============================================================
CREATE TABLE IF NOT EXISTS trades (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id        UUID NOT NULL REFERENCES orders(id),
  position_id     UUID REFERENCES positions(id),
  user_id         UUID NOT NULL REFERENCES users(id),
  wallet_id       UUID NOT NULL REFERENCES wallets(id),
  instrument_key  VARCHAR(100) NOT NULL,
  symbol          VARCHAR(30) NOT NULL,
  side            order_side NOT NULL,
  quantity        NUMERIC(12, 4) NOT NULL,
  price           NUMERIC(18, 4) NOT NULL,       -- actual fill price (with slippage)
  brokerage       NUMERIC(18, 4) NOT NULL DEFAULT 0,
  total_value     NUMERIC(18, 2) NOT NULL,        -- quantity * price + brokerage
  realised_pnl    NUMERIC(18, 2),                 -- for SELL trades
  executed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_trades_order ON trades(order_id);
CREATE INDEX idx_trades_user ON trades(user_id);
CREATE INDEX idx_trades_wallet ON trades(wallet_id);
CREATE INDEX idx_trades_instrument ON trades(instrument_key);
CREATE INDEX idx_trades_executed ON trades(executed_at DESC);

-- =============================================================
-- ORDER EVENTS (append-only audit log — OMS state machine)
-- =============================================================
CREATE TABLE IF NOT EXISTS order_events (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id   UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  event      VARCHAR(50) NOT NULL,   -- PLACED, QUEUED, FILLED, CANCELLED, REJECTED
  payload    JSONB NOT NULL DEFAULT '{}',
  ts         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_events_order ON order_events(order_id);
CREATE INDEX idx_order_events_ts ON order_events(ts DESC);

-- =============================================================
-- HELPER: updated_at trigger
-- =============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_wallets_updated
  BEFORE UPDATE ON wallets
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_positions_updated
  BEFORE UPDATE ON positions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================
-- VIEWS (handy for debugging / admin)
-- =============================================================
CREATE OR REPLACE VIEW vw_open_orders AS
  SELECT o.*, w.name AS wallet_name
  FROM orders o
  JOIN wallets w ON w.id = o.wallet_id
  WHERE o.status IN ('PENDING', 'OPEN', 'PARTIALLY_FILLED');

CREATE OR REPLACE VIEW vw_portfolio_summary AS
  SELECT
    p.user_id,
    p.wallet_id,
    w.name AS wallet_name,
    COUNT(*) AS position_count,
    SUM(p.quantity * p.avg_cost) AS invested_value,
    SUM(p.realised_pnl) AS total_realised_pnl
  FROM positions p
  JOIN wallets w ON w.id = p.wallet_id
  WHERE p.quantity > 0
  GROUP BY p.user_id, p.wallet_id, w.name;
