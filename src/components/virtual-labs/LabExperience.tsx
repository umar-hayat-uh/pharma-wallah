"use client";

/**
 * One lab, start to finish: briefing → bench (3D room or 2D) → assessment → results.
 *
 * Experiment state lives in one reducer over the pure engine (lib/virtual-labs); the 3D
 * room only ever receives a derived "visual" object and reports clicks back. Every action
 * a student can take in the room is also a control in the Bench panel, so the experiment
 * is fully completable with a keyboard, a screen reader or without WebGL.
 */
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useReducer, useRef, useState, type ComponentType } from "react";
import { usePathname } from "next/navigation";
import { ClipboardList, FlaskConical, Info, ListChecks, Microscope, Monitor, Undo2, RotateCcw } from "lucide-react";
import type { LabId } from "@/lib/virtual-labs/catalog";
import type { ExperimentDefinition } from "@/lib/virtual-labs/engine/types";
import { createRun, currentStepId, finalReport, reduceRun, stepsDone, type Run, type RunAction } from "@/lib/virtual-labs/engine/machine";
import { defaultQuality, markCompleted, markStarted, saveQuality, type QualityPref } from "@/lib/virtual-labs/progress";
import { useTracker } from "@/hooks/useTracker";
import { Briefing } from "./interface/Briefing";
import { LabHUD } from "./interface/LabHUD";
import { ProcedurePanel } from "./interface/ProcedurePanel";
import { EquipmentPanel } from "./interface/EquipmentPanel";
import { ObservationSheet } from "./interface/ObservationSheet";
import { Assessment } from "./interface/Assessment";
import { LabResults } from "./interface/LabResults";
import { ControlGuide, Dialog, FeedbackLine, InteractionPrompt, MobileToast, TouchPad } from "./interface/Overlays";
import { Btn } from "./interface/ui";
import type { BenchProps } from "./benches/types";
import { webglAvailable } from "./webgl";
import "./virtual-labs.css";

const Viewport = dynamic(() => import("./Viewport"), { ssr: false, loading: () => <ViewportLoading progress={0.1} /> });

type Phase = "briefing" | "lab" | "assessment" | "results";
type Tab = "bench" | "steps" | "equipment" | "notebook" | "extra";

export interface LabExperienceProps<S, A> {
  labId: LabId;
  def: ExperimentDefinition<S, A>;
  Bench: ComponentType<BenchProps<S, A>>;
  visual(s: S, extra: { flowing: boolean }): unknown;
  /** An optional instrument view (microscope eyepiece, graph) shown as its own tab. */
  extra?: { label: string; icon: "microscope" | "monitor"; Component: ComponentType<BenchProps<S, A>> };
}

