// frontend/src/hooks/useDeviceId.js

import { useEffect, useState } from "react";
import { getDeviceId } from "../utils/device";

/**
 * Async-safe React hook for device fingerprint
 */
export function useDeviceId() {
  const [deviceId, setDeviceId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const id = await getDeviceId();
      setDeviceId(id);
      setLoading(false);
    }
    init();
  }, []);

  return { deviceId, loading };
}