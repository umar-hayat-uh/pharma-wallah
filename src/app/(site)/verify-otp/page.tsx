"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import {
  Loader2,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  User,
} from "lucide-react";

export default function VerifyOTPPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false); // success state
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const supabase = createClient();

  // Resend cooldown (30 sec)
  const [resendCooldown, setResendCooldown] = useState(0);
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Auto‑focus the first input
  useEffect(() => {
    if (!verified) inputRefs.current[0]?.focus();
  }, [verified]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) setCode(pasted.split(""));
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = code.join("");
    if (token.length !== 6) {
      setError("Please enter the complete 6‑digit code.");
      return;
    }
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "signup",
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Successful verification
    setVerified(true);
    setLoading(false);
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError("");
    const { error } = await supabase.auth.signUp({
      email,
      password: "", // original password is not needed; just trigger a new OTP
    });
    if (error) {
      setError(error.message);
    } else {
      setResendCooldown(30); // 30 sec cooldown
    }
  };

  return (
    <main className="min-h-screen flex w-full bg-white">
      {/* ========== LEFT SIDE: Form ========== */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:max-w-md">
          {/* Header & Logo */}
          <div className="mb-10">
            <Link href="/" className="inline-flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center shadow-md">
                <User className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-xl text-slate-900 tracking-tight">
                PharmaWallah
              </span>
            </Link>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
              {verified ? "You're verified!" : "Check your email"}
            </h1>
            <p className="text-slate-500 text-base leading-relaxed">
              {verified
                ? "Your account has been confirmed. Welcome to the community."
                : `We’ve sent a 6‑digit code to ${email}. Enter it below to verify your account.`}
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-start gap-3 shadow-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* ========== SUCCESS STATE ========== */}
          {verified ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
              </div>

              <div className="text-center">
                <p className="text-slate-600 text-sm mb-4">
                  Your email <strong className="text-slate-900">{email}</strong> has been
                  successfully verified. You can now access your dashboard.
                </p>
              </div>

              <button
                onClick={() => router.push("/dashboard")}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* ========== INPUT STATE ========== */
            <form onSubmit={handleVerify} className="space-y-6">
              {/* 6‑digit inputs */}
              <div className="flex justify-center gap-3">
                {code.map((digit, idx) => (
                  <input
                    key={idx}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    onChange={(e) => handleChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    onPaste={handlePaste}
                    className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all"
                    disabled={loading}
                  />
                ))}
              </div>

              {/* Verify button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Verify Email"
                )}
              </button>

              {/* Resend */}
              <p className="text-center text-sm text-slate-500">
                Didn’t receive the code?{" "}
                {resendCooldown > 0 ? (
                  <span className="text-slate-400">
                    Resend in {resendCooldown}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    className="text-blue-600 font-semibold hover:underline transition-colors"
                  >
                    Resend
                  </button>
                )}
              </p>
            </form>
          )}
        </div>
      </div>

      {/* ========== RIGHT SIDE: Illustration (hidden on mobile) ========== */}
      <div className="hidden lg:flex flex-1 relative bg-slate-50 items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-bl from-blue-50 to-green-50 z-0"></div>
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-[500px] h-[500px] bg-green-400/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 w-full max-w-lg px-8 flex flex-col items-center">
          <img
            src="/images/banner/signup.webp"
            className="w-full object-contain drop-shadow-2xl mb-8 transform hover:scale-105 transition-transform duration-700 ease-out"
            alt="Pharmacy e-learning platform illustration"
          />
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-3">
              One last step…
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Enter the code we sent to your email and you’ll be ready to
              explore all the tools and resources.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}