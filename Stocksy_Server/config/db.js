const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error. Starting in Mock Mode...');
    // process.exit(1); // Don't crash
  }
};

module.exports = connectDB;
