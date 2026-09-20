/**
 * Tests for the Community Pharmacy Simulation's pure layer.
 *
 *   node --test scripts/pharmacy-counter.test.mts
 *
 * No framework: Node's type stripping plus the resolve hook that lets the
 * app's extensionless imports work (scripts/lib/ts-resolve.mjs).
 *
 * These cover the parts that decide what a student is told: whether a check
 * was answered correctly, whether a quantity covers a course, whether a batch
 * outlasts it, whether a verification line is actually true, and what the
 * debrief reports. The React layer is verified by driving the page in a
 * browser — there is no component test framework in this repo.
 *
 * The first test is an integrity check over the case data. A finding whose
 * `concernId` does not exist in its check's concern list would be permanently
 * unfindable, and nothing else in the system would notice.
 */
import { register } from "node:module";
import { test } from "node:test";
import assert from "node:assert/strict";

register("./lib/ts-resolve.mjs", import.meta.url);

const C = await import("../src/components/Simulations/CommunityPharmacy/data/constants.ts");
const MEDS = await import("../src/components/Simulations/CommunityPharmacy/data/medicines.ts");
const PATIENTS = await import("../src/components/Simulations/CommunityPharmacy/data/patients.ts");
const SCEN = await import("../src/components/Simulations/CommunityPharmacy/data/scenarios.ts");
const clinical = await import("../src/components/Simulations/CommunityPharmacy/engine/clinical.ts");
const inventory = await import("../src/components/Simulations/CommunityPharmacy/engine/inventory.ts");
const dates = await import("../src/components/Simulations/CommunityPharmacy/engine/dates.ts");
const calc = await import("../src/components/Simulations/CommunityPharmacy/engine/calculators.ts");
const counselling = await import("../src/components/Simulations/CommunityPharmacy/engine/counselling.ts");
const scoring = await import("../src/components/Simulations/CommunityPharmacy/engine/scoring.ts");
const scenarioEngine = await import("../src/components/Simulations/CommunityPharmacy/engine/scenario.ts");
const flow = await import("../src/components/Simulations/CommunityPharmacy/engine/flow.ts");

const TODAY = "2026-09-20";
const MONTH = "2026-09";

// ─── Data integrity ─────────────────────────────────────────────────────────

test("every finding names a concern that its check actually offers", () => {
  let checked = 0;
  SCEN.SCENARIOS.forEach((s: any) => {
    s.findings.forEach((f: any) => {
      const spec = C.CHECK_SPECS.find((c: any) => c.id === f.checkId);
      assert.ok(spec, `${s.id}: unknown check "${f.checkId}"`);
      const ids = spec!.concerns.map((c: any) => c.id);
      assert.ok(ids.indexOf(f.concernId) !== -1, `${s.id}/${f.id}: "${f.concernId}" is not one of ${ids.join(", ")}`);
      checked += 1;
    });
  });
  assert.ok(checked > 0, "no findings were checked — the case data is empty");
});

test("every scenario resolves its patient, prescribed products and decoys", () => {
  SCEN.SCENARIOS.forEach((s: any) => {
    assert.ok(PATIENTS.PATIENT_INDEX[s.patientId], `${s.id}: unknown patient ${s.patientId}`);
    (s.decoyMedicineIds as string[]).forEach((id) => {
      assert.ok(MEDS.medicine(id), `${s.id}: decoy ${id} is not in the catalogue`);
    });
    if (s.prescription) {
      s.prescription.items.forEach((i: any) => {
        assert.ok(MEDS.medicine(i.medicineId), `${s.id}/${i.id}: ${i.medicineId} is not in the catalogue`);
        assert.ok(C.frequencyByCode(i.frequencyCode), `${s.id}/${i.id}: unknown frequency ${i.frequencyCode}`);
      });
    }
    if (s.otc) {
      (s.otc.redFlagIds as string[]).forEach((id) => {
        assert.ok(C.RED_FLAGS.some((f: any) => f.id === id), `${s.id}: unknown red flag ${id}`);
      });
      (s.otc.appropriateMedicineIds as string[]).forEach((id) => {
        assert.ok(MEDS.medicine(id), `${s.id}: unknown product ${id}`);
      });
    }
  });
});

