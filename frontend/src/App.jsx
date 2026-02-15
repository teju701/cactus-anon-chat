// frontend/src/App.jsx

import { Routes, Route, Navigate } from "react-router-dom";

import Onboarding from "./pages/Onboarding";
import Verify from "./pages/Verify";
import Profile from "./pages/Profile";
import Chat from "./pages/Chat";

/**
 * Protected route for pages requiring device ID
 */
function RequireDevice({ children }) {
  const deviceId = localStorage.getItem("device_id");
  
  if (!deviceId) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

/**
 * Protected route for pages requiring verification
 */
function RequireVerification({ children }) {
  const deviceId = localStorage.getItem("device_id");
  const isVerified = sessionStorage.getItem("is_verified") === "true";
  
  if (!deviceId) {
    return <Navigate to="/" replace />;
  }
  
  if (!isVerified) {
    return <Navigate to="/verify" replace />;
  }
  
  return children;
}

/**
 * Protected route for chat (requires profile setup)
 */
function RequireProfile({ children }) {
  const deviceId = localStorage.getItem("device_id");
  const isVerified = sessionStorage.getItem("is_verified") === "true";
  const hasNickname = sessionStorage.getItem("nickname");
  
  if (!deviceId) {
    return <Navigate to="/" replace />;
  }
  
  if (!isVerified) {
    return <Navigate to="/verify" replace />;
  }
  
  if (!hasNickname) {
    return <Navigate to="/profile" replace />;
  }
  
  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/" element={<Onboarding />} />
      
      {/* Requires device ID */}
      <Route 
        path="/verify" 
        element={
          <RequireDevice>
            <Verify />
          </RequireDevice>
        } 
      />
      
      {/* Requires verification */}
      <Route 
        path="/profile" 
        element={
          <RequireVerification>
            <Profile />
          </RequireVerification>
        } 
      />
      
      {/* Requires complete profile */}
      <Route
        path="/chat"
        element={
          <RequireProfile>
            <Chat />
          </RequireProfile>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}