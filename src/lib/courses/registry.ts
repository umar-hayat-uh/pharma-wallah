// src/lib/courses/registry.ts
//
// ── ADDING A NEW COURSE ──────────────────────────────────────────────
// 1. Drop your markdown files in /public/content/{subjectSlug}/
// 2. Add one SubjectMeta object below (or import it from its own file,
//    see biochemistry.ts, if a subject's unit list gets long).
// 3. Done. No new page.tsx, no new folders, no new routes.
//
// NOTE: URLs are now just /courses/{subjectSlug} and
// /courses/{subjectSlug}/{unit} — semester is NOT part of the route,
// it's just a label shown on the page. One less param to keep in sync.
// ───────────────────────────────────────────────────────────────────

import type { SubjectMeta } from "./types";
import { biochemistrySubject } from "./subjects/biochemistry";
// import { naturalToxinsSubject } from "./subjects/natural-toxins";
// import { organicChemistrySubject } from "./subjects/organic-chemistry";
// ...one line per subject — each file below owns its own unit list.

export const SUBJECTS: SubjectMeta[] = [
    biochemistrySubject,
    // naturalToxinsSubject,
    // organicChemistrySubject,
];

// ── Derived lookups (computed once, reused everywhere) ──────────────

export const SUBJECTS_BY_SLUG = new Map(SUBJECTS.map((s) => [s.slug, s]));

export function getSubject(subjectSlug: string): SubjectMeta | undefined {
    return SUBJECTS_BY_SLUG.get(subjectSlug);
}

export function getUnit(subjectSlug: string, unitId: string) {
    const subject = getSubject(subjectSlug);
    if (!subject) return null;
    const idx = subject.units.findIndex((u) => u.id === unitId);
    if (idx === -1) return null;
    return {
        subject,
        unit: subject.units[idx],
        prevUnit: idx > 0 ? subject.units[idx - 1] : null,
        nextUnit: idx < subject.units.length - 1 ? subject.units[idx + 1] : null,
        index: idx,
    };
}

// Groups subjects by semester for the /courses listing page —
// semester is still shown, it's just derived from the data, not the URL.
export function getSemesters() {
    const map = new Map<string, { semester: string; semesterSlug: string; subjects: SubjectMeta[] }>();
    for (const s of SUBJECTS) {
        if (!map.has(s.semesterSlug)) map.set(s.semesterSlug, { semester: s.semester, semesterSlug: s.semesterSlug, subjects: [] });
        map.get(s.semesterSlug)!.subjects.push(s);
    }
    return Array.from(map.values());
}