"use client";

// ============================================================
// The dispensing workspace: shelf → batch → count → tray → label → check
// ============================================================
//
// Everything here is tap-driven. There are no drags at all: a drag-only bench
// excludes keyboard and assistive-technology users and is miserable on a
// phone, and the sibling disk-diffusion lab already paid for that lesson.
//
// The tray is the state, not a decoration — what is in it is what the
// verification, the label and the till all read.

import React, { useMemo, useState } from "react";
import { AlertTriangle, Boxes, Calculator, Package, PackageCheck, Printer, Search, Trash2 } from "lucide-react";

import type { Batch, LabelDraft, Medicine, RxItem, Scenario, StockLine, TrayItem, VerificationId, VerificationTruth } from "../types";
import { Button, Callout, Choice, Dialog, EmptyNote, Field, KeyValue, Panel, RiskChip, inputClass } from "../kit";
import { PackArt } from "../environment/objects";
import { SHELF_BAYS, VERIFICATION_SPECS, FREQUENCIES } from "../data/constants";
import { medicine, medicineLabel, searchMedicines } from "../data/medicines";
import { batchesFor, expiryStatus, stockFor, usablePacks } from "../engine/inventory";
import { addDays, formatExpiry, formatDate, toMonth } from "../engine/dates";
import { directionsLine, packsNeeded, quantityWorking, renderLabel, requiredQuantity } from "../engine/clinical";
import { cn } from "@/lib/utils";

function bayAccent(category: string): string {
  const bay = SHELF_BAYS.find((b) => b.id === category);
  return bay ? bay.accent : "#1C7BD9";
}

// ─── The shelf ───────────────────────────────────────────────────────────────

