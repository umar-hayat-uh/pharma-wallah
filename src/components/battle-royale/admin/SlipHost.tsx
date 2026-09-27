"use client";

import { useEffect, useState } from "react";
import { CodeSlip } from "./CodeSlip";

/*
 * The Game Code slip lives here, in the admin shell, and in sessionStorage —
 * not in the row or drawer that issued the code. Issuing a code refreshes the
 * page's data, and that refresh can remount the whole page (the event's
 * loading.tsx boundary sits above it), which silently threw away a slip held
 * in component state before the desk could read the code. A remount now
 * re-reads the slip and shows it again.
 */
type Slip = { name: string; playerId: string; code: string; reissued?: boolean };
const KEY = "br:slip";
const EVENT = "br-slip";

export function showSlip(slip: Slip) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(slip));
  } catch {
    /* storage blocked: the event below still opens it */
  }
  window.dispatchEvent(new CustomEvent<Slip>(EVENT, { detail: slip }));
}

export function SlipHost() {
  const [slip, setSlip] = useState<Slip | null>(null);
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(KEY);
      if (raw) setSlip(JSON.parse(raw) as Slip);
    } catch {
      /* nothing saved */
    }
    const on = (e: Event) => setSlip((e as CustomEvent<Slip>).detail);
    window.addEventListener(EVENT, on);
    return () => window.removeEventListener(EVENT, on);
  }, []);
  if (!slip) return null;
  return (
    <CodeSlip
      open
      name={slip.name}
      playerId={slip.playerId}
      code={slip.code}
      reissued={slip.reissued}
      onClose={() => {
        try {
          sessionStorage.removeItem(KEY);
        } catch {
          /* ignore */
        }
        setSlip(null);
      }}
    />
  );
}
