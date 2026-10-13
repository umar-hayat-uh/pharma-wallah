import type { Guide, GuideBlock } from "./types";
import { guide as dilution } from "./content/dilution-and-concentration";
import { guide as kinetics } from "./content/reaction-kinetics-drug-stability";
import { guide as analysis } from "./content/accuracy-precision-recovery";
import { guide as pk } from "./content/pharmacokinetic-parameters";
import { guide as dosing } from "./content/dose-calculations";
// Drafts (2026-10-13): registered so tests check them, filtered out of every
// listing, route and the sitemap until a person sets a reviewer and status.
import { guide as d_anion_gap_and_electrolyte_calculations } from "./content/anion-gap-and-electrolyte-calculations";
import { guide as d_beer_lambert_and_uv_spectrophotometry } from "./content/beer-lambert-and-uv-spectrophotometry";
import { guide as d_bioavailability_and_bioequivalence } from "./content/bioavailability-and-bioequivalence";
import { guide as d_blood_cell_counts_with_a_haemocytometer } from "./content/blood-cell-counts-with-a-haemocytometer";
import { guide as d_calorimetry_and_heat_of_neutralization } from "./content/calorimetry-and-heat-of-neutralization";
import { guide as d_chromatography_rf_and_resolution } from "./content/chromatography-rf-and-resolution";
import { guide as d_compounding_and_formula_scaling } from "./content/compounding-and-formula-scaling";
import { guide as d_dissolution_testing_and_drug_release } from "./content/dissolution-testing-and-drug-release";
import { guide as d_dose_response_and_receptor_binding } from "./content/dose-response-and-receptor-binding";
import { guide as d_drug_antagonism_and_schild_analysis } from "./content/drug-antagonism-and-schild-analysis";
import { guide as d_electrolyte_units_mmol_meq_mosmol } from "./content/electrolyte-units-mmol-meq-mosmol";
import { guide as d_isotonicity_and_tonicity_adjustment } from "./content/isotonicity-and-tonicity-adjustment";
import { guide as d_microbial_counts_cfu_and_serial_dilution } from "./content/microbial-counts-cfu-and-serial-dilution";
import { guide as d_multiple_dosing_and_steady_state } from "./content/multiple-dosing-and-steady-state";
import { guide as d_non_compartmental_analysis } from "./content/non-compartmental-analysis";
import { guide as d_nonlinear_michaelis_menten_kinetics } from "./content/nonlinear-michaelis-menten-kinetics";
import { guide as d_partition_coefficient_and_ionisation } from "./content/partition-coefficient-and-ionisation";
import { guide as d_ph_pka_and_henderson_hasselbalch } from "./content/ph-pka-and-henderson-hasselbalch";
import { guide as d_powder_flow_and_micromeritics } from "./content/powder-flow-and-micromeritics";
import { guide as d_renal_function_estimation } from "./content/renal-function-estimation";
import { guide as d_reynolds_number_and_fluid_flow } from "./content/reynolds-number-and-fluid-flow";
import { guide as d_sterilization_kinetics_d_value_f_value } from "./content/sterilization-kinetics-d-value-f-value";
import { guide as d_stoichiometry_and_percentage_yield } from "./content/stoichiometry-and-percentage-yield";
import { guide as d_therapeutic_index_and_margin_of_safety } from "./content/therapeutic-index-and-margin-of-safety";
import { guide as d_titrimetric_analysis_and_assay } from "./content/titrimetric-analysis-and-assay";

/**
 * The guide registry. Order is the order on /guides. A guide in `draft` is not
 * listed, not in the sitemap and its URL 404s — see `publishedGuides`.
 */
const ALL: Guide[] = [
  dilution, dosing, kinetics, analysis, pk,
  d_anion_gap_and_electrolyte_calculations, d_beer_lambert_and_uv_spectrophotometry, d_bioavailability_and_bioequivalence, d_blood_cell_counts_with_a_haemocytometer, d_calorimetry_and_heat_of_neutralization, d_chromatography_rf_and_resolution, d_compounding_and_formula_scaling, d_dissolution_testing_and_drug_release, d_dose_response_and_receptor_binding, d_drug_antagonism_and_schild_analysis, d_electrolyte_units_mmol_meq_mosmol, d_isotonicity_and_tonicity_adjustment, d_microbial_counts_cfu_and_serial_dilution, d_multiple_dosing_and_steady_state, d_non_compartmental_analysis, d_nonlinear_michaelis_menten_kinetics, d_partition_coefficient_and_ionisation, d_ph_pka_and_henderson_hasselbalch, d_powder_flow_and_micromeritics, d_renal_function_estimation, d_reynolds_number_and_fluid_flow, d_sterilization_kinetics_d_value_f_value, d_stoichiometry_and_percentage_yield, d_therapeutic_index_and_margin_of_safety, d_titrimetric_analysis_and_assay,
];

export const GUIDES: Guide[] = ALL.filter((g) => g.meta.review.status !== "draft");

/** Every guide including drafts — for tests and the editorial workflow only, never for pages. */
export const ALL_GUIDES: readonly Guide[] = ALL;

export function findGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}

function blockText(b: GuideBlock): string {
  switch (b.kind) {
    case "p":
      return b.text;
    case "formula":
      return [b.expr, b.note ?? "", ...(b.where ?? []).map((w) => `${w.sym} ${w.meaning}`)].join(" ");
    case "list":
      return b.items.join(" ");
    case "table":
      return [b.caption, ...b.head, ...b.rows.flat()].join(" ");
    case "callout":
      return `${b.title ?? ""} ${b.text}`;
    case "example":
      return [b.title, b.problem, ...b.steps, b.answer, b.note ?? ""].join(" ");
  }
}

/** Words of teaching text, counted rather than claimed. */
export function guideWordCount(g: Guide): number {
  const text = [
    ...g.objectives,
    ...g.intro,
    ...g.terms.flatMap((t) => [t.term, t.definition]),
    ...g.sections.flatMap((s) => [s.heading, ...s.blocks.map(blockText)]),
    ...g.mistakes,
    ...g.practice.flatMap((p) => [p.q, p.answer, ...p.working]),
    ...g.limitations,
  ].join(" ");
  return text.split(/\s+/).filter(Boolean).length;
}

/** ~200 words a minute for technical prose with arithmetic in it. */
export function readingMinutes(g: Guide): number {
  return Math.max(1, Math.round(guideWordCount(g) / 200));
}
