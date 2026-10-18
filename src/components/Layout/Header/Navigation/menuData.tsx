// menuData.ts
import { HeaderItem } from "@/types/menu";

export const headerData: HeaderItem[] = [
  { label: "Home", href: "/" },
  {
    label: "Resources",
    href: "#",
    submenu: [
      { label: "Courses", href: "/courses" },
      { label: "MCQ Bank", href: "/mcqs-bank" },
      { label: "Lab Simulation", href: "/simulations" },
      { label: "Slide Spotting", href: "/spotting" },
      { label: "Osteology Lab", href: "/osteology-lab" },
      { label: "Flashcards", href: "/flash-cards" },
      { label: "Pharmacy Counter", href: "/pharmacy-counter" },
      { label: "Compounding Lab", href: "/compounding-lab" },
      { label: "ADR Detective", href: "/adr-detective" },
      { label: "Prescription Reader", href: "/prescription-reader" },
      { label: "AI Guide", href: "/ai-guide" },
      { label: "Molecular Lab", href: "/molecular-lab" },
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
      // Physiology was the one hub category missing from this menu (2026-10-12).
      { label: "Physiology",                            href: "/calculation-tools#physiology" },
      { label: "Microbiology",                          href: "/calculation-tools#microbiology" },
      { label: "Pharmaceutical Engineering",            href: "/calculation-tools#pharmaceutical-engineering" },
      { label: "Clinical & Hospital Pharmacy",          href: "/calculation-tools#clinical-hospital-pharmacy" },
      { label: "How to use the calculators",            href: "/calculation-tools/how-to-use" },
      { label: "Calculation guides",                    href: "/guides" },
    ],
  },
  { label: "Community", href: "/community" },
  { label: "About Us", href: "/about-us" },
];