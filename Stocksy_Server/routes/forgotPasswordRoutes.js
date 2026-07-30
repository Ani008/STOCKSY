const express = require("express");

const router = express.Router();

const {
  sendOtp,
  verifyOtp,
  resetPassword,
} = require("../controllers/forgotPasswordController");
const { otpLimiter } = require("../middleware/rateLimiter");

router.post("/send-otp", otpLimiter, sendOtp);

router.post("/verify-otp", otpLimiter, verifyOtp);

router.post("/reset-password", otpLimiter, resetPassword);

module.exports = router;