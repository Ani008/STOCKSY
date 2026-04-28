import asyncio
import json
import ssl
import os
import redis
import websockets
from dotenv import load_dotenv
from google.protobuf.json_format import MessageToDict
import MarketDataFeedV3_pb2 as pb

load_dotenv()

# ─── Redis connection ─────────────────────────────────────────────────────────
r = redis.Redis(
    host=os.getenv('REDIS_HOST'),
    port=int(os.getenv('REDIS_PORT')),
    password=os.getenv('REDIS_PASSWORD'),
    ssl=False
)

# ─── Instruments to subscribe ─────────────────────────────────────────────────
INSTRUMENT_KEYS = ["NSE_INDEX|Nifty 50", "NSE_INDEX|Nifty Bank"]

# ─── Reconnect config ─────────────────────────────────────────────────────────
RECONNECT_DELAY = 5   # seconds to wait before reconnecting


def get_market_data_feed_authorize_v3():
    import requests
    access_token = os.getenv('UPSTOX_ACCESS_TOKEN')
    headers = {
        'Accept': 'application/json',
        'Authorization': f'Bearer {access_token}'
    }
    url = 'https://api.upstox.com/v3/feed/market-data-feed/authorize'
    api_response = requests.get(url=url, headers=headers)
    return api_response.json()


def decode_protobuf(buffer):
    feed_response = pb.FeedResponse()
    feed_response.ParseFromString(buffer)
    return feed_response


def save_to_redis(data_dict):
    feeds = data_dict.get('feeds', {})
    for instrument_key, feed_data in feeds.items():
        r.setex(
            f"stock:{instrument_key}",
            60,
            json.dumps(feed_data)
        )
        print(f"Saved to Redis: {instrument_key} → {feed_data}")


async def connect_and_stream():
    """Single connection attempt. Raises on failure so the outer loop can retry."""
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE

    print("Fetching authorized WebSocket URL...")
    response = get_market_data_feed_authorize_v3()
    ws_url = response["data"]["authorized_redirect_uri"]

    # ── Key fix: ping_interval + ping_timeout ────────────────────────────────
    # ping_interval=20  → send a ping every 20 seconds to keep connection alive
    # ping_timeout=30   → wait up to 30s for pong before declaring connection dead
    # close_timeout=10  → give 10s for clean close handshake
    async with websockets.connect(
        ws_url,
        ssl=ssl_context,
        ping_interval=20,
        ping_timeout=30,
        close_timeout=10,
    ) as websocket:
        print("Connection established")
        await asyncio.sleep(1)

        # Subscribe to instruments
        sub_msg = {
            "guid": "stocksy-guid",
            "method": "sub",
            "data": {
                "mode": "ltpc",
                "instrumentKeys": INSTRUMENT_KEYS
            }
        }
        await websocket.send(json.dumps(sub_msg).encode('utf-8'))
        print(f"Subscribed to: {INSTRUMENT_KEYS}")

        # ── Message loop ─────────────────────────────────────────────────────
        async for message in websocket:
            # `async for` is cleaner than `while True` + recv()
            # it also handles connection close gracefully
            try:
                decoded_data = decode_protobuf(message)
                data_dict = MessageToDict(decoded_data)
                save_to_redis(data_dict)
            except Exception as e:
                # Don't crash the whole connection on a bad message
                print(f"Error processing message: {e}")


async def fetch_market_data():
    """Outer loop — reconnects automatically on any error."""
    while True:
        try:
            await connect_and_stream()
        except websockets.exceptions.ConnectionClosedError as e:
            print(f"Connection closed: {e}. Reconnecting in {RECONNECT_DELAY}s...")
        except websockets.exceptions.WebSocketException as e:
            print(f"WebSocket error: {e}. Reconnecting in {RECONNECT_DELAY}s...")
        except Exception as e:
            print(f"Unexpected error: {e}. Reconnecting in {RECONNECT_DELAY}s...")
        
        await asyncio.sleep(RECONNECT_DELAY)


asyncio.run(fetch_market_data())