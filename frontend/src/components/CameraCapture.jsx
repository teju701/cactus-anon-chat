import { useEffect, useRef, useState } from "react";


export default function CameraCapture({ onCapture, isVerifying }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraReady, setCameraReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user" } })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraReady(true);
        }
      })
      .catch(() => {
        setError("Camera access denied. Please enable camera permissions.");
      });

    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || video.paused || video.ended) {
      setError("Live video required. No screenshots allowed.");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    const imageBase64 = canvas.toDataURL("image/jpeg");
    const timestamp = Date.now();

    stopCamera();
    onCapture({ image: imageBase64, timestamp });
  };

  if (error) {
    return (
      <div className="alert alert-error">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="camera-container">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="camera-video"
        />

        {cameraReady && (
          <div className="camera-overlay">
            <div className="face-outline"></div>
          </div>
        )}

        {!cameraReady && (
          <div className="camera-overlay">
            <div className="spinner"></div>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }} />

      <button
        onClick={capture}
        disabled={!cameraReady || isVerifying}
        className="btn btn-primary"
      >
        {isVerifying ? (
          <span className="btn-content">
            <span className="spinner small-spinner"></span>
            Verifying...
          </span>
        ) : (
          "Capture Photo"
        )}
      </button>
    </div>
  );
}
