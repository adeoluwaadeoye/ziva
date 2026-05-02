"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, useNotificationStore } from "@/lib/store";

export default function AuthSyncPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const show = useNotificationStore((s) => s.show);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user, "");
          show(`Welcome, ${data.user.name}!`);
        }
        router.replace("/");
      })
      .catch(() => router.replace("/"));
  }, [router, setUser, show]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-10 h-10 border-2 border-ziva-black border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-ziva-muted">Signing you in…</p>
      </div>
    </div>
  );
}
