"use client";

// ============================================================
// PharmaWallah — Disk Diffusion Lab: bench apparatus
// ============================================================
//
// The glassware and hardware the stages put on the bench. Carried over from
// the original single-file simulation and given accessible labels, so the
// lab's look is unchanged while each item can now be reused by any stage.

import React from "react";

const BLUE = "#1C7BD9";
const GREEN = "#21B67A";
const MUTED = "#64748b";

// ─── Mueller-Hinton agar bottle ─────────────────────────────

export function AgarBottle({ selected = false }: { selected?: boolean }) {
  return (
    <svg viewBox="0 0 70 160" className="h-36 w-auto" role="img" aria-label="Bottle of Mueller-Hinton agar" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="dd-bottle-glass" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#d1d5db" />
          <stop offset="40%" stopColor="#f3f4f6" />
          <stop offset="100%" stopColor="#9ca3af" />
        </linearGradient>
        <linearGradient id="dd-bottle-liquid" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e8e0b4" />
          <stop offset="100%" stopColor="#d6c98a" />
        </linearGradient>
      </defs>
      <rect x="24" y="0" width="22" height="24" rx="5" fill="#374151" />
      <rect x="22" y="22" width="26" height="14" rx="4" fill="#6b7280" />
      <rect
        x="8"
        y="34"
        width="54"
        height="118"
        rx="12"
        fill="url(#dd-bottle-glass)"
        stroke={selected ? GREEN : "#9ca3af"}
        strokeWidth={selected ? 2.5 : 1.5}
      />
      <rect x="12" y="44" width="46" height="100" rx="8" fill="url(#dd-bottle-liquid)" fillOpacity="0.9" />
      <rect x="13" y="61" width="44" height="56" rx="4" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
      <text x="35" y="77" fontSize="10" textAnchor="middle" fill={GREEN} fontWeight="900" fontFamily="inherit">MHA</text>
      <line x1="17" y1="81" x2="53" y2="81" stroke="#cbd5e1" strokeWidth="0.8" />
      <text x="35" y="90" fontSize="5.5" textAnchor="middle" fill={MUTED} fontFamily="inherit">Mueller-Hinton</text>
      <text x="35" y="99" fontSize="5" textAnchor="middle" fill={MUTED} fontFamily="inherit">Agar · 500 mL</text>
      <text x="35" y="108" fontSize="4.5" textAnchor="middle" fill={MUTED} fontFamily="inherit">pH 7.2–7.4</text>
      <circle cx="24" cy="128" r="4" fill="rgba(255,255,255,0.4)" />
    </svg>
  );
}

// ─── Sterile swab ───────────────────────────────────────────

export function SterileSwab({ wet = false }: { wet?: boolean }) {
  return (
    <svg viewBox="0 0 26 150" className="h-32 w-auto" role="img" aria-label={wet ? "Sterile swab, charged with the bacterial suspension" : "Sterile cotton swab"} xmlns="http://www.w3.org/2000/svg">
      <rect x="11" y="0" width="4" height="115" rx="2" fill="#d6d3d1" />
      <rect x="12" y="2" width="1.5" height="112" rx="1" fill="rgba(255,255,255,0.4)" />
      <ellipse cx="13" cy="128" rx="11" ry="20" fill={wet ? "#e5e7d5" : "#fdf6e3"} stroke={wet ? GREEN : "#e2d9b8"} strokeWidth="1" />
      <ellipse cx="13" cy="124" rx="6" ry="9" fill="rgba(255,255,255,0.35)" />
    </svg>
  );
}

// ─── Turbidity tube ─────────────────────────────────────────

/** `density` 0–1: how cloudy the suspension looks against the lined card. */
export function TurbidityTube({
  density,
  label,
  highlighted = false,
}: {
  density: number;
  label: string;
  highlighted?: boolean;
}) {
  const clamp = Math.max(0, Math.min(1, density));
  const lineOpacity = 0.9 - clamp * 0.75;
  return (
    <svg viewBox="0 0 64 120" className="h-28 w-auto" role="img" aria-label={`${label} suspension, seen against a card of black lines`} xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="6" width="56" height="94" rx="6" fill="#ffffff" stroke={highlighted ? GREEN : "#e2e8f0"} strokeWidth={highlighted ? 2 : 1} />
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1="12" y1={24 + i * 18} x2="52" y2={24 + i * 18} stroke="#1f2937" strokeWidth="2.4" opacity={lineOpacity} />
      ))}
      <rect x="20" y="10" width="24" height="86" rx="12" fill="#eef2f7" fillOpacity={0.35 + clamp * 0.55} stroke="#cbd5e1" strokeWidth="1.5" />
      {Array.from({ length: Math.round(2 + clamp * 20) }, (_, i) => (
        <circle key={i} cx={24 + ((i * 7) % 16)} cy={22 + ((i * 13) % 68)} r="1.3" fill={MUTED} opacity="0.5" />
      ))}
    </svg>
  );
}

// ─── Incubator ──────────────────────────────────────────────