test("every medicine carries all eight counselling topics with at least one right and one wrong answer", () => {
  MEDS.MEDICINES.forEach((m: any) => {
    C.COUNSELLING_TOPICS.forEach((t: any) => {
      const content = m.counselling[t.id];
      assert.ok(content, `${m.id}: missing counselling topic ${t.id}`);
      assert.ok(content.points.length >= 1, `${m.id}/${t.id}: no correct statements`);
      assert.ok(content.distractors.length >= 1, `${m.id}/${t.id}: no distractors — the choice would be trivial`);
      content.points.forEach((p: string) => {
        assert.ok(content.distractors.indexOf(p) === -1, `${m.id}/${t.id}: "${p}" is both right and wrong`);
      });
    });
  });
});

// ─── Quantities ─────────────────────────────────────────────────────────────

const item = (over: Record<string, unknown> = {}) => ({
  id: "item-1",
  written: "test",
  medicineId: "amoxicillin-500",
  doseUnits: 1,
  frequencyCode: "TDS",
  route: "Oral",
  durationDays: 7,
  quantityWritten: 21,
  ...over,
}) as any;

test("quantity for a course is dose x frequency x days", () => {
  assert.equal(clinical.requiredQuantity(item()), 21);
  assert.equal(clinical.requiredQuantity(item({ doseUnits: 2, frequencyCode: "BD", durationDays: 5 })), 20);
  assert.equal(clinical.requiredQuantity(item({ doseUnits: 10, frequencyCode: "TDS", durationDays: 7 })), 210);
});

test("a PRN order has no calculable quantity or days' supply", () => {
  assert.equal(clinical.requiredQuantity(item({ frequencyCode: "PRN" })), null);
  assert.equal(clinical.daysSupply(30, 1, "PRN"), null);
});

test("days' supply floors, and packs round up", () => {
  assert.equal(clinical.daysSupply(21, 1, "TDS"), 7);
  assert.equal(clinical.daysSupply(20, 1, "TDS"), 6);
  assert.equal(clinical.packsNeeded(21, 12), 2);
  assert.equal(clinical.packsNeeded(24, 12), 2);
  assert.equal(clinical.packsNeeded(25, 12), 3);
});

test("a liquid's daily dose is computed per 5 mL, not per mL", () => {
  const susp = MEDS.medicine("amoxicillin-susp")!;
  // 10 mL of 125 mg/5 mL is 250 mg; three times a day is 750 mg.
  const daily = clinical.dailyDose(item({ medicineId: "amoxicillin-susp", doseUnits: 10 }), susp);
  assert.equal(daily, 750);
  const patient = PATIENTS.patient("hooriya-tariq")!;
  // 750 mg over 16 kg is 46.9 mg/kg/day — above the 20-40 range, which is the
  // finding the paediatric case is built on.
  assert.equal(clinical.mgPerKgPerDay(item({ medicineId: "amoxicillin-susp", doseUnits: 10 }), susp, patient), 46.9);
});

// ─── The check grader ───────────────────────────────────────────────────────

const finding = (over: Record<string, unknown> = {}) => ({
  id: "f1",
  checkId: "allergy",
  concernId: "documented-allergy",
  itemId: "item-1",
  severity: "critical",
  title: "t",
  detail: "d",
  action: "a",
  learningPoint: "l",
  blocksDispensing: true,
  ...over,
}) as any;

test("a clean check correctly cleared scores as such", () => {
  const g = clinical.gradeCheck("allergy" as any, [{ checkId: "allergy", verdict: "ok" }] as any, []);
  assert.equal(g.outcome, "correct-clear");
  assert.equal(g.missed.length, 0);
});

test("recording a concern where there is none is over-calling, not a pass", () => {
  const g = clinical.gradeCheck(
    "allergy" as any,
    [{ checkId: "allergy", verdict: "concern", concernId: "documented-allergy", itemId: "item-1" }] as any,
    [],
  );
  assert.equal(g.outcome, "over-called");
  assert.equal(g.spurious.length, 1);
});

test("naming the right concern on the right item identifies the finding", () => {
  const f = finding();
  const g = clinical.gradeCheck(
    "allergy" as any,
    [{ checkId: "allergy", verdict: "concern", concernId: "documented-allergy", itemId: "item-1" }] as any,
    [f],
  );
  assert.equal(g.outcome, "identified");
  assert.equal(g.matched.length, 1);
});

