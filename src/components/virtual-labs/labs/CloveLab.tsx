"use client";

import { LabExperience } from "../LabExperience";
import { CLOVE_CONTROLS } from "../benches/CloveControls";
import { CLOVE, cloveVisual, type CloveState } from "@/lib/virtual-labs/experiments/clove";

const visual = (s: CloveState) => cloveVisual(s);

export default function CloveLab() {
  return <LabExperience labId="powdered-clove" def={CLOVE} controls={CLOVE_CONTROLS} visual={visual} />;
}
