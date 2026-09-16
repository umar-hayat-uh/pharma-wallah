import type { Metadata } from "next";
import MolecularLab from "@/components/molecular-lab/MolecularLab";

// Server page so it can carry metadata (the old Molecule Viewer page could
// not). The lab itself is a client component; 3Dmol.js and OpenChemLib are
// loaded lazily from inside it, so neither lands in this route's first load.

export const metadata: Metadata = {
  title: "Molecular Lab — build, edit and explore molecules | PharmaWallah",
  description:
    "Draw molecules from scratch or open drugs from PubChem, edit atoms, bonds and charges, and see the 2D structure and 3D model update together — with formula, molecular weight, functional groups and learning tasks for pharmacy students.",
  alternates: { canonical: "/molecular-lab" },
};

export default function MolecularLabPage() {
  return <MolecularLab />;
}
