import AntibiogramSimulator from "@/components/AntibiogramSimulator";
import { FlaskConical } from "lucide-react";

export default function AntibiogramSimulatorPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-12">
            <div className="max-w-6xl mx-auto">
                <AntibiogramSimulator />
            </div>
        </div>
    );
}