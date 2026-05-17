"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const RING_R = 38;
const CIRCUMFERENCE = 2 * Math.PI * RING_R;
const COUNTDOWN_FROM = 4;

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference") ?? searchParams.get("trxref") ?? "";
  const verified = !!searchParams.get("verified");

  const [countdown, setCountdown] = useState(COUNTDOWN_FROM);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // On mobile, openAuthSessionAsync intercepts ?verified=1 before this renders.
    // This effect only runs for the first stage (no verified param) to drive the countdown.
    if (verified) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setDone(true);
          const params = new URLSearchParams({ verified: "1" });
          if (reference) { params.set("reference", reference); params.set("trxref", reference); }
          window.location.href = `/payment-callback?${params.toString()}`;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [verified, reference]);

  const strokeOffset = CIRCUMFERENCE * (1 - (COUNTDOWN_FROM - countdown) / COUNTDOWN_FROM);

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#FAFAF8",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Georgia, serif",
      padding: "24px",
      textAlign: "center",
    }}>
      {/* Logo */}
      <div style={{
        backgroundColor: "#1C1C1C",
        padding: "20px 36px",
        marginBottom: "52px",
      }}>
        <h1 style={{ color: "#B5883A", fontSize: "24px", letterSpacing: "8px", margin: 0, fontWeight: 300 }}>
          ZIVA
        </h1>
        <p style={{ color: "#B5883A", fontSize: "8px", letterSpacing: "4px", margin: "3px 0 0" }}>
          / NIGERIA
        </p>
      </div>

      {/* Check circle */}
      <div style={{
        width: "72px",
        height: "72px",
        borderRadius: "50%",
        backgroundColor: "#f0fdf4",
        border: "2px solid #86efac",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "24px",
        fontSize: "32px",
        color: "#22c55e",
      }}>
        ✓
      </div>

      <h2 style={{ fontSize: "22px", fontWeight: 500, color: "#1C1C1C", margin: "0 0 8px" }}>
        Payment Successful
      </h2>
      <p style={{ fontSize: "13px", color: "#6B6B6B", margin: "0 0 44px", lineHeight: "1.7", maxWidth: "300px" }}>
        {verified || done
          ? "Opening the ZIVA app…"
          : "Your order is confirmed. Returning you to the app in just a moment."}
      </p>

      {/* Countdown ring */}
      {!verified && !done && (
        <div style={{ position: "relative", width: "100px", height: "100px", marginBottom: "40px" }}>
          <svg width="100" height="100" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="50" cy="50" r={RING_R} fill="none" stroke="#E5E5E5" strokeWidth="5" />
            <circle
              cx="50" cy="50" r={RING_R}
              fill="none"
              stroke="#1C1C1C"
              strokeWidth="5"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeOffset}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 0.95s linear" }}
            />
          </svg>
          <div style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <span style={{ fontSize: "30px", fontWeight: 600, color: "#1C1C1C", lineHeight: 1 }}>
              {countdown}
            </span>
            <span style={{ fontSize: "9px", color: "#9CA3AF", letterSpacing: "1.5px", marginTop: "2px" }}>
              SEC
            </span>
          </div>
        </div>
      )}

      {/* Manual fallback button */}
      {reference && (
        <a
          href={`ziva://payment-callback?reference=${encodeURIComponent(reference)}&trxref=${encodeURIComponent(reference)}`}
          style={{
            display: "inline-block",
            backgroundColor: "#1C1C1C",
            color: "#FAFAF8",
            padding: "14px 36px",
            fontSize: "11px",
            letterSpacing: "2.5px",
            fontWeight: 600,
            textDecoration: "none",
            fontFamily: "Georgia, serif",
          }}
        >
          OPEN ZIVA APP
        </a>
      )}

      <p style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "20px" }}>
        🔒 Secured by Paystack
      </p>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense>
      <PaymentCallbackContent />
    </Suspense>
  );
}
