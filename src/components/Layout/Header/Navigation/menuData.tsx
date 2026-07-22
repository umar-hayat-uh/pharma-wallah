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
  { label: "Calculation Tools", href: "/calculation-tools" },
   { label: "Community", href: "/community" },
  { label: "About Us", href: "/about-us" },
];