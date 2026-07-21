import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useDeviceId } from "../hooks/useDeviceId";


export default function Profile() {
  useDeviceId();
  const navigate = useNavigate();

  const [nickname, setNickname] = useState(sessionStorage.getItem("nickname") || "");
  const [bio, setBio] = useState(sessionStorage.getItem("bio") || "");
  const [filter, setFilter] = useState(sessionStorage.getItem("filter") || "any");
  const [error, setError] = useState("");

  useEffect(() => {
    const isVerified = sessionStorage.getItem("is_verified");
    if (!isVerified) {
      navigate("/verify", { replace: true });
    }
  }, [navigate]);

  const submitProfile = () => {
    const trimmedNickname = nickname.trim();
    const trimmedBio = bio.trim();

    if (!trimmedNickname) {
      setError("Nickname is required");
      return;
    }
    if (trimmedNickname.length < 2) {
      setError("Nickname must be at least 2 characters");
      return;
    }
    if (trimmedBio.length > 120) {
      setError("Bio too long. Max 120 characters.");
      return;
    }

    sessionStorage.setItem("nickname", trimmedNickname);
    sessionStorage.setItem("bio", trimmedBio);
    sessionStorage.setItem("filter", filter);
    navigate("/chat");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitProfile();
    }
  };

  return (
    <div className="page-container">
      <div className="card">
        <div className="card-header">
          <div className="icon-wrapper" aria-hidden="true">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="title">Create Your Profile</h2>
          <p className="subtitle">Set up your temporary identity</p>
        </div>

        <div className="input-group">
          <label className="input-label">
            Nickname <span style={{ color: "#f87171" }}>*</span>
          </label>
          <input
            type="text"
            className="input"
            placeholder="e.g., MidnightTalker"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={50}
          />
          <p className="char-count">{nickname.length}/50 characters</p>
        </div>

        <div className="input-group">
          <label className="input-label">Bio (Optional)</label>
          <textarea
            className="input"
            placeholder="Tell us a bit about yourself..."
            rows={3}
            maxLength={120}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
          <p className="char-count">{bio.length}/120 characters</p>
        </div>

        <div className="input-group">
          <label className="input-label">Who would you like to chat with?</label>
          <div className="filter-grid">
            <button
              type="button"
              className={`filter-btn ${filter === "any" ? "active" : ""}`}
              onClick={() => setFilter("any")}
            >
              <div className="filter-emoji">All</div>
              <div className="filter-label">Anyone</div>
            </button>
            <button
              type="button"
              className={`filter-btn ${filter === "male" ? "active" : ""}`}
              onClick={() => setFilter("male")}
            >
              <div className="filter-emoji">M</div>
              <div className="filter-label">Male</div>
            </button>
            <button
              type="button"
              className={`filter-btn ${filter === "female" ? "active" : ""}`}
              onClick={() => setFilter("female")}
            >
              <div className="filter-emoji">F</div>
              <div className="filter-label">Female</div>
            </button>
          </div>
          {filter !== "any" && (
            <p className="text-small" style={{ color: "#fde047", marginTop: "0.5rem" }}>
              Limited to 50 specific matches per day.
            </p>
          )}
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <button onClick={submitProfile} className="btn btn-primary">
          Enter Chat Room
        </button>

        <div className="alert alert-info" style={{ marginTop: "1rem" }}>
          <p className="text-tiny">
            Your profile is temporary and stays only in this browser session.
          </p>
        </div>
      </div>
    </div>
  );
}
