import { AdSlot } from "@/components/calculators/AdSlot";

/**
 * Layout shared by all 89 calculator pages.
 *
 * It exists for one reason: to give every tool a footer ad placement from a
 * single file. The alternative was editing 89 bespoke 1000–1900-line pages,
 * and only the three migrated to the calculator UI kit have an `aside` to put
 * an ad in (see src/components/calculators/CalculatorShell.tsx).
 *
 * The Android app is unaffected. `scripts/generate-mobile-routes.mjs` emits
 * `export { default } from "<tool>/page"` — it re-exports the page component,
 * never this layout — so no ad markup or ad script can reach the offline APK.
 * `AdSlot` refuses to render there in any case.
 */
export default function CalculatorToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}

      {/* Below the tool, not beside it: a calculator's result is the thing the
          visitor came for, and AdSense forbids placements that could be taken
          for part of the interface. Not wrapped in anything animated — a
          transform or opacity transition on an ad breaks viewability
          measurement. */}
      {/* No background colour of its own: the 86 unmigrated tools each paint
          their own full-height background, so a coloured strip would read as a
          seam. This sits on the body background instead. */}
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <AdSlot
          slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR_FOOTER}
          format="horizontal"
        />
      </div>
    </>
  );
}
