// menuData.ts
import { HeaderItem } from "@/types/menu";

export const headerData: HeaderItem[] = [
  { label: "Home", href: "/" },
  {
    label: "Resources",
    href: "#",
    submenu: [
      { label: "Material", href: "/courses" },
      { label: "MCQ's Bank", href: "/mcqs-bank" },
      { label: "Lab Simulation", href: "/simulations" },
      { label: "Slide Spotting", href: "/spotting" },
      { label: "Flashcards", href: "/flash-cards" },
      { label: "Pharmacy Counter", href: "/pharmacy-counter" },
      { label: "Compounding Lab", href: "/compounding-lab" },
      { label: "ADR Detective", href: "/adr-detective" },
      { label: "Prescription Reader", href: "/prescription-reader" },
      { label: "Books Library", href: "/books-library" },
      { label: "Antibiogram Simulator", href: "/antibiogram-simulator" },
      { label: "Molecule Viewer", href: "/molecule-viewer" },
    ],
  },
  { label: "Pharmacopedia", href: "/encyclopedia" },
 {
    label: "Calculation Tools",
    href: "/calculation-tools",   // base link
    submenu: [
      { label: "Pharmaceutical Chemistry",              href: "/calculation-tools#pharma-chem" },
      { label: "Unit Conversion",                       href: "/calculation-tools#unit-conversion" },
      { label: "Pharmaceutics",                         href: "/calculation-tools#pharmaceutics" },
      { label: "Biopharmaceutics & Pharmacokinetics",   href: "/calculation-tools#biopharmaceutics-pharmacokinetics" },
      { label: "Pharmacology",                          href: "/calculation-tools#pharmacology" },
      { label: "Pharmaceutical Analysis",               href: "/calculation-tools#pharmaceutical-analysis" },
      { label: "Microbiology",                          href: "/calculation-tools#microbiology" },
      { label: "Pharmaceutical Engineering",            href: "/calculation-tools#pharmaceutical-engineering" },
      { label: "Clinical & Hospital Pharmacy",          href: "/calculation-tools#clinical-hospital-pharmacy" },
    ],
  },
  { label: "Community", href: "/community" },
  { label: "About Us", href: "/about-us" },
];