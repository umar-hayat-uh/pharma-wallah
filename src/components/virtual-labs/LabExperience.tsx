"use client";

/**
 * One lab, start to finish: briefing + mode choice → the immersive lab → assessment →
 * results.
 *
 * 2026-10-21 upgrade (docs/virtual-labs/UPGRADE_PLAN.md): the lab is a fixed, full-viewport
 * layer (no site header, footer or margins) with the 3D room as the whole background. The
 * experiment is done on the equipment: selecting an instrument in the room opens ITS
 * controller, and the run machine refuses any action from an instrument that is not open.
 * There is no step-card bench any more — the objectives list only reports progress derived
 * from the experiment state.
 *
 * Accessibility routes kept: keyboard picking in the room (Q to cycle, E to operate), and
 * the 2D lab (a bench plan of buttons standing in for the room) for no-WebGL devices and
 * anyone who chooses it. Both still go through the same instrument controllers.
 */
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useReducer, useRef, useState, type ComponentType } from "react";
import { usePathname } from "next/navigation";
import type { LabId } from "@/lib/virtual-labs/catalog";
import type { ControllerDef, ExperimentDefinition, LabMode } from "@/lib/virtual-labs/engine/types";
import { controllerForEquipment, createRun, currentStepId, finalReport, reduceRun, stepsDone, HINT_CAP, HINT_COST, type Run, type RunAction } from "@/lib/virtual-labs/engine/machine";
import { defaultQuality, markCompleted, markStarted, saveQuality, type QualityPref } from "@/lib/virtual-labs/progress";
import { useTracker } from "@/hooks/useTracker";
import { Briefing } from "./interface/Briefing";
import { ProcedurePanel } from "./interface/ProcedurePanel";
import { EquipmentPanel } from "./interface/EquipmentPanel";
import { ObservationSheet } from "./interface/ObservationSheet";
import { Assessment } from "./interface/Assessment";
import { LabResults } from "./interface/LabResults";
import { ControlGuide, Dialog, FeedbackLine, InteractionPrompt, TouchPad } from "./interface/Overlays";
import { ControllerDock, InfoCard, NextPrompt, TopBar } from "./interface/LabChrome";
import { ControlProvider } from "./interface/controls";
import { Btn } from "./interface/ui";
import type { BenchProps } from "./benches/types";
import { webglAvailable } from "./webgl";
import type { Insets } from "./three/types";
import "./virtual-labs.css";

const Viewport = dynamic(() => import("./Viewport"), { ssr: false, loading: () => <ViewportLoading progress={0.1} /> });

type Phase = "briefing" | "lab" | "assessment" | "results";
type DialogId = "help" | "menu" | "notebook" | "exit" | null;

export const QUALITY_LABEL: Record<QualityPref, string> = { low: "Low", medium: "Balanced", high: "High" };

export interface LabExperienceProps<S, A> {
  labId: LabId;
  def: ExperimentDefinition<S, A>;
  /** Controller id → its panel. One per `def.controllers` entry. */
  controls: Record<string, ComponentType<BenchProps<S, A>>>;
  visual(s: S, extra: { flowing: boolean }): unknown;
}

const isDesktop = () => typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches;

function fullscreenSupported() {
  const d = document as Document & { webkitFullscreenEnabled?: boolean };
  return !!(d.fullscreenEnabled || d.webkitFullscreenEnabled);
}
function fullscreenElement() {
  const d = document as Document & { webkitFullscreenElement?: Element | null };
  return d.fullscreenElement ?? d.webkitFullscreenElement ?? null;
}
/** Must run inside a user gesture. Resolves false when the browser refuses — never assumed to succeed. */
async function requestFullscreen(): Promise<boolean> {
  const el = document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> | void };
  try {
    if (el.requestFullscreen) await el.requestFullscreen({ navigationUI: "hide" });
    else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
    else return false;
    return true;
  } catch {
    return false;
  }
}
function exitFullscreen() {
  const d = document as Document & { webkitExitFullscreen?: () => void };
  if (!fullscreenElement()) return;
  try {
    if (d.exitFullscreen) void d.exitFullscreen().catch(() => undefined);
    else d.webkitExitFullscreen?.();
  } catch {
    /* already out */
  }
}

