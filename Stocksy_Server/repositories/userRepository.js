const pool = require('../config/postgres');

const findFinancialUserByMongoId = async (mongoUserId) => {
  const result = await pool.query(
    `
    SELECT * FROM users
    WHERE mongo_user_id = $1
    `,
    [mongoUserId]
  );

  return result.rows[0];
};

module.exports = {
  findFinancialUserByMongoId,
};