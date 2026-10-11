"use client";

import { useEffect, useState } from "react";
import { getHealth } from "@/lib/api";

export default function ApiStatus() {
  const [status, setStatus] = useState<"checking" | "online" | "offline">("checking");

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timeout = setTimeout(() => controller.abort(), 4000);
    getHealth(controller.signal)
      .then(() => { if (active) setStatus("online"); })
      .catch(() => { if (active) setStatus("offline"); })
      .finally(() => clearTimeout(timeout));
    return () => { active = false; controller.abort(); clearTimeout(timeout); };
  }, []);

  const label = status === "online" ? "Server connected" : status === "offline" ? "Server offline · stories unavailable" : "Checking server…";
  return <span className={`api-status api-status-${status}`} role="status" aria-live="polite">{label}</span>;
}
