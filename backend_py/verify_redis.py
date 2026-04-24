import redis
import os
import time
from dotenv import load_dotenv

load_dotenv()

r = redis.Redis(
    host=os.getenv('REDIS_HOST'),
    port=int(os.getenv('REDIS_PORT')),
    password=os.getenv('REDIS_PASSWORD'),
    ssl=False
)

print("Watching Redis live... (Ctrl+C to stop)\n")

while True:
    keys = r.keys("stock:*")
    
    for key in keys:
        value = r.get(key)
        if value:
            print(f"{key.decode()} → {value.decode()}")
    
    print("---")
    time.sleep(1)  # check every second