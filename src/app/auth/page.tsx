"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PiEye, PiEyeSlash, PiSpinner, PiArrowRight, PiArrowLeft, PiEnvelope } from "react-icons/pi";
import { FaGoogle } from "react-icons/fa6";
import { useAuthStore, useNotificationStore } from "@/lib/store";
import Logo from "@/components/Logo";

type Tab = "login" | "signup";
type SignupStep = "form" | "verify";

const GOOGLE_ERRORS: Record<string, string> = {
  google_cancelled: "Google sign-in was cancelled.",
  google_not_configured: "Google sign-in is not available right now.",
  invalid_state: "Authentication failed. Please try again.",
  token_exchange_failed: "Could not connect with Google. Please try again.",
  no_email: "Your Google account did not provide an email address.",
  server_error: "An unexpected error occurred. Please try again.",
};

function PasswordInput({
  value, onChange, placeholder,
}: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "Password"}
        required
        className="w-full border border-ziva-border bg-ziva-cream/50 px-4 py-3 text-sm text-ziva-black placeholder:text-ziva-muted outline-none focus:border-ziva-black transition-colors pr-11"
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-ziva-muted hover:text-ziva-black transition-colors"
      >
        {show ? <PiEyeSlash size={16} /> : <PiEye size={16} />}
      </button>
    </div>
  );
}

