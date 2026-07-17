const bcrypt = require("bcryptjs");
const { pool } = require("../config/postgres");
const sendForgotPasswordEmail = require("../utils/sendForgotPasswordEmail");

// ===============================
// Send OTP
// ===============================
const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const userResult = await pool.query(
      `SELECT id, full_name, email
       FROM users
       WHERE email = $1`,
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email.",
      });
    }

    const user = userResult.rows[0];

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    await pool.query(
      `UPDATE users
       SET otp = $1,
           otp_expires_at = $2
       WHERE id = $3`,
      [otp, expiry, user.id]
    );

    await sendForgotPasswordEmail({
      email: user.email,
      name: user.full_name,
      otp,
    });

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully.",
    });
  } catch (err) {
    console.error("Send OTP Error:", err);

    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

// ===============================
// Verify OTP
// ===============================
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required.",
      });
    }

    const result = await pool.query(
      `SELECT otp, otp_expires_at
       FROM users
       WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const user = result.rows[0];

    if (!user.otp) {
      return res.status(400).json({
        success: false,
        message: "OTP not generated.",
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    if (new Date() > new Date(user.otp_expires_at)) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully.",
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ===============================
// Reset Password
// ===============================
const resetPassword = async (req, res) => {
  try {

    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    const result = await pool.query(
      `SELECT id, otp, otp_expires_at
       FROM users
       WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const user = result.rows[0];

    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    if (new Date() > new Date(user.otp_expires_at)) {
      return res.status(400).json({
        success: false,
        message: "OTP expired.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `UPDATE users
       SET password = $1,
           otp = NULL,
           otp_expires_at = NULL,
           updated_at = NOW()
       WHERE id = $2`,
      [hashedPassword, user.id]
    );

    return res.status(200).json({
      success: true,
      message: "Password reset successful.",
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });

  }
};

module.exports = {
  sendOtp,
  verifyOtp,
  resetPassword,
};