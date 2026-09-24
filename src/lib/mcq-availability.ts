// src/lib/mcq-availability.ts
//
// Which MCQ subjects have a finished question bank. Until 2026-09-23 this set
// was copied into the hub and the semester page separately, and every other
// subject (about forty of them) was listed with a "Coming Soon" badge — which
// an AdSense reviewer reads as an unfinished site. The hub and semester pages
// now list only these subjects, and the metadata layer (src/lib/seo.ts) keeps
// the empty ones out of the index.
//
// When a new bank is added under src/app/api/mcq-data/, register it in
// BANK_REGISTRY in mcqs-bank/[semesterSlug]/[subject]/page.tsx AND add its slug
// here.

import { SemesterData } from "@/app/api/semester-data";
import { semesterToSlug, subjectToSlug } from "@/lib/mcq-utils";
import type { McqLookup } from "@/lib/seo";

export const AVAILABLE_MCQ_SUBJECTS = new Set([
  "pharmaceutical-biochemistry",
  "physiology-histology-i",
  "physical-pharmacy",
  "pharmaceutical-organic-chemistry",
]);

export const isMcqSubjectAvailable = (subjectName: string) =>
  AVAILABLE_MCQ_SUBJECTS.has(subjectToSlug(subjectName));

/** Semesters with at least one available subject, each listing only those. */
export function semestersWithQuestions() {
  return SemesterData.map((sem) => ({
    ...sem,
    subjects: sem.subjects.filter((s) => isMcqSubjectAvailable(s.name)),
  })).filter((sem) => sem.subjects.length > 0);
}

export const mcqLookup: McqLookup = {
  semester(slug) {
    return SemesterData.find((s) => semesterToSlug(s.semester) === slug)?.semester;
  },
  subject(semesterSlug, subjectSlug) {
    const sem = SemesterData.find((s) => semesterToSlug(s.semester) === semesterSlug);
    const sub = sem?.subjects.find((s) => subjectToSlug(s.name) === subjectSlug);
    if (!sub) return undefined;
    const first = SemesterData.find((s) => s.subjects.some((x) => subjectToSlug(x.name) === subjectSlug))!;
    return {
      name: sub.name,
      available: AVAILABLE_MCQ_SUBJECTS.has(subjectSlug),
      firstSemesterSlug: semesterToSlug(first.semester),
    };
  },
  semesterHasQuestions(slug) {
    const sem = SemesterData.find((s) => semesterToSlug(s.semester) === slug);
    return !!sem?.subjects.some((s) => isMcqSubjectAvailable(s.name));
  },
};
