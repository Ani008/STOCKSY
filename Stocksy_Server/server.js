require('dotenv').config(); // Load this first
const express = require('express');
const cors = require('cors');
const http = require('http');
const connectDB = require('./config/db');
const { initWebSocket } = require('./services/websocketService');

// 1. Initialize App & Database
const app = express();
connectDB();

// 2. Create HTTP Server for shared port (Express + WebSocket)
const server = http.createServer(app);

// 3. Global Middleware
app.use(cors());
app.use(express.json()); // Built-in body parser

// 4. Routes
app.use('/api/auth', require('./routes/auth'));
// app.use('/api/reports', require('./routes/reports')); // For your dashboard reports

// 5. Initialize Services
initWebSocket(server);

// 6. Global Error Handler (Good practice)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: 'Something went wrong!' });
});

// 7. Start Shared Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔌 WebSocket enabled on port ${PORT}`);
});