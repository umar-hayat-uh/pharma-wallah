import Link from "next/link";
import { CALCULATOR_COUNT } from "@/app/(site)/calculation-tools/tool-index";
import { SUBJECTS } from "@/lib/courses/registry";
import { GUIDES } from "@/lib/guides";

/**
 * Plain-text introduction under the home hero (2026-10-13, AdSense phase 4):
 * who the site is for, what is here, how it is checked, what is still being
 * built. A server component passed into the client LandingPage as a slot, so
 * it is in the first HTML and the guide data used for the count never reaches
 * the browser bundle. Every figure is counted from its registry.
 */
export function HomeIntro() {
  const units = SUBJECTS.reduce((n, s) => n + s.units.length, 0);
  const link = "font-medium text-[#1C7BD9] underline-offset-2 hover:underline";
  return (
    <section aria-labelledby="pw-home-intro" className="wrap py-12 sm:py-16">
      <div className="mx-auto max-w-3xl space-y-4 text-[16px] leading-[1.75] text-[#16181d]/80">
        <h2 id="pw-home-intro" className="text-2xl font-bold tracking-tight text-[#16181d] sm:text-3xl">
          What PharmaWallah is
        </h2>
        <p>
          PharmaWallah is a free study site for Doctor of Pharmacy students in Pakistan, built by pharmacy students.
          It is for the calculations, notes and lab practice that come up in a Pharm-D course: preparing a dilution
          for a practical, working out a dose in a pharmaceutics exam, or reading a stability or pharmacokinetics
          data sheet.
        </p>
        <p>
          The largest part is the <Link href="/calculation-tools" className={link}>{CALCULATOR_COUNT} calculators</Link>,
          each showing its formula and the working behind the answer, so you can check your own method rather than
          copy a number. Alongside them are <Link href="/guides" className={link}>{GUIDES.length} calculation guides</Link>{" "}
          with worked examples and practice questions, <Link href="/courses" className={link}>{units} units of course notes</Link>{" "}
          in {SUBJECTS.length} first-semester subjects with practice MCQs, slide-spotting lessons, and lab simulations.
          The calculators also work offline in the Android app.
        </p>
        <p>
          The team checks every formula against the textbook or guideline cited on the page and recalculates each
          worked example independently. Pages are prepared by the student team; where a named person has reviewed a
          page, the page says so. If you find a mistake, every page has a link to report it, and the{" "}
          <Link href="/editorial-policy" className={link}>editorial policy</Link> explains how we correct it.
        </p>
        <p>
          Still being built: notes for more subjects and more calculation guides. Everything here is for learning —
          verify results with your textbook or instructor, and never use them to dose a real patient.
        </p>
      </div>
    </section>
  );
}
