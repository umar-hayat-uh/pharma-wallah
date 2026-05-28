"use client";

import { useEffect, useRef } from "react";
import { useParams, usePathname } from "next/navigation";
import { useTracker } from "@/hooks/useTracker";

const SUBJECT_DISPLAY_NAMES: Record<string, string> = {
    "pharmaceutical-biochemistry": "Pharmaceutical Biochemistry",
    "pharmaceutical-organic-chemistry": "Pharmaceutical Organic Chemistry",
    "physical-pharmacy": "Physical Pharmacy",
    "physiology-histology-1": "Physiology & Histology",
    "industrial-pharmacy": "Industrial Pharmacy",
    "natural-toxins": "Natural Toxins",
    "pharmaceutical-analysis": "Pharmaceutical Analysis",
    "advanced-pharmacognosy": "Advanced Pharmacognosy",
    "hospital-pharmacy": "Hospital Pharmacy",
    "industrial-pharmacy-2": "Industrial Pharmacy‑II",
    "pharmaceutical-technology": "Pharmaceutical Technology",
    "systemic-pharmacology-3": "Systemic Pharmacology",
};

interface UnitTrackerProps {
    unitTitle: string;
}

export default function UnitTracker({ unitTitle }: UnitTrackerProps) {
    const params = useParams();
    const pathname = usePathname();
    const { trackUnit, trackActivity } = useTracker();
    const hasFired = useRef(false);

    useEffect(() => {
        if (hasFired.current) return;   // only once

        const unitSlug = params.unit as string;
        if (!unitSlug) {
            console.warn("🔴 UnitTracker: no unit slug");
            return;
        }

        const segments = pathname.split("/").filter(Boolean);
        const unitIndex = segments.indexOf(unitSlug);
        const subjectSlug = unitIndex > 0 ? segments[unitIndex - 1] : null;

        if (!subjectSlug) {
            console.warn("🔴 UnitTracker: could not determine subject slug");
            return;
        }

        const semesterSegment = segments.find(s => s.startsWith("sem-"));
        const semester = semesterSegment
            ? `Semester ${semesterSegment.replace("sem-", "")}`
            : "Unknown Semester";

        const subjectName = SUBJECT_DISPLAY_NAMES[subjectSlug] || subjectSlug;

        console.log(`📡 Tracking unit: ${unitSlug} (${subjectName}) [${semester}]`);

        // Track unit read
        trackUnit({
            unitId: unitSlug,
            unitTitle,
            subject: subjectName,
            semester,
            timeSpentMin: 0,
        });

        // Create activity entry
        trackActivity({
            type: "unit_read",
            label: `Visited: ${unitTitle}`,
            href: window.location.pathname,
        });

        hasFired.current = true;
    }, []); // empty dependency → runs once on mount

    return null;
}