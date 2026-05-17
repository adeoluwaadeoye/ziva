"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference") ?? searchParams.get("trxref") ?? "";

  useEffect(() => {
    if (!reference) return;
    // Attempt to redirect back to the ZIVA mobile app via deep link.
    // openAuthSessionAsync already intercepts this URL before it renders,
    // so this fallback is for users who arrive here via a regular browser.
    const deepLink = `ziva://payment-callback?reference=${encodeURIComponent(reference)}&trxref=${encodeURIComponent(reference)}`;
    const timer = setTimeout(() => {
      window.location.href = deepLink;
    }, 800);
    return () => clearTimeout(timer);
  }, [reference]);

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
      <div style={{
        backgroundColor: "#1C1C1C",
        padding: "28px 40px",
        marginBottom: "40px",
      }}>
        <h1 style={{ color: "#B5883A", fontSize: "28px", letterSpacing: "8px", margin: 0, fontWeight: 300 }}>
          ZIVA
        </h1>
        <p style={{ color: "#B5883A", fontSize: "9px", letterSpacing: "4px", margin: "4px 0 0" }}>
          / NIGERIA
        </p>
      </div>

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
      }}>
        ✓
      </div>

      <h2 style={{ fontSize: "22px", fontWeight: 500, color: "#1C1C1C", marginBottom: "12px" }}>
        Payment Successful
      </h2>
      <p style={{ fontSize: "14px", color: "#6B6B6B", lineHeight: "1.7", maxWidth: "320px", marginBottom: "32px" }}>
        Returning you to the ZIVA app…
      </p>

      {reference && (
        <a
          href={`ziva://payment-callback?reference=${encodeURIComponent(reference)}&trxref=${encodeURIComponent(reference)}`}
          style={{
            display: "inline-block",
            backgroundColor: "#1C1C1C",
            color: "#FAFAF8",
            padding: "14px 32px",
            fontSize: "12px",
            letterSpacing: "2px",
            fontWeight: 600,
            textDecoration: "none",
            fontFamily: "Georgia, serif",
          }}
        >
          OPEN ZIVA APP
        </a>
      )}
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