test("the right concern against the wrong item does not count", () => {
  const f = finding();
  const g = clinical.gradeCheck(
    "allergy" as any,
    [{ checkId: "allergy", verdict: "concern", concernId: "documented-allergy", itemId: "item-2" }] as any,
    [f],
  );
  assert.equal(g.outcome, "missed");
  assert.equal(g.matched.length, 0);
});

test("saying 'no concern' when there is one is a miss", () => {
  const g = clinical.gradeCheck("allergy" as any, [{ checkId: "allergy", verdict: "ok" }] as any, [finding()]);
  assert.equal(g.outcome, "missed");
  assert.equal(g.missed.length, 1);
});

test("finding one of two problems on the same check is partial", () => {
  const a = finding({ id: "f1", concernId: "documented-allergy", itemId: "item-1" });
  const b = finding({ id: "f2", concernId: "cross-reactivity", itemId: "item-2" });
  const g = clinical.gradeCheck(
    "allergy" as any,
    [{ checkId: "allergy", verdict: "concern", concernId: "documented-allergy", itemId: "item-1" }] as any,
    [a, b],
  );
  assert.equal(g.outcome, "partial");
  assert.equal(g.matched.length, 1);
  assert.equal(g.missed.length, 1);
});

test("a check with no verdict recorded is 'not-run', and all-run gates on all ten", () => {
  const g = clinical.gradeCheck("allergy" as any, [], [finding()]);
  assert.equal(g.outcome, "not-run");
  assert.equal(clinical.allChecksRun([]), false);
  const all = C.CHECK_SPECS.map((s: any) => ({ checkId: s.id, verdict: "ok" }));
  assert.equal(clinical.allChecksRun(all as any), true);
  assert.equal(clinical.checksOutstanding(all as any).length, 0);
});

test("a blocking finding stays blocking until an intervention resolves it", () => {
  const f = finding();
  assert.equal(clinical.blockingFindings([f], []).length, 1);
  assert.equal(clinical.blockingFindings([f], ["f1"]).length, 0);
  assert.equal(clinical.blockingFindings([finding({ blocksDispensing: false })], []).length, 0);
});

// ─── Verification ───────────────────────────────────────────────────────────

const patient = PATIENTS.patient("ayesha-siddiqui")!;

function ctx(over: Record<string, unknown> = {}) {
  const it = item();
  const m = MEDS.medicine("amoxicillin-500")!;
  return {
    item: it,
    tray: { id: "t", itemId: "item-1", medicineId: "amoxicillin-500", batchId: "b", packs: 2, units: 21 },
    patient,
    label: clinical.draftLabel(it, patient, m, 21),
    records: C.CHECK_SPECS.map((s: any) => ({ checkId: s.id, verdict: "ok" })),
    batchExpiry: "2028-01",
    today: TODAY,
    ...over,
  } as any;
}

test("a correct dispensing satisfies every verification line", () => {
  const truths = clinical.verificationTruths(ctx());
  truths.forEach((t: any) => assert.equal(t.truth, true, `${t.id} should be true: ${t.problem}`));
});

test("the wrong strength in the tray makes the strength line false and the rest honest", () => {
  const truths = clinical.verificationTruths(ctx({ tray: { id: "t", itemId: "item-1", medicineId: "amoxicillin-250", batchId: "b", packs: 2, units: 21 } }));
  assert.equal(clinical.truthFor(truths, "right-medicine" as any)!.truth, true, "same generic, so the medicine line is true");
  assert.equal(clinical.truthFor(truths, "right-strength" as any)!.truth, false);
});

test("a batch that expires before the course ends fails the expiry line", () => {
  assert.equal(clinical.truthFor(clinical.verificationTruths(ctx({ batchExpiry: "2026-09" })), "expiry-checked" as any)!.truth, true);
  assert.equal(clinical.truthFor(clinical.verificationTruths(ctx({ batchExpiry: "2026-08" })), "expiry-checked" as any)!.truth, false);
  assert.equal(clinical.truthFor(clinical.verificationTruths(ctx({ batchExpiry: undefined })), "expiry-checked" as any)!.truth, false);
});

test("the allergy and interaction lines are false until those checks have been run", () => {
  const truths = clinical.verificationTruths(ctx({ records: [] }));
  assert.equal(clinical.truthFor(truths, "allergies-checked" as any)!.truth, false);
  assert.equal(clinical.truthFor(truths, "interactions-checked" as any)!.truth, false);
});