export default function AuthPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const show = useNotificationStore((s) => s.show);

  const [tab, setTab] = useState<Tab>("login");
  const [signupStep, setSignupStep] = useState<SignupStep>("form");
  const [loading, setLoading] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [error, setError] = useState("");

  /* Login state */
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  /* Signup state */
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");
  const [otpCode, setOtpCode] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorParam = params.get("error");
    if (errorParam) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError(GOOGLE_ERRORS[errorParam] ?? "Sign-in failed. Please try again.");
    }
  }, []);

  function switchTab(t: Tab) {
    setTab(t);
    setError("");
    setSignupStep("form");
    setOtpCode("");
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setUser(data.user, data.token);
      show(`Welcome back, ${data.user.name}!`);
      router.push("/");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSendOtp(e?: React.FormEvent) {
    e?.preventDefault();
    if (signupPassword !== signupConfirm) { setError("Passwords do not match."); return; }
    if (signupPassword.length < 6) { setError("Password must be at least 6 characters."); return; }
    setOtpSending(true); setError(""); setOtpCode("");
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: signupEmail }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setSignupStep("verify");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setOtpSending(false);
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!otpCode.trim()) { setError("Please enter the verification code."); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: signupName,
          email: signupEmail,
          password: signupPassword,
          code: otpCode,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setUser(data.user, data.token);
      show(`Welcome to ZIVA, ${data.user.name}!`);
      router.push("/");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-16 px-5">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Logo size="lg" variant="dark" />
          <p className="text-sm text-ziva-muted mt-4">
            {tab === "login" ? "Welcome back" : signupStep === "verify" ? "Check your email" : "Create your account"}
          </p>
        </div>

        {/* Tab switcher — hide on OTP step */}
        {signupStep === "form" && (
          <div className="flex border border-ziva-border mb-6">
            {(["login", "signup"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => switchTab(t)}
                className={`flex-1 py-3 text-sm font-semibold tracking-widest uppercase transition-colors ${tab === t
                    ? "bg-ziva-black text-ziva-cream"
                    : "text-ziva-muted hover:text-ziva-black hover:bg-ziva-cream/60"
                  }`}
              >
                {t === "login" ? "Login" : "Register"}
              </button>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 border border-red-200 bg-red-50 text-red-600 text-sm px-4 py-3">
            {error}
          </div>
        )}

        {/* ── LOGIN ── */}
        {tab === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] tracking-widest uppercase text-ziva-muted mb-1.5 font-semibold">Email address</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full border border-ziva-border bg-ziva-cream/50 px-4 py-3 text-sm text-ziva-black placeholder:text-ziva-muted outline-none focus:border-ziva-black transition-colors"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[10px] tracking-widest uppercase text-ziva-muted font-semibold">Password</label>
                <button type="button" className="text-xs text-ziva-black hover:underline underline-offset-2">
                  Forgot password?
                </button>
              </div>
              <PasswordInput value={loginPassword} onChange={setLoginPassword} />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-ziva-black text-ziva-cream py-3.5 text-sm font-semibold tracking-widest uppercase hover:bg-ziva-black transition-colors disabled:opacity-60"
            >
              {loading
                ? <><PiSpinner size={15} className="animate-spin-slow" /> Logging in…</>
                : <>Login <PiArrowRight size={14} /></>}
            </button>
          </form>
        )}

        {/* ── SIGNUP: step 1 — registration form ── */}
        {tab === "signup" && signupStep === "form" && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-[10px] tracking-widest uppercase text-ziva-muted mb-1.5 font-semibold">Full name</label>
              <input
                type="text"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                placeholder="Your full name"
                required
                className="w-full border border-ziva-border bg-ziva-cream/50 px-4 py-3 text-sm text-ziva-black placeholder:text-ziva-muted outline-none focus:border-ziva-black transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] tracking-widest uppercase text-ziva-muted mb-1.5 font-semibold">Email address</label>
              <input
                type="email"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full border border-ziva-border bg-ziva-cream/50 px-4 py-3 text-sm text-ziva-black placeholder:text-ziva-muted outline-none focus:border-ziva-black transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] tracking-widest uppercase text-ziva-muted mb-1.5 font-semibold">Password</label>
              <PasswordInput value={signupPassword} onChange={setSignupPassword} placeholder="Min. 6 characters" />
            </div>
            <div>
              <label className="block text-[10px] tracking-widest uppercase text-ziva-muted mb-1.5 font-semibold">Confirm password</label>
              <PasswordInput value={signupConfirm} onChange={setSignupConfirm} placeholder="Repeat your password" />
            </div>
            <p className="text-xs text-ziva-muted">
              By registering you agree to our{" "}
              <Link href="/terms" className="text-ziva-black hover:underline underline-offset-2">Terms of Service</Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-ziva-black hover:underline underline-offset-2">Privacy Policy</Link>.
            </p>
            <button
              type="submit"
              disabled={otpSending}
              className="w-full flex items-center justify-center gap-2 bg-ziva-black text-ziva-cream py-3.5 text-sm font-semibold tracking-widest uppercase hover:bg-ziva-black transition-colors disabled:opacity-60"
            >
              {otpSending
                ? <><PiSpinner size={15} className="animate-spin-slow" /> Sending code…</>
                : <>Send Verification Code <PiArrowRight size={14} /></>}
            </button>
          </form>
        )}

        {/* ── SIGNUP: step 2 — OTP verification ── */}
        {tab === "signup" && signupStep === "verify" && (
          <form onSubmit={handleSignup} className="space-y-5">
            <div className="flex flex-col items-center gap-2 py-4 border border-ziva-border bg-ziva-cream/30 text-center">
              <PiEnvelope size={22} className="text-ziva-black" />
              <p className="text-sm text-ziva-muted">We sent a 6-digit code to</p>
              <p className="text-sm font-semibold text-ziva-black">{signupEmail}</p>
              <p className="text-[10px] text-ziva-muted">Expires in 10 minutes</p>
            </div>

            <div>
              <label className="block text-[10px] tracking-widest uppercase text-ziva-muted mb-2 font-semibold text-center">
                Verification code
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                required
                autoFocus
                className="w-full border border-ziva-border bg-ziva-cream/50 px-4 py-4 text-2xl font-mono text-center text-ziva-black placeholder:text-ziva-muted/40 outline-none focus:border-ziva-black transition-colors tracking-[0.5em]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-ziva-black text-ziva-cream py-3.5 text-sm font-semibold tracking-widest uppercase hover:bg-ziva-black transition-colors disabled:opacity-60"
            >
              {loading
                ? <><PiSpinner size={15} className="animate-spin-slow" /> Creating account…</>
                : <>Create Account <PiArrowRight size={14} /></>}
            </button>

            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => { setSignupStep("form"); setError(""); setOtpCode(""); }}
                className="flex items-center gap-1 text-ziva-muted hover:text-ziva-black transition-colors"
              >
                <PiArrowLeft size={12} /> Change email
              </button>
              <button
                type="button"
                disabled={otpSending}
                onClick={() => handleSendOtp()}
                className="text-ziva-black hover:underline underline-offset-2 disabled:opacity-50"
              >
                {otpSending ? "Sending…" : "Resend code"}
              </button>
            </div>
          </form>
        )}

        {/* Divider + Google button — only show on form step */}
        {signupStep === "form" && (
          <>
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-ziva-border" />
              <span className="text-xs text-ziva-muted">or continue with</span>
              <div className="flex-1 h-px bg-ziva-border" />
            </div>

            <a
              href="/api/auth/google"
              className="w-full flex items-center justify-center gap-2.5 border border-ziva-border py-3 text-sm text-ziva-black hover:border-ziva-black hover:text-ziva-black transition-colors"
            >
              <FaGoogle size={15} /> Continue with Google
            </a>
          </>
        )}

        <p className="text-center text-xs text-ziva-muted mt-6">
          {tab === "login" ? (
            <>Don&apos;t have an account?{" "}
              <button onClick={() => switchTab("signup")} className="text-ziva-black hover:underline underline-offset-2">Register</button>
            </>
          ) : (
            <>Already have an account?{" "}
              <button onClick={() => switchTab("login")} className="text-ziva-black hover:underline underline-offset-2">Login</button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
