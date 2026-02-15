// frontend/src/utils/device.js

import FingerprintJS from '@fingerprintjs/fingerprintjs';

let cachedDeviceId = null;

/**
 * Generates a browser fingerprint using FingerprintJS.
 * This creates a unique ID based on browser/device characteristics.
 * Much harder to bypass than a simple UUID.
 */
export async function getDeviceId() {
  // Return cached ID if already generated
  if (cachedDeviceId) {
    return cachedDeviceId;
  }

  // Check localStorage first
  let deviceId = localStorage.getItem("device_id");

  if (!deviceId) {
    try {
      // Generate browser fingerprint
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      deviceId = result.visitorId;

      // Store in localStorage (persists across sessions)
      localStorage.setItem("device_id", deviceId);
    } catch (error) {
      // Fallback: Use timestamp + random if FingerprintJS fails
      console.error("Fingerprint generation failed:", error);
      deviceId = `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("device_id", deviceId);
    }
  }

  cachedDeviceId = deviceId;
  return deviceId;
}

/**
 * Synchronous version for immediate access.
 * Returns null if ID hasn't been generated yet.
 */
export function getDeviceIdSync() {
  if (cachedDeviceId) {
    return cachedDeviceId;
  }
  return localStorage.getItem("device_id") || null;
}