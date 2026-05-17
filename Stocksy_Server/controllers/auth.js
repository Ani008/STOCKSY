const User = require("../models/User");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const pool = require("../config/postgres");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

const signupUser = async (req, res) => {
  console.log("\n───────────────────────────────────────");
  console.log("[SIGNUP] Request received");
  console.log("[SIGNUP] Body:", JSON.stringify(req.body, null, 2));
  console.log("[SIGNUP] MongoDB readyState:", mongoose.connection.readyState);
  // readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting

  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    console.log(
      "[SIGNUP] ❌ Missing fields — username:",
      username,
      "| email:",
      email,
      "| password:",
      !!password,
    );
    return res
      .status(400)
      .json({ message: "username, email and password are all required" });
  }

  // Mock Mode (DB not connected)
  if (mongoose.connection.readyState !== 1) {
    console.log("[SIGNUP] ⚠️  DB not connected — running in mock mode");
    return res.status(201).json({
      _id: "mock_id_" + Date.now(),
      username,
      email,
      demoBalance: 1000000,
      token: generateToken("mock_id"),
    });
  }

  try {
    console.log("[SIGNUP] Checking if user already exists...");
    const userExists = await User.findOne({ $or: [{ email }, { username }] });

    if (userExists) {
      console.log(
        "[SIGNUP] ❌ User already exists:",
        userExists.email,
        "/",
        userExists.username,
      );
      return res.status(400).json({ message: "User already exists" });
    }

    console.log("[SIGNUP] Creating new user...");
    const user = await User.create({ username, email, password });
    await pool.query(
      `
  INSERT INTO users (
    mongo_user_id,
    username,
    email
  )
  VALUES ($1, $2, $3)
  `,
      [user._id.toString(), user.username, user.email],
    );
    console.log("[SIGNUP] ✅ User created:", user._id);

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      demoBalance: user.demoBalance,
      token: generateToken(user._id),
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
  console.log("[LOGIN] MongoDB readyState:", mongoose.connection.readyState);

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

  // Mock Mode — FIXED: original code referenced undefined `username`
  if (mongoose.connection.readyState !== 1) {
    const mockUsername = email.split("@")[0];
    console.log(
      "[LOGIN] ⚠️  DB not connected — running in mock mode for:",
      email,
    );
    return res.json({
      _id: "mock_id_" + Date.now(),
      username: mockUsername,
      email,
      demoBalance: 1000000,
      token: generateToken("mock_id"),
    });
  }

  try {
    console.log("[LOGIN] Looking up user by email:", email);
    const user = await User.findOne({ email });

    if (!user) {
      console.log("[LOGIN] ❌ No user found for email:", email);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    console.log("[LOGIN] User found:", user._id, "— checking password...");
    const isMatch = await user.matchPassword(password);
    console.log("[LOGIN] Password match:", isMatch);

    if (isMatch) {
      console.log("[LOGIN] ✅ Login successful for:", user.username);
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        demoBalance: user.demoBalance,
        token: generateToken(user._id),
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
