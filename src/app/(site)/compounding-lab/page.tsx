import ExtemporaneousCompoundingLab from "@/components/ExtemporaneousCompoundingLab";
import { FlaskConical } from "lucide-react";

export default function CompoundingLabPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8">
      <div className="max-w-7xl mx-auto">
        <ExtemporaneousCompoundingLab />
      </div>
    </div>
  );
}