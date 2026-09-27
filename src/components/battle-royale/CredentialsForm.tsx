"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { KeyRound } from "lucide-react";
import { BRAND_BUTTON } from "@/components/page-kit";
import { Field, Spinner, inputClass, primaryButtonClass } from "./ui";
import { credentialsSchema, type CredentialsInput } from "@/lib/battle-royale/schemas";
import { cn } from "@/lib/utils";

export type Credentials = z.output<typeof credentialsSchema>;

/**
 * Player ID (or email) + Game Code. Used by check-in, results and the arena
 * gate. `tone="inverse"` is the arena's version on the brand surface.
 */
export function CredentialsForm({
  onSubmit,
  busy,
  busyLabel,
  submitLabel,
  tone = "default",
  autoFocus,
  defaultIdentifier = "",
}: {
  onSubmit: (c: Credentials) => void | Promise<void>;
  busy: boolean;
  busyLabel: string;
  submitLabel: string;
  tone?: "default" | "inverse";
  autoFocus?: boolean;
  /** Keeps the Player ID across a failed attempt, so only the code needs retyping. */
  defaultIdentifier?: string;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CredentialsInput, unknown, Credentials>({
    resolver: zodResolver(credentialsSchema),
    mode: "onTouched",
    defaultValues: { identifier: defaultIdentifier, gameCode: "" },
  });
  const inverse = tone === "inverse";

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div className={cn(inverse && "[&_label]:text-white [&_[role=alert]]:text-red-100 [&_p]:text-white/80")}>
        <Field id="br-identifier" label="Player ID or email" error={errors.identifier?.message}>
          <input
            id="br-identifier"
            autoFocus={autoFocus}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            placeholder="BR-2026-0001"
            aria-invalid={errors.identifier ? true : undefined}
            className={cn(inputClass, "font-mono tracking-wide")}
            {...register("identifier")}
          />
        </Field>
      </div>
      <div className={cn(inverse && "[&_label]:text-white [&_[role=alert]]:text-red-100 [&_p]:text-white/80")}>
        <Field id="br-gamecode" label="Game Code" error={errors.gameCode?.message} hint="6 characters, from your confirmation.">
          <input
            id="br-gamecode"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            maxLength={6}
            placeholder="••••••"
            aria-invalid={errors.gameCode ? true : undefined}
            className={cn(inputClass, "font-mono text-lg uppercase tracking-[0.35em]")}
            {...register("gameCode")}
          />
        </Field>
      </div>
      <button
        type="submit"
        disabled={busy}
        className={cn(primaryButtonClass, "w-full", inverse && "!bg-white !text-[#0f4f8f]")}
        style={inverse ? undefined : { background: BRAND_BUTTON }}
      >
        {busy ? <Spinner /> : <KeyRound className="h-4 w-4" />}
        {busy ? busyLabel : submitLabel}
      </button>
    </form>
  );
}
