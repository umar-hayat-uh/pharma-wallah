"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TEAM, TEAM_GROUPS } from "@/lib/team";

/** How long each member holds the stage before it advances on its own. */
const DWELL_MS = 4200;

const GROUP_LABEL = new Map(TEAM_GROUPS.map((g) => [g.id, g.label]));

/**
 * The roster stage — the page's opening screen, played as a character select.
 *
 * One member holds the stage at a time: their monogram at portrait scale, their
 * name at display size, and their role, campus and group read out beneath it as
 * a HUD. A filmstrip of all {TEAM.length} tiles runs along the bottom; the
 * stage advances by itself, with a timer hairline showing the dwell, until the
 * first time anyone points at it, clicks, or uses the arrow keys — after that
 * it is theirs to drive.
 *
 * Why a select screen and not a grid of cards: this page's subject is who these
 * people are, there are no photographs of them, and a sixteen-up grid gives
 * every one of them a sixth of a second of attention. Here each person gets the
 * whole screen, in turn, and the count is still legible in the strip.
 *
 * Accessibility and no-JS, which the cinema must not cost:
 *  - The stage renders member 01 on the server, and the full ruled register
 *    further down the page lists everyone whether or not this island hydrates.
 *  - The strip is a real list of buttons with roving tabindex; ← → move, Home
 *    and End jump to the ends, and the active tile carries aria-current.
 *  - The stage is an aria-live region, so a change is announced.
 *  - Auto-advance never starts under `prefers-reduced-motion`, and the swap
 *    animation is disabled there too.
 */
