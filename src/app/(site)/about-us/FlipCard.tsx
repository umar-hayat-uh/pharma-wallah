"use client";

import { useState } from "react";
import { RotateCw } from "lucide-react";
import { BRAND_SURFACE } from "@/components/page-kit";
import type { TeamMember } from "@/lib/team";
import { Plate } from "./_Plate";

/**
 * A team card that turns over: the person on the front, what their role does
 * on the back.
 *
 * How it turns:
 *  - mouse: on hover, but only where the device can hover — `hover:` alone
 *    would leave touch screens stuck on the back after a tap (Tailwind v3 does
 *    not gate it). The hover is read from the card's OUTER box, which never
 *    rotates, so the hit area cannot flicker mid-turn.
 *  - keyboard: while the flip button has visible focus (`:focus-visible`, so a
 *    mouse click on it does not leave the card stuck open).
 *  - touch: a tap anywhere toggles `data-flipped`. A mouse click on the body
 *    does not, or the card would stay turned after the pointer leaves.
 *
 * Both faces are always in the DOM, so a screen reader reads the description
 * without flipping anything, and the CSS hover still works before hydration.
 * Only transform animates (GPU), on the site's expo curve; reduced motion turns
 * instantly. Faces are absolutely positioned, so the card has a fixed height.
 */
export default function FlipCard({ member, code }: { member: TeamMember; code: string }) {
    const [flipped, setFlipped] = useState(false);

    return (
        <article
            id={member.id}
            data-flipped={flipped}
            onClick={() => {
                if (!window.matchMedia("(hover: hover)").matches) setFlipped((f) => !f);
            }}
            className="group relative h-[16rem] scroll-mt-24 cursor-pointer [perspective:1200px]"
        >
            <div
                className={
                    "relative h-full w-full transition-transform duration-700 ease-out-expo [transform-style:preserve-3d] motion-reduce:transition-none " +
                    "group-has-[:focus-visible]:[transform:rotateY(180deg)] group-data-[flipped=true]:[transform:rotateY(180deg)] " +
                    "[@media(hover:hover)]:group-hover:[transform:rotateY(180deg)]"
                }
            >
                {/* Front */}
                <div className="absolute inset-0 flex flex-col rounded-2xl border border-[#16181d]/10 bg-white p-6 shadow-[0_1px_0_rgba(22,24,29,.04)] [backface-visibility:hidden] dark:border-white/10 dark:bg-[#15171b]">
                    <div className="flex items-start justify-between gap-3">
                        <Plate member={member} size={72} className="transition-transform duration-700 ease-out-expo group-hover:-rotate-3 group-hover:scale-105" />
                        <span className="font-mono text-[11px] tracking-[0.12em] text-[#16181d]/40 tabular-nums dark:text-[#f7f5f1]/40">
                            {code}
                        </span>
                    </div>
                    <h4 className="mt-auto text-xl font-semibold leading-tight tracking-[-0.015em]">{member.name}</h4>
                    <p className="mt-1 text-[13.5px] font-medium leading-snug text-[#1567b8] dark:text-[#6fb2f2]">
                        {member.role}
                    </p>
                    <div className="mt-4 flex items-center justify-between border-t border-[#16181d]/10 pt-3 dark:border-white/10">
                        <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#16181d]/45 dark:text-[#f7f5f1]/45">
                            <span className="[@media(hover:hover)]:hidden">Tap</span>
                            <span className="hidden [@media(hover:hover)]:inline">Hover</span> to see the role
                        </span>
                        <button
                            type="button"
                            aria-pressed={flipped}
                            aria-label={`Turn ${member.name}'s card`}
                            // The article's onClick already toggles; stop the
                            // button from toggling twice.
                            onClick={(e) => {
                                e.stopPropagation();
                                setFlipped((f) => !f);
                            }}
                            className="grid h-8 w-8 place-items-center rounded-full text-[#16181d]/45 transition-[transform,color] duration-500 ease-out-expo hover:text-[#1c7bd9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c7bd9]/60 group-hover:rotate-180 dark:text-[#f7f5f1]/45"
                        >
                            <RotateCw className="h-4 w-4" aria-hidden="true" />
                        </button>
                    </div>
                </div>

                {/* Back */}
                <div
                    style={{ background: BRAND_SURFACE }}
                    className="absolute inset-0 flex flex-col rounded-2xl p-6 text-white [backface-visibility:hidden] [transform:rotateY(180deg)]"
                >
                    <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-white/90">{member.role}</p>
                    <p className="mt-4 text-[15.5px] leading-relaxed text-white [text-wrap:pretty]">{member.description}</p>
                    <div className="mt-auto flex items-center gap-3 border-t border-white/25 pt-3">
                        <Plate member={member} size={32} className="rounded-lg ring-1 ring-white/40" />
                        <span className="text-[14px] font-semibold">{member.name}</span>
                    </div>
                </div>
            </div>
        </article>
    );
}