export function Incubator({
  progress,
  tempC,
  hours,
  doorOpen,
  plateLoaded,
  done,
}: {
  progress: number;
  tempC: number;
  hours: number;
  doorOpen: boolean;
  plateLoaded: boolean;
  done: boolean;
}) {
  const elapsed = (progress / 100) * hours;
  return (
    <svg
      viewBox="0 0 180 210"
      className="w-full h-auto"
      role="img"
      aria-label={`Laboratory incubator set to ${tempC} degrees Celsius. Door ${doorOpen ? "open" : "closed"}. ${plateLoaded ? "Plate loaded." : "No plate loaded."} ${done ? "Cycle complete." : progress > 0 ? `${Math.round(progress)} percent through the cycle.` : "Standing by."}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="dd-inc-body" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e7e5e4" />
          <stop offset="100%" stopColor="#d6d3d1" />
        </linearGradient>
        <linearGradient id="dd-inc-bar" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={BLUE} />
          <stop offset="100%" stopColor={GREEN} />
        </linearGradient>
      </defs>

      <rect x="4" y="4" width="172" height="202" rx="12" fill="url(#dd-inc-body)" stroke="#a8a29e" strokeWidth="1.5" />
      <rect x="4" y="4" width="172" height="26" rx="12" fill="#475569" />
      <rect x="4" y="20" width="172" height="10" fill="#475569" />
      <text x="90" y="20" fontSize="7.5" textAnchor="middle" fill="#cbd5e1" fontFamily="inherit" fontWeight="700" letterSpacing="2">
        PHARMAWALLAH
      </text>

      {/* Chamber */}
      <rect x="14" y="36" width="152" height="128" rx="8" fill="#475569" />
      <rect x="18" y="40" width="144" height="120" rx="6" fill="#f1f5f9" />
      <rect x="22" y="112" width="136" height="4" rx="2" fill="#cbd5e1" />
      {progress > 0 && <rect x="18" y="40" width="144" height="120" rx="6" fill={GREEN} fillOpacity={0.04 + (progress / 100) * 0.1} />}

      {/* The plate, inverted on the shelf */}
      {plateLoaded && (
        <g transform="translate(90,100)">
          <ellipse cx="0" cy="4" rx="40" ry="13" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
          <ellipse cx="0" cy="-2" rx="42" ry="14" fill="#f2ead0" stroke="#94a3b8" strokeWidth="1" />
          <ellipse cx="0" cy="-3" rx="38" ry="11" fill="#cfe3c6" fillOpacity={done ? 0.9 : 0.2 + (progress / 100) * 0.7} />
          <text x="0" y="26" fontSize="6" textAnchor="middle" fill={MUTED} fontFamily="inherit" fontWeight="700">
            agar side up
          </text>
        </g>
      )}
      {!plateLoaded && doorOpen && (
        <>
          <ellipse cx="90" cy="100" rx="42" ry="14" fill="none" stroke={BLUE} strokeWidth="1.5" strokeDasharray="4 3" />
          <text x="90" y="103" fontSize="7" textAnchor="middle" fill={BLUE} fontFamily="inherit" fontWeight="700">
            load the plate here
          </text>
        </>
      )}

      {/* Glass door — slides aside when open rather than rotating, which reads
          more clearly at small sizes than a 3D swing. */}
      <g style={{ transform: doorOpen ? "translateX(-46px)" : "translateX(0)", transition: "transform 420ms cubic-bezier(0.22,1,0.36,1)" }}>
        <rect x="14" y="36" width="152" height="128" rx="8" fill="rgba(186,230,253,0.22)" stroke="#94a3b8" strokeWidth="1" />
        <rect x="156" y="84" width="8" height="34" rx="3" fill="#94a3b8" stroke="#64748b" strokeWidth="1" />
      </g>

      {/* Control panel */}
      <rect x="4" y="170" width="172" height="36" rx="0" fill="#1e293b" />
      <rect x="4" y="198" width="172" height="8" rx="4" fill="#1e293b" />
      <rect x="10" y="175" width="100" height="24" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1" />
      <text x="60" y="185" fontSize="7" textAnchor="middle" fill="#4ade80" fontFamily="monospace">
        {`TEMP ${tempC.toFixed(1)}°C`}
      </text>
      <text x="60" y="195" fontSize="7" textAnchor="middle" fill={done ? "#4ade80" : "#fbbf24"} fontFamily="monospace">
        {done ? "COMPLETE" : progress > 0 ? `${elapsed.toFixed(1)} / ${hours} H` : "STANDBY"}
      </text>
      {[
        ["PWR", "#4ade80"],
        ["HEAT", progress > 0 && !done ? "#f97316" : "#334155"],
        ["DONE", done ? "#4ade80" : "#334155"],
      ].map(([l, c], i) => (
        <g key={l}>
          <circle cx={122 + i * 18} cy={182} r="4" fill={c} />
          <text x={122 + i * 18} y="194" fontSize="3.6" textAnchor="middle" fill="#94a3b8" fontFamily="inherit">{l}</text>
        </g>
      ))}
      <rect x="10" y="199" width="160" height="4" rx="2" fill="#334155" />
      <rect x="10" y="199" width={160 * (progress / 100)} height="4" rx="2" fill="url(#dd-inc-bar)" />
    </svg>
  );
}

// ─── Colony plate (the source culture) ──────────────────────

export function ColonyPlate({ color = "#dc2626" }: { color?: string }) {
  return (
    <svg viewBox="0 0 120 120" className="h-28 w-auto" role="img" aria-label="Pure culture plate with well-isolated colonies" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="54" fill="#e2e8f0" />
      <circle cx="60" cy="60" r="50" fill="#f2ead0" />
      {[
        [44, 44], [70, 38], [84, 58], [50, 74], [72, 80], [36, 60], [62, 58], [88, 40], [40, 88],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 5 : 3.6} fill="#e8ddb0" stroke={color} strokeWidth="0.7" strokeOpacity="0.35" />
      ))}
      <circle cx="60" cy="60" r="50" fill="none" stroke="#94a3b8" strokeWidth="1" />
      <path d="M26 40 A50 50 0 0 1 52 14" stroke="rgba(255,255,255,0.8)" strokeWidth="4" fill="none" strokeLinecap="round" />
    </svg>
  );
}
