const jwt = require("jsonwebtoken");
const { pool } = require("../config/postgres");

const protect = async (req, res, next) => {
  let token;

  console.log(
    "[AUTH MIDDLEWARE] Authorization header:",
    req.headers.authorization,
  );

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      console.log("[AUTH MIDDLEWARE] Token found, verifying...");

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("[AUTH MIDDLEWARE] Token valid — user id:", decoded.id);

      const result = await pool.query(
        `
SELECT
id,
full_name,
username,
email,
provider,
google_id,
avatar,
demo_balance
FROM users
WHERE id = $1
`,
        [decoded.id],
      );

      if (result.rows.length === 0) {
        console.log("[AUTH] User not found");
        return res.status(401).json({
          message: "Not authorized, user not found",
        });
      }

      req.user = result.rows[0];

      if (!req.user) {
        console.log(
          "[AUTH MIDDLEWARE] ❌ No user found for decoded id:",
          decoded.id,
        );
        return res
          .status(401)
          .json({ message: "Not authorized, user not found" });
      }

      next();
    } catch (error) {
      console.log("[AUTH MIDDLEWARE] User attached:", req.user.username);
      return res.status(401).json({ message: "Not authorized, token invalid" });
    }
  } else {
    console.log("[AUTH MIDDLEWARE] ❌ No Bearer token in Authorization header");
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

module.exports = { protect };
