"use client";

import Link from "next/link";
import { MotionConfig } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Calculator,
  ChartLine,
  CircleAlert,
  ClipboardCheck,
  Download,
  Globe,
  Lightbulb,
  ListChecks,
  RefreshCw,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Table2,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BRAND_SURFACE } from "@/components/page-kit/brand";
import {
  CHECKLIST,
  COMMON_ERRORS,
  COMPARISON,
  FIELD_SIGNALS,
  FOLLOW_SOURCES,
  GOLDEN_FLOW,
  GOLDEN_RULES,
  HAVE_READY,
  INPUT_RULES,
  LAB_WORKFLOW,
  QUICK_START,
  SECTIONS,
  type GuideFacts,
} from "./content";
import { GuideTour } from "./GuideTour";
import {
  ANATOMY,
  AnatomySketch,
  BrowserSketch,
  CalculateSketch,
  Callout,
  ChooseSketch,
  ErrorFieldSketch,
  FieldKindsSketch,
  FlowStrip,
  FormulaSketch,
  GraphSketch,
  LabWorkflowSketch,
  PhoneSketch,
  RawToInputSketch,
  ResetSketch,
  ResultSketch,
  TableSketch,
  UnitDropdownSketch,
  VerifySketch,
} from "./illustrations";
import "./guide.css";

/**
 * "How to Use PharmaWallah Calculators" — one guide for every calculator.
 *
 * Shared by the website (`/calculation-tools/how-to-use`) and the apps
 * (`/how-to-use/` in `mobile/`). The two pass different `facts` — their own
 * tool count, categories and hub link — and otherwise render the same page.
 *
 * It describes the calculators' real, shared behaviour only (see the header
 * of content.ts for what was checked). Nothing here is tied to one calculator.
 * The quick tour sits at the top; the full guide follows for anyone who wants
 * the detail, with a jump list so a student can go straight to "graphs".
 */
