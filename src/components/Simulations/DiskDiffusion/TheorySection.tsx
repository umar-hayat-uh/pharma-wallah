"use client";

// ============================================================
// PharmaWallah — Disk Diffusion Lab: Theory
// ============================================================
//
// Five sub-sections behind one nav: Principle, Materials, Lab Guide,
// Interpretation, Safety & notes. Every place the theory describes something
// the student can do, there is a button that opens the simulation at exactly
// that stage — the two halves of the page are meant to be one lab, not a
// reading and then a game.

import React from "react";
import {
  ArrowRight,
  BookOpen,
  FlaskConical,
  Info,
  Ruler,
  ShieldAlert,
  Table2,
} from "lucide-react";

import LabGuide from "./LabGuide";
import PreLabCheck from "./PreLabCheck";
import {
  ANTIBIOTICS,
  DISK_DIAMETER_MM,
  EDGE_MARGIN_MM,
  INTERPRETATION_SYSTEMS,
  MIN_DISK_SPACING_MM,
  ORGANISMS,
  PLATE_DIAMETER_MM,
} from "./data";
import { getInterpretationSystem } from "./engine";
import type { LabStage, OrganismGroup, TheoryTab } from "./types";

const TABS: { id: TheoryTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "principle", label: "Principle", icon: Info },
  { id: "materials", label: "Materials", icon: FlaskConical },
  { id: "guide", label: "Lab Guide", icon: BookOpen },
  { id: "interpretation", label: "Interpretation", icon: Table2 },
  { id: "safety", label: "Safety & notes", icon: ShieldAlert },
];

const GROUP_LABELS: Record<OrganismGroup, string> = {
  enterobacterales: "Enterobacterales",
  pseudomonas: "Pseudomonas aeruginosa",
  staphylococcus: "Staphylococcus spp.",
  streptococcus: "Streptococcus spp.",
  enterococcus: "Enterococcus spp.",
};

export interface TheorySectionProps {
  tab: TheoryTab;
  onTabChange: (tab: TheoryTab) => void;
  interpretationSystemId: string;
  onInterpretationSystemChange: (id: string) => void;
  onTryInSimulation: (stage: LabStage) => void;
  /** Passed up so the shell can record the attempt against the student's progress. */
  onPreLabComplete?: (score: number, total: number) => void;
}

