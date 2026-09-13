"use client";

import Link from "next/link";
import { forwardRef } from "react";
import { AlertCircle, ArrowRight, Check, CheckCircle2, Loader2, Smartphone } from "lucide-react";
import { SUBJECTS } from "@/lib/courses/registry";
import { BRAND_BUTTON, BRAND_SURFACE } from "@/components/page-kit/brand";
import { cn } from "@/lib/utils";

/*
 * The shared frame for the five account pages — /signin, /signup, /verify-otp,
 * /forgot-password, /update-password. Redesign direction 01, "What an account
 * keeps" (.claude/redesign-tracker.md, 2026-09-13).
 *
 * The idea: people hesitate at a sign-in form because they can't see the
 * trade. So beside the form, in plain words, sits what an account saves for
 * you — and just as plainly, what works without one. The brand-gradient panel
 * is the family's one signature moment; the form side stays quiet. (It was an
 * ink panel until the user set the rule that the theme is the blue→green
 * gradient, never black — see page-kit/brand.ts for the contrast maths.)
 *
 * UI only. Every page keeps its own Supabase calls, state and redirects; these
 * components render markup and receive handlers.
 *
 * Every claim in the panel is checked against the code (2026-09-13): progress
 * is written by /api/progress for units, flashcards, quizzes and spotting;
 * /community/ask redirects signed-out visitors to /signin; the calculators,
 * courses, spotting lessons and simulations are all public. If any of that
 * changes, change the copy here.
 */

// Derived from the course registry, so the figure cannot drift as subjects are registered.
const UNIT_COUNT = SUBJECTS.reduce((n, s) => n + s.units.length, 0);

// ─── Layout ──────────────────────────────────────────────────────────────

