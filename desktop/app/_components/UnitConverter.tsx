"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, ArrowRightLeft } from "lucide-react";
import { NumberField, SelectField } from "@/components/calculators";
import { formatSig } from "@/components/calculators/lab-math";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel } from "./parts";
import { toolHref, toolName } from "../_data/catalog";
import {
  LINEAR_FAMILIES,
  MOLAR_UNITS,
  TEMPERATURE_UNITS,
  convertLinear,
  convertTemperature,
  isBelowAbsoluteZero,
  molarToPercent,
  percentToMolar,
  type MolarUnit,
  type TemperatureUnit,
} from "../_data/units";

/**
 * The quick converter (spec §10).
 *
 * Built on the shared calculator kit's own field components, so it validates,
 * labels and formats exactly like the 104 calculators do — and on the kit's own
 * conversion factors, so it can never disagree with them.
 *
 * Validation follows the kit's rule (spec §15): an empty or non-numeric field
 * produces a message, never a silent NaN, and an impossible value (a
 * temperature below absolute zero, a molar mass of zero) is refused with a
 * reason rather than shown as Infinity.
 */
export function UnitConverter() {
  return (
    <div className="mx-auto w-full max-w-5xl px-8 py-8">
      <PageHeader
        eyebrow="Conversions"
        title="Unit conversions"
        lead="The bench conversions, without opening a calculator. The mass, volume and amount factors here are the ones the calculators themselves use, so the two can never disagree."
      />

      <div className="space-y-5">
        {LINEAR_FAMILIES.map((family) => (
          <LinearCard key={family.id} familyId={family.id} />
        ))}
        <TemperatureCard />
        <PercentMolarCard />
      </div>

      <Panel className="mt-8 bg-muted/40">
        <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-foreground">
          Going further
        </h2>
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
          Ratio strengths, milliequivalents and density-based weight/volume each have a full
          calculator of their own, with worked steps and their own reference tables. This page
          deliberately does not reimplement them.
        </p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {[
            "StrengthConversionCalculator",
            "ElectrolyteConversionCalculator",
            "DensityConversionCalculator",
            "TemperatureConversionCalculator",
            "MassConversionCalculator",
            "VolumeConversionCalculator",
          ].map((slug) => (
            <li key={slug}>
              <Link
                href={toolHref(slug)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {toolName(slug)}
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}

/** Shared frame so every converter card reads identically. */
function ConverterCard({
  title,
  note,
  children,
  result,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
  result: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border/80 bg-card p-5">
      <h2 className="flex items-center gap-2.5 text-[15px] font-semibold tracking-[-0.01em] text-foreground">
        <span className="h-3.5 w-[3px] rounded-full bg-primary" aria-hidden="true" />
        {title}
      </h2>
      {note && <p className="mt-1 pl-[13px] text-[12.5px] leading-relaxed text-muted-foreground">{note}</p>}

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-end">
        {children}
      </div>

      <p className="mt-4 border-t border-border/70 pt-3.5 text-[15px]" aria-live="polite">
        {result}
      </p>
    </section>
  );
}

function Swap({ onClick }: { onClick: () => void }) {
  return (
    <div className="flex justify-center lg:pb-1.5">
      <Button type="button" variant="outline" size="icon" onClick={onClick} aria-label="Swap units">
        <ArrowRightLeft />
      </Button>
    </div>
  );
}

function LinearCard({ familyId }: { familyId: string }) {
  const family = LINEAR_FAMILIES.find((candidate) => candidate.id === familyId)!;
  const unitNames = useMemo(() => Object.keys(family.units), [family]);

  const [value, setValue] = useState("");
  const [from, setFrom] = useState(unitNames[1] ?? unitNames[0]);
  const [to, setTo] = useState(unitNames[Math.min(2, unitNames.length - 1)]);

  const parsed = value.trim() === "" ? null : Number(value.trim());
  const invalid = value.trim() !== "" && !Number.isFinite(parsed);
  const converted = parsed !== null && !invalid ? convertLinear(family, parsed, from, to) : null;

  return (
    <ConverterCard
      title={family.label}
      note={family.note}
      result={
        value.trim() === "" ? (
          <span className="text-muted-foreground">Enter a value to convert.</span>
        ) : invalid ? (
          <span className="font-medium text-destructive">
            “{value.trim()}” is not a number. Enter digits only, e.g. 250.
          </span>
        ) : converted === null ? (
          <span className="font-medium text-destructive">Those units cannot be converted.</span>
        ) : (
          <span className="font-semibold tabular-nums text-foreground">
            {formatSig(parsed as number, 6)} {from} = {formatSig(converted, 6)} {to}
          </span>
        )
      }
    >
      <NumberField
        label={`Value in ${from}`}
        value={value}
        onChange={setValue}
        placeholder="0"
        error={invalid ? "Enter a number." : undefined}
      />
      <Swap
        onClick={() => {
          setFrom(to);
          setTo(from);
        }}
      />
      <div className="grid grid-cols-2 gap-3">
        <SelectField label="From" value={from} onChange={setFrom} options={unitNames} />
        <SelectField label="To" value={to} onChange={setTo} options={unitNames} />
      </div>
    </ConverterCard>
  );
}

function TemperatureCard() {
  const [value, setValue] = useState("");
  const [from, setFrom] = useState<TemperatureUnit>("°C");
  const [to, setTo] = useState<TemperatureUnit>("°F");

  const parsed = value.trim() === "" ? null : Number(value.trim());
  const invalid = value.trim() !== "" && !Number.isFinite(parsed);
  const impossible = parsed !== null && !invalid && isBelowAbsoluteZero(parsed, from);
  const converted =
    parsed !== null && !invalid && !impossible ? convertTemperature(parsed, from, to) : null;

  return (
    <ConverterCard
      title="Temperature"
      note="Temperature has an offset, so it is not a multiplying factor — it cannot share a table with the ladders above."
      result={
        value.trim() === "" ? (
          <span className="text-muted-foreground">Enter a temperature to convert.</span>
        ) : invalid ? (
          <span className="font-medium text-destructive">
            “{value.trim()}” is not a number.
          </span>
        ) : impossible ? (
          <span className="font-medium text-destructive">
            That is below absolute zero (−273.15 °C), so it is not a temperature.
          </span>
        ) : (
          <span className="font-semibold tabular-nums text-foreground">
            {formatSig(parsed as number, 6)} {from} = {formatSig(converted as number, 6)} {to}
          </span>
        )
      }
    >
      <NumberField
        label={`Temperature in ${from}`}
        value={value}
        onChange={setValue}
        placeholder="25"
        error={invalid ? "Enter a number." : undefined}
      />
      <Swap
        onClick={() => {
          setFrom(to);
          setTo(from);
        }}
      />
      <div className="grid grid-cols-2 gap-3">
        <SelectField
          label="From"
          value={from}
          onChange={(next) => setFrom(next as TemperatureUnit)}
          options={[...TEMPERATURE_UNITS]}
        />
        <SelectField
          label="To"
          value={to}
          onChange={(next) => setTo(next as TemperatureUnit)}
          options={[...TEMPERATURE_UNITS]}
        />
      </div>
    </ConverterCard>
  );
}

function PercentMolarCard() {
  const [percent, setPercent] = useState("");
  const [molar, setMolar] = useState("");
  const [mass, setMass] = useState("");
  const [unit, setUnit] = useState<MolarUnit>("mM");
  const [direction, setDirection] = useState<"toMolar" | "toPercent">("toMolar");

  const source = direction === "toMolar" ? percent : molar;
  const parsedSource = source.trim() === "" ? null : Number(source.trim());
  const sourceInvalid = source.trim() !== "" && !Number.isFinite(parsedSource);

  const parsedMass = mass.trim() === "" ? null : Number(mass.trim());
  const massInvalid = mass.trim() !== "" && (!Number.isFinite(parsedMass) || (parsedMass as number) <= 0);

  const answer =
    parsedSource === null || sourceInvalid || parsedMass === null || massInvalid
      ? null
      : direction === "toMolar"
        ? percentToMolar(parsedSource, parsedMass, unit)
        : molarToPercent(parsedSource, unit, parsedMass);

  return (
    <ConverterCard
      title="Percentage ↔ molarity"
      note="Needs a molar mass: 1% w/v is 10 g/L, so molarity = 10 × % ÷ molar mass. Look a molar mass up in Pharmaceutical values, or compute one from a formula with the Molecular Weight Finder."
      result={
        source.trim() === "" || mass.trim() === "" ? (
          <span className="text-muted-foreground">
            Enter {direction === "toMolar" ? "a percentage" : "a molarity"} and the molar mass.
          </span>
        ) : sourceInvalid ? (
          <span className="font-medium text-destructive">That value is not a number.</span>
        ) : massInvalid ? (
          <span className="font-medium text-destructive">
            The molar mass must be a number greater than zero.
          </span>
        ) : answer === null ? (
          <span className="font-medium text-destructive">That conversion cannot be made.</span>
        ) : direction === "toMolar" ? (
          <span className="font-semibold tabular-nums text-foreground">
            {formatSig(parsedSource as number, 6)} % w/v = {formatSig(answer, 6)} {unit}
          </span>
        ) : (
          <span className="font-semibold tabular-nums text-foreground">
            {formatSig(parsedSource as number, 6)} {unit} = {formatSig(answer, 6)} % w/v
          </span>
        )
      }
    >
      {direction === "toMolar" ? (
        <NumberField
          label="Concentration (% w/v)"
          value={percent}
          onChange={setPercent}
          unit="%"
          placeholder="0.9"
          error={sourceInvalid ? "Enter a number." : undefined}
        />
      ) : (
        <NumberField
          label={`Concentration (${unit})`}
          value={molar}
          onChange={setMolar}
          placeholder="154"
          error={sourceInvalid ? "Enter a number." : undefined}
        />
      )}

      <Swap onClick={() => setDirection(direction === "toMolar" ? "toPercent" : "toMolar")} />

      <div className="grid grid-cols-2 gap-3">
        <NumberField
          label="Molar mass"
          value={mass}
          onChange={setMass}
          unit="g/mol"
          placeholder="58.44"
          error={massInvalid ? "Must be greater than 0." : undefined}
        />
        <SelectField
          label="Molar unit"
          value={unit}
          onChange={(next) => setUnit(next as MolarUnit)}
          options={[...MOLAR_UNITS]}
        />
      </div>
    </ConverterCard>
  );
}
