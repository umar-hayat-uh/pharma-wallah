// ============================================================
//  PharmaWallah — Disk Diffusion Lab
//  Kirby-Bauer antibiotic susceptibility test
// ============================================================
//
//  Route: /simulations/disk-diffusion
//
//  The lab is split so the experiment can be reasoned about without rendering
//  anything:
//
//    types.ts        shared types
//    data.ts         organisms, antibiotic panel, interpretive criteria, guide prose
//    engine.ts       the pure model — zones, placement rules, coverage, scoring
//    useLabMachine   the stage machine and every rule about what is allowed
//
//  Presentation:
//
//    DiskDiffusionLab    the page shell: Theory | Simulation, mode, tracking
//    TheorySection       Principle · Materials · Lab Guide · Interpretation · Safety
//    LabGuide            the illustrated nine-step walk-through
//    illustrations       the Lab Guide's SVG diagrams
//    SimulationWorkspace the bench: layout, plate interaction, timed processes
//    stages              one control panel per stage
//    PetriDish           the plate, drawn in real millimetres
//    equipment           bottle, swab, turbidity tubes, incubator, culture plate
//    MeasurementTool     the calliper the student measures with
//    ResultsDashboard    results table linked to the finished plate
//    CompletionScreen    technique score, checklist and what to carry forward
//    report.ts           the jsPDF lab report (jspdf is imported lazily)
//
//  Progress tracking goes through `useTracker()` in the shell — an activity row
//  when the lab is opened and when an experiment completes, and a quiz attempt
//  for the pre-lab check. Never a raw fetch to /api/progress.

export { default as DiskDiffusionLab } from "./DiskDiffusionLab";
export { default as LabGuide } from "./LabGuide";
export * from "./data";
export * from "./engine";
export * from "./types";
