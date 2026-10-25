"use client";

import { LabExperience } from "../LabExperience";
import { SOLUBILITY_DISSOLUTION_CONTROLS } from "../benches/pharmaceutics/SolubilityDissolutionControls";
import { SOLUBILITY_DISSOLUTION, solubilityDissolutionVisual, type SolubilityDissolutionState } from "@/lib/virtual-labs/experiments/pharmaceutics/solubilityDissolution";

const visual = (s: SolubilityDissolutionState) => solubilityDissolutionVisual(s);

export default function SolubilityDissolutionLab() {
  return <LabExperience labId="solubility-dissolution" def={SOLUBILITY_DISSOLUTION} controls={SOLUBILITY_DISSOLUTION_CONTROLS} visual={visual} />;
}
