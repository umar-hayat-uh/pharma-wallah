"use client";

// ============================================================
// Community Pharmacy Simulation Lab — the shell
// ============================================================
//
// Route: /pharmacy-counter
//
// Three zones, as a real counter has them: the patient side, the pharmacist's
// workstation, and the dispensing bench. The stage machine decides what is on
// the workstation screen; everything else stays where it is, so the student
// keeps their bearings while the task changes.
//
// The whole encounter is local state. Nothing a student enters leaves the
// browser: there is no API route, no AI call and no telemetry beyond the two
// progress rows written through `useTracker` (opened, completed), which is the
// same thing every other learning surface on the site records.

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import "./pharmacy.css";

import type { PanelId, Stage } from "./types";
import { PANELS, STAGE_COPY } from "./data/constants";
import { SCENARIOS } from "./data/scenarios";
import { useCounterMachine, batchExpiryFor, buildSubmission, STORAGE_KEY, PHARMACY_NAME, type CounterState } from "./useCounterMachine";
import { identifiedFindings, missedFindings } from "./engine/clinical";
import { renderDocumentation } from "./engine/scoring";

import { Dialog, Panel, PrimaryAction } from "./kit";
import { Bench, ControlDock, CounterHeader, MobileNav, MoreSheetContent, ReviewNoticeCard, StageRail, Toast } from "./Chrome";
import { HomeScreen } from "./HomeScreen";
import { Debrief } from "./Debrief";
import { StageView } from "./StageView";
import { PatientCard, PatientProfile, PatientRiskStrip, QueuePanel } from "./modules/PatientModule";
import { OrderSummary, PrescriptionViewer } from "./modules/PrescriptionModule";
import { DispensingTray, MedicineInspector } from "./modules/DispensingModule";
import { CalculatorPanel, DocumentationPanel, ExpiryDashboard, HelpPanel, InventoryPanel, PosPanel, ReferenceDesk } from "./modules/SupportModules";
import { CheckConsole } from "./modules/ChecksModule";
import { useTracker } from "@/hooks/useTracker";

