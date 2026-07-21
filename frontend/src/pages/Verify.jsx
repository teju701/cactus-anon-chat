import { useState } from "react";
import { useNavigate } from "react-router-dom";

import CameraCapture from "../components/CameraCapture";
import { useDeviceId } from "../hooks/useDeviceId";


const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";


export default function Verify() {
  const { deviceId, loading } = useDeviceId();
  const [status, setStatus] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="page-container">
        <div className="spinner"></div>
      </div>
    );
  }

  const handleCapture = async ({ image, timestamp }) => {
    setIsVerifying(true);
    setStatus("Analyzing...");

    try {
      const res = await fetch(`${API_URL}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          device_id: deviceId,
          image,
          timestamp,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Verification failed");
      }

      sessionStorage.setItem("gender", data.gender);
      sessionStorage.setItem("is_verified", "true");

      setStatus(`Verified as ${data.gender.toUpperCase()}. Redirecting...`);
      setTimeout(() => navigate("/profile"), 1500);
    } catch (err) {
      console.error("Verify failed:", err);
      setStatus(err.message);
      setIsVerifying(false);
    }
  };

  const alertClass = status.startsWith("Verified")
    ? "alert-success"
    : status === "Analyzing..."
      ? "alert-info"
      : "alert-error";

  return (
    <div className="page-container">
      <div className="card">
        <div className="card-header">
          <div className="icon-wrapper" aria-hidden="true">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <h2 className="title">Live Verification</h2>
          <p className="subtitle">Capture a live selfie. Your photo is never stored.</p>
        </div>

        <CameraCapture onCapture={handleCapture} isVerifying={isVerifying} />

        {status && (
          <div className={`alert ${alertClass}`}>
            {status}
          </div>
        )}

        <div className="alert alert-warning" style={{ marginTop: "1rem" }}>
          <p className="text-tiny">Image is analyzed in real time and never saved.</p>
        </div>
      </div>
    </div>
  );
}
