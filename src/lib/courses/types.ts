// src/lib/courses/types.ts
// Single source of truth for what a "course" is, shared by every subject.

export interface CourseUnit {
  id: string;            // slug used in the URL, e.g. "unit1-intro-pharma-biochemistry"
  title: string;
  shortTitle: string;
  description: string;
  emoji: string;
  gradient: string;      // tailwind gradient classes, e.g. "from-blue-600 to-green-400"
  readTime: number;       // minutes
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  previewImage?: string;
  // Path to the markdown file relative to /public/content
  contentFile: string;
}

export interface SubjectMeta {
  slug: string;              // "pharmaceutical-biochemistry"
  semesterSlug: string;      // "sem-1"
  semester: string;          // "Semester 1"
  title: string;             // "Pharmaceutical Biochemistry"
  subjectCode: string;
  icon: string;               // emoji shown on the course card
  description: string;
  gradient: string;
  units: CourseUnit[];
  hasMcq?: boolean;
}