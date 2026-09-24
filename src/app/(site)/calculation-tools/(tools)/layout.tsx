import Link from "next/link";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { ArrowLeft, Smartphone } from "lucide-react";
import { AdSlot } from "@/components/calculators/AdSlot";
import { CalcDisclaimer } from "@/components/calculators/CalcDisclaimer";
import { Button } from "@/components/ui/button";
import { HUB_SUBJECTS, UNLISTED_TOOLS } from "../tool-index";
import { SITE_NAME } from "@/lib/seo";


/**
 * Each calculator's title and description, from the hub registry.
 *
 * The tool pages are client components and cannot export metadata, so before
 * 2026-09-23 all ~105 of them were titled plain "PharmaWallah" — to a search
 * crawler (and an AdSense review), a hundred copies of one page. Reading the
 * slug from the request path here gives every tool its own, and a newly
 * registered tool is described automatically. Web only: the Android and desktop
 * builds re-export the page files, never this layout.
 */
export async function generateMetadata(): Promise<Metadata> {
  const path = headers().get("x-pathname") ?? "";
  const slug = path.split("/")[2] ?? "";

  let found: { name: string; desc: string; subject?: string } | undefined;
  for (const subject of HUB_SUBJECTS) {
    const tool = subject.tools.find((t) => t.slug === slug);
    if (tool) found = { name: tool.name, desc: tool.desc, subject: subject.label };
  }
  found ??= UNLISTED_TOOLS[slug];
  if (!found) return {};

  const title = `${found.name} | ${SITE_NAME}`;
  const description = `${found.desc}. Free ${
    found.subject ? `${found.subject.toLowerCase()} ` : "pharmacy "
  }calculator for Pharm-D students, with the formula and worked steps.`;

  return { title, description, openGraph: { title, description } };
}

/**
 * Layout shared by every calculator page.
 *
 * It exists to give every tool three things from a single file, instead of
 * editing each bespoke 1000–1900-line page:
 *   1. the "educational purposes only" disclaimer card (CalcDisclaimer — the
 *      Android app mounts its own copy in MobileShell);
 *   2. a way back. Most calculators contain no navigation at all, so a student
 *      who landed on one from search had only the site header to leave by;
 *   3. a footer ad placement. Only tools migrated to the calculator UI kit have
 *      an `aside` to put an ad in (src/components/calculators/CalculatorShell.tsx).
 *
 * `children` is passed through untouched — the pages own everything above.
 *
 * The Android app is unaffected. `scripts/generate-mobile-routes.mjs` emits
 * `export { default } from "<tool>/page"` — it re-exports the page component,
 * never this layout — so no ad markup or ad script can reach the offline APK,
 * and the app's own bar supplies the back button there. `AdSlot` refuses to
 * render in the app in any case.
 */
export default function CalculatorToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}

      {/* No background colour of its own: unmigrated tools each paint their own
          full-height background, so a coloured strip would read as a seam. */}
      <div className="mx-auto w-full max-w-6xl px-4 pb-10 pt-6 sm:px-6">
        {/* Directly under the tool, before navigation and the ad, so it reads
            as part of the calculator rather than as page furniture. */}
        <CalcDisclaimer className="mb-6" />

        <nav
          aria-label="Calculator navigation"
          className="flex flex-col gap-3 border-t border-border/80 pt-6 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            PharmaWallah · Calculators
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild variant="outline" size="sm" className="h-10 px-4">
              <Link href="/calculation-tools">
                <ArrowLeft />
                All calculators
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="h-10 px-4">
              <Link href="/download">
                <Smartphone />
                Use them offline
              </Link>
            </Button>
          </div>
        </nav>

        {/* Below the tool, not beside it: a calculator's result is the thing the
            visitor came for, and AdSense forbids placements that could be taken
            for part of the interface. Not wrapped in anything animated — a
            transform or opacity transition on an ad breaks viewability
            measurement. */}
        <div className="mt-8">
          <AdSlot
            slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR_FOOTER}
            format="horizontal"
          />
        </div>
      </div>
    </>
  );
}
