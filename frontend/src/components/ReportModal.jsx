// frontend/src/components/ReportModal.jsx
import { useState } from "react";

export default function ReportModal({ socket, partnerDeviceId }) {
  const [showConfirm, setShowConfirm] = useState(false);

  const report = () => {
    if (!socket) return;

    socket.send(
      JSON.stringify({
        type: "report",
        reported_device: partnerDeviceId,
      })
    );

    setShowConfirm(false);
  };

  if (!showConfirm) {
    return (
      <button
        onClick={() => setShowConfirm(true)}
        className="btn btn-danger"
        style={{ marginTop: '1rem' }}
      >
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Report User
        </span>
      </button>
    );
  }

  return (
    <div className="modal-content">
      <div style={{ textAlign: 'center' }}>
        <div className="modal-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold" style={{ marginBottom: '0.5rem' }}>Report this user?</h3>
        <p className="text-small" style={{ color: '#9ca3af' }}>
          This will end the chat and flag the user for inappropriate behavior.
        </p>
      </div>

      <div className="modal-actions">
        <button
          onClick={() => setShowConfirm(false)}
          className="btn btn-secondary"
        >
          Cancel
        </button>
        <button
          onClick={report}
          className="btn"
          style={{ 
            background: '#ef4444', 
            color: 'white',
            border: '1px solid #dc2626'
          }}
        >
          Report
        </button>
      </div>
    </div>
  );
}