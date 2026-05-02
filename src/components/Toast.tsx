"use client";

import { useNotificationStore } from "@/lib/store";
import { PiCheckCircle, PiWarningCircle, PiInfo, PiX } from "react-icons/pi";

export default function ToastContainer() {
  const { toasts, dismiss } = useNotificationStore();

  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-200 flex flex-col gap-3 pointer-events-none"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start gap-3 bg-ziva-black text-ziva-cream text-sm px-4 py-3 shadow-xl min-w-64 max-w-80 ${t.exiting ? "animate-toast-out" : "animate-toast-in"}`}
          style={{ borderLeft: `3px solid ${t.type === "error" ? "#ef4444" : t.type === "info" ? "#3b82f6" : "#ffffff"}` }}
        >
          <span className="shrink-0 mt-0.5">
            {t.type === "error" && <PiWarningCircle size={15} className="text-red-400" />}
            {t.type === "info" && <PiInfo size={15} className="text-blue-400" />}
            {t.type === "success" && <PiCheckCircle size={15} className="text-white" />}
          </span>
          <span className="flex-1 leading-snug">{t.message}</span>
          <button
            onClick={() => dismiss(t.id)}
            className="shrink-0 text-white/40 hover:text-white transition-colors mt-0.5"
            aria-label="Dismiss"
          >
            <PiX size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}
