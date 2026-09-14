"use client";

import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { FileDown, Minus, Play, Plus, RotateCcw, Syringe, Wand2 } from "lucide-react";
import {
  CalculatorShell,
  CalcSection,
  FieldGrid,
  NumberField,
  ResultCard,
  FormulaNote,
  Formula,
  CalcAbout,
  CalcList,
  CalcFaq,
  AdSlot,
  LabActions,
  LabNotice,
  TextField,
  fieldError,
  IS_MOBILE_APP,
} from "@/components/calculators";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  PRESETS,
  autoPlanShortfall,
  computeChain,
  fmt,
  fmtConc,
  fmtUg,
  isWithinTolerance,
  parseDoseInputs,
  parseStepEdit,
  planAutoSteps,
  round4,
  type DilutionStep,
  type DoseInputs,
  type WorkedPreset,
} from "./_math";
import { buildReport, buildWarnings, signed, sourceName } from "./_report";
import { downloadProtocolPdf } from "./_pdf";
import { BenchRack } from "./_BenchRack";
import { useBenchMotion } from "./_useBenchMotion";

/*
 * SERIAL DOSE CALCULATOR — tablet → stock → tube chain → syringe.
 *
 * Redesigned on the calculator kit (2026-09-14). The maths lives in _math.ts,
 * copied unchanged from the original page and checked number-for-number
 * against it; this file is layout and state only. The bench rack
 * (_BenchRack.tsx) is the page's one signature moment, with GSAP motion loaded
 * lazily in _useBenchMotion.ts.
 */

const DEFAULTS: DoseInputs & { drugName: string; animalSubject: string } = {
  drugName: "Carprofen",
  animalSubject: "C57BL/6 Mouse (25g)",
  adultDose: "25",
  dissolveVol: "10",
  targetDose: "0.009",
  deliverVol: "0.1",
  aliquotDefault: "1",
};