export function MedicineShelf({
  scenario,
  stock,
  selectedId,
  onSelect,
  onInspect,
  title = "Shelves",
}: {
  scenario: Scenario;
  stock: StockLine[];
  selectedId?: string;
  onSelect: (medicineId: string) => void;
  onInspect: (medicineId: string) => void;
  title?: string;
}) {
  const [query, setQuery] = useState("");
  const [bay, setBay] = useState<string>("all");

  const shelf = useMemo(() => {
    const all = scenario.shelfMedicineIds.map((id) => medicine(id)).filter(Boolean) as Medicine[];
    const byBay = bay === "all" ? all : all.filter((m) => m.category === bay);
    return searchMedicines(query, byBay);
  }, [scenario.shelfMedicineIds, bay, query]);

  const bays = useMemo(() => {
    const present: string[] = [];
    scenario.shelfMedicineIds.forEach((id) => {
      const m = medicine(id);
      if (m && present.indexOf(m.category) === -1) present.push(m.category);
    });
    return SHELF_BAYS.filter((b) => present.indexOf(b.id) !== -1);
  }, [scenario.shelfMedicineIds]);

  return (
    <Panel
      eyebrow="Behind the counter"
      title={title}
      description="Compare the generic name and the strength on the pack, not the brand and not its position."
    >
      <div className="cph-shelf p-3">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className={cn(inputClass, "cph-field pl-9")}
              placeholder="Search the shelves…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search the shelves"
            />
          </div>
          <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 sm:mx-0 sm:px-0 sm:pb-0">
            <button
              type="button"
              onClick={() => setBay("all")}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-[12px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue",
                bay === "all" ? "border-brandBlue bg-brandBlue text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
              )}
            >
              All bays
            </button>
            {bays.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setBay(b.id)}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1.5 text-[12px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue",
                  bay === b.id ? "border-brandBlue bg-brandBlue text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                )}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {shelf.length === 0 ? (
          <div className="mt-3">
            <EmptyNote>Nothing on these shelves matches that search.</EmptyNote>
          </div>
        ) : (
          <ul className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
            {shelf.map((m) => {
              const line = stockFor(stock, m.id);
              const usable = line ? usablePacks(line, toMonth(scenario.today)) : 0;
              const selected = selectedId === m.id;
              return (
                <li key={m.id}>
                  <div
                    className={cn(
                      "cph-bay flex h-full flex-col items-center gap-1.5 p-2.5 text-center",
                      selected && "border-brandBlue ring-2 ring-brandBlue/25",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => onSelect(m.id)}
                      className="flex w-full flex-col items-center gap-1.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue"
                      aria-pressed={selected}
                    >
                      <PackArt accent={bayAccent(m.category)} form={m.form} width={44} label={medicineLabel(m)} />
                      <span className="text-[12px] font-bold leading-tight text-slate-900">{m.brand}</span>
                      <span className="text-[11.5px] font-semibold leading-tight text-brandBlue">{m.strength}</span>
                      <span className="text-[10.5px] leading-tight text-slate-500">
                        {m.generic} · {m.form}
                      </span>
                    </button>
                    <div className="mt-auto flex w-full items-center justify-between gap-1 pt-1.5">
                      <span className={cn("text-[10px] font-bold", usable === 0 ? "text-rose-600" : usable < 5 ? "text-amber-600" : "text-slate-400")}>
                        {usable === 0 ? "Out of stock" : `${usable} pack${usable === 1 ? "" : "s"}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => onInspect(m.id)}
                        className="rounded px-1 text-[10.5px] font-bold text-slate-500 underline-offset-2 hover:text-brandBlue hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue"
                      >
                        Inspect
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Panel>
  );
}

/** Everything printed on the pack — the "inspect the package" step. */
export function MedicineInspector({
  medicineId,
  stock,
  today,
  open,
  onClose,
  onOpenReference,
}: {
  medicineId: string | null;
  stock: StockLine[];
  today: string;
  open: boolean;
  onClose: () => void;
  onOpenReference?: (id: string) => void;
}) {
  const m = medicineId ? medicine(medicineId) : undefined;
  if (!m) return null;
  const line = stockFor(stock, m.id);
  const batches = line ? line.batches : [];

  return (
    <Dialog open={open} onClose={onClose} title={`${m.brand} ${m.strength}`} description={m.generic} wide>
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex shrink-0 justify-center sm:block">
          <PackArt accent={bayAccent(m.category)} form={m.form} width={88} label={medicineLabel(m)} />
        </div>
        <div className="min-w-0 flex-1">
          <KeyValue k="Generic name" v={m.generic} />
          <KeyValue k="Brand" v={m.brand} />
          <KeyValue k="Strength" v={m.strength} />
          <KeyValue k="Dosage form" v={m.form} />
          <KeyValue k="Pack size" v={`${m.packSize} ${m.packUnit}`} />
          <KeyValue k="Manufacturer" v={m.manufacturer} />
          <KeyValue k="Storage" v={m.storage} />
          <KeyValue k="Legal status" v={m.otc ? "Pharmacy sale" : "Prescription only"} />
          <KeyValue k="Price" v={`Rs ${m.pricePkr}`} />
        </div>
      </div>

      <h4 className="mt-4 text-[12px] font-bold uppercase tracking-[0.1em] text-slate-500">Batches on the shelf</h4>
      <ul className="mt-2 space-y-1.5">
        {batches.map((b) => {
          const status = expiryStatus(b.expiry, toMonth(today));
          return (
            <li key={b.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2">
              <span className="text-[12.5px] font-semibold text-slate-800">{b.batchNo}</span>
              <span className="text-[12.5px] tabular-nums text-slate-600">Exp {formatExpiry(b.expiry)}</span>
              <span className="text-[12px] text-slate-500">{b.packs} packs</span>
              <RiskChip level={status === "expired" ? "critical" : status === "expiring-soon" ? "caution" : "ok"}>
                {status === "expired" ? "Expired" : status === "expiring-soon" ? "Expiring soon" : "In date"}
              </RiskChip>
            </li>
          );
        })}
      </ul>

      {m.auxLabels.length > 0 && (
        <>
          <h4 className="mt-4 text-[12px] font-bold uppercase tracking-[0.1em] text-slate-500">Auxiliary labels for this product</h4>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {m.auxLabels.map((l) => (
              <li key={l} className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11.5px] font-semibold text-amber-900">
                {l}
              </li>
            ))}
          </ul>
        </>
      )}

      {onOpenReference && (
        <Button variant="secondary" className="mt-4" onClick={() => onOpenReference(m.id)}>
          <Boxes className="h-4 w-4" /> Open the monograph
        </Button>
      )}
    </Dialog>
  );
}

// ─── Batch selection ─────────────────────────────────────────────────────────

export function BatchPicker({
  medicineId,
  stock,
  today,
  courseDays,
  selectedBatchId,
  onSelect,
}: {
  medicineId: string;
  stock: StockLine[];
  today: string;
  courseDays: number;
  selectedBatchId?: string;
  onSelect: (batchId: string) => void;
}) {
  const m = medicine(medicineId);
  const batches = batchesFor(stock, medicineId);
  const courseEndMonth = toMonth(addDays(today, courseDays));

  if (!m) return <EmptyNote>Select a product first.</EmptyNote>;

  return (
    <div className="space-y-3">
      <Callout level="review" title="Check the date on the pack in your hand">
        A pack that is in date today is not necessarily in date on the last day of the course. This course finishes in{" "}
        <strong>{formatExpiry(courseEndMonth)}</strong>.
      </Callout>
      <div className="space-y-2" role="radiogroup" aria-label="Batch">
        {batches.map((b: Batch) => {
          const status = expiryStatus(b.expiry, toMonth(today));
          const covers = b.expiry >= courseEndMonth;
          return (
            <Choice
              key={b.id}
              selected={selectedBatchId === b.id}
              onSelect={() => onSelect(b.id)}
              disabled={b.packs === 0}
              title={
                <span className="flex flex-wrap items-center gap-2">
                  <span>Batch {b.batchNo}</span>
                  <span className="font-normal tabular-nums text-slate-500">Exp {formatExpiry(b.expiry)}</span>
                </span>
              }
              description={
                b.packs === 0
                  ? "None left in this batch."
                  : `${b.packs} pack${b.packs === 1 ? "" : "s"} on the shelf${status === "expired" ? " · out of date" : covers ? "" : " · runs out before the course ends"}`
              }
              tone={status === "expired" ? "critical" : !covers ? "caution" : "ok"}
            />
          );
        })}
      </div>
    </div>
  );
}

// ─── Quantity ────────────────────────────────────────────────────────────────

export function QuantityPanel({
  item,
  m,
  value,
  onChange,
  onConfirm,
  confirmed,
  onOpenCalculator,
}: {
  item: RxItem;
  m: Medicine | undefined;
  value: string;
  onChange: (v: string) => void;
  onConfirm: () => void;
  confirmed: boolean;
  onOpenCalculator: () => void;
}) {
  const required = requiredQuantity(item);
  const working = quantityWorking(item);
  const entered = Number(value);
  const matches = required !== null && Number.isFinite(entered) && entered === required;

  return (
    <div className="space-y-4">
      <Callout level="review" title="Work it out before you count">
        Dose × times each day × days. The number you calculate is what goes on the label and into the tray.
      </Callout>

      <Panel eyebrow="The arithmetic" title="Quantity for this course">
        <ul className="space-y-1.5">
          {working.map((line: string, i: number) => (
            <li key={i} className="font-mono text-[13px] leading-relaxed text-slate-700">
              {line}
            </li>
          ))}
        </ul>
        {m && required !== null && (
          <p className="mt-3 text-[12.5px] leading-relaxed text-slate-500">
            {required} {m.packUnit} is {packsNeeded(required, m.packSize)} pack{packsNeeded(required, m.packSize) === 1 ? "" : "s"} of {m.packSize}.
          </p>
        )}
      </Panel>

      <Field label="Quantity to dispense" hint={m ? `In ${m.packUnit}.` : undefined}>
        {(id) => (
          <input id={id} className={inputClass} inputMode="numeric" value={value} onChange={(e) => onChange(e.target.value)} placeholder="e.g. 21" />
        )}
      </Field>

      {value && !matches && required !== null && (
        <Callout level="caution" title="That does not match the course">
          Check the arithmetic above against what you have entered before you count anything out.
        </Callout>
      )}

      <div className="flex flex-wrap gap-2">
        <Button onClick={onConfirm} disabled={!value || Number(value) <= 0}>
          {confirmed ? "Update quantity" : "Confirm quantity"}
        </Button>
        <Button variant="secondary" onClick={onOpenCalculator}>
          <Calculator className="h-4 w-4" /> Open the calculators
        </Button>
      </div>
    </div>
  );
}

// ─── The tray ────────────────────────────────────────────────────────────────

export function DispensingTray({
  scenario,
  tray,
  stock,
  onFill,
  onEmpty,
  quantities,
  selectedMedicineId,
  selectedBatchId,
}: {
  scenario: Scenario;
  tray: TrayItem[];
  stock: StockLine[];
  onFill: (itemId: string, units: number) => void;
  onEmpty: (itemId: string) => void;
  quantities: Record<string, string>;
  selectedMedicineId: Record<string, string>;
  selectedBatchId: Record<string, string>;
}) {
  const items = scenario.prescription ? scenario.prescription.items : [];

  return (
    <Panel eyebrow="On the counter" title="Dispensing tray" description="What is in the tray is what gets labelled, checked and sold.">
      <div className="cph-tray min-h-[110px] p-3">
        {tray.length === 0 ? (
          <p className="py-6 text-center text-[13px] text-slate-500">The tray is empty.</p>
        ) : (
          <ul className="space-y-2">
            {tray.map((t) => {
              const m = medicine(t.medicineId);
              if (!m) return null;
              const item = items.find((i) => i.id === t.itemId);
              return (
                <li key={t.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                  <span className="cph-pack shrink-0">
                    <PackArt accent={bayAccent(m.category)} form={m.form} width={30} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-bold leading-tight text-slate-900">
                      {m.brand} {m.strength}
                    </span>
                    <span className="mt-0.5 block text-[11.5px] text-slate-500">
                      {t.units} {m.packUnit} · {t.packs} pack{t.packs === 1 ? "" : "s"} · batch {batchNo(stock, m.id, t.batchId)}
                    </span>
                    {item && (
                      <span className="mt-0.5 block text-[11px] text-slate-400">
                        for {item.written}
                      </span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => onEmpty(t.itemId)}
                    aria-label={`Return ${m.brand} to the shelf`}
                    className="shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="mt-3 space-y-2">
        {items.map((item, index) => {
          const already = tray.some((t) => t.itemId === item.id);
          const units = Number(quantities[item.id] || 0);
          const ready = !!selectedMedicineId[item.id] && !!selectedBatchId[item.id] && units > 0;
          if (already) return null;
          return (
            <Button
              key={item.id}
              variant="secondary"
              className="w-full justify-start"
              disabled={!ready}
              onClick={() => onFill(item.id, units)}
            >
              <Package className="h-4 w-4" />
              {ready ? `Place item ${index + 1} in the tray (${units})` : `Item ${index + 1} — choose a product, a batch and a quantity first`}
            </Button>
          );
        })}
      </div>
    </Panel>
  );
}

/**
 * The batch number as printed on the carton.
 *
 * Read back out of the stock list rather than stored on the tray item, so
 * there is one copy of it and the tray cannot show a stale one.
 */
function batchNo(stock: StockLine[], medicineId: string, batchId: string): string {
  const line = stockFor(stock, medicineId);
  const batch = line ? line.batches.find((b) => b.id === batchId) : undefined;
  return batch ? batch.batchNo : "—";
}

// ─── Label ───────────────────────────────────────────────────────────────────

export function LabelPrinter({
  item,
  m,
  draft,
  patientName,
  today,
  onChange,
  onToggleAux,
  onConfirm,
  confirmed,
  availableAux,
}: {
  item: RxItem;
  m: Medicine | undefined;
  draft: LabelDraft;
  patientName: string;
  today: string;
  onChange: (patch: Partial<LabelDraft>) => void;
  onToggleAux: (label: string) => void;
  onConfirm: () => void;
  confirmed: boolean;
  availableAux: string[];
}) {
  const preview = renderLabel(draft, m, "PharmaWallah Community Pharmacy", formatDate(today));

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <Panel eyebrow="Label printer" title="Write the directions">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Patient name" className="sm:col-span-2">
            {(id) => <input id={id} className={inputClass} value={draft.patientName} onChange={(e) => onChange({ patientName: e.target.value })} />}
          </Field>
          <Field label="Medicine">
            {(id) => <input id={id} className={inputClass} value={draft.medicineLine} onChange={(e) => onChange({ medicineLine: e.target.value })} />}
          </Field>
          <Field label="Dose per administration">
            {(id) => <input id={id} className={inputClass} inputMode="decimal" value={draft.doseUnits} onChange={(e) => onChange({ doseUnits: e.target.value })} />}
          </Field>
          <Field label="Route">
            {(id) => <input id={id} className={inputClass} value={draft.route} onChange={(e) => onChange({ route: e.target.value })} />}
          </Field>
          <Field label="Frequency">
            {(id) => (
              <select id={id} className={inputClass} value={draft.frequencyCode} onChange={(e) => onChange({ frequencyCode: e.target.value })}>
                {FREQUENCIES.map((f) => (
                  <option key={f.code} value={f.code}>
                    {f.label}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field label="Duration (days)">
            {(id) => <input id={id} className={inputClass} inputMode="numeric" value={draft.durationDays} onChange={(e) => onChange({ durationDays: e.target.value })} />}
          </Field>
          <Field label="Quantity">
            {(id) => <input id={id} className={inputClass} inputMode="numeric" value={draft.quantity} onChange={(e) => onChange({ quantity: e.target.value })} />}
          </Field>
          <Field label="Storage" className="sm:col-span-2">
            {(id) => <input id={id} className={inputClass} value={draft.storage} onChange={(e) => onChange({ storage: e.target.value })} />}
          </Field>
        </div>

        <h4 className="mt-4 text-[12px] font-bold uppercase tracking-[0.1em] text-slate-500">Auxiliary labels</h4>
        <p className="mt-1 text-[12px] leading-relaxed text-slate-500">
          Choose only the warnings that belong on this product. More is not safer — a label crowded with warnings is a
          label nobody reads.
        </p>
        <div className="mt-2 space-y-1.5">
          {availableAux.map((l) => (
            <Choice key={l} multi selected={draft.specialInstructions.indexOf(l) !== -1} onSelect={() => onToggleAux(l)} title={l} />
          ))}
        </div>

        <Button className="mt-4" onClick={onConfirm}>
          <Printer className="h-4 w-4" /> {confirmed ? "Reprint the label" : "Print the label"}
        </Button>
      </Panel>

      <div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">Preview</p>
        <div className="cph-label px-4 pb-4 pt-2">
          <pre className="whitespace-pre-wrap break-words font-sans text-[12px] leading-relaxed text-[#26303f]">{preview.join("\n")}</pre>
        </div>
        <p className="mt-2 text-[11.5px] leading-relaxed text-slate-500">
          Read it as the patient will: could someone follow this at home without you in the room?
        </p>
        <p className="mt-2 text-[12px] font-semibold leading-relaxed text-slate-700">{directionsLine(draft, m)}</p>
        <p className="mt-1 text-[11px] text-slate-400">For {patientName}</p>
      </div>
    </div>
  );
}

// ─── Final verification ──────────────────────────────────────────────────────

export function VerificationPanel({
  truths,
  ticked,
  onToggle,
  onAdvance,
  canAdvance,
}: {
  truths: VerificationTruth[];
  ticked: VerificationId[];
  onToggle: (id: VerificationId) => void;
  onAdvance: () => void;
  canAdvance: boolean;
}) {
  return (
    <div className="space-y-4">
      <Callout level="caution" title="Confirm each line, then tick it">
        This is the last point at which an error is cheap. A line you cannot honestly confirm is a line to go back and
        check, not one to tick and move on from.
      </Callout>

      <div className="space-y-2" role="group" aria-label="Verification">
        {VERIFICATION_SPECS.map((spec) => {
          const isTicked = ticked.indexOf(spec.id) !== -1;
          return <Choice key={spec.id} multi selected={isTicked} onSelect={() => onToggle(spec.id)} title={spec.label} description={spec.detail} />;
        })}
      </div>

      <div className="flex items-center gap-2 text-[12.5px] font-semibold text-slate-600">
        <PackageCheck className="h-4 w-4 text-slate-400" />
        {ticked.length} of {VERIFICATION_SPECS.length} confirmed
      </div>

      {!canAdvance && ticked.length > 0 && ticked.length < VERIFICATION_SPECS.length && (
        <p className="flex gap-2 text-[12.5px] leading-relaxed text-slate-500">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
          Nothing leaves the counter until every line is confirmed.
        </p>
      )}

      <Button onClick={onAdvance} disabled={!canAdvance}>
        Hand over to the patient
      </Button>
    </div>
  );
}
