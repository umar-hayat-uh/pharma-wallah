"use client";

import { LabExperience } from "../LabExperience";
import { SyrupBench } from "../benches/SyrupBench";
import { SYRUP, syrupVisual, type SyrupState } from "@/lib/virtual-labs/experiments/syrup";

const visual = (s: SyrupState) => syrupVisual(s);

export default function SyrupLab() {
  return <LabExperience labId="simple-syrup" def={SYRUP} Bench={SyrupBench} visual={visual} />;
}
