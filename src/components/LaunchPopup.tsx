"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { X, Bell, Mail, User, Loader2, AlertCircle } from "lucide-react";

const POPUP_STORAGE_KEY = "pharmawallah_july_popup_closed";

export default function LaunchPopup() {
    const [isOpen, setIsOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [imgError, setImgError] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    // Show popup after 2 seconds if not closed before
    useEffect(() => {
        const closed = localStorage.getItem(POPUP_STORAGE_KEY);
        if (!closed) {
            const timer = setTimeout(() => setIsOpen(true), 2000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        localStorage.setItem(POPUP_STORAGE_KEY, "true");
    };

    const handleNotify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const generatedPassword = crypto.randomUUID().slice(0, 12);

        const { error: signUpError } = await supabase.auth.signUp({
            email,
            password: generatedPassword,
            options: {
                data: { full_name: name || email.split("@")[0] },
                emailRedirectTo: `${window.location.origin}/dashboard`,
            },
        });

        if (signUpError) {
            setError(signUpError.message);
            setLoading(false);
            return;
        }

        // Auto-sign in after signup
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password: generatedPassword,
        });

        if (signInError) {
            setError(signInError.message);
            setLoading(false);
            return;
        }

        localStorage.setItem(POPUP_STORAGE_KEY, "true");
        setIsOpen(false);
        router.push("/dashboard");
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
            <div className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl animate-fadeInUp overflow-hidden">
                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 z-10 bg-white/80 rounded-full p-1"
                    aria-label="Close"
                >
                    <X size={20} />
                </button>

                {/* Image Section */}
                {!imgError ? (
                    <img
                        src="/images/banner/popup.webp"
                        alt="Launching in July – PharmaWallah"
                        className="w-full h-auto object-cover"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    /* Fallback gradient banner if image not found */
                    <div className="bg-gradient-to-r from-blue-600 to-green-500 p-6 text-center">
                        <div className="bg-white/20 inline-flex rounded-full p-3 mb-3">
                            <Bell className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-white text-2xl font-bold">🚀 Launching in July</h3>
                        <p className="text-white/90 text-sm mt-1">
                            Be the first to experience our new features
                        </p>
                    </div>
                )}

                {/* Form Section */}
                <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-800 text-center mb-2">
                        Get Early Access
                    </h2>
                    <p className="text-gray-500 text-sm text-center mb-6">
                        Sign up now and we’ll notify you when we launch. No spam, ever.
                    </p>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleNotify} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name (optional)
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    placeholder="Your name"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address *
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 text-white font-semibold rounded-lg transition-all disabled:opacity-70"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    Notify Me
                                    <Bell className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-xs text-gray-400 text-center mt-4">
                        By signing up, you agree to our{" "}
                        <a href="/terms" className="underline hover:text-gray-600">
                            Terms
                        </a>
                        .
                    </p>
                </div>
            </div>
        </div>
    );
}