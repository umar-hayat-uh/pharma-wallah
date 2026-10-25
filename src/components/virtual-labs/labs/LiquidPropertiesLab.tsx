"use client";

import { LabExperience } from "../LabExperience";
import { LIQUID_PROPERTIES_CONTROLS } from "../benches/pharmaceutics/LiquidPropertiesControls";
import { LIQUID_PROPERTIES, liquidPropertiesVisual, type LiquidPropertiesState } from "@/lib/virtual-labs/experiments/pharmaceutics/liquidProperties";

const visual = (s: LiquidPropertiesState) => liquidPropertiesVisual(s);

export default function LiquidPropertiesLab() {
  return <LabExperience labId="liquid-properties" def={LIQUID_PROPERTIES} controls={LIQUID_PROPERTIES_CONTROLS} visual={visual} />;
}