export function CalculatorGuide({ facts }: { facts: GuideFacts }) {
  const isApp = facts.platform === "app";

  const skipToQuickStart = () => {
    const target = document.getElementById("quick-start");
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
    // Move focus as well, so a keyboard or screen-reader user lands there too.
    target?.focus({ preventScroll: true });
  };

  return (
    // reducedMotion="user": framer-motion honours the OS setting for every
    // animation below; the two CSS loops have their own media query.
    <MotionConfig reducedMotion="user">
      <div className="pw-guide bg-background pb-16 text-foreground">
        {/* ── 1. WELCOME ───────────────────────────────────────────────── */}
        <header className="border-b border-border/70 bg-[linear-gradient(180deg,hsl(var(--primary)/0.07),transparent)]">
          <div className={cn("mx-auto max-w-6xl px-4 sm:px-6", isApp ? "pb-8 pt-6" : "pb-10 pt-8 sm:pb-14 sm:pt-14")}>
            {!isApp && (
              <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
                <Link href="/" className="hover:text-foreground">
                  Home
                </Link>
                <span className="mx-2">/</span>
                <Link href={facts.hubHref} className="hover:text-foreground">
                  Calculation tools
                </Link>
                <span className="mx-2">/</span>
                <span className="text-foreground">How to use</span>
              </nav>
            )}
            <p className="flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-primary">
              <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
              How to use PharmaWallah Calculators
            </p>
            <h1 className="mt-3 max-w-3xl text-[clamp(2rem,1.4rem+3vw,3.4rem)] font-bold leading-[1.02] tracking-[-0.035em] [text-wrap:balance]">
              Master your pharmacy calculations
            </h1>
            <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-muted-foreground sm:text-[17px]">
              PharmaWallah Calculators make pharmaceutical, laboratory, clinical and mathematical calculations faster
              and easier. Enter your values, select the right units, and review your result. This guide works for
              all {facts.toolCount} of them.
            </p>
            <div className="mt-7">
              <FlowStrip
                label="Input, then calculate, then result, then interpret."
                steps={[
                  { label: "Input", icon: ListChecks },
                  { label: "Calculate", icon: Calculator },
                  { label: "Result", icon: Sparkles },
                  { label: "Interpret", icon: Lightbulb },
                ]}
              />
            </div>
            <div className="mt-7 flex flex-wrap gap-2.5">
              <a
                href="#tour"
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Take the quick tour
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <Link
                href={facts.hubHref}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-card px-5 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Calculator className="h-4 w-4" aria-hidden="true" />
                Start calculating
              </Link>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          {/* ── QUICK TOUR ───────────────────────────────────────────────── */}
          <div id="tour" className="scroll-mt-24 pt-8 sm:pt-12">
            <GuideTour facts={facts} onSkip={skipToQuickStart} />
          </div>

          <div className="mt-12 gap-10 lg:grid lg:grid-cols-[14rem_minmax(0,1fr)]">
            <Contents />

            <div className="min-w-0 space-y-14 sm:space-y-16">
              {/* ── 2. BEFORE YOU START ─────────────────────────────────── */}
              <Section id="before-you-start" icon={ClipboardCheck} eyebrow="Before you start" title="Have these ready">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardTitle>What to bring</CardTitle>
                    <ul className="mt-3 space-y-2.5">
                      {HAVE_READY.map((item) => (
                        <li key={item} className="flex gap-2.5 text-sm text-foreground">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </Card>
                  <Card>
                    <CardTitle>Checklist</CardTitle>
                    <ol className="mt-3 space-y-2">
                      {CHECKLIST.map((item, i) => (
                        <li key={item} className="flex items-center gap-2.5 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-950">
                          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-emerald-500 text-[11px] font-bold text-white" aria-hidden="true">
                            ✓
                          </span>
                          <span>
                            <span className="sr-only">Step {i + 1}: </span>
                            {item}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </Card>
                </div>
              </Section>

              {/* ── 3. CHOOSE ───────────────────────────────────────────── */}
              <Section
                id="choose"
                icon={Search}
                eyebrow="Step 1"
                title="Choose your calculator"
                lead="Choose the calculator that matches the calculation or experiment you are doing. Search by name, or browse by the subject you meet it in."
              >
                <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-start">
                  <ChooseSketch categories={facts.categories} />
                  <div>
                    <CardTitle>The {facts.categories.length} subjects</CardTitle>
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {facts.categories.map((c) => (
                        <li key={c.id}>
                          <Link
                            href={c.href}
                            className="inline-flex rounded-full border border-border bg-card px-3 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            {c.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                      Not sure which one? Search for the quantity you need, such as “dilution”, “half-life” or
                      “yield”, and read the one-line description under each name.
                    </p>
                  </div>
                </div>
              </Section>

              {/* ── 4. THE SCREEN ───────────────────────────────────────── */}
              <Section
                id="screen"
                icon={Calculator}
                eyebrow="Step 2"
                title="Understand the calculator screen"
                lead="Every calculator is built from the same parts. Not every calculator has all of them, so look for the ones yours has."
              >
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                  <AnatomySketch />
                  <ol className="grid content-start gap-2.5">
                    {ANATOMY.map((a) => (
                      <li key={a.n} className="flex gap-3">
                        <Callout n={a.n} className="mt-0.5" />
                        <span className="text-sm leading-relaxed">
                          <strong className="font-semibold text-foreground">{a.title}.</strong>{" "}
                          <span className="text-muted-foreground">{a.body}</span>
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              </Section>

              {/* ── 5. ENTER VALUES ─────────────────────────────────────── */}
              <Section
                id="enter"
                icon={ListChecks}
                eyebrow="Step 3"
                title="Enter your values"
                lead="Enter values exactly as your experiment, practical manual, question or dataset gives them."
              >
                <RawToInputSketch />
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {INPUT_RULES.map((rule, i) => (
                    <Card key={rule.title}>
                      <p className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-primary">Rule {i + 1}</p>
                      <CardTitle className="mt-1">{rule.title}</CardTitle>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{rule.body}</p>
                      {(rule.good || rule.bad) && (
                        <div className="mt-3 flex flex-wrap gap-2 text-sm">
                          {rule.good && (
                            <span className="rounded-lg bg-emerald-50 px-2.5 py-1 font-mono text-emerald-900">
                              <span className="sr-only">Correct: </span>✓ {rule.good}
                            </span>
                          )}
                          {rule.bad && (
                            <span className="rounded-lg bg-red-50 px-2.5 py-1 font-mono text-red-900">
                              <span className="sr-only">Avoid: </span>✗ {rule.bad}
                            </span>
                          )}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
                <Tip icon={Sparkles}>
                  Many calculators have a <strong>Try an example</strong> button. It fills in sample values so you can
                  see how the calculator works before you enter your own.
                </Tip>
              </Section>

              {/* ── 6. UNITS ────────────────────────────────────────────── */}
              <Section
                id="units"
                icon={ChevronUnitsIcon}
                eyebrow="Step 4"
                title="Use the unit dropdowns"
                lead="Where a box has a dropdown beside it, choose the unit that matches your recorded value. The calculator converts it for you."
              >
                <div className="grid gap-5 md:grid-cols-2 md:items-center">
                  <UnitDropdownSketch />
                  <div className="space-y-3">
                    <Warning>Wrong units can produce completely different results: 5 mg/mL is 5000 µg/mL.</Warning>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      If the unit is printed inside the box instead of in a dropdown, it is fixed. Convert your value to
                      that unit before you type it.
                    </p>
                  </div>
                </div>
              </Section>

              {/* ── 7. REQUIRED / OPTIONAL ──────────────────────────────── */}
              <Section
                id="inputs"
                icon={ListChecks}
                eyebrow="Step 5"
                title="Needed, optional and calculated values"
                lead="A calculator tells you what it still needs. You don't have to guess."
              >
                <div className="grid gap-5 md:grid-cols-2">
                  <FieldKindsSketch />
                  <ul className="space-y-3">
                    {FIELD_SIGNALS.map((s) => (
                      <li key={s.kind} className="flex gap-3">
                        <span
                          className={cn(
                            "mt-1 h-3 w-3 shrink-0 rounded-full",
                            s.kind === "needed" && "bg-primary",
                            s.kind === "optional" && "border-2 border-muted-foreground/50 bg-card",
                            s.kind === "calculated" && "bg-emerald-500",
                          )}
                          aria-hidden="true"
                        />
                        <span className="text-sm leading-relaxed">
                          <strong className="font-semibold text-foreground">{s.title}.</strong>{" "}
                          <span className="text-muted-foreground">{s.body}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Section>

              {/* ── 8. CALCULATE ────────────────────────────────────────── */}
              <Section
                id="calculate"
                icon={Calculator}
                eyebrow="Step 6"
                title="Getting the result"
                lead="On most calculators there is nothing to press: the result appears as soon as the needed values are in. Lab-practical calculators have a Calculate button."
              >
                <CalculateSketch />
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardTitle>Before you read the answer</CardTitle>
                    <ol className="mt-3 space-y-2 text-sm text-foreground">
                      {[
                        "Enter all the needed values.",
                        "Check the units.",
                        "Check the values once more.",
                        "Press Calculate, if your calculator has the button.",
                        "Read the result card.",
                      ].map((t, i) => (
                        <li key={t} className="flex gap-2.5">
                          <span className="font-mono text-xs font-semibold text-primary">{i + 1}.</span>
                          {t}
                        </li>
                      ))}
                    </ol>
                  </Card>
                  <div className="space-y-3">
                    <ErrorFieldSketch />
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      If a box turns red or a message appears, correct that value first. The result won't show until
                      it's fixed.
                    </p>
                  </div>
                </div>
              </Section>

              {/* ── 9. RESULT ───────────────────────────────────────────── */}
              <Section
                id="result"
                icon={Sparkles}
                eyebrow="Step 7"
                title="Understand your result"
                lead="The result card gives the number, its unit and, on most calculators, a line saying what it means."
              >
                <ResultSketch />
                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    ["The value", "Is it the size you expected?"],
                    ["The unit", "Is it the unit your answer needs?"],
                    ["Decimal places", "Round as your manual asks."],
                    ["Significant figures", "No more than your data supports."],
                    ["Scientific sense", "A yield over 100% or a negative mass means a wrong input."],
                    ["Expected range", "Compare with the range given in your practical."],
                  ].map(([t, b]) => (
                    <Card key={t} compact>
                      <CardTitle>{t}</CardTitle>
                      <p className="mt-1 text-sm text-muted-foreground">{b}</p>
                    </Card>
                  ))}
                </div>
                <Tip icon={ShieldCheck}>
                  The calculator does the arithmetic. <strong>You</strong> are responsible for entering correct data and
                  interpreting the result.
                </Tip>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Lab-practical calculators also build a lab-record card. Use <strong className="text-foreground">Copy</strong>{" "}
                  to paste it into your notes,{" "}
                  {isApp ? (
                    <>
                      or <strong className="text-foreground">Share</strong> to save or send it from your phone.
                    </>
                  ) : (
                    <>
                      or <strong className="text-foreground">Download card</strong> and{" "}
                      <strong className="text-foreground">Print</strong>.
                    </>
                  )}
                </p>
              </Section>

              {/* ── 10. FORMULA ─────────────────────────────────────────── */}
              <Section
                id="formula"
                icon={BookOpen}
                eyebrow="Step 8"
                title="The formula and working"
                lead="Open “How this is calculated” on any calculator to see how the result was obtained. It's closed until you tap it."
              >
                <FormulaSketch />
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  Match each letter in the formula to a box you filled in. Then follow the working to see your own
                  numbers substituted. It's useful for practical records, assignments and viva preparation, and it's the
                  quickest way to spot a value in the wrong box.
                </p>
              </Section>

              {/* ── 11. TABLES ──────────────────────────────────────────── */}
              <Section
                id="tables"
                icon={Table2}
                eyebrow="Step 9"
                title="Tables"
                lead="Calculators that take several observations, such as readings over time or replicates, have a table. You can enter and compare them together."
              >
                <div className="grid gap-5 md:grid-cols-2 md:items-center">
                  <TableSketch />
                  <ul className="space-y-2.5 text-sm text-foreground">
                    {[
                      "Enter values row by row.",
                      "Check each row belongs to the right time, sample or replicate.",
                      "Watch for a value shifted into the row above or below.",
                      "Columns the calculator fills in are shown in its own results. Don't type them.",
                    ].map((t) => (
                      <li key={t} className="flex gap-2.5">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </Section>

              {/* ── 12. GRAPHS ──────────────────────────────────────────── */}
              <Section
                id="graphs"
                icon={ChartLine}
                eyebrow="Step 10"
                title="Graphs"
                lead="Where a calculator draws a graph, it shows the relationship and trend in your data."
              >
                <div className="grid gap-5 md:grid-cols-2 md:items-start">
                  <GraphSketch />
                  <div className="space-y-4">
                    <Card>
                      <CardTitle>Check</CardTitle>
                      <ul className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-2 text-sm text-foreground">
                        {["Axis labels", "Units", "Data points", "The trend", "Slope and intercept", "R², if shown"].map((t) => (
                          <li key={t} className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                            {t}
                          </li>
                        ))}
                      </ul>
                    </Card>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Ask whether the graph shows the relationship you expect. The x-axis is the variable you set; the
                      y-axis is the one you measured. Common types are time against concentration, time against
                      absorbance, concentration against response, calibration curves, and stability or kinetics plots.
                      R² closer to 1 means the points sit closer to the line.
                    </p>
                  </div>
                </div>
              </Section>

              {/* ── 13. RESET ───────────────────────────────────────────── */}
              <Section
                id="reset"
                icon={RefreshCw}
                eyebrow="Step 11"
                title="Reset"
                lead="Use Reset when you start a new calculation or enter a different dataset."
              >
                <ResetSketch />
                <Warning>
                  Reset clears your current inputs and result. Write down or copy anything you need first.
                </Warning>
              </Section>

              {/* ── 14. COMMON ERRORS ───────────────────────────────────── */}
              <Section id="errors" icon={CircleAlert} eyebrow="Step 12" title="Common errors and how to fix them">
                <div className="grid gap-3 md:grid-cols-2">
                  {COMMON_ERRORS.map((e) => (
                    <Card key={e.problem}>
                      <p className="flex items-center gap-2 text-sm font-semibold text-red-700">
                        <CircleAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
                        {e.problem}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-foreground">{e.fix}</p>
                      {e.checks && (
                        <ul className="mt-2.5 flex flex-wrap gap-1.5">
                          {e.checks.map((c) => (
                            <li key={c} className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                              {c}
                            </li>
                          ))}
                        </ul>
                      )}
                    </Card>
                  ))}
                </div>
              </Section>

              {/* ── 15. WEBSITE ─────────────────────────────────────────── */}
              <Section
                id="website"
                icon={Globe}
                eyebrow="On the website"
                title="Using the calculators on the website"
              >
                <FlowStrip
                  label="Open the website, go to calculators, search or choose, enter data, read the result."
                  steps={[
                    { label: "Open the website" },
                    { label: "Calculation tools" },
                    { label: "Search or choose" },
                    { label: "Enter data" },
                    { label: "Review the result" },
                  ]}
                />
                <div className="mt-5 grid gap-5 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] md:items-center">
                  <BrowserSketch />
                  <ul className="space-y-2.5 text-sm leading-relaxed text-muted-foreground">
                    <li>
                      <strong className="text-foreground">Find it:</strong>{" "}
                      {isApp ? (
                        "pharmawallah.com → Calculation tools"
                      ) : (
                        <Link href={facts.hubHref} className="font-medium text-primary underline-offset-2 hover:underline">
                          Calculation tools
                        </Link>
                      )}{" "}
                      has a search box and a subject list.
                    </li>
                    <li>
                      <strong className="text-foreground">Go back:</strong> under every calculator there's an{" "}
                      <em>All calculators</em> button.
                    </li>
                    <li>
                      <strong className="text-foreground">On a phone browser:</strong> the same page stacks into one
                      column, and number boxes open the number keypad.
                    </li>
                    <li>
                      <strong className="text-foreground">Needs internet</strong> to load. No account is needed.
                    </li>
                  </ul>
                </div>
              </Section>

              {/* ── 16. APP ─────────────────────────────────────────────── */}
              <Section id="app" icon={Smartphone} eyebrow="On the app" title="Using the calculators on the mobile app">
                <FlowStrip
                  label="Open the app, browse or search, select a calculator, enter values, read the result."
                  steps={[
                    { label: "Open the app" },
                    { label: "Browse or search" },
                    { label: "Select a calculator" },
                    { label: "Enter values" },
                    { label: "Review the result" },
                  ]}
                />
                <div className="mt-5 grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-center">
                  <PhoneSketch />
                  <ul className="space-y-2.5 text-sm leading-relaxed text-muted-foreground">
                    <li>
                      <strong className="text-foreground">The same calculators.</strong> The app runs the very same
                      calculator screens as the website, so everything in this guide applies.
                    </li>
                    <li>
                      <strong className="text-foreground">Works offline.</strong> Every calculator works with no signal,
                      in the lab or on the ward.
                    </li>
                    <li>
                      <strong className="text-foreground">Home, Browse, Saved</strong> at the bottom of the screen. Tap
                      the ☆ on a calculator to save it; recently opened ones appear on Home.
                    </li>
                    <li>
                      <strong className="text-foreground">Back arrow</strong> at the top left of every calculator
                      returns to the list.
                    </li>
                    <li>
                      <strong className="text-foreground">Android only for now.</strong> There is no iPhone download
                      yet. On an iPhone, use the website in Safari.
                    </li>
                  </ul>
                </div>
                {!isApp && (
                  <Link
                    href="/download"
                    className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-card px-5 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Download className="h-4 w-4" aria-hidden="true" />
                    Get the app
                  </Link>
                )}
              </Section>

              {/* ── 17. WEBSITE VS APP ──────────────────────────────────── */}
              <section aria-labelledby="compare-title">
                <h2 id="compare-title" className="text-xl font-bold tracking-[-0.02em] text-foreground">
                  Website and app compared
                </h2>
                <div className="mt-4 overflow-x-auto rounded-2xl border border-border/80 bg-card">
                  <table className="w-full min-w-[30rem] text-left text-sm">
                    <thead className="bg-muted/60 text-xs uppercase tracking-[0.08em] text-muted-foreground">
                      <tr>
                        <th scope="col" className="px-4 py-3 font-semibold">Feature</th>
                        <th scope="col" className="px-4 py-3 font-semibold">Website</th>
                        <th scope="col" className="px-4 py-3 font-semibold">Mobile app</th>
                      </tr>
                    </thead>
                    <tbody>
                      {COMPARISON.map((row) => (
                        <tr key={row.feature} className="border-t border-border/70">
                          <th scope="row" className="px-4 py-2.5 font-medium text-foreground">{row.feature}</th>
                          <Cell value={row.web} />
                          <Cell value={row.app} />
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* ── 18. GOLDEN RULES ────────────────────────────────────── */}
              <section
                aria-labelledby="rules-title"
                className="rounded-3xl p-6 text-white sm:p-9"
                style={{ background: BRAND_SURFACE }}
              >
                <p className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-white/85">
                  Best practice
                </p>
                <h2 id="rules-title" className="mt-2 text-[clamp(1.6rem,1.2rem+1.6vw,2.4rem)] font-bold leading-tight tracking-[-0.03em]">
                  7 golden rules
                </h2>
                <ol className="mt-6 grid gap-3 sm:grid-cols-2">
                  {GOLDEN_RULES.map((rule, i) => (
                    <li key={rule} className="flex gap-3 rounded-xl bg-white/10 px-4 py-3 ring-1 ring-inset ring-white/15">
                      <span className="font-mono text-lg font-bold text-white/85">{i + 1}</span>
                      <span className="text-[15px] font-medium leading-snug">{rule}</span>
                    </li>
                  ))}
                </ol>
                <div className="mt-6">
                  <FlowStrip
                    tone="brand"
                    label={GOLDEN_FLOW.join(", then ")}
                    steps={GOLDEN_FLOW.map((label) => ({ label }))}
                  />
                </div>
              </section>

              {/* ── 19. LAB WORKFLOW ────────────────────────────────────── */}
              <Section
                id="lab-workflow"
                icon={ClipboardCheck}
                eyebrow="In the lab"
                title="From experiment to practical record"
                lead="The workflow for a lab practical, from the bench to the page."
              >
                <LabWorkflowSketch steps={LAB_WORKFLOW} />
              </Section>

              {/* ── 20. VERIFY ──────────────────────────────────────────── */}
              <Section
                id="verify"
                icon={ShieldCheck}
                eyebrow="Important"
                title="Don't blindly trust the result"
                lead="PharmaWallah Calculators are tools for calculation and learning. Always check that your inputs, units, formula and interpretation are correct."
              >
                <VerifySketch />
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardTitle>Where your instructions win</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      If a method or rounding rule differs from the calculator, follow:
                    </p>
                    <ul className="mt-3 space-y-2 text-sm text-foreground">
                      {FOLLOW_SOURCES.map((s) => (
                        <li key={s} className="flex gap-2.5">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </Card>
                  <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-amber-950">
                    <p className="flex items-center gap-2 font-semibold">
                      <TriangleAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
                      Clinical calculators
                    </p>
                    <p className="mt-2 text-sm leading-relaxed">
                      Dose, renal, hepatic and other clinical calculators are for study and reference only. Their
                      results are not a substitute for professional clinical judgement, current guidelines or a
                      prescriber's decision, and must not be used to treat a real patient.
                    </p>
                  </div>
                </div>
              </Section>

              {/* ── 25. QUICK START ─────────────────────────────────────── */}
              <section
                id="quick-start"
                tabIndex={-1}
                aria-labelledby="quick-start-title"
                className="scroll-mt-24 rounded-3xl border-2 border-primary/25 bg-card p-6 focus:outline-none sm:p-9"
              >
                <p className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-primary">Cheat sheet</p>
                <h2 id="quick-start-title" className="mt-2 text-[clamp(1.6rem,1.2rem+1.6vw,2.4rem)] font-bold tracking-[-0.03em]">
                  Quick start
                </h2>
                <ol className="mt-6 grid gap-2 sm:grid-cols-3">
                  {QUICK_START.map((step, i) => (
                    <li key={step} className="flex items-center gap-3 rounded-xl bg-muted/60 px-4 py-3">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary font-mono text-xs font-bold text-white">
                        {i + 1}
                      </span>
                      <span className="text-sm font-medium text-foreground">{step}</span>
                    </li>
                  ))}
                </ol>
                <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
                  <p className="text-lg font-semibold tracking-[-0.01em] text-foreground">
                    That's it. Calculate smarter with PharmaWallah.
                  </p>
                  <Link
                    href={facts.hubHref}
                    className="inline-flex h-11 items-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <Calculator className="h-4 w-4" aria-hidden="true" />
                    Start calculating
                  </Link>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}

// ─── LAYOUT PIECES ──────────────────────────────────────────────────────────

/** The jump list: a sticky column on a desktop, a scrolling row of chips on a phone. */
function Contents() {
  return (
    <nav aria-label="Guide contents" className="mb-10 lg:mb-0">
      <div className="lg:sticky lg:top-24">
        <p className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          In this guide
        </p>
        <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 lg:mx-0 lg:block lg:space-y-0.5 lg:overflow-visible lg:px-0 lg:pb-0">
          {SECTIONS.map((s) => (
            <li key={s.id} className="shrink-0">
              <a
                href={`#${s.id}`}
                className="block whitespace-nowrap rounded-full border border-border bg-card px-3 py-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:rounded-lg lg:border-0 lg:bg-transparent lg:px-2.5 lg:py-1.5 lg:hover:bg-muted"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

function Section({
  id,
  icon: Icon,
  eyebrow,
  title,
  lead,
  children,
}: {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  eyebrow: string;
  title: string;
  lead?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24">
      <div className="mb-5 flex items-start gap-3.5">
        <span
          aria-hidden="true"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/15"
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-primary">{eyebrow}</p>
          <h2 id={`${id}-title`} className="mt-1 text-[clamp(1.4rem,1.15rem+1vw,1.9rem)] font-bold leading-tight tracking-[-0.025em] text-foreground">
            {title}
          </h2>
          {lead && <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">{lead}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function Card({ children, compact }: { children: React.ReactNode; compact?: boolean }) {
  return (
    <div className={cn("rounded-2xl border border-border/80 bg-card shadow-[0_1px_2px_rgba(15,23,42,0.04)]", compact ? "p-4" : "p-5")}>
      {children}
    </div>
  );
}

function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={cn("text-[15px] font-semibold tracking-[-0.01em] text-foreground", className)}>{children}</h3>;
}

function Tip({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <p className="mt-5 flex gap-3 rounded-2xl bg-primary/[0.06] px-4 py-3.5 text-sm leading-relaxed text-foreground ring-1 ring-inset ring-primary/15">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

function Warning({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-4 flex gap-3 rounded-2xl bg-amber-50 px-4 py-3.5 text-sm font-medium leading-relaxed text-amber-950 ring-1 ring-inset ring-amber-300">
      <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

function Cell({ value }: { value: string }) {
  const tone = value.startsWith("✓") ? "text-emerald-700" : value === "—" ? "text-muted-foreground" : "text-foreground";
  const spoken = value === "✓" ? "Yes" : value === "—" ? "No" : value.replace("✓", "Yes");
  return (
    <td className={cn("px-4 py-2.5 font-medium", tone)}>
      <span aria-hidden="true">{value}</span>
      <span className="sr-only">{spoken}</span>
    </td>
  );
}

/** A unit-dropdown glyph for the units section; lucide has no single icon for it. */
function ChevronUnitsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="6" width="18" height="12" rx="3" />
      <path d="M14 11l2 2 2-2" />
      <path d="M7 12h3" />
    </svg>
  );
}
