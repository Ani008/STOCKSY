const express = require('express');
const router = express.Router();
const { signupUser, loginUser, logoutUser } = require('../controllers/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/signup', authLimiter, signupUser);
router.post('/login', authLimiter, loginUser);
router.post('/logout', logoutUser);

module.exports = router;