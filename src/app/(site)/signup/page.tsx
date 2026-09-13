"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
    AccountPanel,
    AuthDivider,
    AuthField,
    AuthLayout,
    AuthNotice,
    AuthSubmit,
    AuthSwitch,
    GoogleButton,
} from "@/components/auth/AuthKit";

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

        // No emailRedirectTo – Supabase will now send an OTP email
        // (requires the Supabase dashboard changes – see notes below)
        const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: name },
            },
        });

        if (signUpError) {
            setError(signUpError.message);
            setLoading(false);
            return;
        }

        // Pass email so the verify-otp page can pre‑fill it
        router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
    };

    const handleGoogleSignUp = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/api/auth/callback`,
            },
        });
        if (error) setError(error.message);
    };

    return (
        <AuthLayout
            eyebrow="Create an account"
            title="Start keeping your place."
            lead="Free. We'll email you a 6-digit code to confirm the address."
            panel={<AccountPanel heading="Everything you study, remembered." />}
            footer={<AuthSwitch prompt="Already have an account?" href="/signin" label="Sign in" />}
        >
            {error && <AuthNotice tone="error">{error}</AuthNotice>}

            <form onSubmit={handleSignUp} className="space-y-5">
                <AuthField
                    id="name"
                    label="Full name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Shani Ahmed"
                    required
                    disabled={loading}
                />
                <AuthField
                    id="email"
                    label="Email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    disabled={loading}
                />
                <AuthField
                    id="password"
                    label="Password"
                    type="password"
                    autoComplete="new-password"
                    hint="At least 6 characters."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={loading}
                />
                <AuthSubmit loading={loading} loadingLabel="Creating your account" disabled={loading}>
                    Create account
                </AuthSubmit>
            </form>

            <AuthDivider />
            <GoogleButton onClick={handleGoogleSignUp} disabled={loading} />
        </AuthLayout>
    );
}
