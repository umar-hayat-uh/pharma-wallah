"use client";

import { LabExperience } from "../LabExperience";
import { DoseBench, Graph, RecorderStrip } from "../benches/DoseBench";
import { DOSE_RESPONSE, doseVisual, type DoseAction, type DoseState } from "@/lib/virtual-labs/experiments/doseResponse";
import type { BenchProps } from "../benches/types";

const visual = (s: DoseState) => doseVisual(s);

/** The recorder and the graph at full panel width. */
function GraphTab({ s }: BenchProps<DoseState, DoseAction>) {
  return (
    <div className="space-y-4">
      <div>
        <p className="mb-1 text-sm font-semibold">Recorder</p>
        <RecorderStrip trace={s.trials.map((t) => t.trueMm)} pending={s.trials.some((t) => t.recordedMm === null)} />
      </div>
      <div>
        <p className="mb-1 text-sm font-semibold">Your dose–response curve</p>
        {s.plottedLinear || s.plottedLog ? <Graph s={s} guide /> : <p className="text-sm text-[#4a4f57]">Record at least three concentrations, then use Plot in the Bench panel.</p>}
      </div>
    </div>
  );
}

export default function DoseResponseLab() {
  return <LabExperience labId="dose-response" def={DOSE_RESPONSE} Bench={DoseBench} visual={visual} extra={{ label: "Graph", icon: "monitor", Component: GraphTab }} />;
}