export default function SerialDoseCalculator() {
  const [adultDose, setAdultDose] = useState(DEFAULTS.adultDose);
  const [dissolveVol, setDissolveVol] = useState(DEFAULTS.dissolveVol);
  const [targetDose, setTargetDose] = useState(DEFAULTS.targetDose);
  const [deliverVol, setDeliverVol] = useState(DEFAULTS.deliverVol);
  const [aliquotDefault, setAliquotDefault] = useState(DEFAULTS.aliquotDefault);
  const [drugName, setDrugName] = useState(DEFAULTS.drugName);
  const [animalSubject, setAnimalSubject] = useState(DEFAULTS.animalSubject);
  // null = follow the auto-plan; an array once the student edits any tube.
  const [customSteps, setCustomSteps] = useState<DilutionStep[] | null>(null);
  const [pdfStatus, setPdfStatus] = useState<"" | "working" | "failed">("");

  const raw: DoseInputs = { adultDose, dissolveVol, targetDose, deliverVol, aliquotDefault };
  const p = parseDoseInputs(raw);

  const autoSteps = useMemo(
    () => planAutoSteps(p),
    // `p` is rebuilt every render; these are the values planAutoSteps reads.
    [p.inputsValid, p.totalFactorNeeded, p.nAliquot],
  );
  const steps = customSteps ?? autoSteps;
  const isCustomized = customSteps !== null;

  const chain = useMemo(
    () => computeChain(p, steps),
    [p.inputsValid, p.c0, p.nDissolve, steps, p.nDeliver, p.nTarget, p.totalFactorNeeded],
  );

  const withinTolerance = isWithinTolerance(chain);
  const stockTooDilute = p.inputsValid && p.totalFactorNeeded > 0 && p.totalFactorNeeded < 1;
  // Only the auto-plan can run out of tubes; an edited chain is the student's own.
  const shortfall = !isCustomized && p.inputsValid && p.totalFactorNeeded >= 1 ? autoPlanShortfall(p.totalFactorNeeded) : 1;

  const warnings = useMemo(
    () => buildWarnings(p, chain, { withinTolerance, stockTooDilute, shortfall }),
    [chain, withinTolerance, stockTooDilute, shortfall, p.nTarget],
  );

  const report = useMemo(
    () => (chain ? buildReport(raw, { drugName, animalSubject }, p, chain, withinTolerance, warnings) : null),
    [chain, drugName, animalSubject, withinTolerance, warnings, adultDose, dissolveVol, targetDose, deliverVol, aliquotDefault],
  );

  /* ─── Step editing (same rules as the original page) ──────────────────── */

  const updateStep = useCallback(
    (id: string, field: "aliquot" | "addDiluent", value: string) => {
      const base = customSteps ?? autoSteps;
      const parsed = parseStepEdit(value);
      setCustomSteps(base.map((s) => (s.id === id ? { ...s, [field]: parsed } : s)));
    },
    [customSteps, autoSteps],
  );

  const addStep = useCallback(() => {
    const base = customSteps ?? autoSteps;
    const nextNum = base.length + 1;
    setCustomSteps([
      ...base,
      { id: `step-${nextNum}-${Date.now()}`, stepNumber: nextNum, aliquot: p.nAliquot, addDiluent: round4(p.nAliquot * 9) },
    ]);
  }, [customSteps, autoSteps, p.nAliquot]);

  const removeStep = useCallback(
    (id: string) => {
      const base = customSteps ?? autoSteps;
      if (base.length <= 1) return;
      setCustomSteps(base.filter((s) => s.id !== id).map((s, idx) => ({ ...s, stepNumber: idx + 1 })));
    },
    [customSteps, autoSteps],
  );

  const loadPreset = (ex: WorkedPreset) => {
    setDrugName(ex.drug);
    setAdultDose(ex.adultDose);
    setDissolveVol(ex.dissolveVol);
    setTargetDose(ex.targetDose);
    setDeliverVol(ex.deliverVol);
    setCustomSteps(null);
  };

  const handleReset = () => {
    setDrugName(DEFAULTS.drugName);
    setAnimalSubject(DEFAULTS.animalSubject);
    setAdultDose(DEFAULTS.adultDose);
    setDissolveVol(DEFAULTS.dissolveVol);
    setTargetDose(DEFAULTS.targetDose);
    setDeliverVol(DEFAULTS.deliverVol);
    setAliquotDefault(DEFAULTS.aliquotDefault);
    setCustomSteps(null);
  };

  const handlePdf = async () => {
    if (!chain) return;
    setPdfStatus("working");
    try {
      await downloadProtocolPdf({ drugName, animalSubject }, p, chain, steps.length, withinTolerance);
      setPdfStatus("");
    } catch (err) {
      console.error("PDF download failed:", err);
      setPdfStatus("failed");
    }
  };

  /* ─── Motion ───────────────────────────────────────────────────────────── */

  const rackRef = useRef<HTMLDivElement>(null);
  const signature = chain
    ? `${chain.rows.map((r) => `${r.aliquot}/${r.newTotalVol}`).join("|")}>${p.nDeliver}`
    : "";
  const motion = useBenchMotion(rackRef, signature);

  // A tube the student adds slides in; a re-plan from typing does not.
  const listRef = useRef<HTMLDivElement>(null);
  const lastAdded = useRef<string | null>(null);
  useEffect(() => {
    if (!lastAdded.current) return;
    motion.enter(listRef.current?.querySelector(`[data-step-id^="${lastAdded.current}"]`) ?? null);
    lastAdded.current = null;
  }, [steps, motion]);

  const activePreset = PRESETS.find(
    (ex) =>
      ex.adultDose === adultDose && ex.dissolveVol === dissolveVol && ex.targetDose === targetDose && ex.deliverVol === deliverVol,
  );

  const lastTube = steps.length;

  return (
    <CalculatorShell
      title="Serial Dose Calculator"
      subtitle="Turn a human tablet into a dose small enough for a mouse or a rat: dissolve it, dilute it tube by tube, and draw the exact volume into the syringe."
      icon={Syringe}
      eyebrow="Pharmacology"
      aside={
        <>
          <CalcAbout title="About serial dosing">
            <p>
              A 25 mg carprofen tablet holds nearly <strong>3,000 times</strong> the 9 µg a mouse needs. No balance weighs
              9 µg reliably, so the tablet is dissolved into a stock and diluted in measurable steps until the volume you
              can draw into a syringe carries exactly the dose.
            </p>
            <CalcList
              title="Use it when"
              items={[
                "The animal dose is micrograms but the only form you have is a tablet or a weighed solid",
                "You need a written bench protocol — tube, transfer, diluent — to follow and tick off in the lab",
                "You want to check a chain you planned yourself: edit any tube and see the dose it would really deliver",
              ]}
            />
            <CalcList
              tone="caution"
              title="What it does not do"
              items={[
                "It does not convert a human dose to an animal dose — work out the mg dose first (by body weight or surface area)",
                "It assumes the tablet dissolves completely and evenly; filler, coating or poor solubility lowers the real stock",
                "The ±5% check is this tool's accuracy band, not a regulatory limit. Pipetting error adds up down the chain",
              ]}
            />
          </CalcAbout>
          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
        </>
      }
    >
      {/* ─── The answer ─────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <ResultCard
          label="Dose in the syringe"
          value={chain ? fmt(chain.doseDelivered, 5) : null}
          unit="mg"
          tone={chain ? (withinTolerance ? "success" : "warning") : "neutral"}
          interpretation={
            chain
              ? `${fmtUg(chain.doseDelivered)} · ${signed(chain.doseError)}% vs the ${fmtConc(p.nTarget)} mg target — ${
                  withinTolerance ? "within ±5%" : "adjust the volumes"
                }`
              : undefined
          }
          empty="Enter the tablet dose, the dissolving volume, the animal's dose and the syringe volume."
        />

        {chain && (
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <Figure label="Stock C₀" value={fmtConc(p.c0)} unit="mg/mL" />
            <Figure label="Syringe C" value={fmtConc(p.requiredFinalConc)} unit="mg/mL" />
            <Figure label="Dilution" value={`1:${fmt(p.totalFactorNeeded, 1)}×`} unit={`${lastTube} ${lastTube === 1 ? "tube" : "tubes"}`} />
          </div>
        )}
      </div>

      {/* ─── Inputs ─────────────────────────────────────────────────────── */}
      <CalcSection title="Dose parameters" description="Every value updates the chain as you type.">
        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Worked examples</p>
            <Button variant="ghost" size="sm" onClick={handleReset} className="-mr-2 text-muted-foreground">
              <RotateCcw />
              Reset
            </Button>
          </div>
          <div className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0">
            {PRESETS.map((ex) => {
              const active = ex === activePreset;
              return (
                <button
                  key={ex.label}
                  type="button"
                  aria-pressed={active}
                  onClick={() => loadPreset(ex)}
                  className={cn(
                    "group min-w-[13.5rem] snap-start rounded-xl border px-3.5 py-2.5 text-left transition-[border-color,background-color,box-shadow] duration-300 ease-out-expo sm:min-w-0",
                    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/15",
                    active
                      ? "border-primary/60 bg-primary/[0.06] shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.35)]"
                      : "border-border bg-background hover:border-foreground/25",
                  )}
                >
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-semibold tracking-[-0.01em] text-foreground">{ex.drug}</span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{ex.label}</span>
                  </span>
                  <span className="mt-0.5 block text-xs tabular-nums text-muted-foreground">{ex.sub.replace(/ ml\b/g, " mL")}</span>
                </button>
              );
            })}
          </div>
        </div>

        <FieldGrid>
          <TextField label="Compound / drug" value={drugName} onChange={setDrugName} placeholder="e.g. Carprofen" />
          <TextField label="Animal model" value={animalSubject} onChange={setAnimalSubject} placeholder="e.g. Mouse (25 g)" />
        </FieldGrid>

        <FieldGrid>
          <NumberField
            label="Tablet dose"
            value={adultDose}
            onChange={setAdultDose}
            unit="mg"
            hint="The drug in the whole tablet or solid you dissolve."
            error={fieldError(adultDose, { show: true })}
          />
          <NumberField
            label="Dissolved in"
            value={dissolveVol}
            onChange={setDissolveVol}
            unit="mL"
            hint="Volume of diluent for the stock (Tube 0)."
            error={fieldError(dissolveVol, { show: true })}
          />
          <NumberField
            label="Target dose for the animal"
            value={targetDose}
            onChange={setTargetDose}
            unit="mg"
            hint={p.nTarget > 0 ? `= ${fmtUg(p.nTarget)}` : "The dose one animal receives."}
            error={fieldError(targetDose, { show: true })}
          />
          <NumberField
            label="Syringe volume"
            value={deliverVol}
            onChange={setDeliverVol}
            unit="mL"
            hint="The volume you will inject."
            error={fieldError(deliverVol, { show: true })}
          />
        </FieldGrid>

        <NumberField
          label="Default transfer (aliquot)"
          value={aliquotDefault}
          onChange={setAliquotDefault}
          unit="mL"
          hint="Moved from each tube to the next when the plan is made. Empty or 0 uses 1 mL."
          error={fieldError(aliquotDefault, { show: false, allowZero: true, required: false })}
          className="sm:max-w-[calc(50%-0.5rem)]"
        />
      </CalcSection>

      {/* ─── The bench ──────────────────────────────────────────────────── */}
      <CalcSection
        title="Bench plan"
        description={
          isCustomized
            ? "Your edited chain. Every tube's concentration and the syringe dose follow your volumes."
            : "Planned in 1:10 steps with the last step making up the remainder. Edit any volume to take over."
        }
      >
        {!chain ? (
          <p className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
            Enter valid dose values to lay out the tubes.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2">
              {isCustomized ? (
                <>
                  <Badge variant="warning">Edited by you</Badge>
                  <Button variant="outline" size="sm" onClick={() => setCustomSteps(null)}>
                    <Wand2 />
                    Back to auto-plan
                  </Button>
                </>
              ) : (
                <Badge variant="secondary">Auto-plan</Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={motion.play}
                disabled={!motion.ready}
                className="ml-auto text-muted-foreground motion-reduce:hidden"
              >
                <Play />
                Replay
              </Button>
            </div>

            <BenchRack ref={rackRef} chain={chain} deliverVol={p.nDeliver} withinTolerance={withinTolerance} />

            {warnings.map((w) => (
              <LabNotice key={w} tone="warning">
                {w}
              </LabNotice>
            ))}

            <div ref={listRef} role="list" aria-label="Bench steps" className="overflow-hidden rounded-xl border">
              <StepShell index="0" title="Stock solution" tag="Tube 0">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Dissolve <strong className="font-semibold text-foreground">{fmt(p.nAdult)} mg</strong> in{" "}
                  <strong className="font-semibold text-foreground">{fmt(p.nDissolve)} mL</strong> of diluent.
                </p>
                <ConcLine conc={p.c0} label="C₀" />
              </StepShell>

              {chain.rows
                .filter((r) => r.kind === "dilute")
                .map((r, i) => {
                  const step = steps[i];
                  return (
                    <StepShell
                      key={r.id}
                      id={r.id}
                      index={String(r.stepNumber)}
                      title={`Tube ${r.stepNumber}`}
                      tag={`1:${fmt(r.dilutionFactor, 1)}×`}
                      action={
                        steps.length > 1 ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeStep(r.id)}
                            aria-label={`Remove tube ${r.stepNumber}`}
                            className="-my-1.5 -mr-2 h-9 w-9 text-muted-foreground hover:text-destructive"
                          >
                            <Minus />
                          </Button>
                        ) : null
                      }
                    >
                      <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        <VolumeInput
                          label={`Take from ${sourceName(r.stepNumber)}`}
                          value={step?.aliquot ?? r.aliquot}
                          onChange={(v) => updateStep(r.id, "aliquot", v)}
                        />
                        <VolumeInput
                          label="Add diluent"
                          value={step?.addDiluent ?? r.addDiluent}
                          onChange={(v) => updateStep(r.id, "addDiluent", v)}
                        />
                      </div>
                      <ConcLine conc={r.conc} label="C" total={r.newTotalVol} />
                    </StepShell>
                  );
                })}

              <StepShell index="✓" title="Into the syringe" tag={`${fmt(p.nDeliver)} mL`} final ok={withinTolerance}>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Draw exactly <strong className="font-semibold text-foreground">{fmt(p.nDeliver)} mL</strong> from{" "}
                  {lastTube === 0 ? "the stock" : `Tube ${lastTube}`} into a sterile precision syringe.
                </p>
                <div className="grid grid-cols-1 gap-1.5 text-sm sm:grid-cols-3 sm:gap-2">
                  <MiniStat label="Delivered" value={`${fmt(chain.doseDelivered, 5)} mg`} sub={fmtUg(chain.doseDelivered)} />
                  <MiniStat label="Target" value={`${fmt(p.nTarget)} mg`} sub={fmtUg(p.nTarget)} />
                  <MiniStat
                    label="Match"
                    value={`${signed(chain.doseError)}%`}
                    sub={withinTolerance ? "Within ±5%" : "Adjust volumes"}
                    tone={withinTolerance ? "ok" : "warn"}
                  />
                </div>
              </StepShell>
            </div>

            <Button
              variant="outline"
              onClick={() => {
                lastAdded.current = `step-${steps.length + 1}-`;
                addStep();
              }}
              className="w-full border-dashed sm:w-auto"
            >
              <Plus />
              Add a tube
            </Button>
          </>
        )}
      </CalcSection>

      {/* ─── Record ─────────────────────────────────────────────────────── */}
      <LabActions report={report} onReset={handleReset} fileName={`${(drugName || "serial-dose").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-protocol`}>
        {!IS_MOBILE_APP && (
          <Button variant="outline" disabled={!chain || pdfStatus === "working"} onClick={handlePdf}>
            <FileDown />
            {pdfStatus === "working" ? "Preparing PDF…" : "Bench sheet PDF"}
          </Button>
        )}
      </LabActions>
      {pdfStatus === "failed" && (
        <LabNotice tone="danger">The PDF could not be generated. Use Print and choose &ldquo;Save as PDF&rdquo; instead.</LabNotice>
      )}

      <FormulaNote title="Working">
        {chain ? (
          <>
            <Formula>
              C₀ = {fmt(p.nAdult)} mg ÷ {fmt(p.nDissolve)} mL = {fmtConc(p.c0)} mg/mL
            </Formula>
            <Formula>
              C(syringe) = {fmt(p.nTarget)} mg ÷ {fmt(p.nDeliver)} mL = {fmtConc(p.requiredFinalConc)} mg/mL
            </Formula>
            <Formula>
              Dilution needed = {fmtConc(p.c0)} ÷ {fmtConc(p.requiredFinalConc)} = 1:{fmt(p.totalFactorNeeded, 1)}×
            </Formula>
            {chain.rows
              .filter((r) => r.kind === "dilute")
              .map((r) => (
                <Formula key={r.id}>
                  Tube {r.stepNumber}: {fmtConc(r.prevConc)} × {fmt(r.aliquot)} ÷ ({fmt(r.aliquot)} + {fmt(r.addDiluent)}) ={" "}
                  {fmtConc(r.conc)} mg/mL
                </Formula>
              ))}
            <Formula>
              Dose = {fmtConc(chain.finalConc)} mg/mL × {fmt(p.nDeliver)} mL = {fmt(chain.doseDelivered, 5)} mg (
              {fmtUg(chain.doseDelivered)})
            </Formula>
          </>
        ) : (
          <p>Enter the dose parameters to see each step worked out.</p>
        )}
        <p>
          <strong className="text-foreground">The rules.</strong> Dilution law C₁V₁ = C₂V₂: stock concentration × volume
          taken = new concentration × total volume. Step dilution = total volume ÷ volume taken, so 1 mL into 9 mL of
          diluent is 1:10. Dose = final concentration × syringe volume; × 1000 turns mg into µg.
        </p>
        <p>
          <strong className="text-foreground">How the plan is made.</strong> While more than a 1:10 dilution remains, a
          tube takes the default transfer and makes it up ten-fold; the last tube makes up only what is left. Volumes are
          rounded to 4 decimal places, which is why a planned chain can land a hair off the target (35 µg shows as 34.999
          µg). The plan stops at six tubes.
        </p>
      </FormulaNote>

      <CalcFaq
        items={[
          {
            q: "Why not just weigh out the tiny dose?",
            a: "Because a 9 µg dose is far below what a lab balance can weigh accurately, and a fraction of a tablet is not evenly loaded with drug. Dissolving the whole tablet and diluting it in measured volumes turns an impossible weighing into a few ordinary pipetting steps.",
          },
          {
            q: "Why 1:10 steps?",
            a: "Ten-fold steps keep every transfer a comfortable, accurate volume (1 mL into 9 mL) and make each tube's concentration easy to check by eye. The final tube makes up only the remaining factor, so the syringe volume carries the exact dose.",
          },
          {
            q: "Can I change a tube's volumes?",
            a: "Yes. Edit the volume taken or the diluent in any tube and the whole chain — every later tube, the syringe dose and the ±5% check — recalculates from your numbers. \"Back to auto-plan\" discards your edits.",
          },
          {
            q: "What does the ±5% check mean?",
            a: "It compares the dose the syringe would actually deliver with the target you entered. Outside ±5%, the chain you have does not give the dose you asked for, usually because a tube's volumes were edited or the plan ran out of tubes.",
          },
          {
            q: "Where does the target dose come from?",
            a: "From the animal's mg/kg dose × its body weight, or a published animal dose. This calculator starts from that mg figure; it does not scale a human dose to an animal.",
          },
        ]}
      />
    </CalculatorShell>
  );
}

