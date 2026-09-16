"use client";

import { useEffect, useRef, useState } from "react";
import { TEAM, TEAM_SECTIONS, type TeamGroupId, type TeamMember } from "@/lib/team";

type Filter = TeamGroupId | "all";

/**
 * The register — the team set as a typeset list rather than a grid of avatar
 * cards, in the same index language as the calculator hub.
 *
 * A client island for two things, and only two: the group filter and the
 * pointer spotlight. The rows' scroll entrance belongs to the page's GSAP
 * choreography (_useAboutMotion.ts), which owns every scroll-driven effect on
 * this page. Everything renders on the server with the filter on "All", so a
 * crawler and a visitor with no JavaScript see all of the team and every group
 * heading — the fault that made the old calculator hub show nothing before
 * hydration (MEMORY.md gotcha 65).
 *
 * Rows are deliberately NOT links. There are no per-member pages and no
 * verified profiles to link to; the old page faked it with 48 social buttons
 * that did nothing and had no accessible name. The hover treatment is therefore
 * a reading highlight — a wash that wipes in, a rule that draws — rather than a
 * click affordance.
 */
export default function TeamRegister() {
    const [filter, setFilter] = useState<Filter>("all");
    const registerRef = useRef<HTMLDivElement>(null);
    const spotRef = useRef<HTMLDivElement>(null);

    /**
     * The spotlight: a soft brand-coloured light that follows the pointer across
     * the register, so a long list of names has some atmosphere instead of
     * reading as a spreadsheet.
     *
     * A fixed-size element moved with `transform` — not a radial-gradient
     * background repainted on the container, which would repaint a 2,000px-tall
     * box on every pointer move. One rAF per frame at most, only on a device
     * with a real pointer, and never under reduced motion.
     */
    useEffect(() => {
        const host = registerRef.current;
        const spot = spotRef.current;
        if (!host || !spot) return;
        if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        let frame = 0;
        let x = 0;
        let y = 0;

        const paint = () => {
            frame = 0;
            spot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        };
        const onMove = (event: PointerEvent) => {
            const box = host.getBoundingClientRect();
            x = event.clientX - box.left;
            y = event.clientY - box.top;
            // Lit on the first move rather than on pointerenter: a pointer that
            // arrives already inside the element (after a scroll, or a
            // synthetic event) never fires enter, and the light stayed off.
            host.setAttribute("data-lit", "true");
            if (!frame) frame = requestAnimationFrame(paint);
        };
        const onLeave = () => host.removeAttribute("data-lit");

        host.addEventListener("pointermove", onMove);
        host.addEventListener("pointerleave", onLeave);
        return () => {
            if (frame) cancelAnimationFrame(frame);
            host.removeEventListener("pointermove", onMove);
            host.removeEventListener("pointerleave", onLeave);
        };
    }, []);

        function choose(next: Filter) {
        setFilter(next);
    }

    const sections = filter === "all" ? TEAM_SECTIONS : TEAM_SECTIONS.filter((s) => s.id === filter);
    const shown = sections.reduce((n, s) => n + s.members.length, 0);

    // One continuous run of index codes down the visible register, so the
    // numbering always reads 01…n for what is actually on screen.
    let counter = 0;

    return (
        <div>
            <div className="pw-about-filter" role="group" aria-label="Filter the team by what they do">
                <FilterChip label="Everyone" count={TEAM.length} active={filter === "all"} onSelect={() => choose("all")} />
                {TEAM_SECTIONS.map((section) => (
                    <FilterChip
                        key={section.id}
                        label={section.label}
                        count={section.members.length}
                        active={filter === section.id}
                        onSelect={() => choose(section.id)}
                    />
                ))}
            </div>

            <p className="sr-only" role="status" aria-live="polite">
                Showing {shown} of {TEAM.length} team members.
            </p>

            <div ref={registerRef} className="pw-about-register">
                <div ref={spotRef} className="pw-about-spot" aria-hidden="true" />

                {sections.map((section) => (
                    <section key={section.id} aria-labelledby={`team-${section.id}`}>
                        <header className="pw-about-group">
                            <div className="pw-about-group__title">
                                <span className="pw-about-group__mark" aria-hidden="true" />
                                <h3 id={`team-${section.id}`}>{section.label}</h3>
                            </div>
                            <p className="pw-about-group__blurb">{section.blurb}</p>
                            <span className="pw-about-group__count">
                                {String(section.members.length).padStart(2, "0")}{" "}
                                {section.members.length === 1 ? "person" : "people"}
                            </span>
                        </header>

                        <ol className="pw-about-list">
                            {section.members.map((member) => {
                                const index = ++counter;
                                return <PersonRow key={member.id} member={member} index={index} />;
                            })}
                        </ol>
                    </section>
                ))}

                {shown === 0 && <p className="pw-about-empty">No one is filed under that yet.</p>}
            </div>
        </div>
    );
}

function FilterChip({
    label,
    count,
    active,
    onSelect,
}: {
    label: string;
    count: number;
    active: boolean;
    onSelect: () => void;
}) {
    return (
        <button type="button" className="pw-about-chip" aria-pressed={active} onClick={onSelect}>
            {label}
            <span className="pw-about-chip__count">{count}</span>
        </button>
    );
}

function PersonRow({ member, index }: { member: TeamMember; index: number }) {
    return (
        <li
            // The hero's monogram wall scrolls here. tabIndex -1 makes the row a
            // focus target without putting it in the tab order.
            id={`person-${member.id}`}
            tabIndex={-1}
            className={`pw-about-person${member.group === "leadership" ? " is-lead" : ""}`}
            // `--i` staggers the staged entry; `--plate-angle` is this person's
            // own angle of the brand gradient (src/lib/team.ts).
            style={
                {
                    "--i": index - 1,
                    "--plate-angle": `${member.plateAngle}deg`,
                } as React.CSSProperties
            }
        >
            <span className="pw-about-person__code" aria-hidden="true">
                {String(index).padStart(2, "0")}
            </span>

            <span className="pw-about-plate" aria-hidden="true">
                <span>{member.initials}</span>
            </span>

            <span className="pw-about-person__id">
                <span className="pw-about-person__name">{member.name}</span>
                <span className="pw-about-person__role">{member.role}</span>
            </span>

            {/* The table-of-contents leader between the name and the campus. */}
            <span className="pw-about-person__leader" aria-hidden="true" />

            <span className="pw-about-person__campus">{member.campus}</span>

            {/* The rule that draws under the row on hover. */}
            <span className="pw-about-person__rule" aria-hidden="true" />
        </li>
    );
}
