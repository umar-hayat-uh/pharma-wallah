"use client";

import { useId } from "react";
import { Info, TriangleAlert, OctagonAlert } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/** A labelled free-text input — sample names, formulas, notebook references. */
export function TextField({
  label,
  value,
  onChange,
  placeholder,
  hint,
  error,
  className,
  inputClassName,
  maxLength = 120,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  error?: string;
  className?: string;
  inputClassName?: string;
  maxLength?: number;
}) {
  const id = useId();
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={value}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={hint || error ? `${id}-desc` : undefined}
        className={cn(error && "border-destructive focus-visible:ring-destructive", inputClassName)}
      />
      {(hint || error) && (
        <p
          id={`${id}-desc`}
          className={cn("text-xs leading-relaxed", error ? "text-destructive" : "text-muted-foreground")}
        >
          {error ?? hint}
        </p>
      )}
    </div>
  );
}

const NOTICE_STYLES = {
  info: { box: "border-blue-200 bg-blue-50 text-blue-900", icon: Info, iconClass: "text-blue-600" },
  warning: { box: "border-amber-300 bg-amber-50 text-amber-900", icon: TriangleAlert, iconClass: "text-amber-600" },
  danger: { box: "border-red-200 bg-red-50 text-red-900", icon: OctagonAlert, iconClass: "text-red-600" },
} as const;

/** An inline assumption, warning or validation message. */
export function LabNotice({
  tone = "info",
  title,
  children,
  className,
}: {
  tone?: keyof typeof NOTICE_STYLES;
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const style = NOTICE_STYLES[tone];
  const Icon = style.icon;
  return (
    <div
      role={tone === "info" ? "note" : "alert"}
      className={cn("flex gap-2.5 rounded-xl border px-3.5 py-3 text-sm leading-relaxed", style.box, className)}
    >
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", style.iconClass)} />
      <div className="min-w-0">
        {title && <p className="font-semibold">{title}</p>}
        <div>{children}</div>
      </div>
    </div>
  );
}
