import { notFound } from "next/navigation";
import { JsonLd, breadcrumbLd } from "@/lib/structured-data";
import { pageMeta } from "@/lib/seo";
import { SUBJECTS, getUnit } from "@/lib/courses/registry";
import { getUnitMarkdownSync } from "@/lib/courses/content";
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
  return pageMeta({
    title: `${found.unit.title} | ${found.subject.title}`,
    description: found.unit.description,
    path: `/courses/${found.subject.slug}/${found.unit.id}`,
    extra: [`Study notes from ${found.subject.title} for Pharm-D students.`],
    type: "article",
  });
}

export const revalidate = 3600;

export default function UnitPage({ params }: { params: Params }) {
  const found = getUnit(params.subjectSlug, params.unit);
  if (!found) notFound();

  const { subject, unit, prevUnit, nextUnit, index } = found;
  // Synchronous on purpose: see getUnitMarkdownSync.
  const content = getUnitMarkdownSync(unit.contentFile);

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Courses", path: "/courses" },
          { name: subject.title, path: `/courses/${subject.slug}` },
          { name: unit.title, path: `/courses/${subject.slug}/${unit.id}` },
        ])}
      />
      <UnitPageClient
      subject={subject}
      unit={unit}
      prevUnit={prevUnit}
      nextUnit={nextUnit}
      unitIndex={index}
      content={content ?? ""}
      basePath={`/courses/${subject.slug}`}
      />
    </>
  );
}