export default function CommunityPharmacyLab({ today }: { today: string }) {
  const { state, dispatch, flow, progress, canAdvance, blockers, requiredUnits, stageIsComplete, stageIsUnlocked, stageIsSkipped } =
    useCounterMachine(today);
  const { trackActivity } = useTracker();
  const pathname = usePathname();

  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const [inspectId, setInspectId] = useState<string | null>(null);
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);

  // ── Persistence ──────────────────────────────────────────────────────────
  // Read once after mount, never during render: localStorage does not exist on
  // the server, and reading it in render would mismatch hydration.
  useEffect(() => {
    let payload: Record<string, unknown> = {};
    let session: CounterState | null = null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        payload = parsed.progress || {};
        session = parsed.session || null;
      }
    } catch {
      // A blocked or corrupt store is not an error worth showing anyone — the
      // pharmacy simply opens fresh.
    }
    dispatch({ type: "hydrate", payload: payload as never, today, session });
  }, [dispatch, today]);

  useEffect(() => {
    if (!state.hydrated) return;
    try {
      const session =
        state.screen === "counter" && state.scenario
          ? { ...state, savedSession: null, report: null, review: null, toast: null }
          : null;
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          progress: { version: 1, results: state.results, stock: state.stock, records: state.savedRecords, nextCaseNumber: state.nextCaseNumber },
          session,
        }),
      );
    } catch {
      // Private browsing, a full quota, or blocked site data. The simulation
      // works without persistence; it just forgets.
    }
  }, [state]);

  // Reading stages ("the patient has arrived", "here is the prescription")
  // complete by being looked at. Without this the very first primary action
  // does nothing but raise a review, because `arrival` never became complete.
  useEffect(() => {
    if (state.screen !== "counter") return;
    dispatch({ type: "see" });
  }, [state.screen, state.stage, dispatch]);

  // The site header is `position: fixed` and retracts on scroll-down by writing
  // `transform: translateY(-100%)` to its own style attribute. A sticky bar of
  // ours at top-0 would sit *under* it, and a fixed offset would leave a strip
  // of scrolling content above it once it retracts. So we follow it, the way
  // the calculator hub's rail does — observing the style attribute rather than
  // listening to scroll (it changes on toggle, not per frame).
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const header = document.querySelector<HTMLElement>("header.fixed.top-0");
    const root = rootRef.current;
    if (!header || !root) return;
    const apply = () => {
      const hidden = (header.style.transform || "").indexOf("-") !== -1;
      root.style.setProperty("--cph-top", hidden ? "0px" : `${header.offsetHeight}px`);
    };
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(header, { attributes: true, attributeFilter: ["style", "class"] });
    window.addEventListener("resize", apply);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", apply);
    };
    // Re-runs on the screen change: the counter screen is a different tree from
    // the home screen, so `rootRef` is null until the counter is actually
    // mounted and a mount-only effect would silently never attach.
  }, [state.screen]);

  // Toasts confirm an action ("14 tablets into the tray") and then get out of
  // the way. Without this they sat over the stage rail until dismissed.
  useEffect(() => {
    if (!state.toast) return;
    const timer = window.setTimeout(() => dispatch({ type: "dismiss-toast" }), 3500);
    return () => window.clearTimeout(timer);
  }, [state.toast, dispatch]);

  // ── Progress tracking ────────────────────────────────────────────────────
  const openedRef = useRef(false);
  useEffect(() => {
    if (openedRef.current) return;
    openedRef.current = true;
    trackActivity({ type: "simulation", label: "Opened: Community Pharmacy Simulation Lab", href: pathname });
  }, [trackActivity, pathname]);

  const reportedRef = useRef<number | null>(null);
  useEffect(() => {
    if (!state.report || !state.scenario) return;
    if (reportedRef.current === state.report.caseNumber) return;
    reportedRef.current = state.report.caseNumber;
    trackActivity({
      type: "simulation",
      label: `Completed: ${state.report.scenarioTitle} — ${state.report.overallPercent}% at the pharmacy counter`,
      href: pathname,
    });
  }, [state.report, state.scenario, trackActivity, pathname]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const setQuantity = useCallback((itemId: string, value: string) => {
    setQuantities((prev) => ({ ...prev, [itemId]: value }));
  }, []);

  // Prefill each item's quantity box with nothing — the student calculates it.
  // But once a case starts, clear anything left from the previous one.
  const caseKey = state.scenario ? `${state.scenario.templateId}-${state.scenario.caseNumber}` : "";
  const lastCaseKey = useRef(caseKey);
  useEffect(() => {
    if (lastCaseKey.current !== caseKey) {
      lastCaseKey.current = caseKey;
      setQuantities({});
    }
  }, [caseKey]);

  const openPanel = useCallback(
    (panel: PanelId | null) => {
      setMoreOpen(false);
      dispatch({ type: "open-panel", panel });
    },
    [dispatch],
  );

  const onOpenReference = useCallback(
    (medicineId: string) => {
      setReferenceId(medicineId);
      openPanel("references");
    },
    [openPanel],
  );

  const recordText = useMemo(
    () => (state.scenario ? renderDocumentation(buildSubmission(state, 0), PHARMACY_NAME).join("\n") : ""),
    [state],
  );

  const copyRecord = useCallback(() => {
    if (!recordText) return;
    try {
      navigator.clipboard.writeText(recordText);
    } catch {
      // Clipboard access can be refused; the record is on screen either way.
    }
  }, [recordText]);

  const printRecord = useCallback(() => {
    try {
      window.print();
    } catch {
      // Blocked in some embedded webviews; the record is on screen either way.
    }
  }, []);

  // ── Screens ──────────────────────────────────────────────────────────────

  if (state.screen === "home") {
    return (
      <div className="pw-cph min-h-screen">
        <HomeScreen
          results={state.results}
          nextCaseNumber={state.nextCaseNumber}
          resumable={state.savedSession}
          onResume={() => dispatch({ type: "resume" })}
          onDiscardSession={() => dispatch({ type: "discard-session" })}
          onStart={(templateId) => dispatch({ type: "start-case", templateId })}
          onDrill={(templateId, stage) => dispatch({ type: "drill", templateId, stage })}
          onOpenPanel={(panel) => openPanel(panel as PanelId)}
          onReset={() => dispatch({ type: "reset-progress" })}
        />
        {renderPanelDialog()}
      </div>
    );
  }

  if (state.screen === "debrief" && state.report && state.scenario) {
    const nextTemplate = SCENARIOS.find((s) => state.results.every((r) => r.templateId !== s.id));
    return (
      <div className="pw-cph min-h-screen">
        <Debrief
          report={state.report}
          scenario={state.scenario}
          identified={identifiedFindings(state.records, state.scenario.findings)}
          missed={missedFindings(state.records, state.scenario.findings)}
          dialogueAnswers={state.dialogue}
          drill={state.drill}
          onHome={() => dispatch({ type: "exit-case" })}
          onReplay={() => dispatch({ type: "start-case", templateId: state.scenario!.templateId })}
          onNext={() => nextTemplate && dispatch({ type: "start-case", templateId: nextTemplate.id })}
          hasNext={!!nextTemplate}
        />
      </div>
    );
  }

  const sc = state.scenario;
  if (!sc) return null;

  const copy = STAGE_COPY[state.stage];
  const waiting = SCENARIOS.filter((s) => s.id !== sc.templateId && state.results.every((r) => r.templateId !== s.id));

  return (
    <div className="pw-cph min-h-screen" ref={rootRef}>
      <CounterHeader
        caseNumber={sc.caseNumber}
        queueCount={waiting.length}
        progress={progress}
        title={sc.title}
        onExit={() => dispatch({ type: "exit-case" })}
        onHelp={() => openPanel("help")}
      />

      <div className="cph-page mx-auto w-full max-w-[1400px] px-3 py-4 sm:px-5 sm:py-6">
        {/* The workflow, always visible. */}
        <div className="mb-4">
          <StageRail
            flow={flow}
            current={state.stage}
            isComplete={stageIsComplete}
            isUnlocked={stageIsUnlocked}
            isSkipped={stageIsSkipped}
            onGo={(stage: Stage) => dispatch({ type: "go-stage", stage })}
          />
        </div>

        {state.review && (
          <div className="mb-4">
            <ReviewNoticeCard {...state.review} onDismiss={() => dispatch({ type: "dismiss-review" })} />
          </div>
        )}

        <div className="flex flex-col gap-4 xl:grid xl:grid-cols-[280px_minmax(0,1fr)_300px]">
          {/* ZONE A — the patient side. Second on a phone: the task comes
              first there, and the patient is one tap away on the bottom bar. */}
          <aside className="order-2 space-y-3 xl:order-1 xl:sticky xl:top-[124px] xl:self-start">
            <PatientCard scenario={sc} compact />
            <PatientRiskStrip patient={sc.patient} />
            {sc.prescription && (
              <Panel eyebrow="The order" title="What was written">
                <OrderSummary items={sc.prescription.items} entries={state.transcription} />
              </Panel>
            )}
          </aside>

          {/* ZONE B — the workstation */}
          <main className="order-1 min-w-0 xl:order-2">
            <div className="cph-monitor overflow-hidden">
              <div className="cph-monitor-bar flex items-center gap-2 px-4 py-2">
                <span className="flex gap-1" aria-hidden>
                  <span className="h-2 w-2 rounded-full bg-slate-300" />
                  <span className="h-2 w-2 rounded-full bg-slate-300" />
                  <span className="h-2 w-2 rounded-full bg-slate-300" />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">Pharmacy workstation</span>
              </div>
              <div className="px-4 py-5 sm:px-5">
                <StageView
                  state={state}
                  dispatch={dispatch}
                  quantities={quantities}
                  setQuantity={setQuantity}
                  onOpenPanel={(p) => openPanel(p)}
                  onInspect={setInspectId}
                  onOpenReference={onOpenReference}
                  blockers={blockers}
                  canAdvance={canAdvance}
                  onAdvance={() => dispatch({ type: "advance" })}
                  onCopyRecord={copyRecord}
                  onPrintRecord={printRecord}
                />
              </div>
            </div>

            {/* The bench, under the monitor where it would be. */}
            <div className="mt-4 hidden lg:block">
              <Bench onOpen={openPanel} active={state.panel} trayCount={state.tray.length} />
            </div>
          </main>

          {/* ZONE C — the dispensing side */}
          <aside className="order-3 space-y-3 xl:sticky xl:top-[124px] xl:self-start">
            <div className="hidden xl:block">
              <PrimaryActionCard stage={state.stage} canAdvance={canAdvance} onAdvance={() => dispatch({ type: "advance" })} />
            </div>
            {sc.prescription && state.tray.length > 0 && (
              <DispensingTray
                scenario={sc}
                tray={state.tray}
                stock={state.stock}
                quantities={quantities}
                selectedMedicineId={state.selectedMedicineId}
                selectedBatchId={state.selectedBatchId}
                onFill={(itemId, units) => dispatch({ type: "fill-tray", itemId, units })}
                onEmpty={(itemId) => dispatch({ type: "empty-tray", itemId })}
              />
            )}
          </aside>
        </div>
      </div>

      {/* The one primary action, pinned on anything narrower than xl. */}
      <div className="fixed inset-x-0 bottom-[54px] z-30 px-3 pb-2 lg:bottom-4 lg:px-5 xl:hidden">
        <div className="mx-auto max-w-lg lg:max-w-xl">
          <PrimaryActionCard stage={state.stage} canAdvance={canAdvance} onAdvance={() => dispatch({ type: "advance" })} floating />
        </div>
      </div>

      <ControlDock active={state.panel} onOpen={openPanel} />
      <MobileNav active={state.panel} onOpen={openPanel} onMore={() => setMoreOpen(true)} />

      {state.toast && <Toast message={state.toast.message} onDismiss={() => dispatch({ type: "dismiss-toast" })} />}

      <MedicineInspector
        medicineId={inspectId}
        stock={state.stock}
        today={sc.today}
        open={!!inspectId}
        onClose={() => setInspectId(null)}
        onOpenReference={(id) => {
          setInspectId(null);
          onOpenReference(id);
        }}
      />

      <Dialog open={moreOpen} onClose={() => setMoreOpen(false)} title="More">
        <MoreSheetContent onOpen={(p) => openPanel(p)} />
      </Dialog>

      {renderPanelDialog()}
    </div>
  );

  function renderPanelDialog() {
    const panel = state.panel;
    if (!panel) return null;
    const meta = PANELS.find((p) => p.id === panel);
    const scenario = state.scenario;

    let body: React.ReactNode = null;
    switch (panel) {
      case "queue":
        body = scenario ? (
          <QueuePanel scenario={scenario} waiting={SCENARIOS.filter((s) => s.id !== scenario.templateId)} onOpenProfile={() => openPanel("queue")} />
        ) : (
          <QueuePanel scenario={null} waiting={SCENARIOS} onOpenProfile={() => undefined} />
        );
        if (scenario) {
          body = (
            <div className="space-y-4">
              {body}
              <PatientProfile patient={scenario.patient} />
            </div>
          );
        }
        break;
      case "prescription":
        body = scenario && scenario.prescription ? <PrescriptionViewer prescription={scenario.prescription} /> : <p className="text-[13px] text-slate-500">No prescription in this case.</p>;
        break;
      case "interactions":
        body = scenario ? (
          <CheckConsole
            scenario={scenario}
            records={state.records}
            revealed={state.revealed}
            onRecord={(checkId, verdict, concernId, itemId) => dispatch({ type: "record-check", checkId, verdict, concernId, itemId })}
            onClear={(checkId) => dispatch({ type: "clear-check", checkId })}
            onOpenReference={onOpenReference}
          />
        ) : null;
        break;
      case "dispensing":
        body = scenario ? (
          <DispensingTray
            scenario={scenario}
            tray={state.tray}
            stock={state.stock}
            quantities={quantities}
            selectedMedicineId={state.selectedMedicineId}
            selectedBatchId={state.selectedBatchId}
            onFill={(itemId, units) => dispatch({ type: "fill-tray", itemId, units })}
            onEmpty={(itemId) => dispatch({ type: "empty-tray", itemId })}
          />
        ) : null;
        break;
      case "counselling":
        body = <p className="text-[13px] leading-relaxed text-slate-600">Counselling happens at its own step in the workflow — the rail above will take you there once the medicine is ready to hand over.</p>;
        break;
      case "inventory":
        body = (
          <div className="space-y-5">
            <ExpiryDashboard stock={state.stock} today={state.today} onDiscard={(medicineId, batchId) => dispatch({ type: "discard-batch", medicineId, batchId })} />
            <InventoryPanel
              stock={state.stock}
              today={state.today}
              onDiscard={(medicineId, batchId) => dispatch({ type: "discard-batch", medicineId, batchId })}
              onReceive={(medicineId, batchId, packs) => dispatch({ type: "receive-stock", medicineId, batchId, packs })}
            />
          </div>
        );
        break;
      case "calculations":
        body = (
          <CalculatorPanel
            prefill={
              scenario
                ? {
                    weightKg: scenario.patient.weightKg,
                    ageYears: scenario.patient.ageYears,
                    scr: scenario.patient.serumCreatinine,
                    female: scenario.patient.sex === "female",
                  }
                : undefined
            }
          />
        );
        break;
      case "references":
        body = <ReferenceDesk focusId={referenceId} />;
        break;
      case "documentation":
        body = scenario ? (
          <DocumentationPanel
            draft={state.documentation}
            confirmed={state.documentationDone}
            onChange={(field, value) => dispatch({ type: "set-doc", field, value })}
            onConfirm={() => dispatch({ type: "confirm-doc" })}
            preview={renderDocumentation(buildSubmission(state, 0), PHARMACY_NAME)}
            onCopy={copyRecord}
            onPrint={printRecord}
          />
        ) : null;
        break;
      case "help":
        body = <HelpPanel />;
        break;
      default:
        body = null;
    }

    return (
      <Dialog open onClose={() => openPanel(null)} title={meta ? meta.label : "Panel"} description={meta ? meta.blurb : undefined} wide>
        {body}
      </Dialog>
    );
  }
}