export function LabExperience<S, A>({ labId, def, controls, visual }: LabExperienceProps<S, A>) {
  const pathname = usePathname();
  const { trackActivity, trackQuiz } = useTracker();
  const reducer = useCallback((r: Run<S>, m: RunAction<A>) => reduceRun(def, r, m), [def]);
  const [run, dispatch] = useReducer(reducer, 1, (seed) => createRun(def, seed));
  const [phase, setPhase] = useState<Phase>("briefing");
  const [started, setStarted] = useState(false);
  const [use3D, setUse3D] = useState(true);
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [quality, setQuality] = useState<QualityPref>("medium");
  const [qualityAuto, setQualityAuto] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const [infoId, setInfoId] = useState<string | null>(null);
  const [focusCmd, setFocusCmd] = useState<{ n: number; id: string | null } | null>(null);
  const [resetCmd, setResetCmd] = useState(0);
  const [move, setMove] = useState({ x: 0, z: 0 });
  const [flowing, setFlowing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [error3D, setError3D] = useState<string | null>(null);
  const [dialog, setDialog] = useState<DialogId>(null);
  const [touch, setTouch] = useState(false);
  const [objectivesOpen, setObjectivesOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [fs, setFs] = useState<boolean | null>(null);
  const [hidden, setHidden] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [insets, setInsets] = useState<Insets>({ top: 0, right: 0, bottom: 0, left: 0 });
  const [highlight2D, setHighlight2D] = useState<string | null>(null);
  const cmdN = useRef(0);
  const reported = useRef(false);
  const topRef = useRef<HTMLDivElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const objRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ok = webglAvailable();
    setWebgl(ok);
    setUse3D(ok);
    const q = defaultQuality();
    setQuality(q.quality);
    setQualityAuto(!q.saved);
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    setTouch(window.matchMedia("(pointer: coarse)").matches);
    setFs(fullscreenSupported() ? false : null);
    setObjectivesOpen(isDesktop());
  }, []);

  const stepId = currentStepId(def, run.s);
  const step = def.steps.find((x) => x.id === stepId)!;
  const benchDone = def.benchComplete(run.s);
  const learning = run.mode === "learning";
  const equipmentNames = useMemo(() => Object.fromEntries(def.equipment.map((e) => [e.id, e.name])), [def]);
  const controllerById = useMemo(() => Object.fromEntries(def.controllers.map((c) => [c.id, c])), [def]);
  const act = useCallback((action: A) => dispatch({ type: "act", action }), []);
  const done = useCallback((id: string) => def.stepComplete(run.s, id), [def, run.s]);
  const vis = useMemo(() => visual(run.s, { flowing }), [visual, run.s, flowing]);
  const inspected = (run.s as unknown as { inspected?: string[] }).inspected ?? [];
  const active: ControllerDef | null = run.active ? controllerById[run.active] ?? null : null;
  const suggestion = learning ? def.suggest(run.s) : null;
  const nextUninspected = stepId === "inspect" ? step.focus.find((id) => !inspected.includes(id)) ?? null : null;

  // Learning: chevrons over what to use next. Practical: nothing is marked — finding the
  // equipment is part of the test.
  const markers = useMemo(() => {
    if (!learning) return [];
    if (nextUninspected) return step.focus.filter((id) => !inspected.includes(id));
    if (suggestion) return [controllerById[suggestion.controller]?.equipment[0]].filter(Boolean) as string[];
    return step.focus;
  }, [learning, nextUninspected, suggestion, controllerById, step, inspected]);

  const focus = useCallback((id: string | null) => {
    cmdN.current += 1;
    setFocusCmd({ n: cmdN.current, id });
  }, []);

  /** "Show me" — moves the camera (or highlights the 2D tile). Never selects or operates. */
  const showMe = useCallback(
    (id: string) => {
      if (use3D && !error3D) focus(id);
      else {
        setHighlight2D(id);
        document.getElementById(`vl-eq-${id}`)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    },
    [use3D, error3D, focus],
  );

  const start = useCallback(
    (mode: LabMode, threeD: boolean) => {
      const url = new URL(window.location.href);
      const fromUrl = Number(url.searchParams.get("seed"));
      const seed = Number.isInteger(fromUrl) && fromUrl > 0 ? fromUrl : Math.floor(Math.random() * 900000) + 100000;
      dispatch({ type: "reset", seed, silent: true, mode });
      setUse3D(threeD);
      setInfoId(null);
      setCollapsed(false);
      setPhase("lab");
      setStarted(true);
      reported.current = false;
      markStarted(labId);
      trackActivity({ type: "virtual-lab", label: `Opened: ${def.meta.experimentTitle} (virtual lab, ${mode} mode)`, href: pathname });
      // Phones lose a third of the screen to browser chrome; ask for full screen while we
      // still hold the user's tap. Refusal (or no support, e.g. iPhone Safari) is fine —
      // the lab already fills the window.
      if (window.matchMedia("(pointer: coarse)").matches && fullscreenSupported()) void requestFullscreen();
    },
    [def, labId, pathname, trackActivity],
  );

  const select = useCallback(
    (id: string) => {
      if (def.equipment.some((e) => e.id === id)) dispatch({ type: "act", action: { type: "inspect", id } as unknown as A });
      dispatch({ type: "operate", equipment: id });
      const c = controllerForEquipment(def, id);
      setInfoId(c ? null : id);
      setCollapsed(false);
      setHighlight2D(null);
      if (use3D) focus(id);
    },
    [def, focus, use3D],
  );

  const closeController = useCallback(() => {
    dispatch({ type: "operate", equipment: null });
    setInfoId(null);
    setFlowing(false);
    focus(null);
  }, [focus]);

  // Walking away from a close-up (Esc, WASD, the pad) puts the instrument down.
  const onFocusChange = useCallback((id: string | null) => {
    setFocused(id);
    if (id === null) {
      dispatch({ type: "operate", equipment: null });
      setFlowing(false);
    }
  }, []);

  // ── the immersive layer: scroll lock, fullscreen state, backgrounding ──
  useEffect(() => {
    if (phase !== "lab") return;
    const html = document.documentElement;
    const prev = { overflow: html.style.overflow, overscroll: html.style.overscrollBehavior };
    html.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";
    return () => {
      html.style.overflow = prev.overflow;
      html.style.overscrollBehavior = prev.overscroll;
    };
  }, [phase]);

  // Leaving the lab unmounts (and disposes) the renderer; coming back builds a new one, so
  // the view state must start over too — otherwise the loader is skipped and the pad shows
  // over an empty canvas.
  useEffect(() => {
    if (phase === "lab") return;
    if (fullscreenElement()) exitFullscreen();
    setReady(false);
    setProgress(0);
    setFocused(null);
    setHovered(null);
    setMove({ x: 0, z: 0 });
  }, [phase]);

  useEffect(() => {
    const on = () => setFs((f) => (f === null ? null : !!fullscreenElement()));
    document.addEventListener("fullscreenchange", on);
    document.addEventListener("webkitfullscreenchange", on);
    return () => {
      document.removeEventListener("fullscreenchange", on);
      document.removeEventListener("webkitfullscreenchange", on);
    };
  }, []);

  // Backgrounded → stop rendering and show the pause menu; it resumes when closed.
  useEffect(() => {
    if (phase !== "lab") return;
    const on = () => {
      if (document.visibilityState === "hidden") {
        setHidden(true);
        setDialog((d) => d ?? "menu");
        setMove({ x: 0, z: 0 });
        setFlowing(false);
      } else setHidden(false);
    };
    document.addEventListener("visibilitychange", on);
    return () => document.removeEventListener("visibilitychange", on);
  }, [phase]);

  useEffect(() => {
    if (phase !== "lab") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !dialog && run.active && !focused) closeController();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, dialog, run.active, focused, closeController]);

  // What the panels cover, so the camera centres the scene in what is still visible.
  useEffect(() => {
    if (phase !== "lab") return;
    const measure = () => {
      const desk = isDesktop();
      const top = topRef.current?.offsetHeight ?? 0;
      const dock = dockRef.current;
      const obj = objRef.current;
      setInsets({
        top,
        left: desk && obj ? obj.offsetWidth + 12 : 0,
        right: desk && dock ? dock.offsetWidth + 12 : 0,
        bottom: !desk && dock ? dock.offsetHeight : 0,
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    for (const el of [topRef.current, dockRef.current, objRef.current]) if (el) ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [phase, run.active, objectivesOpen, collapsed, infoId]);

  // Submission → results, recorded once.
  useEffect(() => {
    if (!run.submitted || reported.current) return;
    reported.current = true;
    const r = finalReport(def, run);
    markCompleted(labId, { overall: r.overall, grade: r.grade, technique: r.technique, assessment: r.assessment.percent });
    trackQuiz({ quizId: `virtual-lab:${labId}`, subject: def.meta.disciplineLabel, score: r.assessment.correct, total: r.assessment.total });
    trackActivity({ type: "virtual-lab", label: `Completed: ${def.meta.experimentTitle} — ${r.grade} (technique ${r.technique}%, ${r.assessed ? "Practical" : "Learning"})`, href: pathname });
    setPhase("results");
    window.scrollTo({ top: 0 });
  }, [run, def, labId, pathname, trackActivity, trackQuiz]);

  // Feedback toasts clear themselves; mistakes (which carry an explanation) stay longer.
  const [toast, setToast] = useState(run.last);
  useEffect(() => {
    setToast(run.last);
    if (!run.last.length) return;
    const t = window.setTimeout(() => setToast([]), run.last.some((f) => f.mistake || f.kind === "error") ? 9000 : 4000);
    return () => window.clearTimeout(t);
  }, [run.last]);
  useEffect(() => {
    if (!notice) return;
    const t = window.setTimeout(() => setNotice(null), 6000);
    return () => window.clearTimeout(t);
  }, [notice]);

  const changeQuality = (q: QualityPref) => {
    setQuality(q);
    setQualityAuto(false);
    saveQuality(q);
    setReady(false);
    setProgress(0);
  };

  /** One automatic step down, once, if the first measured second is very slow. */
  const onSlow = useCallback(() => {
    if (!qualityAuto || quality === "low") return;
    setQuality("low");
    setQualityAuto(false);
    setReady(false);
    setProgress(0);
    setNotice("This device was drawing the lab slowly, so graphics were set to Low. Change it in the menu.");
  }, [qualityAuto, quality]);

  const toggleFullscreen = async () => {
    if (fullscreenElement()) exitFullscreen();
    else if (!(await requestFullscreen())) setNotice("This browser did not allow full screen. The lab still fills the window.");
  };

  if (phase === "briefing")
    return (
      <Briefing
        def={def as ExperimentDefinition<unknown, unknown>}
        webgl={webgl}
        onStart={start}
        resume={started && !run.submitted ? { mode: run.mode, done: stepsDone(def, run.s), total: def.steps.length, onResume: () => setPhase("lab") } : null}
      />
    );
  if (phase === "results") return <LabResults meta={def.meta} report={finalReport(def, run)} seed={run.seed} onRetry={(mode) => start(mode ?? run.mode, use3D)} />;
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

  const Control = active ? controls[active.id] : null;
  const nearby = active ? (active.nearby ?? []).filter((id) => run.operated.includes(id)).map((id) => controllerById[id]).filter(Boolean) : [];
  const benchProps: BenchProps<S, A> = { s: run.s, act, stepId, done, onFlow: setFlowing };
  const info = infoId ? def.equipment.find((e) => e.id === infoId) : null;
  const threeD = use3D && !error3D;

  // Learning mode's next pointer.
  let next: { label: string; target: string } | null = null;
  if (learning && !benchDone) {
    if (nextUninspected) next = { label: `find and select the ${equipmentNames[nextUninspected] ?? nextUninspected}`, target: nextUninspected };
    else if (suggestion && suggestion.controller !== run.active) {
      const c = controllerById[suggestion.controller];
      if (c) next = { label: `open the ${c.name.toLowerCase()}`, target: c.equipment[0] };
    }
  }

  return (
    <div className="pw-vlab vl-immersive fixed inset-0 z-[70] overflow-hidden bg-[#e9eff4] text-[#16181d]" role="main" aria-label={`${def.meta.experimentTitle} — virtual lab`}>
      {/* the room fills the screen */}
      <div className="absolute inset-0">
        {threeD ? (
          <>
            <Viewport
              labId={labId}
              quality={quality}
              reducedMotion={reducedMotion}
              visual={vis}
              highlight={markers}
              focusCmd={focusCmd}
              resetCmd={resetCmd}
              move={move}
              insets={insets}
              paused={hidden}
              onHover={setHovered}
              onSelect={select}
              onFocusChange={onFocusChange}
              onError={(m) => setError3D(m)}
              onReady={() => setReady(true)}
              onProgress={setProgress}
              onSlow={onSlow}
            />
            {!ready && <ViewportLoading progress={progress} />}
          </>
        ) : (
          <Room2D def={def} inspected={inspected} activeEquipment={active?.equipment ?? []} highlight={highlight2D ?? (learning ? markers[0] ?? null : null)} onSelect={select} error={error3D} insets={insets} onRetry3D={webgl ? () => { setError3D(null); setUse3D(true); setQuality("low"); } : undefined} />
        )}
      </div>

      <TopBar
        ref={topRef}
        title={def.meta.experimentTitle}
        mode={run.mode}
        done={stepsDone(def, run.s)}
        total={def.steps.length}
        objective={learning ? step.title : null}
        objectivesOpen={objectivesOpen}
        fullscreen={fs}
        onExit={() => setDialog("exit")}
        onObjectives={() => setObjectivesOpen((o) => !o)}
        onNotebook={() => setDialog("notebook")}
        onHelp={() => setDialog("help")}
        onMenu={() => setDialog("menu")}
        onFullscreen={toggleFullscreen}
      />

      {/* objectives: a side card on desktop, a drop-down sheet on phones */}
      {objectivesOpen && (
        <aside ref={objRef} aria-label="Objectives" className="vl-scroll pointer-events-auto absolute left-2 right-2 z-30 max-h-[60%] overflow-y-auto rounded-2xl border border-[#16181d]/10 bg-white p-2 shadow-lg lg:bottom-3 lg:left-3 lg:right-auto lg:max-h-none lg:w-[300px] lg:shadow-sm" style={{ top: insets.top + 6 }}>
          <div className="mb-1 flex items-center justify-between px-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#4a4f57]">{learning ? "Procedure" : "Objectives"}</p>
            <button type="button" className="rounded-lg px-2 py-1 text-xs font-semibold text-brandBlue hover:bg-brandBlue/5 lg:hidden" onClick={() => setObjectivesOpen(false)}>Done</button>
          </div>
          <ProcedurePanel def={def} run={run} stepId={stepId} mode={run.mode} onHint={(s) => dispatch({ type: "hint", stepId: s })} equipmentNames={equipmentNames} inspected={inspected} onShow={(id) => { showMe(id); if (!isDesktop()) setObjectivesOpen(false); }} />
        </aside>
      )}

      {/* prompts along the top centre */}
      <div className="pointer-events-none absolute inset-x-2 z-10 flex flex-col items-center gap-1.5" style={{ top: insets.top + 6, left: insets.left + 8, right: insets.right + 8 }}>
        {next && !objectivesOpen && <NextPrompt label={next.label} onShow={() => showMe(next!.target)} />}
        {threeD && !active && <InteractionPrompt label={hovered ? equipmentNames[hovered] ?? hovered : null} focused={focused && !active ? equipmentNames[focused] ?? focused : null} onExitFocus={() => focus(null)} touch={touch} />}
        {benchDone && (
          <div className="pointer-events-auto flex items-center gap-2 rounded-2xl border border-brandGreen/40 bg-white px-3 py-2 shadow-sm">
            <p className="text-sm font-semibold text-[#0f5c3e]">Bench work complete.</p>
            <Btn variant="primary" size="sm" onClick={() => { closeController(); setPhase("assessment"); window.scrollTo({ top: 0 }); }}>Assessment →</Btn>
          </div>
        )}
      </div>

      {/* the open instrument */}
      {active && Control && (
        <ControllerDock
          ref={dockRef}
          controller={active}
          mode={run.mode}
          nearby={nearby}
          collapsed={collapsed}
          canUndo={run.past.length > 0}
          onCollapse={setCollapsed}
          onClose={closeController}
          onNearby={(c) => select(c.equipment[0])}
          onUndo={() => dispatch({ type: "undo" })}
        >
          <ControlProvider mode={run.mode} suggested={suggestion && suggestion.controller === active.id ? suggestion.action : null}>
            <Control {...benchProps} />
          </ControlProvider>
        </ControllerDock>
      )}
      {info && !active && (
        <div className="pointer-events-none absolute inset-x-2 bottom-3 z-20 flex justify-center lg:inset-x-auto lg:right-3" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
          <InfoCard name={info.name} use={info.use} spec={info.spec} safety={info.safety} onClose={() => { setInfoId(null); focus(null); }} />
        </div>
      )}

      {/* walking pad on touch screens, whenever no instrument is in hand */}
      {threeD && touch && ready && !active && !focused && !info && <TouchPad onMove={(x, z) => setMove({ x, z })} />}

      {/* feedback from the last action */}
      <div className="pointer-events-none absolute inset-x-2 z-40 flex flex-col items-center gap-1.5" style={{ bottom: Math.max(12, insets.bottom + 8), left: insets.left + 8, right: insets.right + 8 }}>
        {notice && <p className="pointer-events-auto max-w-xl rounded-2xl border border-[#16181d]/10 bg-white px-3 py-2 text-sm shadow-sm">{notice}</p>}
        {toast.length > 0 && (
          <button type="button" className="pointer-events-auto block max-w-2xl text-left" onClick={() => setToast([])} aria-label="Dismiss message">
            <FeedbackLine feedback={toast} inline />
          </button>
        )}
      </div>

      {dialog === "help" && (
        <Dialog title="Help and theory" onClose={() => setDialog(null)}>
          <ControlGuide touch={touch} mode={run.mode} />
          <details className="mt-4 rounded-2xl border border-[#16181d]/10 p-3 text-sm" open={learning}>
            <summary className="cursor-pointer font-semibold">Principle</summary>
            <div className="mt-2 space-y-2 text-[#3a3f47]">{def.principle.map((p) => <p key={p}>{p}</p>)}</div>
          </details>
          <details className="mt-2 rounded-2xl border border-amber-200 bg-amber-50/60 p-3 text-sm">
            <summary className="cursor-pointer font-semibold">Safety</summary>
            <ul className="vl-bullets mt-2 space-y-1 text-[#3a3f47]">{def.safety.map((s) => <li key={s}>{s}</li>)}</ul>
          </details>
          <details className="mt-2 rounded-2xl border border-[#16181d]/10 p-3 text-sm">
            <summary className="cursor-pointer font-semibold">Equipment guide</summary>
            <div className="mt-2">
              <EquipmentPanel equipment={def.equipment} selected={null} inspected={inspected} onSelect={(id) => { setDialog(null); showMe(id); }} actionLabel="Show me" />
            </div>
          </details>
        </Dialog>
      )}
      {dialog === "notebook" && (
        <Dialog title="Notebook" onClose={() => setDialog(null)}>
          <p className="mb-3 text-xs text-[#4a4f57]">What you have recorded so far, and the lab's log. To calculate or conclude, open the lab notebook on the bench.</p>
          <ObservationSheet sections={def.observations(run.s)} log={run.log} />
        </Dialog>
      )}
      {dialog === "exit" && (
        <Dialog title="Leave the lab?" onClose={() => setDialog(null)}>
          <p className="text-sm text-[#3a3f47]">Your bench is kept while this page stays open — you can come back to it from the briefing.</p>
          <div className="mt-4 grid gap-2">
            <Btn variant="primary" onClick={() => setDialog(null)}>Stay in the lab</Btn>
            <Btn onClick={() => { setDialog(null); closeController(); setPhase("briefing"); }}>Back to the briefing</Btn>
            <a href="/virtual-labs" className="inline-flex min-h-11 items-center justify-center rounded-xl font-semibold text-brandBlue hover:bg-brandBlue/5">Exit to all labs</a>
          </div>
        </Dialog>
      )}
      {dialog === "menu" && (
        <Dialog title={hidden ? "Paused" : "Paused — settings"} onClose={() => setDialog(null)}>
          <div className="grid gap-4">
            <Btn variant="primary" onClick={() => setDialog(null)}>Resume</Btn>

            <section className="space-y-2">
              <p className="text-sm font-bold">Mode</p>
              <p className="text-sm text-[#3a3f47]">
                You are in <strong>{learning ? "Learning" : "Practical"}</strong> mode.{" "}
                {learning
                  ? run.actions > 0
                    ? "Practical mode is assessed, so it starts from a fresh bench — your guided work cannot count towards it."
                    : "You have not started yet, so you can switch to Practical now."
                  : `Switching to Learning keeps your bench but turns this run into practice (it will not be marked as an assessed Practical). Hints in Practical cost ${HINT_COST} marks each, up to ${HINT_CAP}.`}
              </p>
              {learning ? (
                run.actions > 0 ? (
                  <Btn onClick={() => { setDialog(null); start("practical", use3D); }}>Restart in Practical mode</Btn>
                ) : (
                  <Btn onClick={() => { dispatch({ type: "mode", mode: "practical" }); setDialog(null); }}>Switch to Practical</Btn>
                )
              ) : (
                <Btn onClick={() => { dispatch({ type: "mode", mode: "learning" }); setDialog(null); }}>Switch to Learning (practice)</Btn>
              )}
            </section>

            {threeD && (
              <section className="space-y-2">
                <p className="text-sm font-bold">Graphics</p>
                <div className="grid grid-cols-3 gap-1.5" role="group" aria-label="Graphics quality">
                  {(["low", "medium", "high"] as const).map((q) => (
                    <Btn key={q} size="sm" variant={quality === q ? "soft" : "secondary"} onClick={() => changeQuality(q)} aria-pressed={quality === q}>
                      {QUALITY_LABEL[q]}
                    </Btn>
                  ))}
                </div>
                <p className="text-xs text-[#4a4f57]">Low: fastest, no shadows. Balanced: sharp on phones and laptops. High: more detail where the device allows.</p>
                <Btn size="sm" variant="ghost" onClick={() => { setResetCmd((n) => n + 1); setDialog(null); }}>Reset the view</Btn>
              </section>
            )}

            <section className="grid gap-2">
              <Btn onClick={() => dispatch({ type: "undo" })} disabled={run.past.length === 0}>Undo last action</Btn>
              <Btn onClick={() => { setDialog(null); closeController(); setUse3D((x) => !x); setError3D(null); }}>{threeD ? "Switch to the 2D lab" : "Switch to the 3D lab"}</Btn>
              <Btn variant="danger" onClick={() => { setDialog(null); start(run.mode, use3D); }}>Reset the experiment</Btn>
              <a href="/virtual-labs" className="inline-flex min-h-11 items-center justify-center rounded-xl font-semibold text-brandBlue hover:bg-brandBlue/5">Exit to all labs</a>
            </section>
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

/**
 * The 2D lab: a bench plan where every piece of equipment is a button. Selecting one opens
 * the same instrument controller the 3D room opens — it is an alternative way to reach the
 * equipment (no WebGL, screen readers), not a way around it.
 */
function Room2D<S, A>({ def, inspected, activeEquipment, highlight, onSelect, error, insets, onRetry3D }: { def: ExperimentDefinition<S, A>; inspected: string[]; activeEquipment: string[]; highlight: string | null; onSelect(id: string): void; error: string | null; insets: Insets; onRetry3D?: () => void }) {
  return (
    <div className="vl-scroll absolute inset-0 overflow-y-auto px-3" style={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 16, paddingLeft: insets.left + 12, paddingRight: insets.right + 12 }}>
      {error && (
        <div className="mb-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
          <p className="font-semibold">3D view unavailable</p>
          <p className="mt-1">{error} The 2D lab below works the same way: select a piece of equipment to operate it.</p>
          {onRetry3D && <Btn size="sm" className="mt-2" onClick={onRetry3D}>Try 3D again at Low quality</Btn>}
        </div>
      )}
      <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[#4a4f57]">2D lab — {def.meta.labName}</p>
      <ul className="vl-list grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
        {def.equipment.map((e) => {
          const on = activeEquipment.includes(e.id);
          const hl = highlight === e.id;
          return (
            <li key={e.id}>
              <button id={`vl-eq-${e.id}`} type="button" onClick={() => onSelect(e.id)} aria-pressed={on} className={`flex h-full min-h-[4.5rem] w-full flex-col items-start rounded-2xl border p-3 text-left text-sm transition ${on ? "border-brandBlue bg-white shadow-sm" : hl ? "border-brandGreen bg-white ring-2 ring-brandGreen/40" : "border-[#16181d]/10 bg-white/85 hover:border-brandBlue/40"}`}>
                <span className="font-semibold text-[#16181d]">{e.name}</span>
                <span className="mt-1 text-xs text-[#4a4f57]">{on ? "in use" : inspected.includes(e.id) ? "✓ inspected — select to use" : "select to inspect"}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
