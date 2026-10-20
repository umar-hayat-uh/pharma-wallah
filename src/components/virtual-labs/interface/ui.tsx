"use client";

/**
 * Small shared controls for the lab interface: brand tokens, 44 px touch targets,
 * visible focus rings. No new UI library — Tailwind and lucide-react only.
 */
import { useEffect, useId, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "soft";

const VARIANT: Record<Variant, string> = {
  primary: "bg-brandBlue text-white hover:bg-[#1667b8] disabled:bg-brandBlue/40",
  secondary: "border border-[#16181d]/15 bg-white text-[#16181d] hover:border-brandBlue/50 hover:text-brandBlue disabled:opacity-50",
  ghost: "text-[#16181d] hover:bg-[#16181d]/5 disabled:opacity-40",
  danger: "border border-red-200 bg-white text-red-700 hover:bg-red-50",
  soft: "bg-brandBlue/10 text-brandBlue hover:bg-brandBlue/15 disabled:opacity-50",
};

export function Btn({ variant = "secondary", size = "md", className = "", ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: "sm" | "md" }) {
  return (
    <button
      type="button"
      {...rest}
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brandBlue disabled:cursor-not-allowed ${size === "sm" ? "min-h-9 px-3 text-sm" : "min-h-11 px-4 text-[15px]"} ${VARIANT[variant]} ${className}`}
    />
  );
}

/** A labelled numeric entry: the student types a reading and records it. */
export function ReadingField({ label, unit, step = "any", placeholder, onSubmit, disabled, hint, buttonLabel = "Record" }: { label: string; unit?: string; step?: string; placeholder?: string; onSubmit(v: number): void; disabled?: boolean; hint?: string; buttonLabel?: string }) {
  const id = useId();
  const [v, setV] = useState("");
  const submit = () => {
    const n = Number(v.trim().replace(",", ".").replace(/[−–]/g, "-"));
    if (v.trim() === "" || !Number.isFinite(n)) return;
    onSubmit(n);
  };
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-semibold text-[#16181d]">
        {label}
      </label>
      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <input
            id={id}
            inputMode="decimal"
            step={step}
            value={v}
            disabled={disabled}
            placeholder={placeholder}
            onChange={(e) => setV(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            className="vl-input h-11 w-full rounded-xl border border-[#16181d]/15 px-3 pr-12 font-mono text-[15px] tabular-nums focus:border-brandBlue focus:outline-none focus:ring-2 focus:ring-brandBlue/25 disabled:opacity-50"
          />
          {unit && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#4a4f57]">{unit}</span>}
        </div>
        <Btn variant="primary" onClick={submit} disabled={disabled || v.trim() === ""}>
          {buttonLabel}
        </Btn>
      </div>
      {hint && <p className="text-xs text-[#4a4f57]">{hint}</p>}
    </div>
  );
}

export function Section({ title, done, current, defaultOpen, children, badge }: { title: string; done?: boolean; current?: boolean; defaultOpen?: boolean; children: ReactNode; badge?: ReactNode }) {
  const [open, setOpen] = useState(!!defaultOpen || !!current);
  // Once a step has been current its section stays open (until the student collapses it):
  // a step can complete while its controls are still needed — the last wash, a rinse.
  useEffect(() => {
    if (current) setOpen(true);
  }, [current]);
  const isOpen = open;
  return (
    <section className={`rounded-2xl border ${current ? "border-brandBlue/40 bg-brandBlue/[0.03]" : "border-[#16181d]/10 bg-white"}`}>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={isOpen} className="flex min-h-11 w-full items-center gap-2 px-4 py-2 text-left">
        <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] font-bold ${done ? "bg-brandGreen text-white" : current ? "bg-brandBlue text-white" : "bg-[#16181d]/10 text-[#4a4f57]"}`}>{done ? "✓" : ""}</span>
        <span className="flex-1 text-[15px] font-semibold">{title}</span>
        {badge}
        <ChevronDown className={`h-4 w-4 transition ${isOpen ? "rotate-180" : ""}`} aria-hidden />
      </button>
      {isOpen && <div className="space-y-3 px-4 pb-4">{children}</div>}
    </section>
  );
}

export function Pill({ tone = "neutral", children }: { tone?: "neutral" | "blue" | "green" | "amber" | "red"; children: ReactNode }) {
  const t = {
    neutral: "bg-[#16181d]/[0.06] text-[#3a3f47]",
    blue: "bg-brandBlue/10 text-brandBlue",
    green: "bg-brandGreen/12 text-[#137a52]",
    amber: "bg-amber-100 text-amber-800",
    red: "bg-red-50 text-red-700",
  }[tone];
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${t}`}>{children}</span>;
}

export function Choice({ name, options, value, onChange }: { name: string; options: { id: string; label: string }[]; value: string | null; onChange(id: string): void }) {
  return (
    <div role="radiogroup" aria-label={name} className="grid gap-1.5">
      {options.map((o) => (
        <label key={o.id} className={`flex min-h-11 cursor-pointer items-start gap-2 rounded-xl border px-3 py-2 text-sm transition ${value === o.id ? "border-brandBlue bg-brandBlue/5" : "border-[#16181d]/12 hover:border-brandBlue/40"}`}>
          <input type="radio" name={name} className="mt-0.5 accent-[#1C7BD9]" checked={value === o.id} onChange={() => onChange(o.id)} />
          <span>{o.label}</span>
        </label>
      ))}
    </div>
  );
}

export { CURRICULUM_LABEL, CURRICULUM_TONE } from "@/lib/virtual-labs/labels";
