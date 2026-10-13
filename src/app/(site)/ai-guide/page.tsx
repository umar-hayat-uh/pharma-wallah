import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import AIGuideClient from "@/components/ai-guide/AIGuideClient";

/**
 * The AI Guide.
 *
 * A server component purely so the page can carry metadata — the old version
 * was `"use client"` from its first line and therefore could export none, so
 * this route had no title, description or canonical at all.
 */
export const metadata: Metadata = pageMeta({
  title: "AI Guide — PharmaWallah",
  description:
    "Ask a pharmacy tutor anything: mechanisms, kinetics, formulation, calculations and exam practice, explained for the Pharm-D syllabus.",
  path: "/ai-guide",
});

export default function AIGuidePage() {
  return <AIGuideClient />;
}
