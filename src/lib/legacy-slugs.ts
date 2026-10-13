/**
 * Calculator URLs that changed when every slug became lowercase kebab-case
 * (2026-10-13, AdSense remediation phase 2). Old → new.
 *
 * Used in three places, so a renamed tool keeps working everywhere:
 *  - src/middleware.ts answers the old web URL with a 301 to the new one. It is
 *    done there, not in next.config.mjs, because Next's redirect matching is
 *    case-insensitive: a rule for `/pH-pka-relationship-calculator` would also
 *    match its own destination `/ph-pka-relationship-calculator` and loop.
 *  - mobile/app/_components/useLibrary.ts rewrites a phone's saved and recent
 *    lists, which stored the old slugs.
 *  - desktop history entries keep the slug they were saved with; the desktop
 *    reader maps them the same way.
 *
 * Never remove an entry: old links live in search results, bookmarks and
 * installed apps for years.
 */
export const LEGACY_CALCULATOR_SLUGS: Readonly<Record<string, string>> = {
  AccumulationIndexCalculator: "accumulation-index-calculator",
  AnionGapCalculator: "anion-gap-calculator",
  AntagonismSimulator: "antagonism-simulator",
  CorrectedCalciumCalculator: "corrected-calcium-calculator",
  DValueCalculator: "d-value-calculator",
  DensityConversionCalculator: "density-conversion-calculator",
  ElectrolyteConversionCalculator: "electrolyte-conversion-calculator",
  EmaxModelCalculator: "emax-model-calculator",
  FValueCalculator: "f-value-calculator",
  GeriatricDosingCalculator: "geriatric-dosing-calculator",
  HeatOfNeutralizationCalculator: "heat-of-neutralization-calculator",
  InsulinSensitivityCalculator: "insulin-sensitivity-calculator",
  LogReductionCalculator: "log-reduction-calculator",
  MassConversionCalculator: "mass-conversion-calculator",
  MeanResidenceTimeCalculator: "mean-residence-time-calculator",
  OpioidConversionCalculator: "opioid-conversion-calculator",
  OpioidMMECalculator: "opioid-mme-calculator",
  OsmolarGapCalculator: "osmolar-gap-calculator",
  SodiumCorrectionCalculator: "sodium-correction-calculator",
  StrengthConversionCalculator: "strength-conversion-calculator",
  TemperatureConversionCalculator: "temperature-conversion-calculator",
  VolumeConversionCalculator: "volume-conversion-calculator",
  "pH-pka-relationship-calculator": "ph-pka-relationship-calculator",
};

/** The current slug for a possibly-old one. */
export function currentCalculatorSlug(slug: string): string {
  return LEGACY_CALCULATOR_SLUGS[slug] ?? slug;
}
