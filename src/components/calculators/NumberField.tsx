"use client";

import { useId } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type UnitOption = { value: string; label?: string };

/**
 * A labelled numeric input, optionally with a unit selector beside it.
 *
 * `inputMode="decimal"` matters more than it looks: it gives Android a numeric
 * keypad instead of the full QWERTY keyboard, which is the difference between a
 * calculator that is pleasant to use one-handed in a lab and one that is not.
 * The type stays "number" for step/validation semantics.
 */
export function NumberField({
  label,
  value,
  onChange,
  unit,
  units,
  onUnitChange,
  hint,
  error,
  placeholder,
  step = "any",
  min,
  max,
  disabled,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** Static unit shown as a suffix, when there is nothing to switch between. */
  unit?: string;
  /** Switchable units. When provided, renders a select and ignores `unit`. */
  units?: (string | UnitOption)[];
  onUnitChange?: (value: string) => void;
  hint?: string;
  error?: string;
  placeholder?: string;
  step?: string | number;
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
}) {
  const id = useId();
  const normalisedUnits = units?.map((u) => (typeof u === "string" ? { value: u } : u));

  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            id={id}
            type="number"
            inputMode="decimal"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            step={step}
            min={min}
            max={max}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            aria-describedby={hint || error ? `${id}-desc` : undefined}
            className={cn(
              unit && !normalisedUnits && "pr-14",
              error && "border-destructive focus-visible:ring-destructive",
            )}
          />
          {unit && !normalisedUnits && (
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              {unit}
            </span>
          )}
        </div>

        {normalisedUnits && normalisedUnits.length > 0 && (
          <SelectField
            aria-label={`${label} unit`}
            value={normalisedUnits.find((u) => u.value === unit)?.value ?? normalisedUnits[0].value}
            onChange={(next) => onUnitChange?.(next)}
            options={normalisedUnits}
            disabled={disabled}
            className="w-28 shrink-0"
          />
        )}
      </div>

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

/**
 * A styled NATIVE <select>.
 *
 * Deliberately not shadcn's Radix Select: on Android the native control opens
 * the OS picker, works with the phone's accessibility settings, needs no
 * JavaScript, and adds no dependency to a bundle that ships inside an APK.
 */
export function SelectField({
  label,
  value,
  onChange,
  options,
  hint,
  disabled,
  className,
  ...rest
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: (string | UnitOption)[];
  hint?: string;
  disabled?: boolean;
  className?: string;
} & Omit<React.ComponentProps<"select">, "value" | "onChange" | "className">) {
  const id = useId();
  const normalised = options.map((o) => (typeof o === "string" ? { value: o } : o));

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "flex h-12 w-full appearance-none rounded-xl border border-input bg-background px-3.5 text-base",
          "bg-[length:1.25rem] bg-[right_0.65rem_center] bg-no-repeat pr-9",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
        style={{
          // Inline so the chevron survives without adding a plugin or an asset
          // that would need to be bundled into the APK.
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")",
        }}
        {...rest}
      >
        {normalised.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label ?? option.value}
          </option>
        ))}
      </select>
      {hint && <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p>}
    </div>
  );
}
