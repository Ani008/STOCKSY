const { Pool } = require('pg');

// ─── Pool sizing ────────────────────────────────────────────────────────────
// Previously no `max` was set at all, so `pg` silently fell back to its
// default of 10 — that's the real "10" ceiling, not a value anyone chose.
//
// We deliberately do NOT set this to some huge number ("max out the pool").
// A Postgres server has a hard `max_connections` limit (100 by default on
// most managed providers, e.g. RDS free/small tiers, Supabase, Render). If
// this app is ever scaled horizontally (PM2 cluster mode, multiple
// containers/replicas), EVERY instance opens its own pool of this size —
// so 4 instances x a "maxed out" pool of 100 would instantly blow past the
// DB's own connection limit and start throwing
// "sorry, too many clients already" errors for ALL users, including ones
// on requests that never even touch a slow query.
//
// PG_POOL_MAX is env-configurable so ops can tune it per-environment
// without a code change. 20 is a reasonable default for a single instance
// serving ~300 concurrent users (most requests hold a connection for
// milliseconds), leaving headroom under a typical 100-connection DB limit
// for migrations, admin tools, and other services. Raise it gradually
// while watching `pg_stat_activity`, rather than jumping straight to max.
const pool = new Pool({
  host:     process.env.PG_HOST,
  port:     process.env.PG_PORT,
  user:     process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,

  max:                     parseInt(process.env.PG_POOL_MAX, 10) || 20,
  min:                     parseInt(process.env.PG_POOL_MIN, 10) || 4,
  idleTimeoutMillis:       parseInt(process.env.PG_IDLE_TIMEOUT_MS, 10) || 30000,
  connectionTimeoutMillis: parseInt(process.env.PG_CONN_TIMEOUT_MS, 10) || 5000,
});

// Without this listener, an error on an *idle* client in the pool (e.g. the
// DB restarting, a network blip) is an unhandled 'error' event on the pool,
// which crashes the entire Node process — taking down every user's
// connection, not just the one query that failed. This was a latent bug
// even at 10 connections; it matters more at 20+ since there's simply more
// idle-client surface area for it to fire on.
pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
});

pool.connect()
  .then(() => console.log(`PostgreSQL connected (pool max=${pool.options.max})`))
  .catch((err) => console.error('PostgreSQL connection error:', err));

/**
 * getPgUserId — look up the PostgreSQL UUID for a given MongoDB ObjectId string.
 * Used by the auth middleware to attach req.user.pgId for all OMS queries.
 *
 * NOTE: column is `mongo_user_id` (matches your existing INSERT in auth controller)
 */
async function getPgUserId(mongoId) {
  const { rows } = await pool.query(
    'SELECT id FROM users WHERE mongo_id = $1',
    [mongoId]
  );
  return rows[0]?.id ?? null;
}

module.exports = { pool, getPgUserId };