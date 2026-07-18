// src/app/(site)/courses/[subjectSlug]/[unit]/page.tsx
//
// Replaces src/app/(site)/courses/[semesterSlug]/[subjectSlug]/[unit]/page.tsx
// URL is now /courses/pharmaceutical-biochemistry/unit1-... instead of
// /courses/sem-1/pharmaceutical-biochemistry/unit1-...

import { notFound } from "next/navigation";
import { SUBJECTS, getUnit } from "@/lib/courses/registry";
import { getUnitMarkdown } from "@/lib/courses/content";
import UnitPageClient from "@/components/course/UnitPageClient";
import type { Metadata } from "next";

interface Params { subjectSlug: string; unit: string }

export function generateStaticParams() {
  return SUBJECTS.flatMap((s) =>
    s.units.map((u) => ({ subjectSlug: s.slug, unit: u.id }))
  );
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const found = getUnit(params.subjectSlug, params.unit);
  if (!found) return {};
  return {
    title: `${found.unit.title} | ${found.subject.title} | Pharmawallah`,
    description: found.unit.description,
  };
}

export const revalidate = 3600;

export default async function UnitPage({ params }: { params: Params }) {
  const found = getUnit(params.subjectSlug, params.unit);
  if (!found) notFound();

  const { subject, unit, prevUnit, nextUnit, index } = found;
  const content = await getUnitMarkdown(unit.contentFile);

  return (
    <UnitPageClient
      subject={subject}
      unit={unit}
      prevUnit={prevUnit}
      nextUnit={nextUnit}
      unitIndex={index}
      content={content ?? ""}
      basePath={`/courses/${subject.slug}`}
    />
  );
}