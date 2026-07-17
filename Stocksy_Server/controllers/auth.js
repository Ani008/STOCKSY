const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { pool } = require("../config/postgres");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

const signupUser = async (req, res) => {
  console.log("\n───────────────────────────────────────");
  console.log("[SIGNUP] Request received");
  console.log("[SIGNUP] Body:", JSON.stringify(req.body, null, 2));
  // readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting

  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    console.log(
      "[SIGNUP] ❌ Missing fields — fullName:",
      fullName,
      "| email:",
      email,
      "| password:",
      !!password,
    );
    return res
      .status(400)
      .json({ message: "fullName, email and password are all required" });
  }

  const username = fullName.trim().split(" ")[0];
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    console.log("[SIGNUP] Checking if user already exists...");
    const existing = await pool.query(
      `
SELECT *
FROM users
WHERE email=$1
`,
      [email],
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    console.log("[SIGNUP] Creating new user...");
    const result = await pool.query(
      `
INSERT INTO users(

full_name,
username,
email,
password

)

VALUES($1,$2,$3,$4)

RETURNING *
`,

      [fullName, username, email, hashedPassword],
    );

    const user = result.rows[0];
    console.log("[SIGNUP] ✅ User created:", user.id);

    res.status(201).json({
      id: user.id,

      username: user.username,

      email: user.email,

      demoBalance: user.demo_balance,

      token: generateToken(user.id),
    });
  } catch (error) {
    console.log("[SIGNUP] ❌ Error:", error.message);
    console.log("[SIGNUP] Full error:", error);
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  console.log("\n───────────────────────────────────────");
  console.log("[LOGIN] Request received");
  console.log("[LOGIN] Body:", JSON.stringify(req.body, null, 2));

  const { email, password } = req.body;

  if (!email || !password) {
    console.log(
      "[LOGIN] ❌ Missing fields — email:",
      email,
      "| password:",
      !!password,
    );
    return res.status(400).json({ message: "email and password are required" });
  }

  try {
    console.log("[LOGIN] Looking up user by email:", email);
    const result = await pool.query(
      `
SELECT *
FROM users
WHERE email=$1
`,

      [email],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const user = result.rows[0];

    console.log("[LOGIN] User found:", user.id, "— checking password...");
    const isMatch = await bcrypt.compare(
      password,

      user.password,
    );
    console.log("[LOGIN] Password match:", isMatch);

    if (isMatch) {
      console.log("[LOGIN] ✅ Login successful for:", user.username);
      res.json({
        id: user.id,

        username: user.username,

        email: user.email,

        demoBalance: user.demo_balance,

        token: generateToken(user.id),
      });
    } else {
      console.log("[LOGIN] ❌ Password did not match");
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    console.log("[LOGIN] ❌ Error:", error.message);
    console.log("[LOGIN] Full error:", error);
    res.status(500).json({ message: error.message });
  }
};

const logoutUser = (req, res) => {
  console.log("[LOGOUT] Request received");
  res.status(200).json({ message: "Logged out successfully" });
};

module.exports = {
  signupUser,
  loginUser,
  logoutUser,
};
