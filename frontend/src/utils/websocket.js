// frontend/src/utils/websocket.js

import { getDeviceIdSync } from "./device";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const WS_URL = API_URL.replace("http", "ws");

/**
 * Creates a WebSocket connection for chat.
 * 
 * @param {string} roomId - Chat room ID
 * @param {function} onMessage - Callback for incoming messages
 * @param {function} onError - Callback for errors (optional)
 * @returns {WebSocket} - WebSocket instance
 */
export function createChatSocket(roomId, onMessage, onError) {
  const deviceId = getDeviceIdSync();
  
  if (!deviceId) {
    console.error("❌ No device ID available");
    if (onError) onError(new Error("Device ID not initialized"));
    return null;
  }

  const wsUrl = `${WS_URL}/ws/chat/${roomId}?device_id=${deviceId}`;
  
  console.log("🔌 Connecting to:", wsUrl);
  
  const socket = new WebSocket(wsUrl);

  // Connection opened
  socket.onopen = () => {
    console.log("✅ WebSocket connected");
  };

  // Message received
  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (error) {
      console.error("❌ Failed to parse message:", error);
    }
  };

  // Connection error
  socket.onerror = (error) => {
    console.error("❌ WebSocket error:", error);
    if (onError) {
      onError(error);
    }
  };

  // Connection closed
  socket.onclose = (event) => {
    if (event.wasClean) {
      console.log(`✅ WebSocket closed cleanly (code=${event.code})`);
    } else {
      console.warn(`⚠️ WebSocket disconnected unexpectedly (code=${event.code})`);
    }
    
    if (event.reason) {
      console.log("Reason:", event.reason);
    }
  };

  return socket;
}

/**
 * Safely close a WebSocket connection.
 * 
 * @param {WebSocket} socket - Socket to close
 */
export function closeSocket(socket) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.close(1000, "User closed connection");
  }
}

/**
 * Send a message through WebSocket.
 * 
 * @param {WebSocket} socket - Active socket
 * @param {object} message - Message object to send
 * @returns {boolean} - True if sent successfully
 */
export function sendMessage(socket, message) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.error("❌ Cannot send: socket not open");
    return false;
  }

  try {
    socket.send(JSON.stringify(message));
    return true;
  } catch (error) {
    console.error("❌ Send failed:", error);
    return false;
  }
}