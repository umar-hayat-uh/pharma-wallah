import type { SubjectMeta } from "./types";
import { semesterToSlug } from "@/lib/mcq-utils"; 
import { biochemistrySubject } from "./subjects/biochemistry";
import { physiologySubject } from "./subjects/physiology";

export const SUBJECTS: SubjectMeta[] = [
    biochemistrySubject,
    physiologySubject,
];

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

export function getSemesters() {
    const map = new Map<string, { semester: string; semesterSlug: string; subjects: SubjectMeta[] }>();
    for (const s of SUBJECTS) {
        const semesterSlug = semesterToSlug(s.semester);

        if (!map.has(semesterSlug)) {
            map.set(semesterSlug, {
                semester: s.semester,
                semesterSlug,
                subjects: [],
            });
        }
        map.get(semesterSlug)!.subjects.push(s);
    }
    return Array.from(map.values());
}