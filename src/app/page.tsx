import React from "react";
import { headers } from "next/headers";
import LandingPage from "@/components/Home/landing/LandingPage";
import ClinicalLandingPage from "@/components/Clinical/ClinicalLandingPage";

/*
 * The student-facing landing page.
 *
 * The previous stack of sections (Hero / Companies / Courses / Features /
 * ContactForm) was replaced by the ADME landing page on 2026-09-12. Those
 * components are still on disk under src/components/Home/ and are no longer
 * rendered anywhere — see CLAUDE.md §7 Technical Debt before deleting them.
 */
export default function Home() {
  const headersList = headers();
  const isClinical = headersList.get("x-subdomain") === "clinical";

  if (isClinical) {
    return <ClinicalLandingPage />;
  }

  return <LandingPage />;
}
