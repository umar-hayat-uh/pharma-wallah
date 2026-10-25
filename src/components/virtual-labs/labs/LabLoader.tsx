"use client";

/**
 * Picks the experiment's lab component by id. Each is its own chunk (next/dynamic), so an
 * experiment page never ships another experiment's controls. Kept in a "use client"
 * module the server page only RENDERS — a map imported from here into a server file
 * would be a client-reference proxy (MEMORY gotcha 229).
 */
import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { ExperimentId } from "@/lib/virtual-labs/catalog";

const LABS: Partial<Record<ExperimentId, ComponentType>> = {
  "acid-base-titration": dynamic(() => import("./TitrationLab")),
  "solution-preparation": dynamic(() => import("./SolutionPrepLab")),
  "liquid-properties": dynamic(() => import("./LiquidPropertiesLab")),
  "solubility-dissolution": dynamic(() => import("./SolubilityDissolutionLab")),
  "simple-syrup": dynamic(() => import("./SyrupLab")),
  "dose-response": dynamic(() => import("./DoseResponseLab")),
  "powdered-clove": dynamic(() => import("./CloveLab")),
};

export function LabLoader({ id }: { id: ExperimentId }) {
  const Lab = LABS[id];
  return Lab ? <Lab /> : null;
}
