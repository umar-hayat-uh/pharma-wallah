import React, { Suspense } from "react";
import { headers } from "next/headers";
import LandingPage from "@/components/Home/landing/LandingPage";
import ClinicalLandingPage from "@/components/Clinical/ClinicalLandingPage";
import { HomeBattleSection } from "@/components/battle-royale/HomeBattleSection";

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

  // The Battle Royale podium sits under the hero while the event is current
  // (it hides itself when it isn't). Streamed, so it never delays the hero.
  return (
    <LandingPage
      battle={
        <Suspense fallback={null}>
          <HomeBattleSection />
        </Suspense>
      }
    />
  );
}
