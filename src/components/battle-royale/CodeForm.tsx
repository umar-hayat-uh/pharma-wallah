"use client";

import { useState } from "react";
import { KeyRound } from "lucide-react";
import { Spinner, inputClass } from "./ui";
import { gameCodeSchema } from "@/lib/battle-royale/schemas";
import { cn } from "@/lib/utils";

/** The arena's only input: the six-character code from the desk. */
export function CodeForm({ onSubmit, busy }: { onSubmit: (code: string) => void; busy: boolean }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = gameCodeSchema.safeParse(code);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Enter the 6-character code.");
      return;
    }
    setError(null);
    onSubmit(parsed.data);
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <label htmlFor="br-code" className="block text-sm font-semibold text-white">Game Code</label>
      <input
        id="br-code"
        autoFocus
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        maxLength={6}
        inputMode="text"
        placeholder="••••••"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
        aria-invalid={error ? true : undefined}
        aria-describedby="br-code-help"
        className={cn(inputClass, "h-16 text-center font-mono text-3xl font-bold uppercase tracking-[0.5em]")}
      />
      <p id="br-code-help" className={cn("text-sm", error ? "font-medium text-red-100" : "text-white/80")} role={error ? "alert" : undefined}>
        {error ?? "The 6-character code on your slip from the desk. It works once."}
      </p>
      <button
        type="submit"
        disabled={busy || code.length !== 6}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white text-[15px] font-bold text-[#0f4f8f] transition-transform active:scale-[0.98] disabled:opacity-60"
      >
        {busy ? <Spinner /> : <KeyRound className="h-4 w-4" />}
        {busy ? "Verifying…" : "Enter the arena"}
      </button>
    </form>
  );
}
