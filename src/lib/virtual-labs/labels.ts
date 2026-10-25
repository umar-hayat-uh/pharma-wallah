/** Display labels shared by server and client components (no "use client" here on purpose). */
export const CURRICULUM_TONE = { proposed: "amber", source_verified: "blue", faculty_reviewed: "green", published: "green" } as const;
export const CURRICULUM_LABEL = { proposed: "Proposed", source_verified: "Syllabus source verified", faculty_reviewed: "Faculty reviewed", published: "Published" } as const;
/** How far an experiment's METHOD is checked (LabMeta.procedure) — separate from the syllabus mapping. */
export const PROCEDURE_LABEL = { verified: "Method verified against a cited source", referenced_simulation: "Referenced educational simulation", proposed: "Proposed method — awaiting instructor confirmation" } as const;
export const PROCEDURE_TONE = { verified: "green", referenced_simulation: "blue", proposed: "amber" } as const;