/* ─── Local pieces ───────────────────────────────────────────────────────── */

function Figure({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-border/80 bg-card px-3 py-2.5 sm:px-4 sm:py-3">
      <p className="truncate font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground sm:text-[10.5px]">
        {label}
      </p>
      <p className="mt-1 truncate text-base font-bold tabular-nums tracking-[-0.03em] text-foreground sm:text-xl">{value}</p>
      <p className="truncate font-mono text-[10.5px] text-muted-foreground">{unit}</p>
    </div>
  );
}

function StepShell({
  id,
  index,
  title,
  tag,
  action,
  final = false,
  ok = false,
  children,
}: {
  id?: string;
  index: string;
  title: string;
  tag: string;
  action?: React.ReactNode;
  final?: boolean;
  ok?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      role="listitem"
      data-step-id={id}
      className={cn("flex gap-3 border-b px-3.5 py-3.5 last:border-b-0 sm:gap-4 sm:px-4", final && "bg-muted/40")}
    >
      <span
        className={cn(
          "mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full font-mono text-xs font-semibold tabular-nums",
          final ? (ok ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900") : "bg-primary/10 text-primary",
        )}
        aria-hidden="true"
      >
        {index}
      </span>
      <div className="min-w-0 flex-1 space-y-2.5">
        <div className="flex items-center gap-2">
          <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-foreground">{title}</h3>
          <span className="rounded-md bg-foreground/[0.06] px-1.5 py-0.5 font-mono text-[10.5px] tabular-nums text-foreground/75">
            {tag}
          </span>
          <span className="ml-auto">{action}</span>
        </div>
        {children}
      </div>
    </div>
  );
}

function VolumeInput({ label, value, onChange }: { label: string; value: number | string; onChange: (v: string) => void }) {
  const id = useId();
  return (
    <div className="min-w-0 space-y-1">
      <label htmlFor={id} className="block truncate text-xs text-muted-foreground">
        {label}
      </label>
      <div className="relative">
        <Input
          id={id}
          type="number"
          inputMode="decimal"
          step="any"
          min={0}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 pr-10 text-[15px] font-medium"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-muted-foreground">mL</span>
      </div>
    </div>
  );
}

function ConcLine({ conc, label, total }: { conc: number; label: string; total?: number }) {
  return (
    <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
      <span className="text-muted-foreground">
        {label} = <strong className="font-semibold tabular-nums text-foreground">{fmtConc(conc)} mg/mL</strong>
      </span>
      {total !== undefined && (
        <span className="font-mono text-xs tabular-nums text-muted-foreground">total {fmt(total)} mL</span>
      )}
    </p>
  );
}

function MiniStat({ label, value, sub, tone }: { label: string; value: string; sub: string; tone?: "ok" | "warn" }) {
  return (
    <div
      className={cn(
        // A labelled row on a phone (three columns truncated the dose), a tile from sm.
        "flex min-w-0 items-baseline gap-2 rounded-lg border bg-background px-2.5 py-2 sm:block",
        tone === "ok" && "border-emerald-200 bg-emerald-50",
        tone === "warn" && "border-amber-300 bg-amber-50",
      )}
    >
      <p className="w-[4.75rem] shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground sm:w-auto">{label}</p>
      <p className="truncate font-semibold tabular-nums text-foreground">{value}</p>
      <p className={cn("ml-auto truncate text-xs sm:ml-0", tone === "ok" ? "text-emerald-800" : tone === "warn" ? "text-amber-900" : "text-muted-foreground")}>
        {sub}
      </p>
    </div>
  );
}
