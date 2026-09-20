"use client";

// ============================================================
// One stage on the workstation screen
// ============================================================
//
// The stage machine decides where the student is; this decides what that looks
// like. Nothing here holds state of its own beyond what a single panel needs
// to draw itself — every decision goes back through the reducer.

import React from "react";
import { PackageSearch } from "lucide-react";

import type { CounterAction, CounterState } from "./useCounterMachine";
import type { Finding, Medicine, PanelId, Stage } from "./types";
import { Callout, EmptyNote, Panel } from "./kit";
import { STAGE_COPY } from "./data/constants";
import { medicine } from "./data/medicines";
import { batchExpiryFor } from "./useCounterMachine";
import { requiredQuantity, verificationTruths } from "./engine/clinical";

import { PatientProfile } from "./modules/PatientModule";
import { PrescriptionViewer, PrescriberCard, TranscriptionForm } from "./modules/PrescriptionModule";
import { BlockBanner, CheckConsole, InterventionPanel } from "./modules/ChecksModule";
import { BatchPicker, DispensingTray, LabelPrinter, MedicineShelf, QuantityPanel, VerificationPanel } from "./modules/DispensingModule";
import { CounsellingCheckpoints, PatientDialogue } from "./modules/CounsellingModule";
import { ComplaintCard, DecisionPanel, OtcProductPanel, RedFlagPanel, WwhamPanel } from "./modules/OtcModule";
import { DocumentationPanel, PosPanel } from "./modules/SupportModules";
import { renderDocumentation } from "./engine/scoring";
import { buildSubmission } from "./useCounterMachine";

export interface StageViewProps {
  state: CounterState;
  dispatch: React.Dispatch<CounterAction>;
  quantities: Record<string, string>;
  setQuantity: (itemId: string, value: string) => void;
  onOpenPanel: (panel: PanelId) => void;
  onInspect: (medicineId: string) => void;
  onOpenReference: (medicineId: string) => void;
  blockers: Finding[];
  canAdvance: boolean;
  onAdvance: () => void;
  onCopyRecord: () => void;
  onPrintRecord: () => void;
}

export function StageView(props: StageViewProps) {
  const { state } = props;
  const sc = state.scenario;
  if (!sc) return <EmptyNote>No case is open.</EmptyNote>;

  const copy = STAGE_COPY[state.stage];

  const heading = (
    <div className="mb-4">
      <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-slate-400">Step</p>
      <h2 className="mt-0.5 text-[19px] font-extrabold leading-tight text-slate-900">{copy ? copy.title : state.stage}</h2>
      {copy && <p className="mt-1 text-[13px] leading-relaxed text-slate-600">{copy.hint}</p>}
    </div>
  );

  const body = renderStage(props, state.stage);

  return (
    <div>
      {heading}
      {props.blockers.length > 0 && state.stage !== "safety-checks" && state.stage !== "intervention" && (
        <div className="mb-4">
          <BlockBanner blockers={props.blockers} />
        </div>
      )}
      {body}
    </div>
  );
}

