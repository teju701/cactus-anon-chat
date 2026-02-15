// frontend/src/components/ChatBox.jsx
import { useState, useEffect, useRef } from "react";
import { getDeviceIdSync } from "../utils/device";

export default function ChatBox({ socket, messages, onMessageSent }) {
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);
  const deviceId = getDeviceIdSync();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!text.trim() || !socket) return;

    const messageText = text.trim();

    // Send to server
    socket.send(
      JSON.stringify({
        type: "message",
        text: messageText,
      })
    );

    // ✅ Add to local messages immediately (optimistic update)
    if (onMessageSent) {
      onMessageSent({
        type: "message",
        text: messageText,
        sender: deviceId,
      });
    }

    setText("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: '#6b7280', marginTop: '5rem' }}>
            <p className="text-small">Start a conversation...</p>
          </div>
        )}

        {messages.map((m, i) => {
          if (m.type === "system") {
            return (
              <div key={i} className="system-message">
                {m.message}
              </div>
            );
          }

          const isOwnMessage = m.sender === deviceId;

          return (
            <div key={i} className={`message-wrapper ${isOwnMessage ? "own" : ""}`}>
              <div className={`message-bubble ${isOwnMessage ? "own" : "other"}`}>
                {m.text}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="chat-input"
          rows={1}
        />
        <button
          onClick={sendMessage}
          disabled={!text.trim()}
          className="send-btn"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  );
}