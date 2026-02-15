// frontend/src/pages/Chat.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueue } from "../hooks/useQueue";
import { createChatSocket, closeSocket } from "../utils/websocket";
import ChatBox from "../components/ChatBox";
import QueueStatus from "../components/QueueStatus";
import ReportModal from "../components/ReportModal";

export default function Chat() {
  const { status, roomId, partner, error } = useQueue();
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (status === "matched" && roomId && partner) {
      const ws = createChatSocket(
        roomId,
        (msg) => {
          setMessages((prev) => [...prev, msg]);

          if (msg.type === "system") {
            if (msg.message.includes("reported")) {
              setTimeout(() => {
                closeSocket(ws);
                navigate("/profile");
              }, 3000);
            } else if (msg.message.includes("left") || msg.message.includes("disconnected")) {
              setTimeout(() => {
                closeSocket(ws);
                navigate("/profile");
              }, 2000);
            }
          }
        },
        (error) => {
          console.error("Chat error:", error);
        }
      );

      setSocket(ws);

      return () => {
        closeSocket(ws);
      };
    }
  }, [status, roomId, partner, navigate]);

  const handleMessageSent = (message) => {
    setMessages((prev) => [...prev, message]);
  };

  const leaveChat = () => {
    if (socket) {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "leave" }));
      }
      closeSocket(socket);
    }
    navigate("/profile");
  };

  const nextMatch = () => {
    if (socket) {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "leave" }));
      }
      closeSocket(socket);
    }
    
    // ✅ FIX: Only clear filter, keep profile
    sessionStorage.removeItem("filter");
    
    // Reload page to trigger new queue
    window.location.href = "/chat";
  };

  if (status !== "matched") {
    return <QueueStatus status={status} error={error} />;
  }

  const partnerDeviceId = partner?.device_id || null;

  return (
    <div style={{ minHeight: '100vh', padding: '1rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div className="chat-header">
          <div className="chat-user-info">
            <div className="chat-avatar">👤</div>
            <div className="chat-details">
              <h3>{partner?.nickname || "Anonymous"}</h3>
              {partner?.bio && <p>{partner.bio}</p>}
            </div>
          </div>

          <div className="chat-actions">
            <button onClick={nextMatch} className="btn btn-secondary" style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
              Next Match
            </button>
            <button onClick={leaveChat} className="btn btn-danger" style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
              Leave
            </button>
          </div>
        </div>

        {socket && (
          <ChatBox 
            socket={socket} 
            messages={messages} 
            onMessageSent={handleMessageSent}
          />
        )}

        {socket && partnerDeviceId && (
          <ReportModal socket={socket} partnerDeviceId={partnerDeviceId} />
        )}
      </div>
    </div>
  );
}