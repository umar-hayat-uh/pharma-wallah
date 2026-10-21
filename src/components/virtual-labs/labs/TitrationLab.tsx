"use client";

import { LabExperience } from "../LabExperience";
import { TITRATION_CONTROLS } from "../benches/TitrationControls";
import { TITRATION, titrationVisual, type TitrationState } from "@/lib/virtual-labs/experiments/titration";

const visual = (s: TitrationState, x: { flowing: boolean }) => ({ ...titrationVisual(s), flowing: x.flowing });

export default function TitrationLab() {
  return <LabExperience labId="acid-base-titration" def={TITRATION} controls={TITRATION_CONTROLS} visual={visual} />;
}
