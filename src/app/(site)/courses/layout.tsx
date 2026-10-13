// src/app/(site)/courses/layout.tsx
import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Pharm-D Course Notes by Unit | PharmaWallah",
  description:
    "Unit-by-unit study notes for four Semester 1 Pharm-D subjects — biochemistry, physiology, physical pharmacy and organic chemistry — with practice MCQs.",
  path: "/courses",
});

export default function CoursesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}