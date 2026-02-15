# backend/app/ws.py
from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict
import json
from app.redis_client import get_redis_client

active_rooms: Dict[str, Dict[str, WebSocket]] = {}

async def connect_to_room(room_id: str, device_id: str, websocket: WebSocket):
    await websocket.accept()
    if room_id not in active_rooms:
        active_rooms[room_id] = {}
    active_rooms[room_id][device_id] = websocket

def disconnect_from_room(room_id: str, device_id: str):
    if room_id in active_rooms:
        if device_id in active_rooms[room_id]:
            del active_rooms[room_id][device_id]
        if not active_rooms[room_id]:
            del active_rooms[room_id]

async def broadcast(room_id: str, message: dict, exclude_device: str = None):
    if room_id not in active_rooms:
        return
    
    dead_connections = []
    
    for device_id, ws in active_rooms[room_id].items():
        if device_id == exclude_device:
            continue
        try:
            await ws.send_text(json.dumps(message))
        except Exception as e:
            print(f"Failed to send to {device_id}: {e}")
            dead_connections.append(device_id)
    
    for device_id in dead_connections:
        disconnect_from_room(room_id, device_id)

async def websocket_handler(websocket: WebSocket, room_id: str, device_id: str):
    r = get_redis_client()
    
    await connect_to_room(room_id, device_id, websocket)
    
    # ✅ FIX: Only send if partner is ALREADY in room
    if len(active_rooms.get(room_id, {})) > 1:
        await broadcast(room_id, {
            "type": "system",
            "message": "Your partner has joined the chat"
        }, exclude_device=device_id)
    
    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            
            if payload.get("type") == "report":
                if r:
                    r.incr(f"report:{room_id}")
                    r.sadd("reported_users", payload.get("reported_device", ""))
                
                await broadcast(room_id, {
                    "type": "system",
                    "message": "This chat has been reported and will end."
                })
                
                for dev_id in list(active_rooms.get(room_id, {}).keys()):
                    ws = active_rooms[room_id][dev_id]
                    await ws.close()
                    disconnect_from_room(room_id, dev_id)
                break
            
            if payload.get("type") == "leave":
                await broadcast(room_id, {
                    "type": "system",
                    "message": "Your partner has left the chat"
                }, exclude_device=device_id)
                break
            
            if payload.get("type") == "message":
                await broadcast(room_id, {
                    "type": "message",
                    "text": payload.get("text", ""),
                    "sender": device_id
                }, exclude_device=device_id)
    
    except WebSocketDisconnect:
        await broadcast(room_id, {
            "type": "system",
            "message": "Your partner disconnected"
        }, exclude_device=device_id)
    
    finally:
        disconnect_from_room(room_id, device_id)