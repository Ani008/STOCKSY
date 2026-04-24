const WebSocket = require("ws");
const protobuf = require("protobufjs");
const path = require("path");
const axios = require("axios"); // Add this!

let protoRoot = null;

const loadProto = async () => {
  protoRoot = await protobuf.load(
    path.join(__dirname, "../proto/MarketDataV3.proto"),
  );
};

const getAuthorizedUrl = async (accessToken) => {
  try {
    const response = await axios.get(
      "https://api.upstox.com/v3/feed/market-data-feed/authorize",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      },
    );
    // This returns a one-time use WSS URL
    return response.data.data.authorized_redirect_uri;
  } catch (error) {
    console.error(
      "❌ Error getting Auth URL:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

const initWebSocket = async (accessToken) => {
  await loadProto();
  const authorizedWsUrl = await getAuthorizedUrl(accessToken);

  // 1. Open the connection
  const ws = new WebSocket(authorizedWsUrl, {
    followRedirects: true,
    handshakeTimeout: 10000, // 10 seconds timeout
  });

  // 2. Set binary type (Crucial for Protobuf)
  ws.binaryType = "arraybuffer";

  ws.on("open", () => {
    console.log("🔗 WebSocket Connected. Sending subscription in 1s...");

    // A tiny delay helps Upstox "warm up" your session
    setTimeout(() => {
      const subData = {
        guid: `stocksy-${Date.now()}`, // Unique GUID is required
        method: "sub",
        data: {
          mode: "ltpc",
          instrumentKeys: ["NSE_EQ|INE002A01018"], // Reliance
        },
      };
      ws.send(JSON.stringify(subData));
      console.log("📡 Subscription Sent for Reliance");
    }, 1000);
  });

  ws.on("message", (data) => {
    try {
      const FeedResponse = protoRoot.lookup("FeedResponse");
      // Important: Use Uint8Array for the buffer
      const decodedMessage = FeedResponse.decode(new Uint8Array(data));

      if (decodedMessage.type === "market_info") {
        console.log("✅ Market Status Received: Segments are Synchronized.");
      } else if (decodedMessage.feeds) {
        console.log(
          "📈 LIVE DATA:",
          JSON.stringify(decodedMessage.feeds, null, 2),
        );
        // PUSH TO REDIS & SOCKET.IO HERE
      }
    } catch (e) {
      console.error("❌ Decoding Error:", e.message);
    }
  });

  ws.on("close", () => {
    console.log("⚠️ Connection Closed. Attempting reconnect in 5s...");
    setTimeout(() => initWebSocket(accessToken), 5000);
  });

  ws.on("error", (err) => console.error("❌ WebSocket Error:", err.message));
};

module.exports = { initWebSocket };