export default function RosterStage({ lede }: { lede: React.ReactNode }) {
  const [index, setIndex] = useState(0);
  // Auto-play stops permanently at the first deliberate interaction: a screen
  // that keeps moving under someone who is trying to read it is hostile.
  const [auto, setAuto] = useState(false);
  const stripRef = useRef<HTMLUListElement>(null);
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setAuto(true);
  }, []);

  useEffect(() => {
    if (!auto) return;
    const timer = window.setInterval(
      () => setIndex((i) => (i + 1) % TEAM.length),
      DWELL_MS,
    );
    return () => window.clearInterval(timer);
  }, [auto]);

  /** Keep the active tile inside the strip without ever scrolling the page. */
  useEffect(() => {
    const strip = stripRef.current;
    const tile = buttonsRef.current[index];
    if (!strip || !tile) return;
    const target =
      tile.offsetLeft - strip.clientWidth / 2 + tile.clientWidth / 2;
    strip.scrollTo({
      left: Math.max(0, target),
      behavior: auto ? "auto" : "smooth",
    });
  }, [index, auto]);

  const select = useCallback((next: number) => {
    setAuto(false);
    setIndex((next + TEAM.length) % TEAM.length);
  }, []);

  function onStripKeyDown(event: React.KeyboardEvent<HTMLUListElement>) {
    const moves: Record<string, number> = {
      ArrowRight: 1,
      ArrowDown: 1,
      ArrowLeft: -1,
      ArrowUp: -1,
    };
    let next: number | null = null;
    if (event.key in moves) next = index + moves[event.key];
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = TEAM.length - 1;
    if (next === null) return;
    event.preventDefault();
    const resolved = (next + TEAM.length) % TEAM.length;
    select(resolved);
    buttonsRef.current[resolved]?.focus();
  }

  /**
   * Jump to this member's row in the register below. The motion hook suspends
   * the site's CSS smooth scrolling while it is mounted (gotcha 30a), so the
   * behaviour is asked for explicitly here. The row takes focus so a keyboard
   * user lands where the page just moved, and a one-shot class marks it so a
   * mouse user can see where they were sent.
   */
  function jumpTo(id: string) {
    const row = document.getElementById(`person-${id}`);
    if (!row) return;
    row.scrollIntoView({ block: "center", behavior: "smooth" });
    row.focus({ preventScroll: true });
    row.classList.remove("is-called");
    void row.offsetWidth; // reflow, so a second click replays the mark
    row.classList.add("is-called");
  }

  const member = TEAM[index];

  return (
    <div className="pw-stage__roster" onPointerDown={() => setAuto(false)}>
      <div className="pw-about-shell pw-stage__inner">
        <div className="pw-stage__split">
          {lede}

          <div className="pw-stage__card" aria-live="polite">
            <div className="pw-stage__hud">
              <span className="pw-stage__hud-code">
                Entry {String(index + 1).padStart(2, "0")}
                <span className="pw-stage__hud-of"> / {TEAM.length}</span>
              </span>
              <span className="pw-stage__hud-group">
                {GROUP_LABEL.get(member.group)}
              </span>
            </div>

            <div className="pw-stage__figure">
              {/* `key` remounts each block so its entrance animation
                            replays on every change — the swap is the point of a
                            select screen. */}
              <div className="pw-stage__portrait" key={`p-${member.id}`}>
                <span
                  className="pw-stage__plate"
                  style={
                    {
                      "--plate-angle": `${member.plateAngle}deg`,
                    } as React.CSSProperties
                  }
                  aria-hidden="true"
                >
                  {member.initials}
                </span>
                <span className="pw-stage__glow" aria-hidden="true" />
              </div>

              <div className="pw-stage__id" key={`n-${member.id}`}>
                <h2 className="pw-stage__name">
                  <span className="pw-stage__name-line">
                    {given(member.name)}
                  </span>
                  {family(member.name) && (
                    <span className="pw-stage__name-line pw-stage__name-line--last">
                      {family(member.name)}
                    </span>
                  )}
                </h2>
                <dl className="pw-stage__specs">
                  <div>
                    <dt>Role</dt>
                    <dd>{member.role}</dd>
                  </div>
                  <div>
                    <dt>Campus</dt>
                    <dd>{member.campus}</dd>
                  </div>
                </dl>

                <button
                  type="button"
                  className="pw-stage__jump"
                  onClick={() => jumpTo(member.id)}
                >
                  See {given(member.name)} in the register
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* The deck: the filmstrip runs the full width of the screen under
                the stage, the way a select screen lines its cast up. */}
      <div className="pw-stage__deck">
        {/* The dwell timer, restarted by `key` on every change, and only
                    while the stage is still playing itself. */}
        <div className="pw-stage__timer" aria-hidden="true">
          {auto && (
            <span
              key={index}
              className="pw-stage__timer-fill"
              style={{ animationDuration: `${DWELL_MS}ms` }}
            />
          )}
        </div>

        <ul
          ref={stripRef}
          className="pw-stage__strip"
          role="listbox"
          aria-label="Choose a team member"
          tabIndex={-1}
          onKeyDown={onStripKeyDown}
        >
          {TEAM.map((person, i) => (
            <li key={person.id} role="presentation">
              <button
                type="button"
                ref={(node) => {
                  buttonsRef.current[i] = node;
                }}
                role="option"
                aria-selected={i === index}
                tabIndex={i === index ? 0 : -1}
                className="pw-stage__tile"
                style={
                  {
                    "--plate-angle": `${person.plateAngle}deg`,
                    "--i": i,
                  } as React.CSSProperties
                }
                onMouseEnter={() => select(i)}
                onFocus={() => select(i)}
                onClick={() => select(i)}
              >
                <span className="pw-stage__tile-code" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="pw-stage__tile-initials" aria-hidden="true">
                  {person.initials}
                </span>
                <span className="sr-only">
                  {person.name} — {person.role}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** "Jalal bin Junaid" → "Jalal bin"; a single-word name returns itself. */
function given(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts.length === 1 ? parts[0] : parts.slice(0, -1).join(" ");
}

/** "Jalal bin Junaid" → "Junaid"; a single-word name returns "". */
function family(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts.length === 1 ? "" : parts[parts.length - 1];
}
