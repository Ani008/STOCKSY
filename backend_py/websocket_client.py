import asyncio
import json
import ssl
import os
import redis
import websockets
from dotenv import load_dotenv
from google.protobuf.json_format import MessageToDict
import MarketDataFeedV3_pb2 as pb
import ssl as ssl_lib

load_dotenv()

# Redis connection
r = redis.Redis(
    host=os.getenv('REDIS_HOST'),
    port=int(os.getenv('REDIS_PORT')),
    password=os.getenv('REDIS_PASSWORD'),
    ssl=False  # just turn it off
)

def get_market_data_feed_authorize_v3():
    access_token = os.getenv('UPSTOX_ACCESS_TOKEN')  # moved to .env
    headers = {
        'Accept': 'application/json',
        'Authorization': f'Bearer {access_token}'
    }
    url = 'https://api.upstox.com/v3/feed/market-data-feed/authorize'
    import requests
    api_response = requests.get(url=url, headers=headers)
    return api_response.json()

def decode_protobuf(buffer):
    feed_response = pb.FeedResponse()
    feed_response.ParseFromString(buffer)
    return feed_response

def save_to_redis(data_dict):
    """Save each instrument's data to Redis."""
    feeds = data_dict.get('feeds', {})
    
    for instrument_key, feed_data in feeds.items():
        # Save with 60 second expiry - auto cleans stale data
        r.setex(
            f"stock:{instrument_key}",  # key e.g. "stock:NSE_INDEX|Nifty 50"
            60,
            json.dumps(feed_data)
        )
        print(f"Saved to Redis: {instrument_key} → {feed_data}")

async def fetch_market_data():
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE

    response = get_market_data_feed_authorize_v3()
    
    async with websockets.connect(
        response["data"]["authorized_redirect_uri"], 
        ssl=ssl_context
    ) as websocket:
        print('Connection established')
        await asyncio.sleep(1)

        data = {
            "guid": "someguid",
            "method": "sub",
            "data": {
                "mode": "ltpc",
                "instrumentKeys": ["NSE_INDEX|Nifty 50"]
            }
        }

        binary_data = json.dumps(data).encode('utf-8')
        await websocket.send(binary_data)

        while True:
            message = await websocket.recv()
            decoded_data = decode_protobuf(message)
            data_dict = MessageToDict(decoded_data)
            
            # This is the only new line in your loop
            save_to_redis(data_dict)

asyncio.run(fetch_market_data())