test("ticking a line that is not true is reported as a false attestation", () => {
  const truths = clinical.verificationTruths(ctx({ records: [] }));
  const lies = clinical.falseAttestations(truths, ["allergies-checked", "right-medicine"] as any);
  assert.equal(lies.length, 1);
  assert.equal(lies[0].id, "allergies-checked");
});

// ─── Labels ─────────────────────────────────────────────────────────────────

test("a label for the wrong patient is a critical issue", () => {
  const c = ctx();
  c.label = { ...c.label, patientName: "Someone Else" };
  const issues = clinical.labelIssues(c);
  assert.ok(issues.some((i: any) => i.field === "patientName" && i.severity === "critical"));
});

test("a missing auxiliary warning is flagged, and an extra one is too", () => {
  const c = ctx();
  c.label = { ...c.label, specialInstructions: [] };
  assert.ok(clinical.labelIssues(c).some((i: any) => i.field === "auxiliary" && /Missing warning/.test(i.message)));

  const c2 = ctx();
  c2.label = { ...c2.label, specialInstructions: c2.label.specialInstructions.concat(["Keep refrigerated"]) };
  assert.ok(clinical.labelIssues(c2).some((i: any) => /do not belong/.test(i.message)));
});

test("directions read as an instruction a patient can follow", () => {
  const c = ctx();
  const line = clinical.directionsLine(c.label, MEDS.medicine("amoxicillin-500"));
  assert.match(line, /^Take 1 capsule/);
  assert.match(line, /for 7 days/);
});

// ─── Dates and inventory ────────────────────────────────────────────────────

test("expiry is measured in whole months, so a pack expiring this month is not expired", () => {
  assert.equal(dates.monthsUntilExpiry("2026-09", MONTH), 0);
  assert.equal(inventory.expiryStatus("2026-09", MONTH), "expiring-soon");
  assert.equal(inventory.expiryStatus("2026-08", MONTH), "expired");
  assert.equal(inventory.expiryStatus("2028-01", MONTH), "normal");
  assert.equal(dates.addMonths("2026-11", 3), "2027-02");
  assert.equal(dates.formatExpiry("2026-09"), "09/2026");
});

test("the opening inventory is deterministic and holds expired, near and in-date stock", () => {
  const a = inventory.buildInventory(MONTH);
  const b = inventory.buildInventory(MONTH);
  assert.deepEqual(a, b, "the same month must produce the same shelf");
  const summary = inventory.summariseExpiry(a, MONTH);
  assert.ok(summary.expired.length > 0, "an expiry dashboard with nothing on it teaches nothing");
  assert.ok(summary.expiringSoon.length > 0);
  assert.ok(summary.normalCount > 0);
});

test("dispensing depletes the batch it came from, and returning it restores it", () => {
  const stock = inventory.buildInventory(MONTH);
  const line = inventory.stockFor(stock, "amoxicillin-500")!;
  const batch = line.batches[line.batches.length - 1];
  const before = batch.packs;

  const after = inventory.dispensePacks(stock, "amoxicillin-500", batch.id, 2);
  const afterLine = inventory.stockFor(after, "amoxicillin-500")!;
  assert.equal(afterLine.batches.find((b: any) => b.id === batch.id)!.packs, before - 2);
  assert.equal(afterLine.packs, inventory.totalPacks(afterLine.batches));
  // The original must not have been mutated.
  assert.equal(inventory.stockFor(stock, "amoxicillin-500")!.batches.find((b: any) => b.id === batch.id)!.packs, before);

  const restored = inventory.receivePacks(after, "amoxicillin-500", batch.id, 2);
  assert.equal(inventory.stockFor(restored, "amoxicillin-500")!.batches.find((b: any) => b.id === batch.id)!.packs, before);
});

test("expired packs are not counted as usable stock, and a discarded batch disappears", () => {
  const stock = inventory.buildInventory(MONTH);
  const line = inventory.stockFor(stock, "chlorpheniramine-4")!;
  const expired = line.batches.filter((b: any) => inventory.expiryStatus(b.expiry, MONTH) === "expired");
  assert.ok(expired.length > 0, "this product is seeded with an out-of-date batch");
  assert.ok(inventory.usablePacks(line, MONTH) < line.packs);

  const after = inventory.removeBatch(stock, "chlorpheniramine-4", expired[0].id);
  assert.equal(inventory.stockFor(after, "chlorpheniramine-4")!.batches.some((b: any) => b.id === expired[0].id), false);
});

