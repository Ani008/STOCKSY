-- =============================================================
-- ACCOUNT TRANSACTIONS (demo-balance ledger — wallet create/delete)
-- Kept separate from wallet_transactions because wallet_transactions
-- cascades away when a wallet is deleted, but we still want a
-- permanent record that "₹X was refunded when wallet Y was deleted".
-- =============================================================

CREATE TYPE account_tx_type AS ENUM ('wallet_created', 'wallet_deleted');

CREATE TABLE IF NOT EXISTS account_transactions (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type           account_tx_type NOT NULL,
  amount         NUMERIC(18, 2) NOT NULL,
  balance_after  NUMERIC(18, 2) NOT NULL,   -- demo_balance after this event
  wallet_name    VARCHAR(100),               -- plain text snapshot, not a FK
  note           TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_account_tx_user ON account_transactions(user_id);
CREATE INDEX idx_account_tx_created ON account_transactions(created_at DESC);