// ============================================================
//  PharmaWallah — Simulations Module
//  src/components/simulations/index.ts
// ============================================================

export { default as DiskDiffusionSim } from './DiskDiffusionSim';
export * from './diskDiffusionData';

// ============================================================
//  INTEGRATION GUIDE
// ============================================================
//
//  1. ROUTE
//     File: app/simulations/disk-diffusion/page.tsx  (already created)
//     URL:  /simulations/disk-diffusion
//
//  2. NAVBAR LINK (add to your semester-data.ts or header nav)
//     {
//       label: 'Lab Simulations',
//       href: '/simulations',
//       icon: 'BeakerIcon',
//     }
//
//  3. SPOTTING CENTRE CARD (SpottingHubPage.tsx)
//     Add a card linking to /simulations/disk-diffusion
//     with title "Antibiotic Susceptibility Test" and
//     category "Microbiology Lab"
//
//  4. REQUIRED PACKAGES
//     npm install jspdf
//     (html2canvas not needed — report is drawn natively with jsPDF)
//
//  5. TRACKER INTEGRATION
//     The component calls useTracker() internally.
//     trackActivity() fires on each step completion.
//     trackQuiz() fires when the quiz is finished.
//
//  6. ADDING MORE SIMULATIONS
//     Follow the same pattern:
//       - Create [name]Data.ts   (data + types)
//       - Create [Name]Sim.tsx   (component)
//       - Add page at app/simulations/[name]/page.tsx
//       - Export from this index.ts
//
//  7. FUTURE SIMULATIONS TO BUILD
//     - Gram Staining Simulation
//     - Blood Agar Hemolysis Patterns
//     - Minimum Inhibitory Concentration (MIC) Broth Dilution
//     - Urease / Catalase / Oxidase Biochemical Tests
// ============================================================