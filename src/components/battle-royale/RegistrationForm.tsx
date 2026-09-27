"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Info } from "lucide-react";
import { BRAND_BUTTON } from "@/components/page-kit";
import { Field, Notice, Spinner, inputClass, primaryButtonClass, selectClass } from "./ui";
import { BR_BASE, PHARM_YEARS } from "@/lib/battle-royale/constants";
import { registrationSchema, type RegistrationInput } from "@/lib/battle-royale/schemas";
import type { z } from "zod";
import { formatSlot } from "@/lib/battle-royale/format";
import type { PublicSession, RegistrationReceipt } from "@/lib/battle-royale/types";

export const RECEIPT_KEY = "br:receipt";

type Phase = "idle" | "registering" | "emailing";

/**
 * The public form. Validated in the browser with the same Zod schema the
 * route uses, so the messages match — but the route validates again, and
 * the Player ID / Game Code come back from Postgres, never from here.
 */
export function RegistrationForm({ sessions, entryFee }: { sessions: PublicSession[]; entryFee: number }) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistrationInput, unknown, z.output<typeof registrationSchema>>({
    resolver: zodResolver(registrationSchema),
    mode: "onTouched",
    defaultValues: { name: "", email: "", phone: "", university: "", studentId: "", slotId: "", website: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    setPhase("registering");
    // The request does both steps; after a beat, say which one it's on.
    const emailTimer = window.setTimeout(() => setPhase("emailing"), 1200);
    try {
      const res = await fetch("/api/battle-royale/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const body = (await res.json().catch(() => ({}))) as { receipt?: RegistrationReceipt; error?: string };
      if (!res.ok || !body.receipt) {
        setServerError(body.error ?? "Something went wrong. Please try again.");
        setPhase("idle");
        return;
      }
      try {
        sessionStorage.setItem(RECEIPT_KEY, JSON.stringify(body.receipt));
      } catch {
        /* private mode: the success page falls back to "check your email" */
      }
      router.push(`${BR_BASE}/success`);
    } catch {
      setServerError("Couldn't reach the server. Check your connection and try again.");
      setPhase("idle");
    } finally {
      window.clearTimeout(emailTimer);
    }
  });

  const busy = phase !== "idle";
  const bookable = sessions.filter((s) => s.seatsLeft > 0);

  const aria = (name: keyof RegistrationInput) => ({
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `br-${name}-error` : undefined,
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      {serverError && <Notice tone="red" title="Registration didn't go through">{serverError}</Notice>}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="br-name" label="Full name" error={errors.name?.message} className="sm:col-span-2">
          <input id="br-name" autoComplete="name" className={inputClass} {...aria("name")} {...register("name")} />
        </Field>
        <Field id="br-email" label="Email" error={errors.email?.message} hint="Your Player ID and Game Code are sent here.">
          <input id="br-email" type="email" inputMode="email" autoComplete="email" className={inputClass} {...aria("email")} {...register("email")} />
        </Field>
        <Field id="br-phone" label="Phone number" error={errors.phone?.message}>
          <input id="br-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="03XX-XXXXXXX" className={inputClass} {...aria("phone")} {...register("phone")} />
        </Field>
        <Field id="br-university" label="University / institution" error={errors.university?.message} className="sm:col-span-2">
          <input id="br-university" autoComplete="organization" className={inputClass} {...aria("university")} {...register("university")} />
        </Field>
        <Field id="br-pharmYear" label="Pharm-D year" error={errors.pharmYear?.message}>
          <select id="br-pharmYear" className={selectClass} defaultValue="" {...aria("pharmYear")} {...register("pharmYear")}>
            <option value="" disabled>Choose…</option>
            {PHARM_YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </Field>
        <Field id="br-studentId" label="Student ID" optional error={errors.studentId?.message}>
          <input id="br-studentId" className={inputClass} {...aria("studentId")} {...register("studentId")} />
        </Field>
        {sessions.length > 0 && (
          <Field
            id="br-slotId"
            label="Battle slot"
            optional
            error={errors.slotId?.message}
            hint="Leave as walk-in to play at any open station."
            className="sm:col-span-2"
          >
            <select id="br-slotId" className={selectClass} {...register("slotId")}>
              <option value="">Walk-in — any open station</option>
              {bookable.map((s) => (
                <option key={s.id} value={s.id}>
                  {formatSlot(s)} — {s.seatsLeft} {s.seatsLeft === 1 ? "seat" : "seats"} left
                </option>
              ))}
            </select>
          </Field>
        )}
        {/* Honeypot, hidden from people and assistive tech. */}
        <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
          <label htmlFor="br-website">Website</label>
          <input id="br-website" tabIndex={-1} autoComplete="off" {...register("website")} />
        </div>
      </div>

      <Notice tone="blue" icon={<Info />}>
        Registering is free. The <strong>Rs. {entryFee}</strong> entry fee is paid at the PharmaWallah desk, where
        you&apos;ll be checked in. One official attempt per participant.
      </Notice>

      <button type="submit" disabled={busy} className={`${primaryButtonClass} w-full sm:w-auto`} style={{ background: BRAND_BUTTON }}>
        {busy ? <Spinner /> : null}
        {phase === "registering" ? "Registering…" : phase === "emailing" ? "Sending confirmation…" : "Register"}
        {!busy && <ArrowRight className="h-4 w-4" />}
      </button>
    </form>
  );
}
