"use client";

import { useState, useEffect } from "react";
import {
    Trophy, HelpCircle, Play, UserPlus, Key, ArrowRight, X,
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

    const startFreeTrial = async () => {
        setView("freeTrial");
        setScore(0);
        setCurrentQ(0);
        setTrialFinished(false);
        setShowUpgradePopup(false);
        const res = await fetch("/api/tournament/questions");
        const data = await res.json();
        setQuestions(data);
    };

    const handleAnswer = (selectedIdx: number) => {
        const q = questions[currentQ];
        if (selectedIdx === q.answer) setScore((s) => s + 1);

        if (currentQ + 1 < questions.length) {
            setCurrentQ((c) => c + 1);
        } else {
            setTrialFinished(true);
        }
    };

    const endFreeTrial = () => setShowUpgradePopup(true);

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
        <div className="min-h-screen flex flex-col items-center pt-10 p-4 sm:p-6 lg:p-8">
            <div className="text-center mb-10 max-w-2xl">
                <div className="inline-block p-1 rounded-2xl bg-gradient-to-r from-blue-600 to-green-400 mb-6">
                    <div className="bg-white rounded-2xl px-8 py-4">
                        <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-green-400 bg-clip-text text-transparent">
                            PharmaWallah Science Fair
                        </h1>
                        <p className="text-lg text-gray-600 mt-1">Tournament 2026</p>
                    </div>
                </div>
            </div>

            {view === "instructions" && (
                <div className="max-w-3xl w-full space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center">
                                <Trophy className="w-5 h-5 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Prizes & Rewards</h2>
                        </div>
                        <ul className="space-y-3 text-gray-600">
                            <li className="flex items-start gap-2">
                                <span className="text-green-500 mt-1">✓</span>
                                <span><strong className="text-gray-800">Participation:</strong> Sticker for every player</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-500 mt-1">✓</span>
                                <span><strong className="text-gray-800">Per‑game Top 10:</strong> Medals, certificates & premium access</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-500 mt-1">✓</span>
                                <span><strong className="text-gray-800">Grand Champion:</strong> Trophy, goodie bag & 1‑year premium</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-500 mt-1">✓</span>
                                <span><strong className="text-gray-800">Lucky Draw:</strong> Special prizes for random participants</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center">
                                <HelpCircle className="w-5 h-5 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">How to Participate</h2>
                        </div>
                        <ol className="space-y-3 list-decimal list-inside text-gray-600">
                            <li>Register with your details below.</li>
                            <li>Visit the cashier counter, pay the fee, and collect your <strong className="text-gray-800">entry code</strong>.</li>
                            <li>Return here, enter your code, and play the games!</li>
                        </ol>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <button
                            onClick={startFreeTrial}
                            className="flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-blue-600 text-blue-700 font-bold rounded-xl shadow-sm hover:bg-blue-50 transition"
                        >
                            <Play className="w-5 h-5" /> Free Trial (3 Qs)
                        </button>
                        <button
                            onClick={() => setView("register")}
                            className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-green-400 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition"
                        >
                            <UserPlus className="w-5 h-5" /> Register to Participate
                        </button>
                        <button
                            onClick={() => setView("codeEntry")}
                            className="flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-green-500 text-green-700 font-bold rounded-xl shadow-sm hover:bg-green-50 transition"
                        >
                            <Key className="w-5 h-5" /> I Have a Code
                        </button>
                    </div>
                </div>
            )}

            {view === "freeTrial" && !showUpgradePopup && (
                <div className="max-w-2xl w-full bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
                    {!trialFinished ? (
                        <>
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-sm font-medium text-gray-500">
                                    Question {currentQ + 1} of {questions.length}
                                </span>
                                <span className="text-sm font-medium text-blue-600">Score: {score}</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                {questions[currentQ]?.question}
                            </h3>
                            <div className="grid grid-cols-1 gap-3">
                                {questions[currentQ]?.options.map((opt, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleAnswer(idx)}
                                        className="text-left p-4 bg-gray-50 border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition font-medium text-gray-700"
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="text-center space-y-6">
                            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center">
                                <Trophy className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">Trial Complete!</h3>
                                <p className="text-gray-600 mt-2">
                                    You got <span className="font-bold text-blue-600">{score}</span> out of {questions.length} correct.
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <button
                                    onClick={endFreeTrial}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-green-400 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition"
                                >
                                    Upgrade to Full Tournament
                                </button>
                                <button
                                    onClick={() => setView("instructions")}
                                    className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition"
                                >
                                    Back to Home
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {showUpgradePopup && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative">
                        <button
                            onClick={() => setShowUpgradePopup(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div className="text-center space-y-4">
                            <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center">
                                <Trophy className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">Great Job!</h3>
                            <p className="text-gray-600">
                                Unlock the full tournament with more questions, leaderboard, and exciting prizes.
                            </p>
                            <button
                                onClick={() => {
                                    setShowUpgradePopup(false);
                                    setView("register");
                                }}
                                className="w-full py-3 bg-gradient-to-r from-blue-600 to-green-400 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition"
                            >
                                Register Now (Rs.50‑250)
                            </button>
                            <button
                                onClick={() => {
                                    setShowUpgradePopup(false);
                                    setView("instructions");
                                }}
                                className="w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition"
                            >
                                Maybe Later
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {view === "register" && (
                <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center">
                            <UserPlus className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Registration</h2>
                    </div>

                    {regStatus === "success" ? (
                        <div className="text-center space-y-4">
                            <div className="w-14 h-14 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                                <span className="text-2xl">✅</span>
                            </div>
                            <p className="text-green-700 font-medium">Registration submitted!</p>
                            <p className="text-gray-600">
                                Please visit the cashier counter to complete your payment and receive your <strong>entry code</strong>.
                            </p>
                            <button
                                onClick={() => {
                                    setView("instructions");
                                    setRegStatus("");
                                }}
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-green-400 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition"
                            >
                                Back to Home
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={regName}
                                    onChange={(e) => setRegName(e.target.value)}
                                    required
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 outline-none"
                                    placeholder="Ahmed Khan"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={regEmail}
                                    onChange={(e) => setRegEmail(e.target.value)}
                                    required
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 outline-none"
                                    placeholder="ahmed@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                                <input
                                    type="text"
                                    value={regYear}
                                    onChange={(e) => setRegYear(e.target.value)}
                                    required
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 outline-none"
                                    placeholder="1st, 2nd, 3rd, 4th"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                                <input
                                    type="text"
                                    value={regSemester}
                                    onChange={(e) => setRegSemester(e.target.value)}
                                    required
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 outline-none"
                                    placeholder="1,2,3,4,..."
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={regSubmitting}
                                className="w-full py-3 bg-gradient-to-r from-blue-600 to-green-400 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition disabled:opacity-60"
                            >
                                {regSubmitting ? "Submitting..." : "Submit Registration"}
                            </button>
                            {regStatus && <p className="text-red-500 text-sm">{regStatus}</p>}
                            <button
                                type="button"
                                onClick={() => setView("instructions")}
                                className="w-full py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                        </form>
                    )}
                </div>
            )}

            {view === "codeEntry" && (
                <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center">
                            <Key className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Enter Your Code</h2>
                    </div>
                    <form onSubmit={handleCodeSubmit} className="space-y-4">
                        <div>
                            <input
                                type="text"
                                placeholder="Entry code (e.g., ABC12345)"
                                value={codeInput}
                                onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                                maxLength={8}
                                required
                                className="w-full p-4 border border-gray-200 rounded-xl text-center text-xl font-mono font-bold uppercase tracking-widest focus:ring-2 focus:ring-blue-200 outline-none"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={codeSubmitting}
                            className="w-full py-3 bg-gradient-to-r from-blue-600 to-green-400 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                            <ArrowRight className="w-5 h-5" /> {codeSubmitting ? "Checking..." : "Start Playing"}
                        </button>
                        {codeError && <p className="text-red-500 text-sm text-center">{codeError}</p>}
                        <button
                            type="button"
                            onClick={() => setView("instructions")}
                            className="w-full py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition"
                        >
                            Back
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
