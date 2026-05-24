"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

export default function SignUpPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        // 1. Create the user
        const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: name } },
        });

        if (signUpError) {
            setError(signUpError.message);
            setLoading(false);
            return;
        }

        // 2. Sign them in immediately (email confirmation is disabled)
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
            setError(signInError.message);
            setLoading(false);
            return;
        }

        // 3. Redirect to dashboard
        router.push("/dashboard");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-md sm:max-w-lg lg:max-w-md transition-all duration-300">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-8 md:p-10">
                    <div className="text-center mb-8">
                        <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-600 to-green-400 rounded-xl flex items-center justify-center mb-4 shadow-sm">
                            <User className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                            Create your account
                        </h1>
                        <p className="mt-2 text-sm sm:text-base text-gray-600">
                            Join Pakistan’s #1 pharmacy e‑learning platform
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm sm:text-base rounded-xl flex items-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSignUp} className="space-y-5 sm:space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                                Full Name
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="block w-full pl-11 pr-4 py-3 text-base border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition-colors"
                                    placeholder="Shani Ahmed"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                                Email address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="block w-full pl-11 pr-4 py-3 text-base border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition-colors"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="block w-full pl-11 pr-4 py-3 text-base border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition-colors"
                                    placeholder="Min. 6 characters"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-blue-600 to-green-400 text-white text-base font-bold rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Create Account
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-3 bg-white text-gray-500">or continue with</span>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button className="w-full py-2.5 sm:py-3 border border-gray-300 rounded-xl text-sm sm:text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-blue-100 outline-none">
                            Google
                        </button>
                        <button className="w-full py-2.5 sm:py-3 border border-gray-300 rounded-xl text-sm sm:text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-blue-100 outline-none">
                            GitHub
                        </button>
                    </div>

                    <p className="mt-8 text-center text-sm sm:text-base text-gray-600">
                        Already have an account?{" "}
                        <Link href="/signin" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-colors">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}