test("a batch covers a course only if it outlasts the month the course ends in", () => {
  const b = { id: "x", batchNo: "X", expiry: "2026-10", packs: 5 } as any;
  assert.equal(inventory.batchCoversCourse(b, "2026-10"), true);
  assert.equal(inventory.batchCoversCourse(b, "2026-11"), false);
});

// ─── Calculators ────────────────────────────────────────────────────────────

test("Cockcroft-Gault matches a worked example, and refuses what it cannot compute", () => {
  // (140-74) x 63 / (72 x 1.6) = 4158 / 115.2 = 36.09
  assert.equal(calc.cockcroftGault(74, 63, 1.6, false)!.value, 36.1);
  // The same patient as female is 85% of that.
  assert.equal(calc.cockcroftGault(74, 63, 1.6, true)!.value, 30.7);
  assert.equal(calc.cockcroftGault(9, 30, 0.5, false), null, "not validated in children");
  assert.equal(calc.cockcroftGault(74, 63, 0, false), null);
});

test("the body-measure calculators match their formulae", () => {
  assert.equal(calc.bmi(70, 175)!.value, 22.9);
  assert.equal(calc.bsaMosteller(70, 175)!.value, 1.84);
  assert.equal(calc.bmi(70, 0), null);
});

test("quantity, days' supply and weight-based dose agree with the clinical layer", () => {
  assert.equal(calc.quantityForCourse(1, 3, 7)!.value, 21);
  assert.equal(calc.daysSupplyCalc(21, 1, 3)!.value, 7);
  assert.equal(calc.daysSupplyCalc(20, 1, 3)!.value, 6);
  const wb = calc.weightBasedDose(40, 16, 3)!;
  assert.equal(wb.value, 213.33);
  assert.match(wb.note!, /640/);
});

test("the paediatric rules are the textbook ones, and say they are approximations", () => {
  assert.equal(calc.clarksRule(500, 16)!.value, 114.3);
  assert.equal(calc.youngsRule(500, 4)!.value, 125);
  assert.match(calc.clarksRule(500, 16)!.note!, /approximation/i);
  assert.match(calc.youngsRule(500, 15)!.note!, /1–12 years/);
});

test("concentration, infusion and unit conversion", () => {
  assert.equal(calc.dilution(10, null, 2, 100)!.value, 20);
  assert.equal(calc.dilution(null, 20, 2, 100)!.value, 10);
  assert.equal(calc.dilution(10, 20, 2, 100), null, "four knowns is not a question");
  assert.equal(calc.percentToMgPerMl(1)!.value, 10);
  assert.equal(calc.volumeForDose(250, 125, 5)!.value, 10);
  assert.equal(calc.dripRate(500, 20, 240)!.value, 42);
  assert.equal(calc.infusionRate(500, 4)!.value, 125);
  assert.equal(calc.convertUnits(1, "g", "mg", "mass")!.value, 1000);
  assert.equal(calc.convertUnits(37, "°C", "°F", "temperature")!.value, 98.6);
});

// ─── Counselling ────────────────────────────────────────────────────────────

test("counselling scores coverage, and a wrong statement costs more than an omission", () => {
  const m = MEDS.medicine("amoxicillin-500")!;
  const all = m.counselling.purpose.points;
  const perfect = counselling.gradeTopic(m, "purpose" as any, all);
  assert.equal(perfect.score, 1);
  assert.equal(perfect.wrong.length, 0);

  const withWrong = counselling.gradeTopic(m, "purpose" as any, all.concat([m.counselling.purpose.distractors[0]]));
  assert.ok(withWrong.score < perfect.score, "saying something untrue must cost something");
  assert.equal(withWrong.wrong.length, 1);

  const silent = counselling.gradeTopic(m, "purpose" as any, []);
  assert.equal(silent.score, 0);
  assert.equal(silent.missed.length, all.length);
});

