"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { AccountPanel, AuthField, AuthLayout, AuthNotice, AuthSubmit, AuthSwitch } from "@/components/auth/AuthKit";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const supabase = createClient();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    // The redirectTo URL should point to your app's route that handles the new password input
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setStatus("success");
    setMessage("If an account exists, a password reset link has been sent to your email.");
  };

  return (
    <AuthLayout
      eyebrow="Reset your password"
      title="Forgot your password?"
      lead="Enter the email you signed up with and we'll send a link to set a new one."
      panel={
        <AccountPanel
          eyebrow="Nothing is lost"
          heading="Your progress is safe."
          intro="A new password changes how you sign in, nothing else. All of this stays exactly as you left it:"
        />
      }
      footer={<AuthSwitch prompt="Remembered it?" href="/signin" label="Back to sign in" />}
    >
      {status === "success" && <AuthNotice tone="success">{message}</AuthNotice>}
      {status === "error" && <AuthNotice tone="error">{message}</AuthNotice>}

      <form onSubmit={handleResetPassword} className="space-y-5">
        <AuthField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          disabled={status === "loading" || status === "success"}
        />
        <AuthSubmit
          loading={status === "loading"}
          loadingLabel="Sending the link"
          disabled={status === "loading" || status === "success" || !email}
        >
          {status === "success" ? "Link sent" : "Send reset link"}
        </AuthSubmit>
      </form>
    </AuthLayout>
  );
}
