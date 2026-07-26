const jwt = require("jsonwebtoken");
const { pool } = require("../config/postgres");
const logger = require("../utils/logger");

// NOTE: this still hits Postgres on every authenticated request — that's
// the separately-scoped "stateless JWT" redesign we planned earlier and
// haven't built yet. Deliberately not doing that rewrite here; this pass
// only fixes the error contract and the crash bug below.

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Please log in to continue.",
      code: "UNAUTHORIZED",
      severity: "error",
    });
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    // Token missing, malformed, or expired — this is the SESSION_EXPIRED
    // case the frontend needs to detect and route to the full-screen
    // re-auth flow, not a toast.
    logger.error(`[AUTH] Token verification failed: ${err.message}`);
    return res.status(401).json({
      message: "Your session has expired. Please log in again.",
      code: "SESSION_EXPIRED",
      severity: "error",
    });
  }

  try {
    const result = await pool.query(
      `SELECT id, full_name, username, email, provider, google_id, avatar, demo_balance
       FROM users
       WHERE id = $1`,
      [decoded.id],
    );

    if (result.rows.length === 0) {
      // Valid token, but the user it points to no longer exists —
      // also treated as session-expired from the client's perspective.
      return res.status(401).json({
        message: "Your session has expired. Please log in again.",
        code: "SESSION_EXPIRED",
        severity: "error",
      });
    }

    req.user = result.rows[0];
    next();
  } catch (err) {
    logger.error(`[AUTH] DB lookup failed: ${err.message}`);
    return res.status(500).json({
      message: "Something went wrong. Please try again.",
      code: "UNKNOWN_ERROR",
      severity: "error",
    });
  }
};

module.exports = { protect };