"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useTracker } from "@/hooks/useTracker";

interface UnitTrackerProps {
    unitId: string;
    unitTitle: string;
    subjectTitle: string;
    semester: string;
}

/**
 * Records a visit to a course unit, once per page view. The dashboard's
 * syllabus grid shows it as "opened". Marking a unit *read* is a separate,
 * explicit action — see `useTracker().markUnitRead`.
 *
 * The subject and semester used to be re-derived from the URL, looking for a
 * `sem-N` segment the /courses/<subject>/<unit> route no longer has, so every
 * visit was filed under "Unknown Semester". They come from the registry now.
 */
export default function UnitTracker({ unitId, unitTitle, subjectTitle, semester }: UnitTrackerProps) {
    const pathname = usePathname();
    const { trackUnit, trackActivity } = useTracker();
    const visited = useRef<string | null>(null);

    useEffect(() => {
        if (visited.current === unitId) return;
        visited.current = unitId;
        trackUnit({ unitId, unitTitle, subject: subjectTitle, semester, timeSpentMin: 0 });
        trackActivity({ type: "unit_read", label: `Visited: ${unitTitle}`, href: pathname });
    }, [unitId, unitTitle, subjectTitle, semester, pathname, trackUnit, trackActivity]);

    return null;
}