/** The "Try it in simulation" call to action, used throughout the theory. */
function TryIt({ label, stage, onGo }: { label: string; stage: LabStage; onGo: (s: LabStage) => void }) {
  return (
    <button
      type="button"
      onClick={() => onGo(stage)}
      className="mt-3 inline-flex items-center gap-2 rounded-xl border-2 border-brandGreen/30 bg-brandGreen/[0.07] px-4 py-2.5 text-sm font-bold text-brandGreen transition-colors hover:bg-brandGreen/[0.14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandGreen focus-visible:ring-offset-2"
    >
      {label}
      <ArrowRight className="h-4 w-4" aria-hidden />
    </button>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7">{children}</div>;
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mb-2">{children}</h3>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-slate-600 leading-relaxed mb-3">{children}</p>;
}

export default function TheorySection({
  tab,
  onTabChange,
  interpretationSystemId,
  onInterpretationSystemChange,
  onTryInSimulation,
  onPreLabComplete,
}: TheorySectionProps) {
  const system = getInterpretationSystem(interpretationSystemId);

  return (
    <div>
      {/* Sub-navigation */}
      <div
        className="mb-4 -mx-1 flex gap-2 overflow-x-auto pb-1"
        role="tablist"
        aria-label="Theory sections"
      >
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            aria-controls={`theory-${id}`}
            onClick={() => onTabChange(id)}
            className={`shrink-0 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue focus-visible:ring-offset-2 ${
              tab === id
                ? "bg-brandBlue text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {label}
          </button>
        ))}
      </div>

      {/* ── Principle ── */}
      {tab === "principle" && (
        <div id="theory-principle" role="tabpanel" className="space-y-4">
          <Panel>
            <H3>What the test answers</H3>
            <P>
              Antimicrobial susceptibility testing exists to answer one question about one patient&apos;s
              isolate: which of these drugs is likely to work? Choosing without it is guesswork, and
              guesswork both fails patients and selects for resistance.
            </P>
            <P>
              The Kirby-Bauer disk diffusion method answers it by letting the drug and the organism
              compete on an agar plate. A paper disk carrying a known amount of antimicrobial is laid on
              a lawn of the organism. The drug leaves the paper and spreads outwards through the agar,
              so it is most concentrated at the disk and falls away steadily with distance.
            </P>
          </Panel>

          <Panel>
            <H3>Why a clear circle appears</H3>
            <P>
              Two things happen at once under that disk. The drug diffuses outwards, and the bacteria
              multiply. Close to the disk the concentration stays above the level that inhibits this
              organism, so no visible growth appears. Further out the concentration has fallen too low
              before the population became large enough to see, and growth fills in.
            </P>
            <P>
              The edge of the clear area is where those two curves cross. That is why a zone diameter is
              a meaningful number at all — and also why it is not a measure of potency. It reflects how
              fast the molecule moves through agar as much as how susceptible the organism is, which is
              exactly why a diameter can only be read against criteria built for that organism, that
              agent and that disk content.
            </P>
            <TryIt label="Watch the zones form" stage="growth" onGo={onTryInSimulation} />
          </Panel>

          <Panel>
            <H3>What changes the answer</H3>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  title: "Inoculum density",
                  body: "More organisms in the drug's path means growth reaches closer to the disk. A heavy suspension shrinks the zones; a light one inflates them.",
                  stage: "inoculum" as LabStage,
                },
                {
                  title: "Agar depth",
                  body: "The drug diffuses in three dimensions. A thin layer lets it spread further sideways and reads falsely susceptible; a thick layer does the reverse.",
                  stage: "plate-preparation" as LabStage,
                },
                {
                  title: "Lawn uniformity",
                  body: "A confluent lawn gives a sharp circular edge. Patchy growth gives a ragged one that cannot be measured reliably.",
                  stage: "inoculation" as LabStage,
                },
                {
                  title: "Disk spacing",
                  body: `Zones that overlap have no readable edge. Disks stay at least ${MIN_DISK_SPACING_MM} mm apart centre to centre and ${EDGE_MARGIN_MM} mm in from the rim.`,
                  stage: "disk-placement" as LabStage,
                },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                  <p className="text-sm font-extrabold text-slate-900 mb-1">{item.title}</p>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.body}</p>
                  <button
                    type="button"
                    onClick={() => onTryInSimulation(item.stage)}
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-brandBlue hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue focus-visible:ring-offset-2 rounded"
                  >
                    Try it in the simulation
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>
              ))}
            </div>
          </Panel>

          <PreLabCheck onComplete={onPreLabComplete} />
        </div>
      )}

      {/* ── Materials ── */}
      {tab === "materials" && (
        <div id="theory-materials" role="tabpanel" className="space-y-4">
          <Panel>
            <H3>What is on the bench</H3>
            <P>
              Each item is here for a reason, and most of the reasons are about reproducibility — the
              whole method depends on a millimetre measured here meaning the same as a millimetre
              measured in another laboratory.
            </P>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {[
                ["Pure culture, 18–24 h old", "Three to five colonies of one morphology. A mixed culture gives a mixed lawn and an uninterpretable plate."],
                ["Sterile saline or broth", "The suspending fluid. It must not itself inhibit the organism."],
                ["Turbidity standard", "The reference the suspension is matched against — the single biggest controllable source of error."],
                [`Mueller-Hinton agar plate, ${PLATE_DIAMETER_MM} mm`, "Low in sulphonamide and trimethoprim inhibitors, supports most non-fastidious pathogens, reproducible between batches."],
                ["Sterile cotton swabs", "One per plate. Excess fluid is pressed out against the tube wall before swabbing."],
                ["Antibiotic disks", `Paper disks ${DISK_DIAMETER_MM} mm across, each carrying a stated amount of drug. Stored cold and dry, brought to room temperature before the tube is opened.`],
                ["Disk dispenser or sterile forceps", "For placing disks flat and in full contact with the agar."],
                ["Incubator, 35 ± 2 °C", "Set for air, not CO₂ — added CO₂ lowers the agar pH and shifts several drug classes."],
                ["Ruler or callipers", "Read to the nearest whole millimetre, against a dark background in reflected light."],
                ["Interpretive criteria in force", "The table that turns a diameter into a report. Specific to standard, organism, agent and disk content."],
              ].map(([name, why]) => (
                <div key={name} className="rounded-2xl border border-slate-200 p-3.5">
                  <p className="text-sm font-bold text-slate-900">{name}</p>
                  <p className="text-[13px] text-slate-600 leading-relaxed mt-1">{why}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel>
            <H3>The antibiotic panel in this simulation</H3>
            <P>
              A panel is chosen for the organism and the site of infection, not assembled at random.
              These seven are configurable — the plate holds six at correct spacing, so part of the
              exercise is deciding which to leave off.
            </P>
            <div className="overflow-x-auto -mx-1 px-1">
              <table className="w-full min-w-[520px] text-sm">
                <caption className="sr-only">Antibiotic disks available in this simulation</caption>
                <thead>
                  <tr className="border-b border-slate-200 text-left">
                    {["Disk", "Antibiotic", "Content", "Class", "Mechanism"].map((h) => (
                      <th key={h} scope="col" className="py-2 pr-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ANTIBIOTICS.map((a) => (
                    <tr key={a.id}>
                      <td className="py-2.5 pr-3">
                        <span
                          className="inline-grid h-7 w-7 place-items-center rounded-full border-2 text-[10px] font-black"
                          style={{ borderColor: a.color, color: a.color }}
                        >
                          {a.id}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 font-bold text-slate-900">{a.name}</td>
                      <td className="py-2.5 pr-3 tabular-nums text-slate-700">{a.diskContent}</td>
                      <td className="py-2.5 pr-3 text-slate-600">{a.className}</td>
                      <td className="py-2.5 pr-3 text-slate-600">{a.mechanism}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <TryIt label="Build a panel on the plate" stage="disk-placement" onGo={onTryInSimulation} />
          </Panel>
        </div>
      )}

      {/* ── Lab Guide ── */}
      {tab === "guide" && (
        <div id="theory-guide" role="tabpanel">
          <LabGuide onTryInSimulation={onTryInSimulation} />
        </div>
      )}

      {/* ── Interpretation ── */}
      {tab === "interpretation" && (
        <div id="theory-interpretation" role="tabpanel" className="space-y-4">
          <Panel>
            <H3>From millimetres to a report</H3>
            <P>
              A diameter on its own is not a result. It becomes one by being looked up in a table of
              interpretive criteria for that organism group, that antimicrobial and that disk content.
              What is reported is the category, not the millimetres.
            </P>
            <P>
              The measurement always includes the {DISK_DIAMETER_MM} mm paper disk, so an organism with no
              inhibition at all is recorded as {DISK_DIAMETER_MM} mm — never as zero.
            </P>
            <TryIt label="Learn how to measure the zone" stage="measurement" onGo={onTryInSimulation} />
          </Panel>

          <Panel>
            <H3>The categories</H3>
            <div className="grid gap-3 sm:grid-cols-3">
              {(
                [
                  ["S", system.categoryLabels.S, "The isolate is likely to respond to the agent at the dosing the category assumes.", "text-brandGreen", "border-brandGreen/30 bg-brandGreen/[0.07]"],
                  ["I", system.categoryLabels.I, "A buffer between the other two. Depending on the system, it signals either uncertainty or that the agent may work where exposure is higher.", "text-amber-600", "border-amber-200 bg-amber-50"],
                  ["R", system.categoryLabels.R, "The isolate is unlikely to respond at achievable concentrations. Treatment failure is the expectation.", "text-red-600", "border-red-200 bg-red-50"],
                ] as const
              ).map(([key, label, body, tone, box]) => (
                <div key={key} className={`rounded-2xl border p-4 ${box}`}>
                  <p className={`text-2xl font-black ${tone}`}>{key}</p>
                  <p className={`text-sm font-extrabold ${tone} mt-0.5`}>{label}</p>
                  <p className="text-[13px] text-slate-700 leading-relaxed mt-1.5">{body}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
              <p className="text-sm text-slate-700 leading-relaxed">
                Some organism and agent pairs have no zone-diameter criteria at all. That is a real
                answer, not a gap: it means disk diffusion cannot be interpreted for that pair and a
                different method is needed. This lab reports those as{" "}
                <span className="font-bold text-slate-900">no interpretive criteria</span> rather than
                inventing a threshold.
              </p>
            </div>
          </Panel>

          <Panel>
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
              <div>
                <H3>Criteria in this simulation</H3>
                <p className="text-sm text-slate-600">Thresholds are configuration — switch the reporting system to see it.</p>
              </div>
              <div>
                <label htmlFor="theory-system" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Reporting system
                </label>
                <select
                  id="theory-system"
                  value={interpretationSystemId}
                  onChange={(e) => onInterpretationSystemChange(e.target.value)}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-800"
                >
                  {INTERPRETATION_SYSTEMS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-4 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-3.5">
              <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" aria-hidden />
              <p className="text-[13px] text-amber-900 leading-relaxed">{system.sourceNote}</p>
            </div>

            <div className="overflow-x-auto -mx-1 px-1">
              <table className="w-full min-w-[560px] text-sm">
                <caption className="sr-only">
                  Zone diameter criteria in millimetres, by antibiotic and organism group
                </caption>
                <thead>
                  <tr className="border-b border-slate-200 text-left">
                    <th scope="col" className="py-2 pr-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Antibiotic
                    </th>
                    {(Object.keys(GROUP_LABELS) as OrganismGroup[]).map((g) => (
                      <th key={g} scope="col" className="py-2 pr-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        {GROUP_LABELS[g]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ANTIBIOTICS.map((a) => (
                    <tr key={a.id}>
                      <th scope="row" className="py-2.5 pr-3 text-left font-bold text-slate-900">
                        {a.name}
                        <span className="block text-[11px] font-semibold text-slate-500">{a.diskContent}</span>
                      </th>
                      {(Object.keys(GROUP_LABELS) as OrganismGroup[]).map((g) => {
                        const c = system.criteria[a.id]?.[g];
                        return (
                          <td key={g} className="py-2.5 pr-3 tabular-nums">
                            {c ? (
                              <span className="text-slate-700">
                                <span className="font-bold text-brandGreen">S ≥ {c.susceptible}</span>
                                <span className="block text-[11px] text-slate-500">R ≤ {c.resistant}</span>
                              </span>
                            ) : (
                              <span className="text-slate-400" title="No interpretive criteria in this teaching set">
                                —
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-[13px] text-slate-500 leading-relaxed">
              A dash means this teaching set has no criteria for that pair. Values are in millimetres and
              include the {DISK_DIAMETER_MM} mm disk.
            </p>
          </Panel>

          <Panel>
            <H3>Reading the plate honestly</H3>
            <P>
              Quality control is what makes any of this trustworthy. Reference strains with known
              expected ranges are tested alongside patient isolates, and a result that falls outside the
              expected range invalidates the run rather than the strain.
            </P>
            <P>
              Watch for the plate telling you something other than a diameter: colonies growing inside an
              otherwise clear zone may be a mixed culture or a resistant subpopulation; a zone with a
              blurred edge usually means the lawn was not confluent; and an unexpectedly susceptible
              result for an organism with known intrinsic resistance is a reason to repeat, not to report.
            </P>
            <div className="mt-2 grid gap-2.5 sm:grid-cols-2">
              {ORGANISMS.slice(0, 4).map((o) => (
                <div key={o.id} className="rounded-2xl border border-slate-200 p-3.5">
                  <p className="text-sm font-bold italic text-slate-900">{o.name}</p>
                  <p className="text-[13px] text-slate-600 leading-relaxed mt-1">{o.clinicalNote}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}

      {/* ── Safety & notes ── */}
      {tab === "safety" && (
        <div id="theory-safety" role="tabpanel" className="space-y-4">
          <Panel>
            <H3>Working safely with the real thing</H3>
            <P>
              Everything below describes the bench, not this simulation. Nothing you do on this page is
              hazardous — but the procedure it teaches is carried out on live pathogens.
            </P>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {[
                ["Containment", "Most of the organisms in a routine susceptibility panel are handled at biosafety level 2, in a laboratory with controlled access, with work that may aerosolise carried out in a cabinet."],
                ["Personal protection", "Laboratory coat, gloves and eye protection. No food, drink or cosmetics at the bench; hands washed on leaving."],
                ["Aseptic technique", "Work near a flame or in a cabinet, keep plates closed except when in use, and never re-use a swab. Contamination does not announce itself — it appears as an uninterpretable plate a day later."],
                ["Sharps and spills", "Loops and slides go into a sharps container. Spills are covered, disinfected with an agent effective against the organism, and left for the stated contact time."],
                ["Disposal", "All cultures, plates, swabs and disks are autoclaved or otherwise decontaminated before disposal. Antibiotic-containing waste does not go to a drain."],
                ["Records", "The isolate, the medium lot, the disk lot, the incubation conditions and the criteria used are recorded with the result. A result without its conditions cannot be checked."],
              ].map(([title, body]) => (
                <div key={title} className="rounded-2xl border border-slate-200 p-3.5">
                  <p className="text-sm font-bold text-slate-900">{title}</p>
                  <p className="text-[13px] text-slate-600 leading-relaxed mt-1">{body}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel>
            <div className="flex gap-3">
              <Ruler className="h-5 w-5 shrink-0 text-brandBlue mt-0.5" aria-hidden />
              <div>
                <H3>What this simulation is, and is not</H3>
                <P>
                  The plate here is driven by a small educational model. It reproduces the direction and
                  the rough size of the effects you need to understand — inoculum density, agar depth,
                  lawn uniformity, disk spacing — from a table of base zone diameters, with a small
                  reproducible variation so that two runs are not identical.
                </P>
                <P>
                  It is not a pharmacodynamic model, it is not clinically validated, and the organisms&apos;
                  zone diameters are teaching values rather than measurements from a validated panel.
                  Use it to learn the technique and the reasoning. For a real isolate, use a real plate
                  and the interpretive criteria in force.
                </P>
              </div>
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
}
