"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Lock, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";

export default function UpdatePasswordPage() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const supabase = createClient();
    const router = useRouter();

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        setMessage("");

        // Basic validation
        if (password !== confirmPassword) {
            setStatus("error");
            setMessage("Passwords do not match. Please try again.");
            return;
        }

        if (password.length < 6) {
            setStatus("error");
            setMessage("Password must be at least 6 characters long.");
            return;
        }

        // Update the user's password in Supabase
        // Note: This works because clicking the email link establishes a temporary session
        const { error } = await supabase.auth.updateUser({
            password: password,
        });

        if (error) {
            setStatus("error");
            setMessage(error.message);
            return;
        }

        setStatus("success");
        setMessage("Your password has been successfully updated. Redirecting to login...");

        // Redirect to login page after a short delay
        setTimeout(() => {
            router.push("/signin");
        }, 2500);
    };

    return (
        <main className="min-h-screen flex w-full bg-white">

            {/* Left Side: Form Section */}
            <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20 xl:px-24">
                <div className="mx-auto w-full max-w-sm lg:max-w-md">

                    {/* Header & Logo */}
                    <div className="mb-10">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center shadow-md mb-6">
                            <Lock className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
                            Set new password
                        </h1>
                        <p className="text-slate-500 text-base leading-relaxed">
                            Your new password must be different from previously used passwords.
                        </p>
                    </div>

                    {/* Alerts */}
                    {status === "success" && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 text-sm rounded-xl flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-2">
                            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-green-600" />
                            <span className="font-medium leading-relaxed">{message}</span>
                        </div>
                    )}

                    {status === "error" && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-2">
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
                            <span className="font-medium">{message}</span>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleUpdatePassword} className="space-y-5">
                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                                New Password
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="block w-full pl-12 pr-4 py-3.5 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all disabled:opacity-50"
                                    disabled={status === "loading" || status === "success"}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 mb-2">
                                Confirm New Password
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="block w-full pl-12 pr-4 py-3.5 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all disabled:opacity-50"
                                    disabled={status === "loading" || status === "success"}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={status === "loading" || status === "success" || !password || !confirmPassword}
                            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 mt-2 bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {status === "loading" ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                "Update Password"
                            )}
                        </button>
                    </form>

                    {/* Back to Login Link */}
                    <div className="mt-8 flex justify-center">
                        <Link
                            href="/signin"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded px-2 py-1"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to log in
                        </Link>
                    </div>
                </div>
            </div>

            {/* Right Side: Visual/Branding Section (Hidden on Mobile) */}
            <div className="hidden lg:flex flex-1 relative bg-slate-50 items-center justify-center overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-50 to-green-50 z-0"></div>
                <div className="absolute top-1/4 right-0 translate-x-1/3 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 left-0 -translate-x-1/4 w-[400px] h-[400px] bg-green-400/10 rounded-full blur-3xl"></div>

                <div className="relative z-10 w-full max-w-lg px-8 flex flex-col items-center">
                    <img
                        src="/images/banner/signup.webp"
                        className="w-full object-contain drop-shadow-2xl mb-8 transform hover:scale-105 transition-transform duration-700 ease-out opacity-90"
                        alt="Security illustration"
                    />
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-slate-800 mb-3">
                            Account Secured
                        </h2>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Set a strong password to protect your learning progress, interactive modules, and comprehensive study materials.
                        </p>
                    </div>
                </div>
            </div>

        </main>
    );
}