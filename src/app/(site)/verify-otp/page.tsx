"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import {
    AccountPanel,
    AuthLayout,
    AuthLoading,
    AuthNotice,
    AuthSubmit,
    AuthSwitch,
} from "@/components/auth/AuthKit";

// ------------------------------------------------------------
// Inner component that actually uses useSearchParams
// ------------------------------------------------------------
function VerifyOTPContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email") ?? "";

    const [code, setCode] = useState<string[]>(Array(6).fill(""));
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [verified, setVerified] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const supabase = createClient();

    const [resendCooldown, setResendCooldown] = useState(0);
    useEffect(() => {
        if (resendCooldown <= 0) return;
        const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
        return () => clearTimeout(timer);
    }, [resendCooldown]);

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

        setVerified(true);
        setLoading(false);
    };

    const handleResend = async () => {
        if (resendCooldown > 0) return;
        setError("");
        const { error } = await supabase.auth.signUp({
            email,
            password: "", // only triggers a new OTP
        });
        if (error) {
            setError(error.message);
        } else {
            setResendCooldown(30);
        }
    };

    return (
        <AuthLayout
            eyebrow={verified ? "Email verified" : "Verify your email · last step"}
            title={verified ? "You're in." : "Enter the 6‑digit code."}
            lead={
                verified ? (
                    <>
                        <span className="font-medium text-[#16181d]">{email}</span> is confirmed. Your account is ready.
                    </>
                ) : (
                    <>
                        We sent it to <span className="font-medium text-[#16181d]">{email || "your email"}</span>. It
                        can take a minute to arrive — check spam too.
                    </>
                )
            }
            panel={
                <AccountPanel
                    eyebrow="Why a code"
                    heading="It proves the address is yours."
                    intro="So password resets reach you and nobody else. Once you're in, this is what the account keeps:"
                />
            }
            footer={
                verified ? undefined : (
                    <AuthSwitch prompt="Wrong address?" href="/signup" label="Start again" />
                )
            }
        >
            {error && <AuthNotice tone="error">{error}</AuthNotice>}

            {verified ? (
                <AuthSubmit type="button" onClick={() => router.push("/dashboard")}>
                    Go to your dashboard
                </AuthSubmit>
            ) : (
                <form onSubmit={handleVerify} className="space-y-6">
                    <fieldset>
                        <legend className="mb-3 text-sm font-medium text-[#16181d]">Verification code</legend>
                        <div className="grid grid-cols-6 gap-2 sm:gap-2.5">
                            {code.map((digit, idx) => (
                                <input
                                    key={idx}
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete={idx === 0 ? "one-time-code" : "off"}
                                    aria-label={`Digit ${idx + 1} of 6`}
                                    maxLength={1}
                                    value={digit}
                                    ref={(el) => {
                                        inputRefs.current[idx] = el;
                                    }}
                                    onChange={(e) => handleChange(idx, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(idx, e)}
                                    onPaste={handlePaste}
                                    className="h-14 w-full min-w-0 rounded-xl border border-[#16181d]/15 bg-white text-center text-2xl font-semibold tabular-nums text-[#16181d] transition-[border-color,box-shadow] duration-300 ease-out-expo hover:border-[#16181d]/30 focus:border-[#1c7bd9] focus:outline-none focus:ring-4 focus:ring-[#1c7bd9]/15 disabled:opacity-60 sm:h-16 sm:text-[1.75rem]"
                                    disabled={loading}
                                />
                            ))}
                        </div>
                        <p className="mt-2 text-[13px] text-[#16181d]/50">Pasting the whole code fills every box.</p>
                    </fieldset>

                    <AuthSubmit loading={loading} loadingLabel="Verifying" disabled={loading}>
                        Verify email
                    </AuthSubmit>

                    <p className="text-[15px] text-[#16181d]/62" aria-live="polite">
                        Didn&apos;t get it?{" "}
                        {resendCooldown > 0 ? (
                            <span className="tabular-nums text-[#16181d]/45">Send again in {resendCooldown}s</span>
                        ) : (
                            <button
                                type="button"
                                onClick={handleResend}
                                className="rounded-sm font-semibold text-[#16181d] underline decoration-[#16181d]/25 underline-offset-4 transition-colors duration-300 hover:decoration-[#16181d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c7bd9]/50"
                            >
                                Send it again
                            </button>
                        )}
                    </p>
                </form>
            )}
        </AuthLayout>
    );
}

// ------------------------------------------------------------
// Exported page component with Suspense boundary
// ------------------------------------------------------------
export default function VerifyOTPPage() {
    return (
        <Suspense fallback={<AuthLoading label="Loading verification" />}>
            <VerifyOTPContent />
        </Suspense>
    );
}