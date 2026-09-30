"use client";

import { Award, Hourglass, Medal, Trophy } from "lucide-react";
import { BRAND_SURFACE } from "@/components/page-kit";
import { Notice } from "./ui";
import { Certificate } from "./certificate/Certificate";
import { ROUNDS } from "@/lib/battle-royale/constants";
import { formatDuration, ordinal } from "@/lib/battle-royale/format";
import type { ResultPayload } from "@/lib/battle-royale/types";
import { cn } from "@/lib/utils";

/**
 * A finished player's score, titles and e-certificate. Shared by both ways of
 * finding it: the name search and the Player ID + email lookup.
 */
export function ResultView({ data }: { data: ResultPayload & { score: NonNullable<ResultPayload["score"]> } }) {
  return (
    <>
      <div className="relative overflow-hidden rounded-3xl p-6 text-white sm:p-8" style={{ background: BRAND_SURFACE }}>
        <div className="br-sheen" aria-hidden="true" />
        <div className="relative">
          {data.titles[0] && (
            <p className="inline-flex items-center gap-2 rounded-full bg-[#f5b301] px-3.5 py-1.5 text-sm font-extrabold uppercase tracking-wide text-[#3b2a00]">
              <Award className="h-4 w-4" /> {data.titles[0].name}
            </p>
          )}
          <div className="mt-5 flex flex-wrap items-end gap-x-10 gap-y-4">
            <div>
              <p className="text-sm text-white/80">Total score</p>
              <p className="text-6xl font-extrabold tracking-tight">{data.score.total}</p>
            </div>
            {data.rank && (
              <div>
                <p className="text-sm text-white/80">{data.finalized ? "Final rank" : "Rank right now"}</p>
                <p className="text-4xl font-bold">{ordinal(data.rank)}</p>
              </div>
            )}
          </div>
          <div className="mt-6 grid grid-cols-3 gap-2">
            {ROUNDS.map((r, i) => (
              <div key={r.no} className="rounded-2xl border border-white/25 bg-white/10 p-3">
                <p className="text-xs text-white/75">{r.name}</p>
                <p className="text-2xl font-bold">{data.score!.rounds[i]}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-white/85">
            {data.score.correct} of {data.score.questions} correct · {formatDuration(data.score.timeMs)} battle time
          </p>
        </div>
      </div>

      {data.titles.length > 0 && (
        <section aria-labelledby="st-titles">
          <h2 id="st-titles" className="text-lg font-bold">Titles you earned</h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {data.titles.map((t, i) => (
              <li key={t.id} className={cn("flex gap-3 rounded-2xl border p-4", i === 0 ? "border-[#f5b301]/60 bg-[#f5b301]/[0.08]" : "border-[#16181d]/10 bg-white")}>
                <Medal className={cn("mt-0.5 h-5 w-5 shrink-0", i === 0 ? "text-[#b98500]" : "text-[#1C7BD9]")} />
                <div>
                  <p className="font-bold">{t.name}</p>
                  <p className="text-sm text-[#16181d]/65">{t.reason}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!data.finalized ? (
        <Notice tone="blue" icon={<Hourglass />} title="Results aren't final yet.">
          {data.closed ? "The tournament has closed and the results are being verified." : "Your score won't change, but your rank can while others play."} The Top {data.winnersCount} receive a gold
          Certificate of Achievement once results are final — come back here then.
        </Notice>
      ) : data.score.finalStatus === "winner" ? (
        <Notice tone="green" icon={<Trophy />} title={`You're in the Top ${data.winnersCount}!`}>
          Collect your PharmaWallah Goodie Hamper at the stall.
        </Notice>
      ) : null}

      {data.certificate && (
        <section aria-labelledby="st-cert">
          <h2 id="st-cert" className="text-lg font-bold">
            Your e-certificate
            <span className="ml-2 align-middle text-sm font-medium text-[#16181d]/55">
              {data.certificate.kind === "winner" ? "Certificate of Achievement" : "Certificate of Participation"}
            </span>
          </h2>
          <div className="mt-3">
            <Certificate data={data.certificate} />
          </div>
        </section>
      )}
    </>
  );
}
