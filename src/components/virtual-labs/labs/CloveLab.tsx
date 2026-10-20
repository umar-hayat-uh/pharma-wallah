"use client";

import { LabExperience } from "../LabExperience";
import { CloveBench, ScopeControls } from "../benches/CloveBench";
import { CLOVE, cloveVisual, type CloveAction, type CloveState } from "@/lib/virtual-labs/experiments/clove";
import type { BenchProps } from "../benches/types";

const visual = (s: CloveState) => cloveVisual(s);

function Eyepiece({ s, act }: BenchProps<CloveState, CloveAction>) {
  return <ScopeControls s={s} act={act} large />;
}

export default function CloveLab() {
  return <LabExperience labId="powdered-clove" def={CLOVE} Bench={CloveBench} visual={visual} extra={{ label: "Eyepiece", icon: "microscope", Component: Eyepiece }} />;
}
