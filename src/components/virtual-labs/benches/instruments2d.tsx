"use client";

import { useId } from "react";

/**
 * 2D instrument views, drawn from the experiment's true state. These are what the
 * student READS — the scale shows the meniscus where it really is and never prints the
 * value, so a reading must be taken, as at the bench. They double as the accessible,
 * no-WebGL view of each instrument (role="img" with a description that does not give
 * the reading away).
 */

/** A vertical scale window (burette, cylinder, flask neck). `invert` = 0 at the top (burette). */
export function ScaleWindow({ level, from, to, minor, major, label, invert = false, unit = "mL", mark, liquid = "#cfe6fb", height = 260 }: { level: number | null; from: number; to: number; minor: number; major: number; label: string; invert?: boolean; unit?: string; mark?: number; liquid?: string; height?: number }) {
  const gid = useId().replace(/:/g, "");
  const W = 150;
  const H = height;
  const span = to - from;
  const y = (v: number) => (invert ? ((v - from) / span) * H : H - ((v - from) / span) * H);
  const ticks: number[] = [];
  for (let v = Math.ceil(from / minor - 1e-9) * minor; v <= to + 1e-9; v += minor) ticks.push(Math.round(v / minor) * minor);
  const ly = level === null ? null : y(Math.min(to, Math.max(from, level)));
  const fillTop = ly === null ? H : invert ? ly : ly;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full max-w-[170px] rounded-xl border border-[#16181d]/10 bg-[#f7fafc]" role="img" aria-label={`${label}: magnified scale. Read the bottom of the meniscus against the graduations.`}>
      <defs>
        <linearGradient id={`g${gid}`} x1="0" x2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="0.5" stopColor="#eef4f9" stopOpacity="0.4" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      <rect x="40" y="0" width="56" height={H} fill={`url(#g${gid})`} />
      {ly !== null && (
        <>
          <rect x="40" y={invert ? fillTop : fillTop} width="56" height={invert ? H - fillTop : H - fillTop} fill={liquid} opacity="0.75" />
          {/* meniscus: concave, its bottom at the true level */}
          <path d={`M40 ${ly - 7} Q68 ${ly + 7} 96 ${ly - 7} L96 ${ly - 9} Q68 ${ly + 4} 40 ${ly - 9} Z`} fill="#7aa9d6" opacity="0.9" />
        </>
      )}
      {ticks.map((v) => {
        const isMajor = Math.abs(v / major - Math.round(v / major)) < 1e-6;
        const half = !isMajor && Math.abs((v * 2) / major - Math.round((v * 2) / major)) < 1e-6;
        return (
          <g key={v}>
            <line x1="96" x2={isMajor ? 120 : half ? 112 : 106} y1={y(v)} y2={y(v)} stroke="#1b1f26" strokeWidth={isMajor ? 1.6 : 0.9} />
            {isMajor && (
              <text x="124" y={y(v) + 4} fontSize="11" fontWeight="600" fill="#1b1f26" className="vl-tick">
                {Number.isInteger(v) ? v : v.toFixed(1)}
              </text>
            )}
          </g>
        );
      })}
      {mark !== undefined && <line x1="34" x2="102" y1={y(mark)} y2={y(mark)} stroke="#1b1f26" strokeWidth="1.6" />}
      <line x1="40" x2="40" y1="0" y2={H} stroke="#9fb3c6" />
      <line x1="96" x2="96" y1="0" y2={H} stroke="#9fb3c6" />
      <text x="6" y="14" fontSize="10" fill="#4a4f57">{unit}</text>
    </svg>
  );
}

/** A conical flask drawn with the liquid's actual colour. */
export function FlaskSwatch({ rgba, volume, label }: { rgba: [number, number, number, number]; volume: number; label: string }) {
  const fill = `rgba(${Math.round(rgba[0] * 255)},${Math.round(rgba[1] * 255)},${Math.round(rgba[2] * 255)},${Math.min(0.95, rgba[3] + 0.08)})`;
  const cid = useId().replace(/:/g, "");
  const h = Math.min(80, 18 + volume * 0.9);
  return (
    <svg viewBox="0 0 120 130" className="h-28 w-auto" role="img" aria-label={label}>
      <rect x="0" y="118" width="120" height="12" rx="3" fill="#ffffff" stroke="#d6dde4" />
      <clipPath id={`c${cid}`}>
        <path d="M48 8 L72 8 L72 40 L104 112 Q106 118 98 118 L22 118 Q14 118 16 112 L48 40 Z" />
      </clipPath>
      {volume > 0 && <rect x="0" y={118 - h} width="120" height={h} fill={fill} clipPath={`url(#c${cid})`} />}
      <path d="M48 8 L72 8 L72 40 L104 112 Q106 118 98 118 L22 118 Q14 118 16 112 L48 40 Z" fill="none" stroke="#7c8b99" strokeWidth="2" />
    </svg>
  );
}

/** An instrument LCD. */
export function Lcd({ value, sub, tone = "green" }: { value: string; sub?: string; tone?: "green" | "amber" | "blue" }) {
  const c = tone === "amber" ? "text-[#ffb37a]" : tone === "blue" ? "text-[#7fd3ff]" : "text-[#9df2b8]";
  return (
    <div className="rounded-xl bg-[#1d2b22] px-4 py-2" role="status" aria-live="polite">
      {sub && <p className={`text-[11px] font-semibold ${c} opacity-80`}>{sub}</p>}
      <p className={`text-right font-mono text-2xl font-semibold tabular-nums ${c}`}>{value}</p>
    </div>
  );
}
