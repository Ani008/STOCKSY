-- =============================================================
-- 002_add_product_type.sql
-- Adds CNC (delivery) / MIS (intraday) product type support.
--
-- Why positions needs a schema change, not just orders:
-- A user can legitimately hold a CNC position AND an MIS position
-- in the same stock, in the same wallet, at the same time — these
-- are economically different holdings with different avg_cost and
-- different lifecycle (MIS gets force-squared-off at ~3:20pm,
-- CNC never does). The old UNIQUE(wallet_id, instrument_key)
-- constraint would silently merge them into one row and corrupt
-- avg_cost. product_type must be part of the position's identity.
-- =============================================================

CREATE TYPE product_type AS ENUM ('CNC', 'MIS');

-- ── orders ──────────────────────────────────────────────────
ALTER TABLE orders
  ADD COLUMN product_type product_type NOT NULL DEFAULT 'CNC';

-- ── positions ───────────────────────────────────────────────
ALTER TABLE positions
  ADD COLUMN product_type product_type NOT NULL DEFAULT 'CNC';

-- Replace the old unique constraint with one that includes product_type.
-- (Constraint name may differ on your DB — check with \d positions if
-- this fails, and adjust the DROP CONSTRAINT name accordingly.)
ALTER TABLE positions
  DROP CONSTRAINT IF EXISTS positions_wallet_id_instrument_key_key;

ALTER TABLE positions
  ADD CONSTRAINT positions_wallet_instrument_product_unique
  UNIQUE (wallet_id, instrument_key, product_type);

-- Index to make the square-off job's query (find all open MIS
-- positions) fast instead of a full table scan every trading day.
CREATE INDEX idx_positions_product_type
  ON positions(product_type)
  WHERE product_type = 'MIS';

-- Track how much leverage was actually applied on the order, for
-- auditability — lets you see historically what multiplier a user
-- got even if you change the leverage config later.
ALTER TABLE orders
  ADD COLUMN leverage_applied NUMERIC(4, 2) NOT NULL DEFAULT 1.00;