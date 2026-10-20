"use client";

import { LabExperience } from "../LabExperience";
import { TitrationBench } from "../benches/TitrationBench";
import { TITRATION, titrationVisual, type TitrationState } from "@/lib/virtual-labs/experiments/titration";

const visual = (s: TitrationState, x: { flowing: boolean }) => ({ ...titrationVisual(s), flowing: x.flowing });

export default function TitrationLab() {
  return <LabExperience labId="acid-base-titration" def={TITRATION} Bench={TitrationBench} visual={visual} />;
}