export function AuthLayout({
  eyebrow,
  title,
  lead,
  panel,
  children,
  footer,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  /** The brand panel — usually <AccountPanel />. */
  panel: React.ReactNode;
  children: React.ReactNode;
  /** Below the form: "New here? Create an account", "Back to sign in". */
  footer?: React.ReactNode;
}) {
  return (
    // The site header is fixed and ships its own in-flow spacer (64px, 76px from lg),
    // so this fills exactly the rest of the first screen.
    <main className="grid min-h-[calc(100svh-64px)] bg-[#fcfcfa] text-[#16181d] lg:min-h-[calc(100svh-76px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      {/* Form first in the DOM and on a phone: the thing the visitor came to do. */}
      <section className="flex items-center justify-center px-5 py-10 sm:px-10 sm:py-14 lg:order-2 lg:px-16">
        <div className="w-full max-w-[26rem] animate-in fade-in slide-in-from-bottom-2 duration-700 ease-out-expo motion-reduce:animate-none">
          <p className="flex items-center gap-2 font-mono text-[10.5px] font-medium uppercase tracking-[0.16em] text-[#16181d]/55">
            <span className="h-1.5 w-1.5 rounded-full bg-[#1c7bd9]" aria-hidden="true" />
            {eyebrow}
          </p>
          <h1 className="mt-3 text-[2.35rem] font-bold leading-[1.02] tracking-[-0.04em] [text-wrap:balance] sm:text-5xl">
            {title}
          </h1>
          {lead && (
            <p className="mt-3 text-[15.5px] leading-relaxed text-[#16181d]/62 [text-wrap:pretty]">{lead}</p>
          )}
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-8 border-t border-[#16181d]/10 pt-6 text-[15px] text-[#16181d]/62">{footer}</div>}
        </div>
      </section>

      <aside className="lg:order-1">{panel}</aside>
    </main>
  );
}

// ─── The brand panel ───────────────────────────────────────────────────────

const KEPT = [
  { title: `Your place in ${UNIT_COUNT} course units`, note: "Which you've opened, and which you've finished" },
  { title: "Every MCQ attempt and its score" },
  { title: "Flashcard and slide-spotting progress" },
  { title: "Your study dashboard" },
  { title: "Asking and answering in Community" },
];

/**
 * What an account saves, and what works without one.
 *
 * `heading` / `intro` let each page frame the same facts for its moment:
 * signing in, verifying an email, resetting a password.
 */
export function AccountPanel({
  eyebrow = "Your account",
  heading = "Pick up exactly where you stopped.",
  intro,
}: {
  eyebrow?: string;
  heading?: string;
  intro?: string;
}) {
  return (
    // The bottom hairline: this panel sits directly on the site footer, which is
    // also the brand gradient, and without it the two read as one block.
    <div
      className="flex h-full flex-col justify-center border-b border-white/25 px-5 py-12 text-white sm:px-10 sm:py-16 lg:px-16"
      style={{ background: BRAND_SURFACE }}
    >
      <div className="mx-auto w-full max-w-[30rem] lg:mx-0">
        <p className="flex items-center gap-2 font-mono text-[10.5px] font-medium uppercase tracking-[0.16em] text-white/90">
          <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden="true" />
          {eyebrow}
        </p>
        <h2 className="mt-4 text-[2rem] font-bold leading-[1.04] tracking-[-0.035em] [text-wrap:balance] sm:text-[2.6rem]">
          {heading}
        </h2>
        {intro && <p className="mt-4 text-[15.5px] leading-relaxed text-white/90 [text-wrap:pretty]">{intro}</p>}

        {/* div + role="list": globals.css puts bullets and grey text on every ul/li (gotcha 30b). */}
        <div role="list" className="mt-8 border-t border-white/25">
          {KEPT.map((item) => (
            <div role="listitem" key={item.title} className="flex gap-3.5 border-b border-white/20 py-3.5">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/95 text-[#156c53]" aria-hidden="true">
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
              <p className="text-[16px] leading-snug">
                {item.title}
                {item.note && <span className="mt-0.5 block text-[13.5px] text-white/90">{item.note}</span>}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex gap-3.5 rounded-2xl border border-white/30 bg-white/[0.08] p-4 sm:p-5">
          <Smartphone className="mt-0.5 h-5 w-5 shrink-0 text-white" aria-hidden="true" />
          <p className="text-[14.5px] leading-relaxed text-white/90">
            <span className="font-semibold text-white">No account needed</span> for the calculators, courses,
            spotting lessons or simulations — or the{" "}
            <Link
              href="/download"
              className="font-semibold text-white underline decoration-white/50 underline-offset-4 transition-colors duration-300 hover:decoration-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              offline Android app
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Form parts ──────────────────────────────────────────────────────────

const inputClass =
  "block h-12 w-full rounded-xl border border-[#16181d]/15 bg-white px-4 text-[15.5px] text-[#16181d] placeholder:text-[#16181d]/35 transition-[border-color,box-shadow] duration-300 ease-out-expo hover:border-[#16181d]/30 focus:border-[#1c7bd9] focus:outline-none focus:ring-4 focus:ring-[#1c7bd9]/15 disabled:cursor-not-allowed disabled:opacity-60";

/** A labelled input. `aside` sits on the label row — e.g. "Forgot password?". */
export const AuthField = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { label: string; aside?: React.ReactNode; hint?: string }
>(function AuthField({ label, aside, hint, id, className, ...props }, ref) {
  const hintId = hint && id ? `${id}-hint` : undefined;
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-[#16181d]">
          {label}
        </label>
        {aside}
      </div>
      <input ref={ref} id={id} aria-describedby={hintId} className={cn(inputClass, className)} {...props} />
      {hint && (
        <p id={hintId} className="mt-1.5 text-[13px] text-[#16181d]/50">
          {hint}
        </p>
      )}
    </div>
  );
});

/** The inline link that sits on a field's label row. */
export function FieldLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-sm text-sm font-medium text-[#1c7bd9] underline-offset-4 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c7bd9]/50"
    >
      {children}
    </Link>
  );
}

/** The one primary action: the brand gradient, full width, with a real loading state. */
export function AuthSubmit({
  loading,
  loadingLabel = "Working",
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean; loadingLabel?: string }) {
  return (
    <button
      type="submit"
      aria-busy={loading || undefined}
      style={{ background: BRAND_BUTTON }}
      className={cn(
        // Hover darkens with an inset shadow rather than a second gradient, so the
        // change animates (background-image can't) and contrast only goes up.
        "group inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl px-5 text-[15px] font-semibold text-white shadow-[inset_0_0_0_999px_rgba(6,18,36,0)] transition-[box-shadow,transform,opacity] duration-300 ease-out-expo hover:shadow-[inset_0_0_0_999px_rgba(6,18,36,0.14)] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c7bd9] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          <span>{loadingLabel}…</span>
        </>
      ) : (
        <>
          {children}
          <ArrowRight
            className="h-4 w-4 transition-transform duration-500 ease-out-expo group-hover:translate-x-0.5 group-disabled:translate-x-0"
            aria-hidden="true"
          />
        </>
      )}
    </button>
  );
}

export function AuthDivider() {
  return (
    <div className="my-6 flex items-center gap-4 font-mono text-[10.5px] uppercase tracking-[0.16em] text-[#16181d]/45" aria-hidden="true">
      <span className="h-px flex-1 bg-[#16181d]/10" />
      or
      <span className="h-px flex-1 bg-[#16181d]/10" />
    </div>
  );
}

export function GoogleButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-[#16181d]/15 bg-white px-5 text-[15px] font-medium text-[#16181d] transition-[border-color,background-color] duration-300 ease-out-expo hover:border-[#16181d]/35 hover:bg-[#16181d]/[0.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c7bd9] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
      Continue with Google
    </button>
  );
}

/**
 * A result the visitor must read: the error from Supabase, or a success.
 * A leading rule plus an icon plus words — never colour alone.
 */
export function AuthNotice({ tone, children }: { tone: "success" | "error"; children: React.ReactNode }) {
  const Icon = tone === "error" ? AlertCircle : CheckCircle2;
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "mb-6 flex items-start gap-3 rounded-r-xl border-l-[3px] px-4 py-3.5 text-[14.5px] leading-relaxed",
        tone === "error" ? "border-l-red-600 bg-red-50 text-red-900" : "border-l-emerald-600 bg-emerald-50 text-emerald-950",
      )}
    >
      <Icon className={cn("mt-0.5 h-[18px] w-[18px] shrink-0", tone === "error" ? "text-red-600" : "text-emerald-600")} aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}

/** The "New here? Create an account" line under a form. */
export function AuthSwitch({ prompt, href, label }: { prompt: string; href: string; label: string }) {
  return (
    <p>
      {prompt}{" "}
      <Link
        href={href}
        className="rounded-sm font-semibold text-[#16181d] underline decoration-[#16181d]/25 underline-offset-4 transition-colors duration-300 hover:decoration-[#16181d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c7bd9]/50"
      >
        {label}
      </Link>
    </p>
  );
}

/** Suspense fallback for the pages that read search params. */
export function AuthLoading({ label }: { label: string }) {
  return (
    <div role="status" className="flex min-h-[calc(100svh-64px)] items-center justify-center bg-[#fcfcfa] lg:min-h-[calc(100svh-76px)]">
      <Loader2 className="h-6 w-6 animate-spin text-[#16181d]/40" aria-hidden="true" />
      <span className="sr-only">{label}…</span>
    </div>
  );
}
