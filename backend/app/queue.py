# backend/app/queue.py
import uuid
import json
from app.redis_client import get_redis_client
from app.config import QUEUE_EXPIRY_SECONDS, ROOM_EXPIRY_SECONDS

def try_match(user: dict):
    r = get_redis_client()
    if r is None:
        return None, None

    user_gender = user["gender"]
    user_filter = user["filter"]
    user_device_id = user["device_id"]

    # Determine which queues to check
    possible_queues = (
        ["queue:any", f"queue:{user_gender}"]
        if user_filter == "any"
        else [f"queue:{user_filter}"]
    )

    for queue_key in possible_queues:
        try:
            size = r.llen(queue_key)
            print(f"🔍 Checking {queue_key}: {size} users waiting")

            for i in range(size):
                raw = r.lindex(queue_key, i)
                if not raw:
                    continue

                partner = json.loads(raw)
                
                # ✅ CRITICAL: Skip self-matching
                if partner["device_id"] == user_device_id:
                    print(f"⏭️ Skipping self: {user_device_id}")
                    continue

                partner_wants_me = (
                    partner["filter"] == "any"
                    or partner["filter"] == user_gender
                )

                i_want_partner = (
                    user_filter == "any"
                    or user_filter == partner["gender"]
                )

                print(f"🤝 Match check: Me({user_gender},{user_filter}) vs Partner({partner['gender']},{partner['filter']})")
                print(f"   Partner wants me: {partner_wants_me}, I want partner: {i_want_partner}")

                if partner_wants_me and i_want_partner:
                    # ✅ REMOVE from queue BEFORE creating room
                    removed = r.lrem(queue_key, 1, raw)
                    print(f"✅ MATCHED! Removed {removed} from queue")

                    room_id = str(uuid.uuid4())
                    
                    # ✅ Store room with both users
                    room_data = {
                        "user1": user_device_id,
                        "user2": partner["device_id"],
                        "user1_data": {
                            "nickname": user.get("nickname", "Anonymous"),
                            "bio": user.get("bio", ""),
                            "device_id": user_device_id
                        },
                        "user2_data": {
                            "nickname": partner.get("nickname", "Anonymous"),
                            "bio": partner.get("bio", ""),
                            "device_id": partner["device_id"]
                        }
                    }
                    
                    r.setex(f"room:{room_id}", ROOM_EXPIRY_SECONDS, json.dumps(room_data))
                    print(f"💾 Created room: {room_id}")

                    # ✅ CRITICAL: Store match for BOTH users
                    # This allows the waiting user to get their match on next poll
                    r.setex(f"match:{user_device_id}", 60, json.dumps({
                        "room_id": room_id,
                        "partner": {
                            "device_id": partner["device_id"],
                            "nickname": partner.get("nickname", "Anonymous"),
                            "bio": partner.get("bio", "")
                        }
                    }))
                    
                    r.setex(f"match:{partner['device_id']}", 60, json.dumps({
                        "room_id": room_id,
                        "partner": {
                            "device_id": user_device_id,
                            "nickname": user.get("nickname", "Anonymous"),
                            "bio": user.get("bio", "")
                        }
                    }))
                    
                    print(f"✅ Stored matches for both users")

                    partner_response = {
                        "device_id": partner["device_id"],
                        "nickname": partner.get("nickname", "Anonymous"),
                        "bio": partner.get("bio", "")
                    }

                    return room_id, partner_response

        except Exception as e:
            print(f"⚠️ Queue scan error: {e}")
            import traceback
            traceback.print_exc()
            continue

    # No match found - add to queue
    try:
        queue_key = f"queue:{user_filter}"
        r.rpush(queue_key, json.dumps(user))
        r.expire(queue_key, QUEUE_EXPIRY_SECONDS)
        print(f"📝 Added to {queue_key}")
    except Exception as e:
        print(f"⚠️ Queue add error: {e}")

    return None, None