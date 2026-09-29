/**
 * Battle Royale — page sections shared by the public pages. Server-safe.
 */
import Link from "next/link";
import { Crest } from "./ui";
import { BR_BASE } from "@/lib/battle-royale/constants";

/** A small illustration of each round, drawn with the round's real controls. */
export function RoundVisual({ round }: { round: 1 | 2 | 3 }) {
  if (round === 1) {
    // A miniature of the v2 station: a letter grid with one word found and
    // the list of words to find (the v1 letter-blocks game is gone).
    const grid = ["KDOSEQM", "ASPIRIN", "VULCBZH", "TABLETR", "GYWENOX"];
    const words: [string, boolean][] = [["ASPIRIN", true], ["DOSE", false], ["TABLET", false]];
    return (
      <div aria-hidden="true">
        <div className="grid w-fit grid-cols-7 gap-y-1 font-mono text-[13px] font-bold">
          {grid.map((row, r) =>
            row.split("").map((c, i) => {
              const found = r === 1;
              return (
                <span
                  key={`${r}-${i}`}
                  className={
                    found
                      ? `flex h-7 w-7 items-center justify-center bg-[#1C7BD9] text-white ${i === 0 ? "rounded-l-full" : ""} ${i === 6 ? "rounded-r-full" : ""}`
                      : "flex h-7 w-7 items-center justify-center text-[#16181d]/75"
                  }
                >
                  {c}
                </span>
              );
            }),
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] font-semibold">
          {words.map(([w, done]) => (
            <span
              key={w}
              className={
                done
                  ? "rounded-full bg-[#21B67A]/15 px-2 py-0.5 text-[#0f7a50] line-through"
                  : "rounded-full border border-[#16181d]/15 bg-white px-2 py-0.5 text-[#16181d]/70"
              }
            >
              {w}
            </span>
          ))}
        </div>
      </div>
    );
  }
  if (round === 2) {
    const rows = [
      ["Metformin", "Biguanide", "bg-[#1C7BD9]"],
      ["Atenolol", "Beta-blocker", "bg-[#21B67A]"],
      ["Omeprazole", "?", ""],
    ];
    return (
      <div className="space-y-1.5 text-[13px] font-medium" aria-hidden="true">
        {rows.map(([l, r, c]) => (
          <div key={l} className="grid grid-cols-[1fr_1.2rem_1fr] items-center gap-2">
            <span className="rounded-lg border border-[#16181d]/15 bg-white px-2.5 py-1.5">{l}</span>
            <span className={`h-1 rounded-full ${c || "bg-[#16181d]/15"}`} />
            <span className="rounded-lg border border-[#16181d]/15 bg-white px-2.5 py-1.5 text-[#16181d]/70">{r}</span>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-1.5 text-[13px] font-medium" aria-hidden="true">
      {["A  Naloxone", "B  Flumazenil", "C  N-acetylcysteine", "D  Atropine"].map((o, i) => (
        <span
          key={o}
          className={
            i === 2
              ? "rounded-lg bg-[#21B67A] px-2.5 py-2 text-white"
              : "rounded-lg border border-[#16181d]/15 bg-white px-2.5 py-2"
          }
        >
          {o}
        </span>
      ))}
    </div>
  );
}

/** The event's own sign-off, above the site footer. */
export function EventFooter() {
  return (
    <div className="br-no-print border-t border-[#16181d]/10 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Crest size={40} />
          <div>
            <p className="font-bold">PharmaWallah</p>
            <p className="text-sm text-[#16181d]/60">Your Digital Pharmacy Learning Platform</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-[#16181d]/65">
          <Link href={`${BR_BASE}/instructions`} className="hover:text-[#16181d]">Rules</Link>
          <Link href={`${BR_BASE}/leaderboard`} className="hover:text-[#16181d]">Leaderboard</Link>
          <Link href="/contact" className="hover:text-[#16181d]">Contact</Link>
          <a href="https://www.pharmawallah.com" className="hover:text-[#16181d]">PharmaWallah.com</a>
        </div>
      </div>
    </div>
  );
}