test("red flags: missing one and inventing one both count, and 'none' is a real answer", () => {
  const otcRefer = { redFlagIds: ["chest-pain", "treatment-failure"] } as any;
  assert.equal(counselling.gradeRedFlags(otcRefer, ["chest-pain", "treatment-failure"]).percent, 100);
  assert.equal(counselling.gradeRedFlags(otcRefer, ["chest-pain"]).missed.length, 1);
  assert.ok(counselling.gradeRedFlags(otcRefer, ["chest-pain", "treatment-failure", "jaundice"]).percent < 100);

  const otcClean = { redFlagIds: [] } as any;
  assert.equal(counselling.gradeRedFlags(otcClean, []).percent, 100);
  assert.equal(counselling.gradeRedFlags(otcClean, ["jaundice"]).percent, 75);
});

test("supplying to a patient who needed referral is flagged as an unsafe supply", () => {
  const otc = { correctOutcome: "refer", appropriateMedicineIds: [] } as any;
  const g = counselling.gradeOtcDecision(otc, "self-care", "loperamide-2");
  assert.equal(g.correct, false);
  assert.equal(g.unsafeSupply, true);

  const ok = counselling.gradeOtcDecision(otc, "refer", null);
  assert.equal(ok.correct, true);
  assert.equal(ok.unsafeSupply, false);
});

// ─── Scenario building ──────────────────────────────────────────────────────

test("the same seed rebuilds the same case exactly", () => {
  const t = SCEN.scenarioTemplate("sulfa-allergy")!;
  const a = scenarioEngine.buildScenario(t, 1234, 1, TODAY);
  const b = scenarioEngine.buildScenario(t, 1234, 1, TODAY);
  assert.deepEqual(a.shelfMedicineIds, b.shelfMedicineIds);
  assert.deepEqual(a.dialogue, b.dialogue);

  const other = scenarioEngine.buildScenario(t, 99, 1, TODAY);
  assert.notDeepEqual(a.shelfMedicineIds, other.shelfMedicineIds, "a different seed should vary the shelf");
});

test("the prescribed product is always on the shelf, alongside its look-alikes", () => {
  SCEN.SCENARIOS.forEach((t: any) => {
    const s = scenarioEngine.buildScenario(t, scenarioEngine.seedFor(t.id, 1), 1, TODAY);
    if (!s.prescription) return;
    s.prescription.items.forEach((i: any) => {
      assert.ok(s.shelfMedicineIds.indexOf(i.medicineId) !== -1, `${t.id}: the prescribed product is not on the shelf`);
    });
  });
});

// ─── Flow gating ────────────────────────────────────────────────────────────

function flowState(over: Record<string, unknown> = {}) {
  const s = scenarioEngine.buildScenario(SCEN.scenarioTemplate("chest-infection")!, 1, 1, TODAY);
  return {
    scenario: s,
    stage: "safety-checks",
    seen: [],
    records: [],
    transcriptionDone: false,
    interventionsDone: false,
    selectedMedicineId: {},
    selectedBatchId: {},
    quantityConfirmed: {},
    tray: [],
    labelsWritten: {},
    ticked: [],
    counsellingTopicsDone: 0,
    dialogueAnswered: 0,
    documentationDone: false,
    wwhamAsked: 0,
    redFlagsRecorded: false,
    otcDecided: false,
    otcProductChosen: false,
    paid: false,
    ...over,
  } as any;
}

test("a stage cannot be opened until everything before it is done", () => {
  const s = flowState();
  assert.equal(flow.stageUnlocked("safety-checks" as any, s), false, "transcription is not done");
  assert.equal(flow.stageUnlocked("arrival" as any, s), true);
});

test("the safety-check stage completes only when all ten checks have a verdict", () => {
  const nine = C.CHECK_SPECS.slice(0, 9).map((c: any) => ({ checkId: c.id, verdict: "ok" }));
  assert.equal(flow.stageComplete("safety-checks" as any, flowState({ records: nine })), false);
  const ten = C.CHECK_SPECS.map((c: any) => ({ checkId: c.id, verdict: "ok" }));
  assert.equal(flow.stageComplete("safety-checks" as any, flowState({ records: ten })), true);
});

test("the intervention stage is skipped when the prescription has no problems", () => {
  const clean = flowState();
  assert.equal(flow.stageSkipped("intervention" as any, clean), true, "the beginner case has no findings");

  const withFindings = flowState({ scenario: scenarioEngine.buildScenario(SCEN.scenarioTemplate("sulfa-allergy")!, 1, 1, TODAY) });
  assert.equal(flow.stageSkipped("intervention" as any, withFindings), false);
});

