"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    Mail,
    RefreshCw,
    CheckCircle2,
    ArrowLeft,
    Pill,
    AlertCircle,
} from "lucide-react";

export default function VerifyEmailPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const supabase = createClient();

    // The email is passed from the signup page via query param
    const email = searchParams.get("email") ?? "";

    const [resendLoading, setResendLoading] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);
    const [resendError, setResendError] = useState("");
    // Countdown timer to prevent spam-clicking resend (60 s)
    const [countdown, setCountdown] = useState(0);

    // If someone lands here already logged in, push them forward
    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            if (data.session) router.replace("/dashboard");
        });
    }, [router, supabase.auth]);

    // Tick the countdown down every second
    useEffect(() => {
        if (countdown <= 0) return;
        const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [countdown]);

    const handleResend = async () => {
        if (!email || countdown > 0) return;
        setResendLoading(true);
        setResendError("");
        setResendSuccess(false);

        const { error } = await supabase.auth.resend({
            type: "signup",
            email,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        setResendLoading(false);

        if (error) {
            setResendError(error.message);
        } else {
            setResendSuccess(true);
            setCountdown(60); // lock resend for 60 seconds
        }
    };

    const maskedEmail = email
        ? email.replace(/^(.{2})(.*)(@.*)$/, (_, a, b, c) => a + "*".repeat(Math.max(b.length, 3)) + c)
        : "your email";

    return (
        <main className="min-h-screen flex w-full bg-white">

            {/* ── Left: Form column ── */}
            <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20 xl:px-24">
                <div className="mx-auto w-full max-w-sm lg:max-w-md">

                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center shadow-md">
                            <Pill className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-extrabold text-xl text-slate-900 tracking-tight">
                            PharmaWallah
                        </span>
                    </div>

                    {/* Animated envelope */}
                    <div className="flex justify-center mb-8">
                        <div className="relative">
                            {/* Outer pulse ring */}
                            <div className="absolute inset-0 rounded-full bg-blue-100 animate-ping opacity-30" />
                            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center shadow-lg">
                                <Mail className="w-9 h-9 text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Heading */}
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3 text-center">
                        Check your inbox
                    </h1>
                    <p className="text-slate-500 text-base leading-relaxed text-center mb-8">
                        We&apos;ve sent a verification link to{" "}
                        <span className="font-semibold text-slate-700">{maskedEmail}</span>.
                        Click it to activate your account.
                    </p>

                    {/* Email destination card */}
                    <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl mb-8">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <Mail className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">
                                Verification sent to
                            </p>
                            <p className="text-sm font-semibold text-slate-800 truncate">{email || "—"}</p>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    </div>

                    {/* Steps */}
                    <ol className="space-y-4 mb-8">
                        {[
                            {
                                step: "1",
                                title: "Open the email",
                                body: (
                                    <>
                                        Look for a message from{" "}
                                        <span className="font-semibold text-slate-700">noreply@pharmawallah.pk</span>.
                                        Check your spam or promotions folder if it&apos;s not in your inbox.
                                    </>
                                ),
                            },
                            {
                                step: "2",
                                title: 'Click "Verify my email"',
                                body: "The big button inside the email will confirm your address and activate your account instantly.",
                            },
                            {
                                step: "3",
                                title: "Start learning",
                                body: "You'll be taken straight to your dashboard — ready to enrol in courses and track your progress.",
                            },
                        ].map(({ step, title, body }) => (
                            <li key={step} className="flex items-start gap-4">
                                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-green-500 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                                    {step}
                                </span>
                                <div>
                                    <p className="text-sm font-semibold text-slate-800 mb-0.5">{title}</p>
                                    <p className="text-sm text-slate-500 leading-relaxed">{body}</p>
                                </div>
                            </li>
                        ))}
                    </ol>

                    {/* Resend feedback */}
                    {resendSuccess && (
                        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-green-600" />
                            <span className="font-medium">New verification email sent! Check your inbox.</span>
                        </div>
                    )}
                    {resendError && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
                            <span className="font-medium">{resendError}</span>
                        </div>
                    )}

                    {/* Resend button */}
                    <button
                        onClick={handleResend}
                        disabled={resendLoading || countdown > 0}
                        className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed mb-3"
                    >
                        {resendLoading ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : countdown > 0 ? (
                            <>
                                <RefreshCw className="w-4 h-4" />
                                Resend in {countdown}s
                            </>
                        ) : (
                            <>
                                <RefreshCw className="w-4 h-4" />
                                Resend verification email
                            </>
                        )}
                    </button>

                    <Link
                        href="/signup"
                        className="w-full flex items-center justify-center gap-2 py-3.5 px-4 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to sign up
                    </Link>

                    <p className="mt-8 text-center text-xs text-slate-400 leading-relaxed">
                        Wrong email address?{" "}
                        <Link href="/signup" className="text-blue-600 font-semibold hover:underline">
                            Start over
                        </Link>
                        {" "}·{" "}
                        <a href="mailto:support@pharmawallah.pk" className="text-blue-600 font-semibold hover:underline">
                            Contact support
                        </a>
                    </p>
                </div>
            </div>

            {/* ── Right: Branding panel (desktop only) ── */}
            <div className="hidden lg:flex flex-1 relative items-center justify-center overflow-hidden bg-slate-50">
                <div className="absolute inset-0 bg-gradient-to-bl from-blue-50 to-green-50 z-0" />
                <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-[500px] h-[500px] bg-green-400/10 rounded-full blur-3xl" />

                <div className="relative z-10 max-w-md px-8 text-center">
                    {/* Decorative molecule / capsule SVG */}
                    <svg
                        viewBox="0 0 320 260"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-72 mx-auto mb-8 drop-shadow-xl"
                        aria-hidden="true"
                    >
                        {/* Envelope body */}
                        <rect x="30" y="60" width="260" height="170" rx="18" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="2" />
                        {/* Envelope flap */}
                        <path d="M30 78 L160 155 L290 78" stroke="#93C5FD" strokeWidth="2" fill="none" />
                        {/* Left fold line */}
                        <line x1="30" y1="230" x2="110" y2="155" stroke="#BFDBFE" strokeWidth="1.5" />
                        {/* Right fold line */}
                        <line x1="290" y1="230" x2="210" y2="155" stroke="#BFDBFE" strokeWidth="1.5" />
                        {/* Pill inside envelope */}
                        <rect x="120" y="170" width="80" height="34" rx="17" fill="url(#pillGrad)" />
                        <line x1="160" y1="170" x2="160" y2="204" stroke="white" strokeWidth="1.5" opacity="0.6" />
                        {/* Check badge */}
                        <circle cx="240" cy="80" r="28" fill="url(#checkGrad)" />
                        <path d="M228 80 L237 89 L253 72" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        {/* Floating dots */}
                        <circle cx="60" cy="50" r="6" fill="#93C5FD" opacity="0.6" />
                        <circle cx="270" cy="40" r="4" fill="#6EE7B7" opacity="0.5" />
                        <circle cx="290" cy="200" r="5" fill="#93C5FD" opacity="0.4" />
                        <defs>
                            <linearGradient id="pillGrad" x1="120" y1="187" x2="200" y2="187" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#2563EB" />
                                <stop offset="1" stopColor="#10B981" />
                            </linearGradient>
                            <linearGradient id="checkGrad" x1="212" y1="52" x2="268" y2="108" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#10B981" />
                                <stop offset="1" stopColor="#059669" />
                            </linearGradient>
                        </defs>
                    </svg>

                    <h2 className="text-2xl font-bold text-slate-800 mb-3">Almost there!</h2>
                    <p className="text-slate-600 text-sm leading-relaxed mb-6">
                        Verify your email to unlock all courses, mock exams, and your personalised learning dashboard.
                    </p>

                    {/* Feature chips */}
                    <div className="flex flex-wrap gap-2 justify-center">
                        {["120+ Courses", "Mock Exams", "Live Sessions", "Certificates"].map((f) => (
                            <span
                                key={f}
                                className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-semibold rounded-full shadow-sm"
                            >
                                {f}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}