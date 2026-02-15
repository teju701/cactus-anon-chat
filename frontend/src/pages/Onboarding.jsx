// frontend/src/pages/Onboarding.jsx
import { useNavigate } from "react-router-dom";
import { useDeviceId } from "../hooks/useDeviceId";

export default function Onboarding() {
  const { deviceId, loading } = useDeviceId();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="page-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="card">
        <div className="card-header">
          <div className="icon-wrapper">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>

          <h1 className="title">Anonymous Chat</h1>
          <p className="subtitle">No login. No identity. Just genuine conversation.</p>
        </div>

        <div className="features-grid">
          <div className="feature-box">
            <div className="feature-emoji">🔒</div>
            <div className="feature-label">100% Anonymous</div>
          </div>
          <div className="feature-box">
            <div className="feature-emoji">🛡️</div>
            <div className="feature-label">AI Verified</div>
          </div>
          <div className="feature-box">
            <div className="feature-emoji">⚡</div>
            <div className="feature-label">Instant Match</div>
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => navigate("/verify")}
          disabled={!deviceId}
        >
          Get Started →
        </button>

        <p className="text-tiny" style={{ textAlign: 'center', marginTop: '1rem' }}>
          Your privacy is protected. No data is stored permanently.
        </p>
      </div>
    </div>
  );
}