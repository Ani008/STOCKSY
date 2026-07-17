const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/postgres");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        message: "Google ID Token is required",
      });
    }

    // Verify token with Google
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const googleId = payload.sub;
    const email = payload.email;
    const fullName = payload.name;
    const avatar = payload.picture;
    const emailVerified = payload.email_verified;

    if (!emailVerified) {
      return res.status(401).json({
        message: "Google email is not verified",
      });
    }

    // Check existing user
    const existing = await pool.query(
      `
      SELECT *
      FROM users
      WHERE email = $1
      `,
      [email],
    );

    let user;

    if (existing.rows.length > 0) {
      // Existing user
      user = existing.rows[0];

      await pool.query(
        `
        UPDATE users
SET
    full_name = $1,
    username = $2,
    google_id = $3,
    provider = 'google',
    avatar = $4
WHERE id = $5
        `,
        [fullName, fullName.trim().split(" ")[0], googleId, avatar, user.id]
      );

      user.google_id = googleId;
      user.provider = "google";
      user.avatar = avatar;
    } else {
      // Create username automatically
      const username = fullName.trim().split(" ")[0];

      const created = await pool.query(
        `
        INSERT INTO users
        (
            full_name,
            username,
            email,
            password,
            provider,
            google_id,
            avatar
        )

        VALUES
        (
            $1,
            $2,
            $3,
            '',
            'google',
            $4,
            $5
        )

        RETURNING *
        `,
        [fullName, username, email, googleId, avatar],
      );

      user = created.rows[0];
    }

    return res.json({
      id: user.id,
      fullName: user.full_name,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      demoBalance: user.demo_balance,
      token: generateToken(user.id),
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Google Authentication Failed",
    });
  }
};

module.exports = {
  googleLogin,
};
