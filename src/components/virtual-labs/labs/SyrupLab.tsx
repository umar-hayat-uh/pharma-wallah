"use client";

import { LabExperience } from "../LabExperience";
import { SYRUP_CONTROLS } from "../benches/SyrupControls";
import { SYRUP, syrupVisual, type SyrupState } from "@/lib/virtual-labs/experiments/syrup";

const visual = (s: SyrupState) => syrupVisual(s);

export default function SyrupLab() {
  return <LabExperience labId="simple-syrup" def={SYRUP} controls={SYRUP_CONTROLS} visual={visual} />;
}
