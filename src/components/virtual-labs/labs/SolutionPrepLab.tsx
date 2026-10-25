"use client";

import { LabExperience } from "../LabExperience";
import { SOLUTION_PREP_CONTROLS } from "../benches/pharmaceutics/SolutionPrepControls";
import { SOLUTION_PREP, solutionPrepVisual, type SolutionPrepState } from "@/lib/virtual-labs/experiments/pharmaceutics/solutionPrep";

const visual = (s: SolutionPrepState) => solutionPrepVisual(s);

export default function SolutionPrepLab() {
  return <LabExperience labId="solution-preparation" def={SOLUTION_PREP} controls={SOLUTION_PREP_CONTROLS} visual={visual} />;
}