function renderStage(props: StageViewProps, stage: Stage): React.ReactNode {
  const { state, dispatch } = props;
  const sc = state.scenario;
  if (!sc) return null;
  const items = sc.prescription ? sc.prescription.items : [];
  const firstItem = items[0];

  switch (stage) {
    case "arrival":
      return (
        <div className="space-y-4">
          <Callout level="review" title={`${sc.patient.name} has come to the counter`}>
            {sc.brief}
          </Callout>
          <PatientProfile patient={sc.patient} />
        </div>
      );

    case "receive":
      return sc.prescription ? (
        <div className="space-y-4">
          <PrescriptionViewer prescription={sc.prescription} />
          <PrescriberCard prescription={sc.prescription} />
        </div>
      ) : null;

    case "complaint":
      return sc.otc ? <ComplaintCard otc={sc.otc} patient={sc.patient} /> : null;

    case "patient-assessment":
      return <PatientProfile patient={sc.patient} />;

    case "interpretation":
      return sc.prescription ? (
        <div className="space-y-4">
          <PrescriptionViewer prescription={sc.prescription} />
          <TranscriptionForm
            items={items}
            entries={state.transcription}
            submitted={state.transcriptionDone}
            onChange={(itemId, patch) => dispatch({ type: "set-transcription", itemId, patch })}
            onSubmit={() => dispatch({ type: "submit-transcription" })}
          />
        </div>
      ) : null;

    case "safety-checks":
      return (
        <CheckConsole
          scenario={sc}
          records={state.records}
          revealed={state.revealed}
          onRecord={(checkId, verdict, concernId, itemId) => dispatch({ type: "record-check", checkId, verdict, concernId, itemId })}
          onClear={(checkId) => dispatch({ type: "clear-check", checkId })}
          onOpenReference={props.onOpenReference}
        />
      );

    case "intervention":
      return (
        <InterventionPanel
          findings={sc.findings.filter((f) => state.revealed.indexOf(f.id) !== -1)}
          chosen={state.interventions}
          patient={sc.patient}
          onChoose={(findingId, action, note) => dispatch({ type: "record-intervention", findingId, action, note })}
          onFinish={() => dispatch({ type: "finish-interventions" })}
        />
      );

    case "selection":
      return (
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={item.id}>
              {items.length > 1 && (
                <p className="mb-2 text-[12px] font-bold uppercase tracking-[0.1em] text-slate-500">
                  Item {index + 1} — {item.written}
                </p>
              )}
              <MedicineShelf
                scenario={sc}
                stock={state.stock}
                selectedId={state.selectedMedicineId[item.id]}
                onSelect={(medicineId) => dispatch({ type: "select-medicine", itemId: item.id, medicineId })}
                onInspect={props.onInspect}
                title={items.length > 1 ? `Shelves — item ${index + 1}` : "Shelves"}
              />
            </div>
          ))}
        </div>
      );

    case "stock-expiry":
      return (
        <div className="space-y-4">
          {items.map((item, index) => {
            const medicineId = state.selectedMedicineId[item.id];
            if (!medicineId) {
              return (
                <EmptyNote key={item.id}>
                  Item {index + 1} has no product selected yet. Go back to the shelves.
                </EmptyNote>
              );
            }
            return (
              <Panel key={item.id} eyebrow={`Item ${index + 1}`} title="Choose a batch" description={`${medicine(medicineId)?.brand} ${medicine(medicineId)?.strength}`}>
                <BatchPicker
                  medicineId={medicineId}
                  stock={state.stock}
                  today={sc.today}
                  courseDays={item.durationDays}
                  selectedBatchId={state.selectedBatchId[item.id]}
                  onSelect={(batchId) => dispatch({ type: "select-batch", itemId: item.id, batchId })}
                />
              </Panel>
            );
          })}
        </div>
      );

    case "quantity":
      return (
        <div className="space-y-4">
          {items.map((item, index) => (
            <Panel key={item.id} eyebrow={`Item ${index + 1}`} title="Quantity to dispense">
              <QuantityPanel
                item={item}
                m={medicine(state.selectedMedicineId[item.id] || item.medicineId)}
                value={props.quantities[item.id] || ""}
                onChange={(v) => props.setQuantity(item.id, v)}
                onConfirm={() => dispatch({ type: "confirm-quantity", itemId: item.id })}
                confirmed={!!state.quantityConfirmed[item.id]}
                onOpenCalculator={() => props.onOpenPanel("calculations")}
              />
            </Panel>
          ))}
        </div>
      );

    case "dispensing":
      return (
        <DispensingTray
          scenario={sc}
          tray={state.tray}
          stock={state.stock}
          quantities={props.quantities}
          selectedMedicineId={state.selectedMedicineId}
          selectedBatchId={state.selectedBatchId}
          onFill={(itemId, units) => dispatch({ type: "fill-tray", itemId, units })}
          onEmpty={(itemId) => dispatch({ type: "empty-tray", itemId })}
        />
      );

    case "labelling":
      return (
        <div className="space-y-6">
          {items.map((item, index) => {
            const draft = state.labels[item.id];
            const m = medicine(state.selectedMedicineId[item.id] || item.medicineId);
            if (!draft) {
              return <EmptyNote key={item.id}>Item {index + 1} is not in the tray yet, so there is nothing to label.</EmptyNote>;
            }
            return (
              <LabelPrinter
                key={item.id}
                item={item}
                m={m}
                draft={draft}
                patientName={sc.patient.name}
                today={sc.today}
                availableAux={auxChoices(m)}
                confirmed={!!state.labelsWritten[item.id]}
                onChange={(patch) => dispatch({ type: "set-label", itemId: item.id, patch })}
                onToggleAux={(label) => dispatch({ type: "toggle-aux", itemId: item.id, label })}
                onConfirm={() => dispatch({ type: "confirm-label", itemId: item.id })}
              />
            );
          })}
        </div>
      );

    case "final-verification": {
      if (!firstItem) return null;
      const truths = verificationTruths({
        item: firstItem,
        tray: state.tray.find((t) => t.itemId === firstItem.id),
        patient: sc.patient,
        label: state.labels[firstItem.id],
        records: state.records,
        batchExpiry: batchExpiryFor(state, firstItem.id),
        today: sc.today,
      });
      return (
        <VerificationPanel
          truths={truths}
          ticked={state.ticked}
          onToggle={(id) => dispatch({ type: "toggle-tick", id })}
          onAdvance={props.onAdvance}
          canAdvance={props.canAdvance}
        />
      );
    }

    case "counselling": {
      const source = state.tray[0];
      const m = medicine(source ? source.medicineId : firstItem ? firstItem.medicineId : "");
      return (
        <div className="space-y-6">
          {m && sc.kind === "rx" && (
            <CounsellingCheckpoints
              m={m}
              seed={sc.seed}
              selections={state.counselling}
              done={state.counsellingDone}
              onChange={(topic, chosen) => dispatch({ type: "set-counselling", topic, chosen })}
              onConfirm={(topic) => dispatch({ type: "confirm-counselling", topic })}
            />
          )}
          {m && sc.kind === "otc" && (
            <CounsellingCheckpoints
              m={m}
              seed={sc.seed}
              selections={state.counselling}
              done={state.counsellingDone}
              onChange={(topic, chosen) => dispatch({ type: "set-counselling", topic, chosen })}
              onConfirm={(topic) => dispatch({ type: "confirm-counselling", topic })}
            />
          )}
          {!m && sc.kind === "otc" && (
            <Callout level="review" title="Nothing was supplied">
              There is no product to counsel on. What matters here is that the patient leaves knowing what to do next
              and how urgently — record that in the documentation step.
            </Callout>
          )}
          <PatientDialogue
            turns={sc.dialogue}
            patient={sc.patient}
            answers={state.dialogue}
            onAnswer={(turnId, optionId) => dispatch({ type: "answer-dialogue", turnId, optionId })}
          />
        </div>
      );
    }

    case "wwham":
      return sc.otc ? (
        <WwhamPanel
          otc={sc.otc}
          patient={sc.patient}
          answers={state.wwham}
          onAnswer={(field, optionId) => dispatch({ type: "answer-wwham", field, optionId })}
        />
      ) : null;

    case "assessment":
      return (
        <RedFlagPanel
          marked={state.redFlags}
          confirmed={state.redFlagsRecorded}
          onToggle={(id) => dispatch({ type: "toggle-red-flag", id })}
          onConfirm={() => dispatch({ type: "confirm-red-flags" })}
        />
      );

    case "decision":
      return <DecisionPanel decided={state.otcDecision ? state.otcDecision.outcome : null} onDecide={(outcome) => dispatch({ type: "decide-otc", outcome })} />;

    case "product":
      return (
        <OtcProductPanel
          decided={state.otcDecision ? state.otcDecision.outcome : null}
          chosenId={state.otcDecision ? state.otcDecision.medicineId : null}
          onChoose={(medicineId) => dispatch({ type: "choose-otc-product", medicineId })}
          shelf={
            <MedicineShelf
              scenario={sc}
              stock={state.stock}
              selectedId={state.otcDecision ? state.otcDecision.medicineId || undefined : undefined}
              onSelect={(medicineId) => dispatch({ type: "choose-otc-product", medicineId })}
              onInspect={props.onInspect}
              title="Over-the-counter shelves"
            />
          }
        />
      );

    case "documentation":
      return (
        <DocumentationPanel
          draft={state.documentation}
          confirmed={state.documentationDone}
          onChange={(field, value) => dispatch({ type: "set-doc", field, value })}
          onConfirm={() => dispatch({ type: "confirm-doc" })}
          preview={renderDocumentation(buildSubmission(state, 0), "PharmaWallah Community Pharmacy")}
          onCopy={props.onCopyRecord}
          onPrint={props.onPrintRecord}
        />
      );

    case "payment":
      return (
        <PosPanel
          tray={state.tray}
          discount={state.discountPkr}
          payment={state.payment}
          paid={state.paid}
          onDiscount={(amount) => dispatch({ type: "set-discount", amount })}
          onPayment={(method) => dispatch({ type: "set-payment", method })}
          onComplete={() => dispatch({ type: "take-payment" })}
        />
      );

    case "complete":
      return (
        <Panel title="Case complete">
          <p className="flex gap-2 text-[13px] leading-relaxed text-slate-600">
            <PackageSearch className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            The encounter is finished. Open the debrief to see what you found, what you missed and why it mattered.
          </p>
        </Panel>
      );

    default:
      return null;
  }
}

/**
 * The auxiliary labels offered for a product.
 *
 * Its own labels plus a fixed set of plausible-but-wrong ones, so choosing is
 * a judgement. The distractors are the same every time, which means the list
 * itself never hints at the answer.
 */
const DISTRACTOR_AUX = [
  "Keep refrigerated",
  "Shake well before use",
  "May cause drowsiness",
  "Take with plenty of water",
  "Avoid prolonged sun exposure",
  "Do not drink alcohol during and for 48 hours after the course",
  "For external use only",
  "Swallow whole — do not crush",
];

export function auxChoices(m: Medicine | undefined): string[] {
  if (!m) return DISTRACTOR_AUX;
  const own = m.auxLabels;
  const extras = DISTRACTOR_AUX.filter((d) => own.indexOf(d) === -1);
  return own.concat(extras).sort();
}
