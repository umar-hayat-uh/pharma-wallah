"use client";

import ClinicalHero from "./ClinicalHero";
import ClinicalToolsSection from "./ClinicalToolsSection";
import ClinicalDashboardPreview from "./ClinicalDashboardPreview";
import ClinicalTrust from "./ClinicalTrust";
import ClinicalWorkflow from "./ClinicalWorkflow";
import ClinicalCTA from "./ClinicalCTA";

export default function ClinicalLandingPage() {
    return (
        <main className="bg-white min-h-screen">
            <ClinicalHero />
            <ClinicalToolsSection />
            <ClinicalDashboardPreview />
            <ClinicalTrust />
            <ClinicalWorkflow />
            <ClinicalCTA />
        </main>
    );
}