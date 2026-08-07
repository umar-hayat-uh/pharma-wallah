// src/app/(site)/courses/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pharm-D E-Learning Courses | Semester & Unit Wise Notes",
  description:
    "Comprehensive lecture handouts, clinical notes, and unit modules for Pharm-D students. Structured for sessionals, board finals, and pharmacy licensure preparation.",
};

export default function CoursesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}