# backend/app/limits.py
import time
from app.redis_client import get_redis_client
from app.config import QUEUE_COOLDOWN_SECONDS, DAILY_FILTER_LIMIT, SPAM_THRESHOLD

def can_requeue(device_id: str) -> tuple[bool, int]:
    r = get_redis_client()
    if r is None:
        return True, 0
    
    try:
        # last = r.get(f"cooldown:{device_id}")
        
        # if last:
        #     elapsed = time.time() - float(last)
        #     if elapsed < QUEUE_COOLDOWN_SECONDS:
        #         return False, int(QUEUE_COOLDOWN_SECONDS - elapsed)
        
        # hourly_key = f"hourly:{device_id}"
        # count = int(r.get(hourly_key) or 0)
        
        # if count >= SPAM_THRESHOLD:
        #     return False, 3600
        
        # ✅ FIX: Only increment and set cooldown AFTER successful queue join
        return True, 0
    except Exception as e:
        print(f"⚠️ Rate limit check failed: {e}")
        return True, 0

def record_queue_attempt(device_id: str):
    """Call this AFTER adding user to queue"""
    r = get_redis_client()
    if r is None:
        return
    
    try:
        r.incr(f"hourly:{device_id}")
        r.expire(f"hourly:{device_id}", 3600)
        r.setex(f"cooldown:{device_id}", 10, time.time())
    except Exception as e:
        print(f"⚠️ Record attempt failed: {e}")

def can_use_filter(device_id: str, filter_choice: str) -> tuple[bool, int]:
    if filter_choice == "any":
        return True, -1
    
    r = get_redis_client()
    if r is None:
        return True, -1
    
    try:
        key = f"filter:{device_id}:{filter_choice}"
        count = int(r.get(key) or 0)
        remaining = DAILY_FILTER_LIMIT - count
        
        if remaining <= 0:
            return False, 0
        
        r.incr(key)
        r.expire(key, 86400)
        
        return True, remaining - 1
    except Exception as e:
        print(f"⚠️ Filter limit check failed: {e}")
        return True, -1

def clear_spam_ban(device_id: str):
    r = get_redis_client()
    if r is None:
        return
    
    try:
        r.delete(f"cooldown:{device_id}")
        r.delete(f"hourly:{device_id}")
        for filter_type in ["male", "female"]:
            r.delete(f"filter:{device_id}:{filter_type}")
    except Exception as e:
        print(f"⚠️ Clear ban failed: {e}")