test("an OTC case runs a different set of stages from a prescription", () => {
  const rx = flow.stageFlow(scenarioEngine.buildScenario(SCEN.scenarioTemplate("chest-infection")!, 1, 1, TODAY));
  const otc = flow.stageFlow(scenarioEngine.buildScenario(SCEN.scenarioTemplate("hay-fever")!, 1, 2, TODAY));
  assert.ok(rx.indexOf("safety-checks" as any) !== -1);
  assert.ok(otc.indexOf("wwham" as any) !== -1);
  assert.equal(otc.indexOf("safety-checks" as any), -1);
});

// ─── The debrief ────────────────────────────────────────────────────────────

function submission(over: Record<string, unknown> = {}) {
  const s = scenarioEngine.buildScenario(SCEN.scenarioTemplate("sulfa-allergy")!, 1, 1, TODAY);
  return {
    scenario: s,
    records: [],
    interventions: [],
    transcription: [],
    tray: [],
    batchExpiry: {},
    labels: {},
    ticked: [],
    counselling: [],
    dialogue: [],
    documentation: { complaint: "", assessment: "", supplied: "", counselling: "", intervention: "", referral: "", followUp: "" },
    wwham: [],
    redFlags: [],
    otcDecision: null,
    minutesTaken: 12,
    ...over,
  } as any;
}

test("missing a critical finding is reported as critical, with its learning point", () => {
  const sub = submission({ records: C.CHECK_SPECS.map((c: any) => ({ checkId: c.id, verdict: "ok" })) });
  const report = scoring.buildReport(sub);
  assert.equal(report.criticalMissed, true);
  const missed = report.errors.find((e: any) => /Documented sulfonamide allergy/.test(e.title));
  assert.ok(missed, "the missed allergy must appear in the debrief");
  assert.ok(missed!.learningPoint.length > 20, "an error without teaching is just a scold");
  assert.equal(report.errors[0].severity, "critical", "the debrief leads with the worst thing");
});

test("identifying every finding removes the critical flag and records a strength", () => {
  const s = scenarioEngine.buildScenario(SCEN.scenarioTemplate("sulfa-allergy")!, 1, 1, TODAY);
  const records = C.CHECK_SPECS.map((c: any) => {
    const real = s.findings.filter((f: any) => f.checkId === c.id);
    if (real.length === 0) return { checkId: c.id, verdict: "ok" };
    return { checkId: c.id, verdict: "concern", concernId: real[0].concernId, itemId: real[0].itemId };
  });
  const report = scoring.buildReport(submission({ scenario: s, records }));
  assert.ok(report.strengths.some((x: string) => /Every clinical problem/.test(x)));
  assert.equal(report.errors.some((e: any) => /^Missed:/.test(e.title)), false);
});

test("a competency the case never exercised is left out rather than scored zero", () => {
  const report = scoring.buildReport(submission());
  const counsellingScore = report.competencies.find((c: any) => c.id === "counselling")!;
  assert.equal(counsellingScore.max, 0);
  const exercised = report.competencies.filter((c: any) => c.max > 0);
  assert.ok(exercised.length > 0);
  assert.equal(
    report.overallPercent,
    Math.round(exercised.reduce((a: number, c: any) => a + c.percent, 0) / exercised.length),
  );
});

test("the intervention record names every field, and says when one is not recorded", () => {
  const lines = scoring.renderDocumentation(submission(), "Test Pharmacy");
  const text = lines.join("\n");
  scoring.DOC_FIELDS.forEach((f: any) => assert.ok(text.indexOf(f.label.toUpperCase()) !== -1, `${f.label} missing from the record`));
  assert.ok(/not recorded/.test(text));
  assert.ok(/relates to no real patient/.test(text));
});

test("dispensing the wrong strength is a critical error in the debrief", () => {
  const s = scenarioEngine.buildScenario(SCEN.scenarioTemplate("sulfa-allergy")!, 1, 1, TODAY);
  const report = scoring.buildReport(
    submission({
      scenario: s,
      tray: [{ id: "t", itemId: "item-1", medicineId: "cotrimoxazole-ss", batchId: "b", packs: 2, units: 14 }],
    }),
  );
  assert.ok(report.errors.some((e: any) => /strength does not match/.test(e.title) && e.severity === "critical"));
});
