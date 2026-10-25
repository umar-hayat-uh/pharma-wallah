/**
 * RoboPharma — the PharmaWallah lab companion (2026-10-25). An original SVG drawing,
 * inspired by the owner's reference (rounded white body, dark visor, glowing eyes) but not
 * traced from it — the reference is a stock illustration of unknown licence. Brand touches:
 * the blue→green gradient on the visor rim, ears and chest badge, a "PW" capsule badge,
 * and eyes that change with the tutor's mood. No image file, no 3D: weightless on phones.
 */
import type { TutorMood } from "@/lib/virtual-labs/tutor";

const EYES: Record<TutorMood, JSX.Element> = {
  // happy / celebrate: upturned arcs; thinking: one raised; warning: level bars
  happy: (
    <>
      <path d="M38 46q6-8 12 0" />
      <path d="M70 46q6-8 12 0" />
    </>
  ),
  celebrate: (
    <>
      <path d="M37 47q7-10 14 0" />
      <path d="M69 47q7-10 14 0" />
    </>
  ),
  thinking: (
    <>
      <path d="M38 44h12" />
      <path d="M70 47q6-8 12 0" />
    </>
  ),
  warning: (
    <>
      <path d="M38 45h12" />
      <path d="M70 45h12" />
    </>
  ),
};

const MOUTH: Record<TutorMood, string> = {
  happy: "M54 56q6 6 12 0",
  celebrate: "M52 55q8 9 16 0z",
  thinking: "M55 58h10",
  warning: "M55 59q5-4 10 0",
};

export function RoboPharma({ mood = "happy", size = 64, animate = true }: { mood?: TutorMood; size?: number; animate?: boolean }) {
  return (
    <svg
      viewBox="0 0 120 140"
      width={size}
      height={(size * 140) / 120}
      role="img"
      aria-label="RoboPharma, the PharmaWallah lab assistant"
      className={animate ? "vl-robo-float" : undefined}
    >
      <defs>
        <linearGradient id="rp-brand" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1C7BD9" />
          <stop offset="1" stopColor="#21B67A" />
        </linearGradient>
        <linearGradient id="rp-shell" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#dfe5ee" />
        </linearGradient>
        <linearGradient id="rp-visor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#173a5c" />
          <stop offset="1" stopColor="#0d2238" />
        </linearGradient>
      </defs>
      {/* floor shadow */}
      <ellipse cx="60" cy="134" rx="22" ry="3.5" fill="#16181d" opacity="0.12" />
      {/* arms */}
      <rect x="14" y="82" width="15" height="34" rx="7.5" fill="url(#rp-shell)" stroke="#c9d2de" />
      <rect x="91" y="82" width="15" height="34" rx="7.5" fill="url(#rp-shell)" stroke="#c9d2de" />
      {/* body */}
      <path d="M32 82q0-10 10-10h36q10 0 10 10v20q0 26-28 26t-28-26z" fill="url(#rp-shell)" stroke="#c9d2de" />
      <path d="M36 104h16l4 4h8l4-4h16" fill="none" stroke="#c9d2de" strokeWidth="1.5" />
      {/* chest badge: a capsule in brand colours with PW */}
      <rect x="45" y="80" width="30" height="14" rx="7" fill="url(#rp-brand)" />
      <text x="60" y="90.5" textAnchor="middle" fontSize="9" fontWeight="800" fill="#fff" fontFamily="Outfit, system-ui, sans-serif">PW</text>
      {/* neck */}
      <rect x="51" y="66" width="18" height="8" rx="3" fill="#dfe5ee" stroke="#c9d2de" />
      {/* antenna: a small capsule */}
      <rect x="54" y="4" width="12" height="7" rx="3.5" fill="url(#rp-brand)" />
      <rect x="58.5" y="10" width="3" height="6" fill="#c9d2de" />
      {/* ears */}
      <rect x="10" y="32" width="9" height="22" rx="4.5" fill="url(#rp-brand)" />
      <rect x="101" y="32" width="9" height="22" rx="4.5" fill="url(#rp-brand)" />
      {/* head */}
      <rect x="16" y="15" width="88" height="54" rx="22" fill="url(#rp-shell)" stroke="#c9d2de" />
      {/* visor with a brand rim */}
      <rect x="24" y="23" width="72" height="40" rx="15" fill="url(#rp-visor)" stroke="url(#rp-brand)" strokeWidth="2" />
      <path d="M30 30q6-4 16-4" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* face */}
      <g stroke="#5ee6ff" strokeWidth="4.5" strokeLinecap="round" fill="none" className="vl-robo-face">
        {EYES[mood]}
      </g>
      <path d={MOUTH[mood]} fill={mood === "celebrate" ? "#5ee6ff" : "none"} stroke="#5ee6ff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
