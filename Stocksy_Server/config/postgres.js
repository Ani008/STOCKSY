const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.PG_HOST,
  port:     process.env.PG_PORT,
  user:     process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
});

pool.connect()
  .then(() => console.log('PostgreSQL connected'))
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