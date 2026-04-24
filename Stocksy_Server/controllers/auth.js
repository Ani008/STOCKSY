const User = require('../models/User');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const signupUser = async (req, res) => {
  const { username, email, password } = req.body;

  // Mock Mode Check
  if (mongoose.connection.readyState !== 1) {
    console.log('Mock Signup successful for:', username);
    return res.status(201).json({
      _id: 'mock_id_' + Date.now(),
      username,
      email,
      token: generateToken('mock_id'),
    });
  }

  try {
    const userExists = await User.findOne({ $or: [{ email }, { username }] });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      username,
      email,
      password,
    });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Mock Mode Check
  if (mongoose.connection.readyState !== 1) {
    console.log('Mock Login successful for:', email);
    return res.json({
      _id: 'mock_id_' + Date.now(),
      username,
      email: username + '@example.com',
      token: generateToken('mock_id'),
    });
  }

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const logoutUser = (req, res) => {
  // For JWT, logout is usually handled client-side by deleting the token.
  // We provide a successful response so the client knows it can proceed.
  res.status(200).json({ message: 'Logged out successfully' });
};

module.exports = {
  signupUser,
  loginUser,
  logoutUser,
};