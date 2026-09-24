"use client";

import ClinicalHero from "./ClinicalHero";
import ClinicalToolsSection from "./ClinicalToolsSection";
import ClinicalTrust from "./ClinicalTrust";
import ClinicalWorkflow from "./ClinicalWorkflow";
import ClinicalCTA from "./ClinicalCTA";

export default function ClinicalLandingPage() {
    return (
        <main className="bg-white min-h-screen">
            <ClinicalHero />
            <ClinicalToolsSection />
            {/* ClinicalDashboardPreview (a mock "integrated clinical environment"
                with a fabricated patient profile) was removed: a mock-up of an
                unbuilt product reads as vapourware. Recoverable from git. */}
            <ClinicalTrust />
            <ClinicalWorkflow />
            <ClinicalCTA />
        </main>
    );
}