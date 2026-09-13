"use client";

import { useState, Suspense } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import {
    AccountPanel,
    AuthDivider,
    AuthField,
    AuthLayout,
    AuthLoading,
    AuthNotice,
    AuthSubmit,
    AuthSwitch,
    FieldLink,
    GoogleButton,
} from "@/components/auth/AuthKit";

function SignInForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const message = searchParams.get("message");
    const supabase = createClient();

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (signInError) {
            setError(signInError.message);
            setLoading(false);
            return;
        }

        router.push("/dashboard");
    };

    const handleGoogleSignIn = async () => {
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
            eyebrow="Sign in"
            title="Welcome back."
            lead="Sign in to open your dashboard and carry on from your last unit."
            panel={<AccountPanel />}
            footer={<AuthSwitch prompt="New to PharmaWallah?" href="/signup" label="Create an account" />}
        >
            {message && <AuthNotice tone="success">{message}</AuthNotice>}
            {error && <AuthNotice tone="error">{error}</AuthNotice>}

            <form onSubmit={handleSignIn} className="space-y-5">
                <AuthField
                    id="email"
                    label="Email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                />
                <AuthField
                    id="password"
                    label="Password"
                    type="password"
                    autoComplete="current-password"
                    aside={<FieldLink href="/forgot-password">Forgot password?</FieldLink>}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Your password"
                />
                <AuthSubmit loading={loading} loadingLabel="Signing in" disabled={loading}>
                    Sign in
                </AuthSubmit>
            </form>

            <AuthDivider />
            <GoogleButton onClick={handleGoogleSignIn} />
        </AuthLayout>
    );
}

export default function SignInPage() {
    return (
        <Suspense fallback={<AuthLoading label="Loading sign in" />}>
            <SignInForm />
        </Suspense>
    );
}