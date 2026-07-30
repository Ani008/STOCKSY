const express = require("express");
const router = express.Router();

const { googleLogin } = require("../controllers/googleAuth");
const { authLimiter } = require("../middleware/rateLimiter");

router.post("/", authLimiter, googleLogin);

module.exports = router;