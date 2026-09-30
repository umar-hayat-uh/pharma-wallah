"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { ChevronRight, CircleAlert, Search, X } from "lucide-react";
import { Notice, Spinner, inputClass, secondaryButtonClass } from "./ui";
import { ResultView } from "./ResultView";
import { BR_BASE } from "@/lib/battle-royale/constants";
import { certificateQuery } from "@/lib/battle-royale/format";
import type { CertificateMatch, ResultPayload } from "@/lib/battle-royale/types";
import { cn } from "@/lib/utils";

const API = "/api/battle-royale/certificates";
const DEBOUNCE_MS = 250;

type Finished = ResultPayload & { score: NonNullable<ResultPayload["score"]> };

/**
 * "Find your certificate": type part of your name, pick yourself from the
 * dropdown, and the result and certificate open. No Player ID, no email —
 * players forget both. Only finished players are listed (the route decides).
 */
export function CertificateSearch() {
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [matches, setMatches] = useState<CertificateMatch[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [picked, setPicked] = useState<CertificateMatch | null>(null);
  const [result, setResult] = useState<Finished | null>(null);
  const [loadingResult, setLoadingResult] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced search. Each effect run aborts the previous request, so a slow
  // answer for "um" can never overwrite the answer for "umar".
  useEffect(() => {
    if (picked) return;
    if (!certificateQuery(q)) {
      setMatches(null);
      setSearching(false);
      return;
    }
    const ctl = new AbortController();
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`${API}?q=${encodeURIComponent(q)}`, { signal: ctl.signal });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(body.error ?? "Search failed. Please try again.");
          setMatches([]);
        } else {
          setError(null);
          setMatches(body.matches ?? []);
          setActive(0);
        }
      } catch (e) {
        if ((e as Error).name !== "AbortError") setError("Couldn't reach the server. Check your connection and try again.");
      } finally {
        if (!ctl.signal.aborted) setSearching(false);
      }
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(t);
      ctl.abort();
    };
  }, [q, picked]);

  const choose = async (m: CertificateMatch) => {
    setPicked(m);
    setOpen(false);
    setQ(m.name);
    setError(null);
    setLoadingResult(true);
    try {
      const res = await fetch(`${API}?code=${encodeURIComponent(m.code)}`);
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.score) setError(body.error ?? "Couldn't load this certificate. Please try again.");
      else setResult(body as Finished);
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setLoadingResult(false);
    }
  };

  const reset = () => {
    setPicked(null);
    setResult(null);
    setMatches(null);
    setError(null);
    setQ("");
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!matches?.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => (i + 1) % matches.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => (i - 1 + matches.length) % matches.length);
    } else if (e.key === "Enter" && open) {
      e.preventDefault();
      void choose(matches[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  if (picked) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-2xl font-bold">{picked.name}</p>
            <p className="text-sm text-[#16181d]/60">
              {picked.university && <>{picked.university} · </>}
              <span className="font-mono text-[#1C7BD9]">{picked.code}</span>
            </p>
          </div>
          <button type="button" onClick={reset} className={secondaryButtonClass}>
            <Search className="h-4 w-4" /> Search another name
          </button>
        </div>
        {error && <Notice tone="red" icon={<CircleAlert />}>{error}</Notice>}
        {loadingResult && (
          <p className="flex items-center gap-2 text-sm text-[#16181d]/60">
            <Spinner /> Loading the result…
          </p>
        )}
        {result && <ResultView data={result} />}
        <Link href={`${BR_BASE}/leaderboard?code=${encodeURIComponent(picked.code)}`} className={cn(secondaryButtonClass, "inline-flex")}>
          Leaderboard
        </Link>
      </div>
    );
  }

  const showList = open && matches !== null && certificateQuery(q) !== null;

  return (
    <div className="space-y-4 rounded-3xl border border-[#16181d]/10 bg-white p-6 sm:p-8">
      <div>
        <label htmlFor="cert-q" className="text-sm font-semibold">Your name</label>
        <p className="text-sm text-[#16181d]/60">Start typing, then pick your name from the list.</p>
      </div>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#16181d]/40" aria-hidden="true" />
        <input
          ref={inputRef}
          id="cert-q"
          autoFocus
          autoComplete="off"
          spellCheck={false}
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showList && matches?.length ? `${listId}-${active}` : undefined}
          placeholder="e.g. Ayesha Khan"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={onKeyDown}
          className={cn(inputClass, "pl-10 pr-10 text-base")}
        />
        {searching ? (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2"><Spinner /></span>
        ) : q ? (
          <button type="button" aria-label="Clear" onClick={reset} className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-[#16181d]/45 hover:bg-[#16181d]/5">
            <X className="h-4 w-4" />
          </button>
        ) : null}

        {showList && (
          <ul
            id={listId}
            role="listbox"
            className="absolute inset-x-0 top-full z-20 mt-2 max-h-80 overflow-auto rounded-2xl border border-[#16181d]/10 bg-white p-1.5 shadow-lg"
          >
            {matches.length === 0 ? (
              <li className="px-3 py-3 text-sm text-[#16181d]/60">
                {searching ? "Searching…" : "No finished player matches that. Try just your first name."}
              </li>
            ) : (
              matches.map((m, i) => (
                <li
                  key={m.code}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={i === active}
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => void choose(m)}
                  className={cn("flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5", i === active && "bg-[#1C7BD9]/[0.08]")}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{m.name}</span>
                    <span className="block truncate text-xs text-[#16181d]/55">
                      {m.university && <>{m.university} · </>}
                      <span className="font-mono">{m.code}</span>
                    </span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-[#16181d]/35" aria-hidden="true" />
                </li>
              ))
            )}
          </ul>
        )}
      </div>
      {error && <Notice tone="red" icon={<CircleAlert />}>{error}</Notice>}
      <p className="text-xs text-[#16181d]/55">Only players who have finished their battle are listed.</p>
    </div>
  );
}
