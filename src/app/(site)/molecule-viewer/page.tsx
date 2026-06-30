import MoleculeViewer from "@/components/MoleculeViewer";
import { FlaskConical } from "lucide-react";

export default function MoleculeViewerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <FlaskConical className="mx-auto text-blue-600 mb-2" size={36} />
          <h1 className="text-3xl font-black text-gray-900">3D Molecule Viewer</h1>
          <p className="text-gray-500 text-sm mt-2">
            Type any drug name, chemical formula, or SMILES string to explore its 3D structure.
          </p>
        </div>
        <MoleculeViewer />
      </div>
    </div>
  );
}