export function LabExperience<S, A>({ labId, def, Bench, visual, extra }: LabExperienceProps<S, A>) {
  const pathname = usePathname();
  const { trackActivity, trackQuiz } = useTracker();
  const reducer = useCallback((r: Run<S>, m: RunAction<A>) => reduceRun(def, r, m), [def]);
  const [run, dispatch] = useReducer(reducer, 1, (seed) => createRun(def, seed));
  const [phase, setPhase] = useState<Phase>("briefing");
  const [use3D, setUse3D] = useState(true);
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [quality, setQuality] = useState<QualityPref>("medium");
  const [reducedMotion, setReducedMotion] = useState(false);
  const [mode, setMode] = useState<"guided" | "free">("guided");
  const [tab, setTab] = useState<Tab>("bench");
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const [focusCmd, setFocusCmd] = useState<{ n: number; id: string | null } | null>(null);
  const [resetCmd, setResetCmd] = useState(0);
  const [move, setMove] = useState({ x: 0, z: 0 });
  const [flowing, setFlowing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [error3D, setError3D] = useState<string | null>(null);
  const [dialog, setDialog] = useState<"help" | "pause" | null>(null);
  const [touch, setTouch] = useState(false);
  const cmdN = useRef(0);
  const reported = useRef(false);

  useEffect(() => {
    const ok = webglAvailable();
    setWebgl(ok);
    setUse3D(ok);
    setQuality(defaultQuality());
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    setTouch(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  const stepId = currentStepId(def, run.s);
  const step = def.steps.find((x) => x.id === stepId)!;
  const benchDone = def.benchComplete(run.s);
  const equipmentNames = useMemo(() => Object.fromEntries(def.equipment.map((e) => [e.id, e.name])), [def]);
  const act = useCallback((action: A) => dispatch({ type: "act", action }), []);
  const done = useCallback((id: string) => def.stepComplete(run.s, id), [def, run.s]);
  const vis = useMemo(() => visual(run.s, { flowing }), [visual, run.s, flowing]);
  const inspected = (run.s as unknown as { inspected?: string[] }).inspected ?? [];

  const focus = useCallback((id: string | null) => {
    cmdN.current += 1;
    setFocusCmd({ n: cmdN.current, id });
  }, []);

  const start = useCallback(
    (threeD: boolean, announce = false) => {
      const url = new URL(window.location.href);
      const fromUrl = Number(url.searchParams.get("seed"));
      const seed = Number.isInteger(fromUrl) && fromUrl > 0 ? fromUrl : Math.floor(Math.random() * 900000) + 100000;
      dispatch({ type: "reset", seed, silent: !announce });
      setUse3D(threeD);
      setPhase("lab");
      setTab("bench");
      reported.current = false;
      markStarted(labId);
      trackActivity({ type: "virtual-lab", label: `Opened: ${def.meta.experimentTitle} (virtual lab)`, href: pathname });
      window.scrollTo({ top: 0 });
    },
    [def, labId, pathname, trackActivity],
  );

  // Guided mode: the camera follows the procedure to the equipment each step uses.
  useEffect(() => {
    if (phase !== "lab" || !use3D || mode !== "guided" || !ready) return;
    // Inspection steps walk through what is still unseen; every other step frames its
    // main station (the first item listed for the step).
    const target = stepId === "inspect" ? step.focus.find((id) => !inspected.includes(id)) ?? step.focus[0] : step.focus[0];
    if (target) focus(target);
    // inspected changes on every selection; follow the STEP, not each click
  }, [stepId, mode, phase, use3D, ready]); // eslint-disable-line react-hooks/exhaustive-deps

  const select = useCallback(
    (id: string) => {
      setSelected(id);
      if (def.equipment.some((e) => e.id === id)) dispatch({ type: "act", action: { type: "inspect", id } as unknown as A });
      if (use3D) focus(id);
    },
    [def, focus, use3D],
  );

  // Submission → results, recorded once.
  useEffect(() => {
    if (!run.submitted || reported.current) return;
    reported.current = true;
    const r = finalReport(def, run);
    markCompleted(labId, { overall: r.overall, grade: r.grade, technique: r.technique, assessment: r.assessment.percent });
    trackQuiz({ quizId: `virtual-lab:${labId}`, subject: def.meta.disciplineLabel, score: r.assessment.correct, total: r.assessment.total });
    trackActivity({ type: "virtual-lab", label: `Completed: ${def.meta.experimentTitle} — ${r.grade} (technique ${r.technique}%)`, href: pathname });
    setPhase("results");
    window.scrollTo({ top: 0 });
  }, [run, def, labId, pathname, trackActivity, trackQuiz]);

  const changeQuality = (q: QualityPref) => {
    setQuality(q);
    saveQuality(q);
    setReady(false);
    setProgress(0);
  };

  if (phase === "briefing") return <Briefing def={def as ExperimentDefinition<unknown, unknown>} webgl={webgl} onStart={() => start(true)} onStart2D={() => start(false)} />;
  if (phase === "results") return <LabResults meta={def.meta} report={finalReport(def, run)} seed={run.seed} onRetry={() => start(use3D)} />;
  if (phase === "assessment")
    return (
      <div>
        <div className="vl-noprint mx-auto max-w-3xl px-4 pt-4 sm:px-6">
          <Btn size="sm" variant="ghost" onClick={() => setPhase("lab")}>← Back to the bench</Btn>
        </div>
        <Assessment def={def} run={run} onAnswer={(questionId, choice) => dispatch({ type: "answer", questionId, choice })} onSubmit={() => dispatch({ type: "submit" })} />
        {run.last.length > 0 && run.last[0].kind === "warn" && <p className="mx-auto max-w-3xl px-6 pb-6 text-sm text-amber-800">{run.last[0].text}</p>}
      </div>
    );

  const total = def.steps.length;
  const tabs: { id: Tab; label: string; Icon: typeof FlaskConical; mobileOnly?: boolean }[] = [
    { id: "steps", label: "Steps", Icon: ListChecks, mobileOnly: true },
    { id: "bench", label: "Bench", Icon: FlaskConical },
    ...(extra ? [{ id: "extra" as Tab, label: extra.label, Icon: extra.icon === "microscope" ? Microscope : Monitor }] : []),
    { id: "equipment", label: "Equipment", Icon: Info },
    { id: "notebook", label: "Notebook", Icon: ClipboardList },
  ];
  const benchProps: BenchProps<S, A> = { s: run.s, act, stepId, done, onFlow: setFlowing };
  const selectedEq = def.equipment.find((e) => e.id === selected);

  return (
    <div className="pw-vlab flex min-w-0 flex-col overflow-x-clip bg-[#f4f7fa] lg:h-[calc(100dvh-var(--calc-top-offset,5rem))] lg:min-h-[600px]">
      <LabHUD
        title={def.meta.experimentTitle}
        stepTitle={step.title}
        objective={step.objective}
        done={stepsDone(def, run.s)}
        total={total}
        stepNumber={def.steps.findIndex((x) => x.id === stepId) + 1}
        mode={mode}
        onMode={(m) => {
          setMode(m);
          if (m === "free") focus(null);
        }}
        quality={quality}
        onQuality={changeQuality}
        is3D={use3D}
        onResetView={() => setResetCmd((n) => n + 1)}
        onHelp={() => setDialog("help")}
        onPause={() => setDialog("pause")}
      />

      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(260px,300px)_minmax(0,1fr)_minmax(360px,420px)]">
        {/* procedure (desktop) */}
        <aside className="vl-scroll hidden min-h-0 min-w-0 overflow-y-auto border-r border-[#16181d]/10 bg-white p-3 lg:block" aria-label="Procedure">
          <ProcedurePanel def={def} run={run} stepId={stepId} onHint={(s) => dispatch({ type: "hint", stepId: s })} equipmentNames={equipmentNames} inspected={inspected} onFocus={select} />
        </aside>

        {/* the room */}
        <section className="relative h-[46vh] min-h-[300px] min-w-0 overflow-hidden bg-[#e9eff4] lg:h-auto" aria-label="Laboratory view">
          {use3D && !error3D ? (
            <>
              <Viewport
                labId={labId}
                quality={quality}
                reducedMotion={reducedMotion}
                visual={vis}
                highlight={step.focus}
                focusCmd={focusCmd}
                resetCmd={resetCmd}
                move={move}
                onHover={setHovered}
                onSelect={select}
                onFocusChange={setFocused}
                onError={(m) => setError3D(m)}
                onReady={() => setReady(true)}
                onProgress={setProgress}
              />
              {!ready && <ViewportLoading progress={progress} />}
              <InteractionPrompt label={hovered ? equipmentNames[hovered] ?? hovered : null} focused={focused ? equipmentNames[focused] ?? focused : null} onExitFocus={() => focus(null)} />
              {touch && mode === "free" && !focused && <TouchPad onMove={(x, z) => setMove({ x, z })} />}
            </>
          ) : (
            <Room2D def={def} selected={selected} inspected={inspected} onSelect={select} error={error3D} onRetry3D={webgl ? () => { setError3D(null); setUse3D(true); setQuality("low"); } : undefined} />
          )}
          {selectedEq && use3D && !error3D && (
            <div className="pointer-events-auto absolute bottom-16 right-3 hidden max-w-xs rounded-2xl border border-[#16181d]/10 bg-white/95 p-3 text-sm shadow-sm md:block">
              <p className="font-bold">{selectedEq.name}</p>
              <p className="mt-1 text-[#3a3f47]">{selectedEq.use}</p>
              <button type="button" className="mt-1 text-xs font-semibold text-brandBlue" onClick={() => setTab("equipment")}>Full details →</button>
            </div>
          )}
          <FeedbackLine feedback={run.last} />
        </section>

        {/* panels */}
        <aside className="flex min-h-0 min-w-0 flex-col border-l border-[#16181d]/10 bg-[#fbfcfd]" aria-label="Lab panels">
          <div role="tablist" aria-label="Panels" className="vl-scroll flex min-w-0 gap-1 overflow-x-auto border-b border-[#16181d]/10 bg-white px-2 pt-2">
            {tabs.map(({ id, label, Icon, mobileOnly }) => (
              <button key={id} role="tab" type="button" aria-selected={tab === id} onClick={() => setTab(id)} className={`${mobileOnly ? "lg:hidden" : ""} inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-t-lg border-b-2 px-3 text-sm font-semibold ${tab === id ? "border-brandBlue text-brandBlue" : "border-transparent text-[#4a4f57] hover:text-[#16181d]"}`}>
                <Icon className="h-4 w-4" aria-hidden />
                {label}
              </button>
            ))}
          </div>
          <div className="vl-scroll min-h-0 flex-1 overflow-y-auto p-3" role="tabpanel">
            {benchDone && (
              <div className="mb-3 rounded-2xl border border-brandGreen/40 bg-brandGreen/[0.07] p-3">
                <p className="text-sm font-semibold text-[#0f5c3e]">Bench work complete.</p>
                <Btn variant="primary" size="sm" className="mt-2" onClick={() => setPhase("assessment")}>Go to the assessment</Btn>
              </div>
            )}
            {tab === "steps" && <ProcedurePanel def={def} run={run} stepId={stepId} onHint={(s) => dispatch({ type: "hint", stepId: s })} equipmentNames={equipmentNames} inspected={inspected} onFocus={select} />}
            {tab === "bench" && stepId === "inspect" && (
              <div className="mb-3 rounded-2xl border border-brandBlue/30 bg-white p-3">
                <p className="mb-2 text-sm font-semibold">Inspect each item ({step.focus.filter((id) => inspected.includes(id)).length}/{step.focus.length})</p>
                <ul className="vl-list flex flex-wrap gap-1.5">
                  {step.focus.map((id) => (
                    <li key={id}>
                      <button type="button" onClick={() => select(id)} className={`min-h-9 rounded-full border px-3 text-xs font-medium ${inspected.includes(id) ? "border-brandGreen/40 bg-brandGreen/10 text-[#137a52]" : "border-[#16181d]/15 bg-white hover:border-brandBlue/50"}`}>
                        {inspected.includes(id) ? "✓ " : ""}
                        {equipmentNames[id] ?? id}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {tab === "bench" && <Bench {...benchProps} />}
            {tab === "extra" && extra && <extra.Component {...benchProps} />}
            {tab === "equipment" && <EquipmentPanel equipment={def.equipment} selected={focused ?? selected} inspected={inspected} onSelect={select} onClose={() => { setSelected(null); focus(null); }} />}
            {tab === "notebook" && <ObservationSheet sections={def.observations(run.s)} log={run.log} />}
            <div className="mt-4 flex flex-wrap gap-2 border-t border-[#16181d]/10 pt-3">
              <Btn size="sm" variant="ghost" onClick={() => dispatch({ type: "undo" })} disabled={run.past.length === 0}>
                <Undo2 className="h-4 w-4" aria-hidden />Undo
              </Btn>
              <Btn size="sm" variant="ghost" onClick={() => { if (window.confirm("Reset the whole experiment? Your progress in this run will be lost.")) start(use3D, true); }}>
                <RotateCcw className="h-4 w-4" aria-hidden />Reset experiment
              </Btn>
            </div>
          </div>
        </aside>
      </div>

      <MobileToast feedback={run.last} />
      {dialog === "help" && (
        <Dialog title="Controls and help" onClose={() => setDialog(null)}>
          <ControlGuide />
        </Dialog>
      )}
      {dialog === "pause" && (
        <Dialog title="Paused" onClose={() => setDialog(null)}>
          <p className="text-sm text-[#3a3f47]">Nothing in this lab runs on a clock, so take your time. Your bench is exactly as you left it.</p>
          <div className="mt-4 grid gap-2">
            <Btn variant="primary" onClick={() => setDialog(null)}>Resume</Btn>
            <Btn onClick={() => setDialog("help")}>Controls and help</Btn>
            {use3D && (
              <div className="grid grid-cols-3 gap-1.5" role="group" aria-label="Graphics quality">
                {(["low", "medium", "high"] as const).map((q) => (
                  <Btn key={q} size="sm" variant={quality === q ? "soft" : "secondary"} onClick={() => changeQuality(q)} aria-pressed={quality === q}>
                    {q[0].toUpperCase() + q.slice(1)}
                  </Btn>
                ))}
              </div>
            )}
            <Btn onClick={() => { setDialog(null); setUse3D((x) => !x); setError3D(null); }}>{use3D ? "Switch to the 2D lab" : "Switch to the 3D lab"}</Btn>
            <Btn variant="danger" onClick={() => { setDialog(null); start(use3D, true); }}>Reset the experiment</Btn>
            <a href="/virtual-labs" className="inline-flex min-h-11 items-center justify-center rounded-xl font-semibold text-brandBlue hover:bg-brandBlue/5">Exit to all labs</a>
          </div>
        </Dialog>
      )}
    </div>
  );
}

function ViewportLoading({ progress }: { progress: number }) {
  return (
    <div className="absolute inset-0 grid place-items-center bg-[#e9eff4]" role="status" aria-live="polite">
      <div className="w-56 text-center">
        <p className="text-sm font-semibold text-[#16181d]">Setting up the laboratory…</p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white">
          <div className="h-full rounded-full bg-brandBlue transition-[width]" style={{ width: `${Math.round(Math.max(0.08, progress) * 100)}%` }} />
        </div>
      </div>
    </div>
  );
}

/** The no-WebGL room: every piece of equipment as a button, laid out as a bench plan. */
function Room2D<S, A>({ def, selected, inspected, onSelect, error, onRetry3D }: { def: ExperimentDefinition<S, A>; selected: string | null; inspected: string[]; onSelect(id: string): void; error: string | null; onRetry3D?: () => void }) {
  return (
    <div className="vl-scroll absolute inset-0 overflow-y-auto p-4">
      {error && (
        <div className="mb-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
          <p className="font-semibold">3D view unavailable</p>
          <p className="mt-1">{error} The 2D lab below works the same way: every step is in the Bench panel.</p>
          {onRetry3D && <Btn size="sm" className="mt-2" onClick={onRetry3D}>Try 3D again at low quality</Btn>}
        </div>
      )}
      <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[#4a4f57]">2D lab — {def.meta.labName}</p>
      <ul className="vl-list grid grid-cols-2 gap-2 sm:grid-cols-3">
        {def.equipment.map((e) => (
          <li key={e.id}>
            <button type="button" onClick={() => onSelect(e.id)} aria-pressed={selected === e.id} className={`flex h-full min-h-[4.5rem] w-full flex-col items-start rounded-2xl border p-3 text-left text-sm transition ${selected === e.id ? "border-brandBlue bg-white shadow-sm" : "border-[#16181d]/10 bg-white/80 hover:border-brandBlue/40"}`}>
              <span className="font-semibold text-[#16181d]">{e.name}</span>
              <span className="mt-1 text-xs text-[#4a4f57]">{inspected.includes(e.id) ? "✓ inspected" : "select to inspect"}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
