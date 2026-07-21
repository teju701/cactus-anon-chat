import redis

from app.config import REDIS_URL


redis_client = None


def get_redis_client():
    """
    Return a lazily initialized Redis client.
    """
    global redis_client

    if redis_client is None:
        try:
            url_lower = REDIS_URL.lower()
            redis_kwargs = {
                "decode_responses": True,
                "socket_connect_timeout": 10,
                "socket_timeout": 10,
                "retry_on_timeout": True,
                "health_check_interval": 30,
            }

            if url_lower.startswith("rediss://"):
                redis_kwargs["ssl_cert_reqs"] = None

            redis_client = redis.Redis.from_url(REDIS_URL, **redis_kwargs)
            redis_client.ping()
            print(f"Redis connected: {REDIS_URL[:30]}...")
        except Exception as exc:
            print(f"Redis connection failed: {exc}")
            print("App will run without Redis; queue and limits are disabled.")
            redis_client = None

    return redis_client
