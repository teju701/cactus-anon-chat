// frontend/src/components/QueueStatus.jsx
export default function QueueStatus({ status, error }) {
  if (error) {
    return (
      <div className="page-container">
        <div className="card queue-container">
          <div className="icon-wrapper" style={{ background: 'rgba(239, 68, 68, 0.2)' }}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="title" style={{ color: '#f87171' }}>Error</h3>
          <p className="subtitle">{error}</p>
        </div>
      </div>
    );
  }

  if (status === "queueing" || status === "waiting") {
    return (
      <div className="page-container">
        <div className="card queue-container">
          <div className="queue-spinner-wrapper">
            <div className="ring ring-1"></div>
            <div className="ring ring-2"></div>
            <div className="ring ring-3"></div>
            <div className="queue-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <h3 className="title">Finding Your Match...</h3>
          <p className="subtitle">Looking for someone interesting to chat with</p>

          <div className="queue-dots">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        </div>
      </div>
    );
  }

  if (status === "matched") {
    return (
      <div className="page-container">
        <div className="card queue-container">
          <div className="icon-wrapper" style={{ background: 'rgba(34, 197, 94, 0.2)', animation: 'bounce 0.5s ease' }}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="title" style={{ color: '#4ade80' }}>Match Found!</h3>
          <p className="subtitle">Connecting to chat...</p>
        </div>
      </div>
    );
  }

  if (status === "cooldown") {
    return (
      <div className="page-container">
        <div className="card queue-container">
          <div className="icon-wrapper" style={{ background: 'rgba(234, 179, 8, 0.2)' }}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="title" style={{ color: '#facc15' }}>Please Wait</h3>
          <p className="subtitle">Cooldown period active. Try again in a moment.</p>
        </div>
      </div>
    );
  }

  // ✅ NEW: Handle daily limit reached
  if (status === "limited" || status === "limit_reached") {
    return (
      <div className="page-container">
        <div className="card queue-container">
          <div className="icon-wrapper" style={{ background: 'rgba(234, 179, 8, 0.2)' }}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="title" style={{ color: '#facc15' }}>Daily Limit Reached</h3>
          <p className="subtitle">
            You've reached your daily limit for specific gender filters. Try selecting "Anyone" instead!
          </p>
        </div>
      </div>
    );
  }

  return null;
}
