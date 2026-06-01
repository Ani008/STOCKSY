const jwt  = require('jsonwebtoken');
const User = require('../models/User');
const { getPgUserId } = require('../config/postgres');

const protect = async (req, res, next) => {
  let token;

  console.log('[AUTH MIDDLEWARE] Authorization header:', req.headers.authorization);

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      console.log('[AUTH MIDDLEWARE] Token found, verifying...');

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('[AUTH MIDDLEWARE] Token valid — user id:', decoded.id);

      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        console.log('[AUTH MIDDLEWARE] ❌ No user found for decoded id:', decoded.id);
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      // ── OMS: attach PostgreSQL UUID so order routes can use it directly ──
      req.user.pgId    = await getPgUserId(decoded.id);  // PostgreSQL UUID
      req.user.mongoId = decoded.id;                     // MongoDB ObjectId
      console.log('[AUTH MIDDLEWARE] ✅ User attached:', req.user.username, '| pgId:', req.user.pgId);

      next();
    } catch (error) {
      console.log('[AUTH MIDDLEWARE] ❌ Token verification failed:', error.message);
      return res.status(401).json({ message: 'Not authorized, token invalid' });
    }
  } else {
    console.log('[AUTH MIDDLEWARE] ❌ No Bearer token in Authorization header');
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };