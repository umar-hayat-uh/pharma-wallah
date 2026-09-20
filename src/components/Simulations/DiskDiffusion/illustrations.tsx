// ============================================================
// PharmaWallah — Disk Diffusion Lab: Lab Guide illustrations
// ============================================================
//
// Educational diagrams, drawn rather than shipped as images: they stay sharp,
// weigh nothing, follow the brand palette and adapt to the container. Each one
// takes its alt text from the guide step (`GuideStep.illustrationAlt`) and
// exposes it as an SVG <title>, so the diagram is not lost to a screen reader.
//
// House style: light laboratory ground, brand blue and green for anything
// meaningful, grey for apparatus, one or two labels — no decoration that does
// not carry information.

import React from "react";

const BLUE = "#1C7BD9";
const GREEN = "#21B67A";
const INK = "#1f2937";
const MUTED = "#64748b";
const GLASS = "#cbd5e1";
const AGAR = "#f0e9c4";
const LAWN = "#cfe3c6";

interface FigureProps {
  /** Alt text — the diagram carries real information, so this is required. */
  alt: string;
  className?: string;
}

/** Shared frame: a light bench ground, a consistent viewBox and the alt text. */
function Figure({
  alt,
  className,
  children,
}: FigureProps & { children: React.ReactNode }) {
  const titleId = React.useId();
  return (
    <svg
      viewBox="0 0 320 180"
      role="img"
      aria-labelledby={titleId}
      className={className ?? "w-full h-auto"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title id={titleId}>{alt}</title>
      <rect x="0" y="0" width="320" height="180" rx="14" fill="#f8fafc" />
      <rect x="0" y="0" width="320" height="180" rx="14" fill="none" stroke="#e2e8f0" />
      {children}
    </svg>
  );
}

/** A small caption under an element inside a figure. */
function Caption({ x, y, children, fill = MUTED }: { x: number; y: number; children: React.ReactNode; fill?: string }) {
  return (
    <text x={x} y={y} fontSize="8.5" textAnchor="middle" fill={fill} fontFamily="inherit" fontWeight="600">
      {children}
    </text>
  );
}

/** A plate seen from above, optionally with a lawn and streak paths. */
function PlateTop({
  cx,
  cy,
  r,
  lawn = false,
  children,
}: {
  cx: number;
  cy: number;
  r: number;
  lawn?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r + 3} fill="#e2e8f0" />
      <circle cx={cx} cy={cy} r={r} fill={AGAR} />
      {lawn && <circle cx={cx} cy={cy} r={r - 1} fill={LAWN} opacity="0.85" />}
      {children}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#94a3b8" strokeWidth="1" />
      <path
        d={`M ${cx - r * 0.7} ${cy - r * 0.55} A ${r} ${r} 0 0 1 ${cx - r * 0.1} ${cy - r * 0.95}`}
        stroke="rgba(255,255,255,0.8)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
    </g>
  );
}

// ─── 1. Preparing the inoculum ──────────────────────────────

export function InoculumFigure({ alt, className }: FigureProps) {
  return (
    <Figure alt={alt} className={className}>
      {/* Culture plate with isolated colonies */}
      <PlateTop cx={58} cy={78} r={36}>
        {[
          [44, 64], [66, 58], [78, 80], [52, 92], [70, 96], [40, 82], [60, 74],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 4 : 3} fill="#e8ddb0" stroke="#c9b978" strokeWidth="0.8" />
        ))}
      </PlateTop>
      <Caption x={58} y={128}>Pure culture, 18–24 h</Caption>

      {/* Loop carrying colony material */}
      <g>
        <line x1="108" y1="46" x2="146" y2="86" stroke={GLASS} strokeWidth="3" strokeLinecap="round" />
        <circle cx="150" cy="90" r="5" fill="none" stroke={MUTED} strokeWidth="2" />
        <circle cx="150" cy="90" r="2" fill="#c9b978" />
        <Caption x={128} y={40}>Sterile loop</Caption>
      </g>

      {/* Tube of saline before */}
      <g>
        <rect x="176" y="52" width="24" height="72" rx="11" fill="#eef2f7" stroke={GLASS} strokeWidth="1.5" />
        <path d="M177 78 h22 v38 a11 11 0 0 1 -22 0 z" fill="#eaf4fb" />
        <Caption x={188} y={138}>Sterile saline</Caption>
      </g>

      <path d="M212 90 h16 m-5 -4 l5 4 l-5 4" stroke={MUTED} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />

      {/* Tube after — faintly cloudy */}
      <g>
        <rect x="240" y="52" width="24" height="72" rx="11" fill="#eef2f7" stroke={GLASS} strokeWidth="1.5" />
        <path d="M241 78 h22 v38 a11 11 0 0 1 -22 0 z" fill="#dce9f2" />
        {[[247, 88], [256, 96], [250, 106], [259, 112], [245, 100]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="1.6" fill={MUTED} opacity="0.5" />
        ))}
        <Caption x={252} y={138} fill={BLUE}>Suspension</Caption>
      </g>
    </Figure>
  );
}

// ─── 2. Mueller-Hinton plate ────────────────────────────────

export function MediaFigure({ alt, className }: FigureProps) {
  return (
    <Figure alt={alt} className={className}>
      {/* Cross-section */}
      <g>
        <Caption x={92} y={36} fill={INK}>Cross-section</Caption>
        <path d="M30 60 h124 v46 a6 6 0 0 1 -6 6 h-112 a6 6 0 0 1 -6 -6 z" fill="#f1f5f9" stroke={GLASS} strokeWidth="1.5" />
        <path d="M33 84 h118 v22 a4 4 0 0 1 -4 4 h-110 a4 4 0 0 1 -4 -4 z" fill={AGAR} />
        <line x1="33" y1="84" x2="151" y2="84" stroke="#c9b978" strokeWidth="1.2" />
        {/* Depth dimension */}
        <line x1="166" y1="84" x2="166" y2="110" stroke={BLUE} strokeWidth="1.4" />
        <line x1="162" y1="84" x2="170" y2="84" stroke={BLUE} strokeWidth="1.4" />
        <line x1="162" y1="110" x2="170" y2="110" stroke={BLUE} strokeWidth="1.4" />
        <text x="174" y="100" fontSize="10" fill={BLUE} fontWeight="800" fontFamily="inherit">4 mm</text>
        <Caption x={92} y={128}>Even layer, surface dry</Caption>
      </g>

      {/* Top view */}
      <g>
        <Caption x={258} y={36} fill={INK}>From above</Caption>
        <PlateTop cx={258} cy={86} r={40} />
        <Caption x={258} y={144} fill={GREEN}>Mueller-Hinton agar</Caption>
      </g>
    </Figure>
  );
}

// ─── 3. Turbidity standard ──────────────────────────────────

export function TurbidityFigure({ alt, className }: FigureProps) {
  const tubes: { x: number; label: string; fill: string; dots: number; tone: string }[] = [
    { x: 52, label: "Too light", fill: "#f1f7fb", dots: 3, tone: "#d97706" },
    { x: 152, label: "Standard", fill: "#dbe9f3", dots: 9, tone: GREEN },
    { x: 252, label: "Too heavy", fill: "#b9c8d4", dots: 18, tone: "#dc2626" },
  ];
  return (
    <Figure alt={alt} className={className}>
      {tubes.map((t) => (
        <g key={t.label}>
          {/* Lined card behind the tube — how turbidity is actually judged */}
          <rect x={t.x - 26} y={38} width="52" height="80" rx="4" fill="#ffffff" stroke="#e2e8f0" />
          {[0, 1, 2, 3].map((i) => (
            <line
              key={i}
              x1={t.x - 20}
              y1={54 + i * 16}
              x2={t.x + 20}
              y2={54 + i * 16}
              stroke={INK}
              strokeWidth="2"
              opacity={t.label === "Too heavy" ? 0.18 : t.label === "Standard" ? 0.45 : 0.85}
            />
          ))}
          <rect x={t.x - 12} y={40} width="24" height="76" rx="11" fill={t.fill} fillOpacity="0.92" stroke={GLASS} strokeWidth="1.5" />
          {Array.from({ length: t.dots }, (_, i) => (
            <circle
              key={i}
              cx={t.x - 8 + ((i * 7) % 17)}
              cy={54 + ((i * 13) % 56)}
              r="1.4"
              fill={MUTED}
              opacity="0.55"
            />
          ))}
          <rect x={t.x - 24} y={128} width="48" height="16" rx="8" fill={t.tone} fillOpacity="0.12" />
          <Caption x={t.x} y={139} fill={t.tone}>{t.label}</Caption>
          <Caption x={t.x} y={162}>
            {t.label === "Standard" ? "zones read true" : t.label === "Too light" ? "zones read large" : "zones read small"}
          </Caption>
        </g>
      ))}
    </Figure>
  );
}

// ─── 4. Inoculating the plate ───────────────────────────────

export function InoculationFigure({ alt, className }: FigureProps) {
  const passes = [
    { cx: 48, angle: 0, label: "1st" },
    { cx: 128, angle: 60, label: "2nd · turn 60°" },
    { cx: 208, angle: 120, label: "3rd · turn 60°" },
  ];
  return (
    <Figure alt={alt} className={className}>
      {passes.map((p) => (
        <g key={p.label}>
          <PlateTop cx={p.cx} cy={74} r={32}>
            <g transform={`rotate(${p.angle} ${p.cx} 74)`}>
              {[-22, -13, -4, 5, 14, 23].map((off) => (
                <line
                  key={off}
                  x1={p.cx - 28}
                  y1={74 + off}
                  x2={p.cx + 28}
                  y2={74 + off}
                  stroke={GREEN}
                  strokeWidth="3"
                  strokeLinecap="round"
                  opacity="0.5"
                  clipPath="none"
                />
              ))}
            </g>
          </PlateTop>
          <Caption x={p.cx} y={122}>{p.label}</Caption>
        </g>
      ))}

      <path d="M248 74 h14 m-5 -4 l5 4 l-5 4" stroke={MUTED} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />

      {/* Result: confluent lawn with the rim pass */}
      <PlateTop cx={286} cy={74} r={26} lawn>
        <circle cx={286} cy={74} r={23} fill="none" stroke={GREEN} strokeWidth="2.5" strokeDasharray="3 3" opacity="0.8" />
      </PlateTop>
      <Caption x={286} y={114} fill={GREEN}>Confluent</Caption>
      <Caption x={286} y={126}>+ rim pass</Caption>
    </Figure>
  );
}

// ─── 5. Applying the disks ──────────────────────────────────

export function DisksFigure({ alt, className }: FigureProps) {
  const disks = [
    { a: -90, id: "AMP" },
    { a: -18, id: "CIP" },
    { a: 54, id: "GEN" },
    { a: 126, id: "TET" },
  ];
  const cx = 116;
  const cy = 90;
  const r = 38;
  return (
    <Figure alt={alt} className={className}>
      <PlateTop cx={cx} cy={cy} r={62} lawn>
        {disks.map((d) => {
          const x = cx + r * Math.cos((d.a * Math.PI) / 180);
          const y = cy + r * Math.sin((d.a * Math.PI) / 180);
          return (
            <g key={d.id}>
              <circle cx={x} cy={y} r="11" fill="#ffffff" stroke={BLUE} strokeWidth="1.6" />
              <text x={x} y={y + 3} fontSize="7.5" textAnchor="middle" fill={BLUE} fontWeight="800" fontFamily="inherit">
                {d.id}
              </text>
            </g>
          );
        })}
        {/* Spacing guide between the first two disks */}
        <line
          x1={cx + r * Math.cos((-90 * Math.PI) / 180)}
          y1={cy + r * Math.sin((-90 * Math.PI) / 180)}
          x2={cx + r * Math.cos((-18 * Math.PI) / 180)}
          y2={cy + r * Math.sin((-18 * Math.PI) / 180)}
          stroke={GREEN}
          strokeWidth="1.4"
          strokeDasharray="4 3"
        />
      </PlateTop>
      <text x={196} y={58} fontSize="9" fill={GREEN} fontWeight="800" fontFamily="inherit">≥ 24 mm apart</text>

      {/* Forceps placing a fifth disk */}
      <g>
        <path d="M262 34 L238 78" stroke={GLASS} strokeWidth="3.5" strokeLinecap="round" />
        <path d="M272 36 L248 80" stroke={GLASS} strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="243" cy="86" r="9" fill="#ffffff" stroke={MUTED} strokeWidth="1.4" />
        <Caption x={268} y={104}>Sterile forceps</Caption>
        <Caption x={268} y={116}>or dispenser</Caption>
      </g>

      <rect x="196" y="128" width="112" height="16" rx="8" fill={BLUE} fillOpacity="0.1" />
      <Caption x={252} y={139} fill={BLUE}>≥ 15 mm from the rim</Caption>
    </Figure>
  );
}

// ─── 6. Incubation ──────────────────────────────────────────

export function IncubationFigure({ alt, className }: FigureProps) {
  return (
    <Figure alt={alt} className={className}>
      {/* Incubator cabinet */}
      <rect x="28" y="26" width="150" height="128" rx="10" fill="#e7e5e4" stroke="#a8a29e" strokeWidth="1.5" />
      <rect x="40" y="40" width="126" height="86" rx="6" fill="#f8fafc" stroke={GLASS} strokeWidth="1.2" />
      {/* Shelf and inverted plates */}
      {[54, 82, 110].map((y) => (
        <g key={y}>
          <line x1="48" y1={y + 12} x2="158" y2={y + 12} stroke="#cbd5e1" strokeWidth="2" />
          {[70, 106, 142].map((x) => (
            <g key={x}>
              <rect x={x - 16} y={y - 2} width="32" height="9" rx="3" fill={AGAR} stroke="#94a3b8" strokeWidth="0.8" />
              <rect x={x - 17} y={y + 5} width="34" height="5" rx="2" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.8" />
            </g>
          ))}
        </g>
      ))}
      <text x="103" y="148" fontSize="9" textAnchor="middle" fill={MUTED} fontWeight="700" fontFamily="inherit">
        agar side up (inverted)
      </text>

      {/* Readouts */}
      <rect x="196" y="40" width="98" height="40" rx="10" fill="#ffffff" stroke="#e2e8f0" />
      <text x="245" y="60" fontSize="15" textAnchor="middle" fill={BLUE} fontWeight="800" fontFamily="inherit">35 ± 2 °C</text>
      <Caption x={245} y={73}>in air, not CO₂</Caption>

      <rect x="196" y="92" width="98" height="40" rx="10" fill="#ffffff" stroke="#e2e8f0" />
      <text x="245" y="112" fontSize="15" textAnchor="middle" fill={GREEN} fontWeight="800" fontFamily="inherit">16–18 h</text>
      <Caption x={245} y={125}>read once, on time</Caption>
    </Figure>
  );
}

// ─── 7. Zones of inhibition ─────────────────────────────────

export function ZonesFigure({ alt, className }: FigureProps) {
  const cx = 96;
  const cy = 90;
  const items = [
    { a: -90, r: 30, id: "CIP", label: "wide zone" },
    { a: 30, r: 16, id: "GEN", label: "narrow zone" },
    { a: 150, r: 0, id: "AMP", label: "no zone" },
  ];
  return (
    <Figure alt={alt} className={className}>
      <PlateTop cx={cx} cy={cy} r={68} lawn>
        {items.map((it) => {
          const x = cx + 34 * Math.cos((it.a * Math.PI) / 180);
          const y = cy + 34 * Math.sin((it.a * Math.PI) / 180);
          return (
            <g key={it.id}>
              {it.r > 0 && (
                <>
                  <circle cx={x} cy={y} r={it.r} fill={AGAR} />
                  <circle cx={x} cy={y} r={it.r} fill="none" stroke={BLUE} strokeWidth="1.2" strokeDasharray="3 2" />
                </>
              )}
              <circle cx={x} cy={y} r="8" fill="#ffffff" stroke={BLUE} strokeWidth="1.5" />
              <text x={x} y={y + 2.5} fontSize="6" textAnchor="middle" fill={BLUE} fontWeight="800" fontFamily="inherit">
                {it.id}
              </text>
            </g>
          );
        })}
      </PlateTop>

      {/* Key — the four things a student must be able to tell apart */}
      {[
        { y: 44, fill: LAWN, stroke: "#94a3b8", label: "Bacterial growth (lawn)" },
        { y: 66, fill: AGAR, stroke: "#c9b978", label: "Clear zone / agar" },
        { y: 88, fill: "#ffffff", stroke: BLUE, label: "Antibiotic disk" },
        { y: 110, fill: "none", stroke: BLUE, label: "Zone edge — growth stops" },
      ].map((k) => (
        <g key={k.label}>
          <circle cx={190} cy={k.y} r="7" fill={k.fill} stroke={k.stroke} strokeWidth="1.5" strokeDasharray={k.fill === "none" ? "3 2" : undefined} />
          <text x={204} y={k.y + 3.5} fontSize="9" fill={INK} fontFamily="inherit" fontWeight="600">
            {k.label}
          </text>
        </g>
      ))}
      <Caption x={232} y={140}>Zone size reflects diffusion and susceptibility together</Caption>
    </Figure>
  );
}

// ─── 8. Measuring ───────────────────────────────────────────

export function MeasureFigure({ alt, className }: FigureProps) {
  const cx = 110;
  const cy = 92;
  const zr = 48;
  return (
    <Figure alt={alt} className={className}>
      <PlateTop cx={cx} cy={cy} r={70} lawn>
        <circle cx={cx} cy={cy} r={zr} fill={AGAR} />
        <circle cx={cx} cy={cy} r={zr} fill="none" stroke={BLUE} strokeWidth="1.2" strokeDasharray="3 2" />
        <circle cx={cx} cy={cy} r="9" fill="#ffffff" stroke={BLUE} strokeWidth="1.6" />
      </PlateTop>

      {/* Ruler laid across the diameter, through the disk centre */}
      <g>
        <rect x={cx - zr - 8} y={cy - 9} width={zr * 2 + 16} height="18" rx="3" fill="#ffffff" fillOpacity="0.92" stroke={MUTED} strokeWidth="1" />
        {Array.from({ length: 13 }, (_, i) => {
          const x = cx - zr + (i * (zr * 2)) / 12;
          return <line key={i} x1={x} y1={cy - 9} x2={x} y2={cy - (i % 3 === 0 ? 1 : 4)} stroke={INK} strokeWidth="0.9" />;
        })}
        <line x1={cx - zr} y1={cy + 6} x2={cx + zr} y2={cy + 6} stroke={GREEN} strokeWidth="2" />
        <line x1={cx - zr} y1={cy + 2} x2={cx - zr} y2={cy + 10} stroke={GREEN} strokeWidth="2.4" />
        <line x1={cx + zr} y1={cy + 2} x2={cx + zr} y2={cy + 10} stroke={GREEN} strokeWidth="2.4" />
      </g>
      <Caption x={cx} y={cy + 76} fill={GREEN}>full diameter, through the centre</Caption>

      <rect x="212" y="46" width="90" height="34" rx="10" fill={GREEN} fillOpacity="0.1" />
      <text x="257" y="68" fontSize="16" textAnchor="middle" fill={GREEN} fontWeight="800" fontFamily="inherit">24 mm</text>
      <Caption x={257} y={96}>to the nearest millimetre</Caption>
      <Caption x={257} y={112}>the 6 mm disk is included</Caption>
      <Caption x={257} y={132} fill="#dc2626">a radius doubled is not a diameter</Caption>
    </Figure>
  );
}

// ─── 9. Interpreting ────────────────────────────────────────

export function InterpretFigure({ alt, className }: FigureProps) {
  const rows = [
    { drug: "Ciprofloxacin", mm: "28", rule: "S ≥ 21", cat: "S", tone: GREEN },
    { drug: "Gentamicin", mm: "14", rule: "13–14", cat: "I", tone: "#d97706" },
    { drug: "Ampicillin", mm: "11", rule: "R ≤ 13", cat: "R", tone: "#dc2626" },
    { drug: "Vancomycin", mm: "6", rule: "none", cat: "—", tone: MUTED },
  ];
  return (
    <Figure alt={alt} className={className}>
      <rect x="20" y="22" width="280" height="20" rx="6" fill="#eef2f7" />
      {["Antibiotic", "Diameter", "Criteria", "Report"].map((h, i) => (
        <text key={h} x={[34, 152, 206, 268][i]} y={36} fontSize="8.5" fill={MUTED} fontWeight="800" fontFamily="inherit" letterSpacing="0.6">
          {h.toUpperCase()}
        </text>
      ))}
      {rows.map((r, i) => {
        const y = 52 + i * 26;
        return (
          <g key={r.drug}>
            {i % 2 === 0 && <rect x="20" y={y - 12} width="280" height="24" rx="5" fill="#f8fafc" />}
            <text x="34" y={y + 4} fontSize="9.5" fill={INK} fontWeight="700" fontFamily="inherit">{r.drug}</text>
            <text x="152" y={y + 4} fontSize="9.5" fill={INK} fontWeight="800" fontFamily="inherit">{r.mm} mm</text>
            <text x="206" y={y + 4} fontSize="9" fill={MUTED} fontFamily="inherit" fontWeight="600">{r.rule}</text>
            <rect x="262" y={y - 8} width="26" height="16" rx="8" fill={r.tone} fillOpacity="0.14" />
            <text x="275" y={y + 3.5} fontSize="9.5" textAnchor="middle" fill={r.tone} fontWeight="800" fontFamily="inherit">{r.cat}</text>
          </g>
        );
      })}
      <rect x="20" y="152" width="280" height="18" rx="6" fill={BLUE} fillOpacity="0.08" />
      <text x="160" y="164" fontSize="8.5" textAnchor="middle" fill={BLUE} fontWeight="700" fontFamily="inherit">
        criteria depend on the standard, organism, agent and conditions
      </text>
    </Figure>
  );
}

/** Guide step id → its illustration. Keyed so `data.ts` stays free of JSX. */
export const GUIDE_FIGURES: Record<string, React.ComponentType<FigureProps>> = {
  inoculum: InoculumFigure,
  media: MediaFigure,
  turbidity: TurbidityFigure,
  inoculation: InoculationFigure,
  disks: DisksFigure,
  incubation: IncubationFigure,
  zones: ZonesFigure,
  measure: MeasureFigure,
  interpret: InterpretFigure,
};
