"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { AccountPanel, AuthField, AuthLayout, AuthNotice, AuthSubmit, AuthSwitch } from "@/components/auth/AuthKit";

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
        <AuthLayout
            eyebrow="Reset your password"
            title="Set a new password."
            lead="Choose something you haven't used here before. You'll sign in with it next."
            panel={
                <AccountPanel
                    eyebrow="Nothing is lost"
                    heading="Your progress is safe."
                    intro="A new password changes how you sign in, nothing else. All of this stays exactly as you left it:"
                />
            }
            footer={<AuthSwitch prompt="Changed your mind?" href="/signin" label="Back to sign in" />}
        >
            {status === "success" && <AuthNotice tone="success">{message}</AuthNotice>}
            {status === "error" && <AuthNotice tone="error">{message}</AuthNotice>}

            <form onSubmit={handleUpdatePassword} className="space-y-5">
                <AuthField
                    id="password"
                    label="New password"
                    type="password"
                    autoComplete="new-password"
                    hint="At least 6 characters."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={status === "loading" || status === "success"}
                />
                <AuthField
                    id="confirmPassword"
                    label="Confirm new password"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={status === "loading" || status === "success"}
                />
                <AuthSubmit
                    loading={status === "loading"}
                    loadingLabel="Saving"
                    disabled={status === "loading" || status === "success" || !password || !confirmPassword}
                >
                    {status === "success" ? "Password updated" : "Update password"}
                </AuthSubmit>
            </form>
        </AuthLayout>
    );
}
