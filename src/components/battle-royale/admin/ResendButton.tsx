"use client";

import { RotateCw } from "lucide-react";
import { adminFetch, useMutation } from "./client";

export function ResendButton({ logId, failed }: { logId: string; failed: boolean }) {
  const { run, pending, error, message } = useMutation();
  return (
    <div className="inline-flex flex-col items-end">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          void run(
            () => adminFetch<{ status: string; reason?: string }>("/api/battle-royale/admin/emails", "POST", { action: "resend_log", logId }),
            (r) => (r.status === "sent" ? "Sent" : `Not sent: ${r.reason ?? r.status}`),
          )
        }
        className={failed ? "inline-flex h-8 items-center gap-1 rounded-lg bg-[#1C7BD9] px-3 text-xs font-semibold text-white disabled:opacity-50" : "inline-flex h-8 items-center gap-1 rounded-lg px-3 text-xs font-semibold text-[#16181d]/60 hover:text-[#16181d] disabled:opacity-50"}
      >
        <RotateCw className="h-3.5 w-3.5" /> {pending ? "Sending…" : "Resend"}
      </button>
      {(message || error) && <span className={error ? "text-xs text-red-600" : "text-xs text-[#0f7a50]"}>{error ?? message}</span>}
    </div>
  );
}
