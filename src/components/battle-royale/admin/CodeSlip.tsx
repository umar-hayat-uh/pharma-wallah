"use client";

import { Printer } from "lucide-react";
import { Dialog } from "./Dialog";

/**
 * The Game Code, as the desk hands it over. Printed on its own (the print
 * stylesheet shows only `.br-print-card`), so it can be torn off and given to
 * the player. This is the only place the code is ever displayed in full.
 */
export function CodeSlip({
  open,
  onClose,
  name,
  playerId,
  code,
  reissued,
}: {
  open: boolean;
  onClose: () => void;
  name: string;
  playerId: string;
  code: string;
  reissued?: boolean;
}) {
  return (
    <Dialog open={open} onClose={onClose} title={reissued ? "New Game Code issued" : "Payment approved — Game Code"}>
      <div className="br-print-card rounded-2xl border-2 border-dashed border-[#1C7BD9]/40 p-6 text-center">
        <p className="text-sm font-semibold text-[#16181d]/60">PharmaWallah · Battle Royale</p>
        <p className="mt-1 text-lg font-bold">{name}</p>
        <p className="font-mono text-sm text-[#16181d]/60">{playerId}</p>
        <p className="mt-5 font-mono text-[10.5px] uppercase tracking-[0.2em] text-[#16181d]/55">Game Code</p>
        <p className="mt-1 font-mono text-5xl font-extrabold tracking-[0.25em] text-[#1C7BD9]">{code}</p>
        <p className="mt-4 text-sm text-[#16181d]/70">Type this code at any free gaming station. It works once.</p>
      </div>
      {reissued && (
        <p className="mt-3 text-sm text-amber-800">The previous code no longer works. The player continues the same battle from where it stopped.</p>
      )}
      <div className="mt-5 flex justify-end gap-2">
        <button type="button" onClick={() => window.print()} className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#16181d]/15 px-4 font-semibold">
          <Printer className="h-4 w-4" /> Print slip
        </button>
        <button type="button" onClick={onClose} className="h-11 rounded-xl bg-[#1C7BD9] px-5 font-semibold text-white">Done</button>
      </div>
    </Dialog>
  );
}
