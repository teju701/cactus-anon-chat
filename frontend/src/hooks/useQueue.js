// frontend/src/hooks/useQueue.js
import { useEffect, useState, useRef } from "react";
import { getDeviceIdSync } from "../utils/device";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export function useQueue() {
  const [status, setStatus] = useState("idle");
  const [roomId, setRoomId] = useState(null);
  const [partner, setPartner] = useState(null);
  const [error, setError] = useState(null);
  
  const isMounted = useRef(true);
  const timeoutRef = useRef(null);
  const retryCount = useRef(0);
  
  const MAX_RETRIES = 60;

  useEffect(() => {
    isMounted.current = true;

    async function joinQueue() {
      if (!isMounted.current) return;

      if (retryCount.current >= MAX_RETRIES) {
        setError("No matches found. Please try again later.");
        setStatus("error");
        return;
      }

      setStatus("queueing");

      try {
        const payload = {
          device_id: getDeviceIdSync(),
          gender: sessionStorage.getItem("gender"),
          filter: sessionStorage.getItem("filter") || "any",
          nickname: sessionStorage.getItem("nickname"),
          bio: sessionStorage.getItem("bio") || "",
        };

        // ✅ DEBUG: Log payload
        console.log("📤 Sending to /queue/join:", payload);

        const res = await fetch(`${API_URL}/queue/join`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!isMounted.current) return;

        // ✅ DEBUG: Log response
        const data = await res.json();
        console.log("📥 Received from /queue/join:", data);

        if (!res.ok) {
          console.error("❌ Server error:", res.status, data);
          throw new Error(`Server error: ${res.status}`);
        }

        if (data.status === "matched") {
          console.log("✅ MATCHED! Room:", data.room_id, "Partner:", data.partner);
          setRoomId(data.room_id);
          setPartner(data.partner);
          setStatus("matched");
          retryCount.current = 0;
        } else if (data.status === "waiting") {
          console.log("⏳ Waiting... retry", retryCount.current + 1);
          setStatus("waiting");
          retryCount.current += 1;
          
          if (isMounted.current) {
            timeoutRef.current = setTimeout(joinQueue, 3000);
          }
        } else if (data.status === "cooldown") {
          const waitTime = data.retry_after || 30;
          setError(`Please wait ${waitTime} seconds before trying again`);
          setStatus("cooldown");
          
          if (isMounted.current) {
            timeoutRef.current = setTimeout(joinQueue, waitTime * 1000);
          }
        } else if (data.status === "limit_reached") {
          setError(data.message || "Daily limit reached. Try 'Any' filter.");
          setStatus("limited");
        } else {
          throw new Error(`Unknown status: ${data.status}`);
        }
      } catch (err) {
        if (!isMounted.current) return;
        
        console.error("❌ Queue error:", err);
        setError(err.message || "Failed to join queue. Check your connection.");
        setStatus("error");
      }
    }

    joinQueue();

    return () => {
      isMounted.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  return { status, roomId, partner, error };
}