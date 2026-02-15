# backend/app/redis_client.py

import redis
from app.config import REDIS_URL

redis_client = None

def get_redis_client():
    """
    Returns a Redis client instance.
    Lazy initialization with connection pooling.
    """
    global redis_client
    
    if redis_client is None:
        try:
            url_lower = REDIS_URL.lower()
            
            if url_lower.startswith('rediss://') or 'render.com' in url_lower:
                redis_client = redis.Redis.from_url(
                    REDIS_URL,
                    decode_responses=True,
                    socket_connect_timeout=10,
                    socket_timeout=10,
                    retry_on_timeout=True,
                    health_check_interval=30,
                    ssl_cert_reqs=None
                )
            else:
                redis_client = redis.Redis.from_url(
                    REDIS_URL,
                    decode_responses=True,
                    socket_connect_timeout=5,
                    socket_timeout=5,
                    retry_on_timeout=True,
                    health_check_interval=30
                )
            
            redis_client.ping()
            print(f"✅ Redis connected: {REDIS_URL[:30]}...")
        except Exception as e:
            print(f"⚠️ Redis connection failed: {e}")
            print(f"⚠️ App will run without Redis (queue/limits disabled)")
            redis_client = None
    
    return redis_client

