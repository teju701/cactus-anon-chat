import { getDeviceIdSync } from "./device";


const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const WS_URL = API_URL.replace(/^http/, "ws");


export function createChatSocket(roomId, onMessage, onError) {
  const deviceId = getDeviceIdSync();

  if (!deviceId) {
    const error = new Error("Device ID not initialized");
    console.error(error.message);
    if (onError) onError(error);
    return null;
  }

  const wsUrl = `${WS_URL}/ws/chat/${roomId}?device_id=${deviceId}`;
  const socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    console.log("WebSocket connected");
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (error) {
      console.error("Failed to parse message:", error);
    }
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
    if (onError) onError(error);
  };

  socket.onclose = (event) => {
    if (event.wasClean) {
      console.log(`WebSocket closed cleanly (code=${event.code})`);
    } else {
      console.warn(`WebSocket disconnected unexpectedly (code=${event.code})`);
    }
  };

  return socket;
}


export function closeSocket(socket) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.close(1000, "User closed connection");
  }
}


export function sendMessage(socket, message) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.error("Cannot send: socket not open");
    return false;
  }

  try {
    socket.send(JSON.stringify(message));
    return true;
  } catch (error) {
    console.error("Send failed:", error);
    return false;
  }
}
