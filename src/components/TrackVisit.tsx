"use client";

import { useEffect } from "react";

export default function TrackVisit() {
  useEffect(() => {
    if (sessionStorage.getItem("ziva_tracked")) return;
    const ua = navigator.userAgent.toLowerCase();
    const device =
      /mobile|android|iphone|ipod|blackberry|windows phone/.test(ua)
        ? "mobile"
        : /ipad|tablet/.test(ua)
          ? "tablet"
          : "desktop";
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ device }),
    }).catch(() => { });
    sessionStorage.setItem("ziva_tracked", "1");
  }, []);

  return null;
}
