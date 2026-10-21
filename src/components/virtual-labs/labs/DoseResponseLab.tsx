"use client";

import { LabExperience } from "../LabExperience";
import { DOSE_CONTROLS } from "../benches/DoseControls";
import { DOSE_RESPONSE, doseVisual, type DoseState } from "@/lib/virtual-labs/experiments/doseResponse";

const visual = (s: DoseState) => doseVisual(s);

export default function DoseResponseLab() {
  return <LabExperience labId="dose-response" def={DOSE_RESPONSE} controls={DOSE_CONTROLS} visual={visual} />;
}
