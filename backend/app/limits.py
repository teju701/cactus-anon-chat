import time

from app.config import DAILY_FILTER_LIMIT, SPAM_THRESHOLD
from app.redis_client import get_redis_client


def can_requeue(device_id: str) -> tuple[bool, int]:
    r = get_redis_client()
    if r is None:
        return True, 0

    try:
        count = int(r.get(f"hourly:{device_id}") or 0)
        if count >= SPAM_THRESHOLD:
            return False, 3600

        return True, 0
    except Exception as exc:
        print(f"Rate limit check failed: {exc}")
        return True, 0


def record_queue_attempt(device_id: str):
    r = get_redis_client()
    if r is None:
        return

    try:
        r.incr(f"hourly:{device_id}")
        r.expire(f"hourly:{device_id}", 3600)
        r.setex(f"last_queue_attempt:{device_id}", 3600, time.time())
    except Exception as exc:
        print(f"Record attempt failed: {exc}")


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
    except Exception as exc:
        print(f"Filter limit check failed: {exc}")
        return True, -1


def clear_spam_ban(device_id: str):
    r = get_redis_client()
    if r is None:
        return

    try:
        r.delete(f"last_queue_attempt:{device_id}")
        r.delete(f"hourly:{device_id}")
        for filter_type in ["male", "female"]:
            r.delete(f"filter:{device_id}:{filter_type}")
    except Exception as exc:
        print(f"Clear ban failed: {exc}")
