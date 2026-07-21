import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import ChatBox from "../components/ChatBox";
import QueueStatus from "../components/QueueStatus";
import ReportModal from "../components/ReportModal";
import { useQueue } from "../hooks/useQueue";
import { closeSocket, createChatSocket } from "../utils/websocket";


export default function Chat() {
  const { status, roomId, partner, error } = useQueue();
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (status !== "matched" || !roomId || !partner) {
      return undefined;
    }

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
      (socketError) => {
        console.error("Chat error:", socketError);
      },
    );

    setSocket(ws);

    return () => {
      closeSocket(ws);
    };
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

    window.location.href = "/chat";
  };

  if (status !== "matched") {
    return <QueueStatus status={status} error={error} />;
  }

  const partnerDeviceId = partner?.device_id || null;

  return (
    <div style={{ minHeight: "100vh", padding: "1rem" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div className="chat-header">
          <div className="chat-user-info">
            <div className="chat-avatar" aria-hidden="true">A</div>
            <div className="chat-details">
              <h3>{partner?.nickname || "Anonymous"}</h3>
              {partner?.bio && <p>{partner.bio}</p>}
            </div>
          </div>

          <div className="chat-actions">
            <button onClick={nextMatch} className="btn btn-secondary compact-btn">
              Next Match
            </button>
            <button onClick={leaveChat} className="btn btn-danger compact-btn">
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
