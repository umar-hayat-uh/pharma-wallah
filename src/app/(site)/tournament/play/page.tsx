"use client";

import { useState } from "react";
import {
    Trophy,
    HelpCircle,
    Play,
    UserPlus,
    Key,
    ArrowRight,
    X,
    CheckCircle2,
    Sparkles,
    Award,
    Gift,
    Medal,
} from "lucide-react";

type Question = {
    question: string;
    options: string[];
    answer: number;
};

export default function TournamentPlayPage() {
    const [view, setView] = useState<
        "instructions" | "freeTrial" | "register" | "codeEntry"
    >("instructions");
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQ, setCurrentQ] = useState(0);
    const [score, setScore] = useState(0);
    const [trialFinished, setTrialFinished] = useState(false);
    const [showUpgradePopup, setShowUpgradePopup] = useState(false);

    const [regName, setRegName] = useState("");
    const [regEmail, setRegEmail] = useState("");
    const [regYear, setRegYear] = useState("");
    const [regSemester, setRegSemester] = useState("");
    const [regStatus, setRegStatus] = useState("");
    const [regSubmitting, setRegSubmitting] = useState(false);

    const [codeInput, setCodeInput] = useState("");
    const [codeError, setCodeError] = useState("");
    const [codeSubmitting, setCodeSubmitting] = useState(false);

    // Helper to scroll to top smoothly on screen changes / next clicks
    const scrollToTop = () => {
        if (typeof window !== "undefined") {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const handleSetView = (
        nextView: "instructions" | "freeTrial" | "register" | "codeEntry"
    ) => {
        setView(nextView);
        scrollToTop();
    };

    const startFreeTrial = async () => {
        handleSetView("freeTrial");
        setScore(0);
        setCurrentQ(0);
        setTrialFinished(false);
        setShowUpgradePopup(false);
        try {
            const res = await fetch("/api/tournament/questions");
            const data = await res.json();
            setQuestions(data);
        } catch {
            setQuestions([]);
        }
    };

    const handleAnswer = (selectedIdx: number) => {
        const q = questions[currentQ];
        if (selectedIdx === q.answer) setScore((s) => s + 1);

        if (currentQ + 1 < questions.length) {
            setCurrentQ((c) => c + 1);
        } else {
            setTrialFinished(true);
        }
        scrollToTop();
    };

    const endFreeTrial = () => {
        setShowUpgradePopup(true);
        scrollToTop();
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setRegSubmitting(true);
        setRegStatus("");
        try {
            const res = await fetch("/api/tournament/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: regName,
                    email: regEmail,
                    year: regYear,
                    semester: regSemester,
                }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setRegStatus("success");
            } else {
                setRegStatus(data.error || "Registration failed.");
            }
        } catch {
            setRegStatus("Network error. Please try again.");
        } finally {
            setRegSubmitting(false);
            scrollToTop();
        }
    };

    const handleCodeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setCodeError("");
        setCodeSubmitting(true);
        try {
            const normalizedCode = codeInput.trim().toUpperCase();
            const res = await fetch(
                `/api/tournament/validate-code?code=${encodeURIComponent(normalizedCode)}`
            );
            const data = await res.json();
            if (data.valid) {
                window.location.href = `/tournament/games?code=${data.code}`;
            } else {
                setCodeError(data.message || "Invalid code");
            }
        } catch {
            setCodeError("Network error. Please try again.");
        } finally {
            setCodeSubmitting(false);
        }
    };

    return (
        <div className="min-h-[100dvh] w-full bg-slate-50/50 flex flex-col items-center px-4 py-6 pt-10 sm:px-6 sm:py-10 lg:px-8">
            {/* Top Banner Header */}
            <div className="text-center mb-6 sm:mb-10 max-w-2xl w-full">
                <div className="relative inline-block w-full sm:w-auto p-1 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-blue-600 to-green-400 shadow-md sm:shadow-lg shadow-blue-500/10">
                    <div className="bg-white rounded-[14px] sm:rounded-[22px] px-4 py-4 sm:px-10 sm:py-5">
                        <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-1">
                            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 animate-pulse" />
                            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider sm:tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500">
                                Official Event
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight bg-gradient-to-r from-blue-600 to-green-400 bg-clip-text text-transparent leading-tight">
                            PharmaWallah Science Fair
                        </h1>
                        <p className="text-xs sm:text-base font-semibold text-gray-500 mt-1">
                            Tournament 2026
                        </p>
                    </div>
                </div>
            </div>

            {/* VIEW: INSTRUCTIONS */}
            {view === "instructions" && (
                <div className="max-w-3xl w-full space-y-4 sm:space-y-6">
                    {/* Prizes Card */}
                    <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-md sm:shadow-xl p-4 sm:p-8">
                        <div className="flex items-center gap-3 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-100">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                                    Prizes & Rewards
                                </h2>
                                <p className="text-[11px] sm:text-xs text-gray-500">
                                    Compete for exclusive titles and access
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div className="flex items-start gap-3 p-3 rounded-xl sm:rounded-2xl bg-blue-50/50 border border-blue-100/60">
                                <Award className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                                <div>
                                    <strong className="block text-xs sm:text-sm text-gray-900 font-bold">
                                        Participation
                                    </strong>
                                    <span className="text-[11px] sm:text-xs text-gray-600">
                                        Custom sticker pack for every player
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 rounded-xl sm:rounded-2xl bg-green-50/50 border border-green-100/60">
                                <Medal className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                                <div>
                                    <strong className="block text-xs sm:text-sm text-gray-900 font-bold">
                                        Per‑game Top 10
                                    </strong>
                                    <span className="text-[11px] sm:text-xs text-gray-600">
                                        Medals, certificates & premium access
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 rounded-xl sm:rounded-2xl bg-amber-50/50 border border-amber-100/60">
                                <Trophy className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                    <strong className="block text-xs sm:text-sm text-gray-900 font-bold">
                                        Grand Champion
                                    </strong>
                                    <span className="text-[11px] sm:text-xs text-gray-600">
                                        Trophy, goodie bag & 1‑year premium
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 rounded-xl sm:rounded-2xl bg-purple-50/50 border border-purple-100/60">
                                <Gift className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                                <div>
                                    <strong className="block text-xs sm:text-sm text-gray-900 font-bold">
                                        Lucky Draw
                                    </strong>
                                    <span className="text-[11px] sm:text-xs text-gray-600">
                                        Special prizes for random participants
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* How to Participate Card */}
                    <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-md sm:shadow-xl p-4 sm:p-8">
                        <div className="flex items-center gap-3 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-100">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                                <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                                    How to Participate
                                </h2>
                                <p className="text-[11px] sm:text-xs text-gray-500">
                                    Three easy steps to start competing
                                </p>
                            </div>
                        </div>
                        <ol className="space-y-3 sm:space-y-4">
                            {[
                                { step: "01", text: "Register with your student details below." },
                                {
                                    step: "02",
                                    text: "Visit the cashier counter, pay the fee, and collect your entry code.",
                                },
                                {
                                    step: "03",
                                    text: "Return here, enter your code, and play to rank on the leaderboard!",
                                },
                            ].map((item, idx) => (
                                <li
                                    key={idx}
                                    className="flex items-start sm:items-center gap-3 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl hover:bg-slate-50 transition-colors"
                                >
                                    <span className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-600 to-green-400 text-white font-extrabold text-xs shadow-sm shrink-0">
                                        {item.step}
                                    </span>
                                    <span className="text-xs sm:text-sm font-medium text-gray-700 pt-1 sm:pt-0">
                                        {item.text}
                                    </span>
                                </li>
                            ))}
                        </ol>
                    </div>

                    {/* Action Navigation Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-1">
                        <button
                            onClick={startFreeTrial}
                            className="group flex items-center justify-center gap-2 px-5 py-3.5 sm:py-4 bg-white border-2 border-blue-600 text-blue-700 font-bold rounded-xl sm:rounded-2xl shadow-sm hover:bg-blue-50 active:scale-[0.98] transition-all text-sm sm:text-base min-h-[48px]"
                        >
                            <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-blue-600 shrink-0" />
                            <span>Free Trial (3 Qs)</span>
                        </button>
                        <button
                            onClick={() => handleSetView("register")}
                            className="group flex items-center justify-center gap-2 px-5 py-3.5 sm:py-4 bg-gradient-to-r from-blue-600 to-green-400 text-white font-bold rounded-xl sm:rounded-2xl shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all text-sm sm:text-base min-h-[48px]"
                        >
                            <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                            <span>Register Now</span>
                        </button>
                        <button
                            onClick={() => handleSetView("codeEntry")}
                            className="group flex items-center justify-center gap-2 px-5 py-3.5 sm:py-4 bg-white border-2 border-green-500 text-green-700 font-bold rounded-xl sm:rounded-2xl shadow-sm hover:bg-green-50 active:scale-[0.98] transition-all text-sm sm:text-base min-h-[48px]"
                        >
                            <Key className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                            <span>I Have a Code</span>
                        </button>
                    </div>
                </div>
            )}

            {/* VIEW: FREE TRIAL PLAY */}
            {view === "freeTrial" && !showUpgradePopup && (
                <div className="max-w-2xl w-full bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-xl p-5 sm:p-8">
                    {!trialFinished ? (
                        <>
                            {/* Question Header & Progress Bar */}
                            <div className="mb-4 sm:mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-400">
                                        Question {currentQ + 1} of {questions.length}
                                    </span>
                                    <span className="text-[10px] sm:text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                                        Score: {score}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                    <div
                                        className="bg-gradient-to-r from-blue-600 to-green-400 h-full transition-all duration-300 rounded-full"
                                        style={{
                                            width: `${((currentQ + 1) / (questions.length || 1)) * 100}%`,
                                        }}
                                    />
                                </div>
                            </div>

                            <h3 className="text-base sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 leading-relaxed sm:leading-snug">
                                {questions[currentQ]?.question || "Loading question..."}
                            </h3>

                            <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
                                {questions[currentQ]?.options.map((opt, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleAnswer(idx)}
                                        className="group relative flex items-start sm:items-center gap-3 text-left p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50/70 border border-gray-200 hover:bg-blue-50/60 hover:border-blue-300 active:scale-[0.99] transition-all font-semibold text-gray-700 min-h-[48px]"
                                    >
                                        <span className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-500 shrink-0 mt-0.5 sm:mt-0">
                                            {String.fromCharCode(65 + idx)}
                                        </span>
                                        <span className="text-xs sm:text-sm leading-relaxed">{opt}</span>
                                    </button>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-2 sm:py-4 space-y-4 sm:space-y-6">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl sm:rounded-3xl bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center shadow-lg shadow-blue-500/30 animate-bounce">
                                <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-2xl sm:text-3xl font-black text-gray-900">Trial Complete!</h3>
                                <p className="text-gray-500 text-xs sm:text-sm">
                                    You scored <span className="font-extrabold text-blue-600">{score}</span> out of {questions.length} correct.
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 justify-center pt-2">
                                <button
                                    onClick={endFreeTrial}
                                    className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-blue-600 to-green-400 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all text-sm min-h-[48px]"
                                >
                                    Upgrade to Full Tournament
                                </button>
                                <button
                                    onClick={() => handleSetView("instructions")}
                                    className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 text-gray-700 font-bold rounded-xl hover:bg-slate-200 active:scale-[0.98] transition-all text-sm min-h-[48px]"
                                >
                                    Back to Home
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* UPGRADE POPUP MODAL */}
            {showUpgradePopup && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full p-5 sm:p-8 shadow-2xl relative border border-gray-100 my-auto">
                        <button
                            onClick={() => setShowUpgradePopup(false)}
                            className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-slate-100 transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div className="text-center space-y-4 sm:space-y-5">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <Trophy className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xl sm:text-2xl font-black text-gray-900">Great Job!</h3>
                                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                                    Unlock the full tournament with more questions, real-time leaderboard rankings, and exciting prizes!
                                </p>
                            </div>
                            <div className="space-y-2 pt-2">
                                <button
                                    onClick={() => {
                                        setShowUpgradePopup(false);
                                        handleSetView("register");
                                    }}
                                    className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-green-400 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 active:scale-[0.99] transition-all text-sm min-h-[48px]"
                                >
                                    Register Now (Rs.50‑250)
                                </button>
                                <button
                                    onClick={() => {
                                        setShowUpgradePopup(false);
                                        handleSetView("instructions");
                                    }}
                                    className="w-full py-3.5 bg-slate-100 text-gray-700 font-bold rounded-xl hover:bg-slate-200 active:scale-[0.99] transition-all text-sm min-h-[48px]"
                                >
                                    Maybe Later
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* VIEW: REGISTER FORM */}
            {view === "register" && (
                <div className="max-w-md w-full bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-xl p-5 sm:p-8">
                    <div className="flex items-center gap-3 mb-5 pb-3 sm:pb-4 border-b border-gray-100">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                            <UserPlus className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Registration</h2>
                    </div>

                    {regStatus === "success" ? (
                        <div className="text-center py-2 space-y-4">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full bg-green-50 border border-green-200 flex items-center justify-center">
                                <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8 text-green-600" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                                    Registration Submitted!
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                                    Please visit the cashier counter to complete your payment and receive your <strong className="text-gray-900">entry code</strong>.
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    handleSetView("instructions");
                                    setRegStatus("");
                                }}
                                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-green-400 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 active:scale-[0.99] transition-all text-sm min-h-[48px]"
                            >
                                Back to Home
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleRegister} className="space-y-3.5 sm:space-y-4">
                            <div>
                                <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={regName}
                                    onChange={(e) => setRegName(e.target.value)}
                                    required
                                    className="w-full px-3.5 py-3 bg-slate-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all text-sm font-medium h-[48px]"
                                    placeholder="e.g. Ahmed Khan"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={regEmail}
                                    onChange={(e) => setRegEmail(e.target.value)}
                                    required
                                    className="w-full px-3.5 py-3 bg-slate-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all text-sm font-medium h-[48px]"
                                    placeholder="ahmed@example.com"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                                        Year
                                    </label>
                                    <input
                                        type="text"
                                        value={regYear}
                                        onChange={(e) => setRegYear(e.target.value)}
                                        required
                                        className="w-full px-3.5 py-3 bg-slate-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all text-sm font-medium h-[48px]"
                                        placeholder="1st, 2nd..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                                        Semester
                                    </label>
                                    <input
                                        type="text"
                                        value={regSemester}
                                        onChange={(e) => setRegSemester(e.target.value)}
                                        required
                                        className="w-full px-3.5 py-3 bg-slate-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all text-sm font-medium h-[48px]"
                                        placeholder="1, 2, 3..."
                                    />
                                </div>
                            </div>

                            <div className="pt-2 space-y-2">
                                <button
                                    type="submit"
                                    disabled={regSubmitting}
                                    className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-green-400 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 active:scale-[0.99] transition-all disabled:opacity-60 text-sm min-h-[48px]"
                                >
                                    {regSubmitting ? "Submitting..." : "Submit Registration"}
                                </button>
                                {regStatus && (
                                    <p className="text-red-500 text-xs font-bold text-center">{regStatus}</p>
                                )}
                                <button
                                    type="button"
                                    onClick={() => handleSetView("instructions")}
                                    className="w-full py-3 bg-slate-100 text-gray-700 font-bold rounded-xl hover:bg-slate-200 active:scale-[0.99] transition-all text-sm min-h-[48px]"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}

            {/* VIEW: CODE ENTRY */}
            {view === "codeEntry" && (
                <div className="max-w-md w-full bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-xl p-5 sm:p-8">
                    <div className="flex items-center gap-3 mb-5 pb-3 sm:pb-4 border-b border-gray-100">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                            <Key className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Enter Your Code</h2>
                    </div>
                    <form onSubmit={handleCodeSubmit} className="space-y-4">
                        <div>
                            <input
                                type="text"
                                placeholder="ABC12345"
                                value={codeInput}
                                onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                                maxLength={8}
                                required
                                className="w-full p-3.5 sm:p-4 bg-slate-50/50 border border-gray-200 rounded-xl sm:rounded-2xl text-center text-xl sm:text-2xl font-mono font-black uppercase tracking-widest focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all placeholder:text-gray-300 placeholder:font-normal h-[56px]"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={codeSubmitting}
                            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-green-400 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 text-sm min-h-[48px]"
                        >
                            <span>{codeSubmitting ? "Validating..." : "Start Playing"}</span>
                            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        {codeError && (
                            <p className="text-red-500 text-xs font-bold text-center">{codeError}</p>
                        )}
                        <button
                            type="button"
                            onClick={() => handleSetView("instructions")}
                            className="w-full py-3 bg-slate-100 text-gray-700 font-bold rounded-xl hover:bg-slate-200 active:scale-[0.99] transition-all text-sm min-h-[48px]"
                        >
                            Back
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}