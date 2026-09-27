"use client";

import { BadgeCheck } from "lucide-react";
import { adminFetch, useMutation } from "./client";
import { showSlip } from "./SlipHost";
import { StatusBadge } from "../ui";

/**
 * The Game Code cell of a participant row, and the desk's one-tap step:
 * payment received → approve → Game Code slip.
 *
 * One component for every state, deliberately: approving refreshes the table,
 * the row's state changes from "none" to "issued", and a separate button
 * component would be unmounted — taking the open slip with it before the desk
 * could read the code. This one stays mounted, so the slip stays open.
 */
export function CodeCell({
  id,
  name,
  playerId,
  state,
}: {
  id: string;
  name: string;
  playerId: string;
  state: "none" | "issued" | "used" | "na";
}) {
  const { run, pending, error } = useMutation();
  return (
    <>
      {state === "used" && <StatusBadge tone="green">Used · playing/played</StatusBadge>}
      {state === "issued" && <StatusBadge tone="blue">Issued · not used</StatusBadge>}
      {state === "na" && <span className="text-xs text-[#16181d]/40">—</span>}
      {state === "none" && (
      <button
        type="button"
        disabled={pending}
        onClick={async () => {
          const r = await run(() => adminFetch<{ code: string }>(`/api/battle-royale/admin/participants/${id}`, "PATCH", { action: "issue_code" }));
          if (r) showSlip({ name, playerId, code: r.code });
        }}
        className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#21B67A] px-3 text-xs font-bold text-white disabled:opacity-60"
      >
        <BadgeCheck className="h-3.5 w-3.5" /> {pending ? "Approving…" : "Approve & issue code"}
      </button>
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </>
  );
}
