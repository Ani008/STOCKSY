require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const connectDB = require('./config/db');
require('./config/postgres');
const { initWebSocket } = require('./services/websocketService');


const app = express();
connectDB();

const server = http.createServer(app);

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// 🔍 DEBUG: Log every incoming request so you can see if the server is even
//    receiving calls from the app. If you hit signup and see nothing here,
//    the problem is 100% the API_BASE_URL in your .env / api.js.
app.use((req, res, next) => {
  console.log(`\n📨 [${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('   Headers:', JSON.stringify(req.headers, null, 2));
  if (Object.keys(req.body || {}).length) {
    console.log('   Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/wallet', require('./routes/wallet'));
app.use('/api/historical', require('./routes/historical'));

// ─── Health check — hit this first from the app to confirm connectivity ───────
// From the app: fetch('http://<YOUR_LAN_IP>:5000/health').then(r => r.text()).then(console.log)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    mongoState: ['disconnected', 'connected', 'connecting', 'disconnecting'][
      require('mongoose').connection.readyState
    ],
    timestamp: new Date().toISOString(),
  });
});

// ─── Services ─────────────────────────────────────────────────────────────────
initWebSocket(server);

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[ERROR HANDLER]', err.stack);
  res.status(500).send({ message: 'Something went wrong!' });
});

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`🔌 WebSocket enabled on port ${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log('\n⚠️  For React Native on a REAL DEVICE or Android emulator:');
  console.log('   Use your LAN IP in .env — NOT localhost!');
  console.log('   Find it with: ipconfig (Windows) or ifconfig (Mac/Linux)');
  console.log('   Example: API_BASE_URL=http://192.168.1.42:5000/api\n');
});