/**
 * The single next action, wherever it is shown.
 *
 * Always the brand colour, even while a supply is on hold. It was briefly
 * tinted red whenever a blocking finding was outstanding, which meant the main
 * call to action was red for most of a difficult case and read as an error
 * rather than as the next step. The hold is communicated by `BlockBanner`, at
 * the top of the workstation, where it belongs.
 */
function PrimaryActionCard({
  stage,
  canAdvance,
  onAdvance,
  floating,
}: {
  stage: Stage;
  canAdvance: boolean;
  onAdvance: () => void;
  floating?: boolean;
}) {
  const copy = STAGE_COPY[stage];
  if (!copy || stage === "complete") return null;
  return (
    <div className={floating ? "cph-dock rounded-2xl p-1.5" : undefined}>
      <PrimaryAction
        label={canAdvance ? nextLabel(stage) : copy.action}
        hint={canAdvance ? undefined : copy.hint}
        onClick={onAdvance}
      />
    </div>
  );
}

/**
 * The label on the primary action once the current stage is finished.
 *
 * Deliberately the same words every time: the button is a rhythm, and changing
 * its wording per stage made it read as a new control each step.
 */
function nextLabel(stage: Stage): string {
  return stage === "payment" ? "Finish the case" : "Continue to the next step";
}
