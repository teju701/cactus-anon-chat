import json
import uuid

from app.config import QUEUE_EXPIRY_SECONDS, ROOM_EXPIRY_SECONDS
from app.redis_client import get_redis_client


QUEUE_KEYS = ("queue:any", "queue:male", "queue:female")


def remove_user_from_queues(r, device_id: str):
    for queue_key in QUEUE_KEYS:
        for raw in r.lrange(queue_key, 0, -1):
            try:
                queued_user = json.loads(raw)
            except json.JSONDecodeError:
                r.lrem(queue_key, 0, raw)
                continue

            if queued_user.get("device_id") == device_id:
                r.lrem(queue_key, 0, raw)


def is_user_in_queue(r, device_id: str) -> bool:
    for queue_key in QUEUE_KEYS:
        for raw in r.lrange(queue_key, 0, -1):
            try:
                queued_user = json.loads(raw)
            except json.JSONDecodeError:
                r.lrem(queue_key, 0, raw)
                continue

            if queued_user.get("device_id") == device_id:
                return True

    return False


def try_match(user: dict):
    r = get_redis_client()
    if r is None:
        return None, None

    user_gender = user["gender"]
    user_filter = user["filter"]
    user_device_id = user["device_id"]

    possible_queues = (
        ["queue:any", f"queue:{user_gender}"]
        if user_filter == "any"
        else [f"queue:{user_filter}"]
    )

    for queue_key in possible_queues:
        try:
            size = r.llen(queue_key)
            print(f"Checking {queue_key}: {size} users waiting")

            for i in range(size):
                raw = r.lindex(queue_key, i)
                if not raw:
                    continue

                try:
                    partner = json.loads(raw)
                except json.JSONDecodeError:
                    r.lrem(queue_key, 0, raw)
                    continue

                if partner.get("device_id") == user_device_id:
                    continue

                partner_wants_me = (
                    partner.get("filter") == "any"
                    or partner.get("filter") == user_gender
                )

                i_want_partner = (
                    user_filter == "any"
                    or user_filter == partner.get("gender")
                )

                if partner_wants_me and i_want_partner:
                    removed = r.lrem(queue_key, 1, raw)
                    remove_user_from_queues(r, user_device_id)
                    print(f"Matched user. Removed {removed} queue entries.")

                    room_id = str(uuid.uuid4())
                    room_data = {
                        "user1": user_device_id,
                        "user2": partner["device_id"],
                        "user1_data": {
                            "nickname": user.get("nickname", "Anonymous"),
                            "bio": user.get("bio", ""),
                            "device_id": user_device_id,
                        },
                        "user2_data": {
                            "nickname": partner.get("nickname", "Anonymous"),
                            "bio": partner.get("bio", ""),
                            "device_id": partner["device_id"],
                        },
                    }

                    r.setex(f"room:{room_id}", ROOM_EXPIRY_SECONDS, json.dumps(room_data))

                    r.setex(
                        f"match:{user_device_id}",
                        60,
                        json.dumps(
                            {
                                "room_id": room_id,
                                "partner": {
                                    "device_id": partner["device_id"],
                                    "nickname": partner.get("nickname", "Anonymous"),
                                    "bio": partner.get("bio", ""),
                                },
                            }
                        ),
                    )

                    r.setex(
                        f"match:{partner['device_id']}",
                        60,
                        json.dumps(
                            {
                                "room_id": room_id,
                                "partner": {
                                    "device_id": user_device_id,
                                    "nickname": user.get("nickname", "Anonymous"),
                                    "bio": user.get("bio", ""),
                                },
                            }
                        ),
                    )

                    return room_id, {
                        "device_id": partner["device_id"],
                        "nickname": partner.get("nickname", "Anonymous"),
                        "bio": partner.get("bio", ""),
                    }

        except Exception as exc:
            print(f"Queue scan error: {exc}")
            import traceback

            traceback.print_exc()
            continue

    try:
        remove_user_from_queues(r, user_device_id)
        queue_key = f"queue:{user_filter}"
        r.rpush(queue_key, json.dumps(user))
        r.expire(queue_key, QUEUE_EXPIRY_SECONDS)
        print(f"Added or refreshed user in {queue_key}")
    except Exception as exc:
        print(f"Queue add error: {exc}")

    return None, None
