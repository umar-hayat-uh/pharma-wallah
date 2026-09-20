// ============================================================
//  PharmaWallah — Community Pharmacy Simulation Lab
// ============================================================
//
//  Route: /pharmacy-counter
//
//  A community-pharmacy counter a Pharm-D student stands behind: receive a
//  prescription, read the record, run the clinical checks, pick the right pack
//  from the right batch, label it, counsel the patient, document it and take
//  payment — or decide that what is in front of them belongs to a doctor.
//
//  Split so the rules can be reasoned about without rendering anything:
//
//    types.ts              every domain type
//    data/constants.ts     risk bands, frequencies, the ten checks, the nine
//                          verification lines, counselling topics, red flags
//    data/medicines.ts     the shelf catalogue, with counselling and monographs
//    data/patients.ts      the ten fictional patients
//    data/scenarios.ts     the ten cases, and their findings (the answer key)
//
//    engine/rng.ts         seeded variation — never `Math.random()`
//    engine/dates.ts       month arithmetic for expiry
//    engine/scenario.ts    template + seed → a playable case
//    engine/inventory.ts   stock, batches, expiry, dispensing
//    engine/clinical.ts    quantities, the check grader, verification, labels
//    engine/evidence.ts    what each check shows — facts, never the answer
//    engine/counselling.ts counselling, dialogue and the WWHAM consultation
//    engine/calculators.ts the bench calculators, with their working
//    engine/pos.ts         the till
//    engine/flow.ts        stage order, gating and progress
//    engine/scoring.ts     competencies, errors and the learning points
//
//  Presentation:
//
//    CommunityPharmacyLab  the shell: three zones, persistence, tracking
//    Chrome                header, stage rail, bench, dock, phone navigation
//    StageView             routes the current stage to its module
//    HomeScreen            before the counter
//    Debrief               after the case
//    kit.tsx               panel, field, choice, risk chip, dialog
//    environment/objects   the pharmacy, drawn — packs, shelves, equipment
//    modules/*             patient, prescription, checks, dispensing,
//                          counselling, OTC, and the support drawers
//    pharmacy.css          the bespoke surfaces, namespaced on .pw-cph
//
//  Everything is local state. There is no API route, no AI call and no
//  telemetry beyond the two progress rows `useTracker` writes (opened,
//  completed) — the same thing every other learning surface on the site does.
//
//  Tests: `node --test scripts/pharmacy-counter.test.mts` covers the pure
//  layer (checks, quantities, verification, labels, inventory, scoring).

export { default as CommunityPharmacyLab } from "./CommunityPharmacyLab";
export * from "./types";
export * from "./data/constants";
export * from "./data/scenarios";
