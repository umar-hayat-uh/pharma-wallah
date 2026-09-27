import Link from "next/link";
import { Lock } from "lucide-react";
import { Crest, primaryButtonClass, secondaryButtonClass } from "../ui";
import { BRAND_BUTTON } from "@/components/page-kit";
import { BR_BASE } from "@/lib/battle-royale/constants";

/** Shown instead of the admin when the visitor isn't signed in, or isn't in `br_admins`. */
export function AdminGate({ status }: { status: 401 | 403 | "role" }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#f4f6f9] px-5">
      <div className="w-full max-w-md rounded-3xl border border-[#16181d]/10 bg-white p-8 text-center">
        <Crest size={56} className="mx-auto" />
        <h1 className="mt-5 flex items-center justify-center gap-2 text-2xl font-bold">
          <Lock className="h-5 w-5" /> Battle Royale admin
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-[#16181d]/65">
          {status === 401
            ? "Sign in with your PharmaWallah account to continue."
            : status === "role"
              ? "This section needs a full event administrator. Desk accounts can register, take payments and check people in."
              : "Your account isn't an event administrator. Ask the event owner to add you."}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {status === 401 && (
            <Link href="/signin" className={primaryButtonClass} style={{ background: BRAND_BUTTON }}>
              Sign in
            </Link>
          )}
          <Link href={status === "role" ? `${BR_BASE}/admin` : BR_BASE} className={secondaryButtonClass}>
            {status === "role" ? "Back to overview" : "Event page"}
          </Link>
        </div>
      </div>
    </div>
  );
}
