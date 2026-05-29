"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
    CheckCircle2,
    ArrowRight,
    BookOpen,
    ClipboardList,
    Users,
    Award,
    Pill,
} from "lucide-react";

// ─── tiny animated counter hook ───────────────────────────────────────────────
function useCountUp(target: number, duration = 1200) {
    const [value, setValue] = useState(0);
    useEffect(() => {
        let start: number | null = null;
        const step = (ts: number) => {
            if (!start) start = ts;
            const progress = Math.min((ts - start) / duration, 1);
            setValue(Math.floor(progress * target));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [target, duration]);
    return value;
}

// ─── stat card with animated number ──────────────────────────────────────────
function StatCard({ value, suffix, label }: { value: number; suffix: string; label: string }) {
    const count = useCountUp(value);
    return (
        <div className="flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
            <p className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {count.toLocaleString()}
                <span className="text-green-500">{suffix}</span>
            </p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{label}</p>
        </div>
    );
}

// ─── main page ────────────────────────────────────────────────────────────────
export default function EmailVerifiedPage() {
    const router = useRouter();
    const supabase = createClient();
    const [userName, setUserName] = useState("there");
    const [goLoading, setGoLoading] = useState(false);

    // Fetch the user's display name from the session
    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (!data.user) {
                // Not signed in — redirect to signin
                router.replace("/signin");
                return;
            }
            const name: string =
                data.user.user_metadata?.full_name ??
                data.user.email?.split("@")[0] ??
                "there";
            setUserName(name.split(" ")[0]); // first name only
        });
    }, [router, supabase.auth]);

    const handleGoToDashboard = () => {
        setGoLoading(true);
        router.push("/dashboard");
    };

    const features = [
        {
            icon: <BookOpen className="w-5 h-5 text-blue-600" />,
            bg: "bg-blue-50",
            title: "Certified Courses",
            body: "Structured curricula written by licensed pharmacists and professors.",
        },
        {
            icon: <ClipboardList className="w-5 h-5 text-green-600" />,
            bg: "bg-green-50",
            title: "Mock Exams",
            body: "Timed practice papers that mirror real pharmacy licensing tests.",
        },
        {
            icon: <Users className="w-5 h-5 text-indigo-600" />,
            bg: "bg-indigo-50",
            title: "Community Forum",
            body: "Ask questions, share notes, and study with 40,000+ peers.",
        },
        {
            icon: <Award className="w-5 h-5 text-amber-600" />,
            bg: "bg-amber-50",
            title: "Shareable Certificates",
            body: "Earn verified credentials you can add directly to your LinkedIn.",
        },
    ];

    return (
        <main className="min-h-screen flex w-full bg-white">

            {/* ── Left column ── */}
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

                    {/* Success badge */}
                    <div className="flex justify-center mb-8">
                        <div className="relative">
                            <div className="absolute inset-0 rounded-full bg-green-100 scale-150 opacity-40" />
                            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center shadow-lg">
                                <CheckCircle2 className="w-10 h-10 text-white" strokeWidth={2.5} />
                            </div>
                        </div>
                    </div>

                    {/* Heading */}
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-2 text-center">
                        You&apos;re verified!
                    </h1>
                    <p className="text-slate-500 text-base leading-relaxed text-center mb-8">
                        Welcome to PharmaWallah,{" "}
                        <span className="font-semibold text-slate-800 capitalize">{userName}</span>. Your
                        account is active and ready to go.
                    </p>

                    {/* Stats row */}
                    <div className="flex gap-3 mb-8">
                        <StatCard value={120} suffix="+" label="Courses" />
                        <StatCard value={40000} suffix="+" label="Students" />
                        <StatCard value={95} suffix="%" label="Pass rate" />
                    </div>

                    {/* Welcome banner */}
                    <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl mb-8">
                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <CheckCircle2 className="w-4 h-4 text-white" strokeWidth={2.5} />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-green-800 mb-0.5">Account activated</p>
                            <p className="text-sm text-green-700 leading-relaxed">
                                Your pharmacy learning journey begins now. Explore courses, take quizzes, and earn your certificates.
                            </p>
                        </div>
                    </div>

                    {/* Feature grid */}
                    <div className="grid grid-cols-2 gap-3 mb-8">
                        {features.map(({ icon, bg, title, body }) => (
                            <div
                                key={title}
                                className="flex flex-col gap-2 p-4 border border-slate-200 rounded-xl hover:border-blue-200 hover:bg-slate-50 transition-colors"
                            >
                                <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center`}>
                                    {icon}
                                </div>
                                <p className="text-sm font-semibold text-slate-800">{title}</p>
                                <p className="text-xs text-slate-500 leading-relaxed">{body}</p>
                            </div>
                        ))}
                    </div>

                    {/* CTA */}
                    <button
                        onClick={handleGoToDashboard}
                        disabled={goLoading}
                        className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {goLoading ? (
                            <span className="flex items-center gap-2">
                                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                </svg>
                                Opening dashboard…
                            </span>
                        ) : (
                            <>
                                Go to my dashboard
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>

                    <p className="mt-6 text-center text-xs text-slate-400 leading-relaxed">
                        Bookmark{" "}
                        <a href="https://pharmawallah.pk" className="text-blue-600 font-semibold hover:underline">
                            pharmawallah.pk
                        </a>{" "}
                        so you never lose access to your courses.
                    </p>
                </div>
            </div>

            {/* ── Right: Branding panel (desktop only) ── */}
            <div className="hidden lg:flex flex-1 relative items-center justify-center overflow-hidden bg-slate-50">
                <div className="absolute inset-0 bg-gradient-to-bl from-green-50 to-blue-50 z-0" />
                <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[600px] h-[600px] bg-green-400/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-3xl" />

                <div className="relative z-10 max-w-md px-8 text-center">
                    {/* Decorative success SVG */}
                    <svg
                        viewBox="0 0 320 280"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-72 mx-auto mb-8 drop-shadow-xl"
                        aria-hidden="true"
                    >
                        {/* Background circle */}
                        <circle cx="160" cy="140" r="110" fill="#F0FDF4" stroke="#BBF7D0" strokeWidth="2" />
                        {/* Inner circle */}
                        <circle cx="160" cy="140" r="78" fill="#DCFCE7" />
                        {/* Big check */}
                        <path d="M115 142 L145 172 L208 112" stroke="url(#checkStroke)" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
                        {/* Pill top-right */}
                        <rect x="225" y="55" width="58" height="26" rx="13" fill="url(#pillG2)" />
                        <line x1="254" y1="55" x2="254" y2="81" stroke="white" strokeWidth="1.5" opacity="0.7" />
                        {/* Pill bottom-left */}
                        <rect x="37" y="190" width="50" height="22" rx="11" fill="url(#pillG3)" transform="rotate(-25 37 190)" />
                        {/* Floating molecule dots */}
                        <circle cx="64" cy="70" r="7" fill="#93C5FD" opacity="0.7" />
                        <circle cx="56" cy="70" r="7" fill="#6EE7B7" opacity="0.7" />
                        <line x1="63" y1="70" x2="57" y2="70" stroke="#94A3B8" strokeWidth="1.5" />
                        <circle cx="265" cy="200" r="6" fill="#FCA5A5" opacity="0.6" />
                        <circle cx="277" cy="200" r="6" fill="#FCD34D" opacity="0.6" />
                        <line x1="271" y1="200" x2="277" y2="200" stroke="#94A3B8" strokeWidth="1.5" />
                        <defs>
                            <linearGradient id="checkStroke" x1="115" y1="142" x2="208" y2="142" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#16A34A" />
                                <stop offset="1" stopColor="#2563EB" />
                            </linearGradient>
                            <linearGradient id="pillG2" x1="225" y1="68" x2="283" y2="68" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#2563EB" />
                                <stop offset="1" stopColor="#10B981" />
                            </linearGradient>
                            <linearGradient id="pillG3" x1="37" y1="201" x2="87" y2="201" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#10B981" />
                                <stop offset="1" stopColor="#6366F1" />
                            </linearGradient>
                        </defs>
                    </svg>

                    <h2 className="text-2xl font-bold text-slate-800 mb-3">
                        Your Career Starts Now
                    </h2>
                    <p className="text-slate-600 text-sm leading-relaxed mb-6">
                        Pakistan&apos;s most trusted pharmacy e‑learning platform is ready for you. Every course, exam, and certificate awaits.
                    </p>

                    {/* Testimonial */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 text-left shadow-sm">
                        <p className="text-sm text-slate-600 italic leading-relaxed mb-3">
                            &ldquo;PharmaWallah helped me pass my Pharm-D exams on the first attempt. The mock tests are incredibly accurate!&rdquo;
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-green-400 flex items-center justify-center text-white text-xs font-bold">
                                FA
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-800">Fatima Aziz</p>
                                <p className="text-xs text-slate-400">Pharm-D Graduate, Karachi</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}