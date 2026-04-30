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
INSTRUMENT_KEYS = [
    # ── Indices (5) ──────────────────────────────────────────
    "NSE_INDEX|Nifty 50",
    "NSE_INDEX|Nifty Bank",

    # ── Banking & Finance (8) ─────────────────────────────────
    "NSE_EQ|INE040A01034",   # HDFCBANK
    "NSE_EQ|INE090A01021",   # ICICIBANK
    "NSE_EQ|INE062A01020",   # SBIN
    "NSE_EQ|INE238A01034",   # AXISBANK
    "NSE_EQ|INE296A01032",   # BAJFINANCE
    "NSE_EQ|INE237A01036",   # KOTAKBANK
    "NSE_EQ|INE795G01014",   # HDFCLIFE
    "NSE_EQ|INE918I01026",   # BAJAJFINSV

    # ── IT (6) ───────────────────────────────────────────────
    "NSE_EQ|INE467B01029",   # TCS
    "NSE_EQ|INE009A01021",   # INFY
    "NSE_EQ|INE075A01022",   # WIPRO
    "NSE_EQ|INE860A01027",   # HCL Technologies
    "NSE_EQ|INE669C01036",   # TECHM
    "NSE_EQ|INE214T01019",   # LTIM

    # ── Oil & Energy (5) ─────────────────────────────────────
    "NSE_EQ|INE002A01018",   # Reliance
    "NSE_EQ|INE213A01029",   # ONGC
    "NSE_EQ|INE029A01011",   # BPCL
    "NSE_EQ|INE752E01010",   # POWERGRID
    "NSE_EQ|INE733E01010",   # NTPC

    # ── Auto (5) ─────────────────────────────────────────────
    "NSE_EQ|INE585B01010",   # MARUTI
    "NSE_EQ|INE1TAE01010",   # TATAMOTORS
    "NSE_EQ|INE158A01026",   # HEROMOTOCO
    "NSE_EQ|INE917I01010",   # BAJAJ-AUTO
    "NSE_EQ|INE066A01021",   # EICHERMOT

    # ── FMCG (5) ─────────────────────────────────────────────
    "NSE_EQ|INE030A01027",   # HUL
    "NSE_EQ|INE154A01025",   # ITC
    "NSE_EQ|INE239A01024",   # NESTLEIND
    "NSE_EQ|INE016A01026",   # DABUR
    "NSE_EQ|INE216A01030",   # BRITANNIA

    # ── Pharma (4) ───────────────────────────────────────────
    "NSE_EQ|INE044A01036",   # SUNPHARMA
    "NSE_EQ|INE089A01031",   # DRREDDY
    "NSE_EQ|INE059A01026",   # CIPLA
    "NSE_EQ|INE361B01024",   # DIVISLAB

    # ── Metals & Mining (4) ──────────────────────────────────
    "NSE_EQ|INE081A01020",   # TATASTEEL
    "NSE_EQ|INE038A01020",   # HINDALCO
    "NSE_EQ|INE019A01038",   # JSWSTEEL
    "NSE_EQ|INE522F01014",   # COALINDIA

    # ── Telecom & Others (4) ─────────────────────────────────
    "NSE_EQ|INE397D01024",   # BHARTIARTL
    "NSE_EQ|INE742F01042",   # ADANIPORTS
    "NSE_EQ|INE364U01010",   # ADANIGREEN
    "NSE_EQ|INE481G01011",   # ULTRACEMCO

    # ── Infrastructure & Capital Goods (4) ───────────────────
    "NSE_EQ|INE018A01030",   # LARSEN
    "NSE_EQ|INE047A01021",   # GRASIM
    "NSE_EQ|INE423A01024",   # ADANIENT
    "NSE_EQ|INE1NPP01017",   # SIEMENS
]

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
    if not feeds:
        print("⚠️  Empty feeds received — check instrument keys")
        return
    
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