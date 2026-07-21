import json

from fastapi import FastAPI, HTTPException, Query, WebSocket
from fastapi.middleware.cors import CORSMiddleware

from app.config import CORS_ORIGINS
from app.limits import can_requeue, can_use_filter, record_queue_attempt
from app.models import QueueJoinRequest
from app.queue import is_user_in_queue, try_match
from app.redis_client import get_redis_client
from app.verify_gender import verify_router


app = FastAPI(title="Controlled Anon Chat API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(verify_router)


@app.get("/")
def health_check():
    r = get_redis_client()
    redis_connected = False

    if r:
        try:
            redis_connected = bool(r.ping())
        except Exception:
            redis_connected = False

    return {
        "status": "ok",
        "redis": "connected" if redis_connected else "disconnected",
    }


@app.post("/queue/join")
def join_queue(req: QueueJoinRequest):
    try:
        r = get_redis_client()
        if r is None:
            raise HTTPException(503, "Queue service unavailable")

        existing_match = r.get(f"match:{req.device_id}")
        if existing_match:
            match_data = json.loads(existing_match)
            r.delete(f"match:{req.device_id}")
            return {
                "status": "matched",
                "room_id": match_data["room_id"],
                "partner": match_data["partner"],
            }

        already_waiting = is_user_in_queue(r, req.device_id)

        if not already_waiting:
            can_queue, retry_after = can_requeue(req.device_id)
            if not can_queue:
                return {
                    "status": "cooldown",
                    "retry_after": retry_after,
                }

            can_filter, remaining = can_use_filter(req.device_id, req.filter)
            if not can_filter:
                return {
                    "status": "limit_reached",
                    "remaining": remaining,
                    "message": f"Daily limit reached for '{req.filter}' filter. Try 'Any'.",
                }

        room_id, partner = try_match(req.model_dump())
        if not already_waiting:
            record_queue_attempt(req.device_id)

        if room_id:
            return {
                "status": "matched",
                "room_id": room_id,
                "partner": partner,
            }

        return {"status": "waiting"}

    except HTTPException:
        raise
    except Exception as exc:
        print(f"Queue join error: {exc}")
        import traceback

        traceback.print_exc()
        raise HTTPException(500, "Failed to join queue")


@app.websocket("/ws/chat/{room_id}")
async def chat_socket(websocket: WebSocket, room_id: str, device_id: str = Query(...)):
    try:
        r = get_redis_client()
        if r is None:
            await websocket.close(code=4000, reason="Service unavailable")
            return

        room_data = r.get(f"room:{room_id}")
        if not room_data:
            await websocket.close(code=4004, reason="Room not found")
            return

        users = json.loads(room_data)
        if device_id not in (users["user1"], users["user2"]):
            await websocket.close(code=4003, reason="Unauthorized")
            return

        from app.ws import websocket_handler

        await websocket_handler(websocket, room_id, device_id)

    except Exception as exc:
        print(f"WebSocket error: {exc}")
        import traceback

        traceback.print_exc()
        await websocket.close(code=4000, reason="Internal error")
