"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Atom,
  Beaker,
  Bone,
  Calculator,
  Download,
  FlaskConical,
  FlaskRound,
  GraduationCap,
  HeartPulse,
  Layers,
  Microscope,
  Pill,
  ScanSearch,
  ShieldCheck,
  Timer,
  WifiOff,
  type LucideIcon,
} from "lucide-react";
import { STATS } from "@/components/Home/landing/data";

import "./molecule-landing.css";

/** One calculator subject for section 01, summarised on the server from tool-index.ts. */
export type SubjectSummary = { id: string; label: string; desc: string; count: number };

/*
 * Osteology Lab coverage, from src/lib/osteology and CLAUDE.md (2026-10-18): 22
 * bones, 17 joints, 354 viva questions, 8 mock-exam presets. Literals so this
 * bundle does not pull in the lab's content; update together.
 */
const OSTEOLOGY = { bones: 22, joints: 17, viva: 354, mocks: 8 };

/** Stills of our own apparatus (scripts/home/render-apparatus.mjs) and app (capture-app-screens.mjs). */
const IMG = {
  glassware: { src: "/images/home/apparatus-glassware.webp", w: 1005, h: 1413 },
  balance: { src: "/images/home/apparatus-balance.webp", w: 1200, h: 1332 },
  microscope: { src: "/images/home/apparatus-microscope.webp", w: 1062, h: 1806 },
  femur: { src: "/images/home/apparatus-femur.webp", w: 690, h: 1163 },
  appHome: { src: "/images/home/app-home.webp", w: 780, h: 1688 },
  appDilution: { src: "/images/home/app-dilution.webp", w: 780, h: 1688 },
};

const SUBJECT_ICONS: Record<string, LucideIcon> = {
  "pharma-chem": FlaskConical,
  pharmaceutics: Pill,
  "biopharmaceutics-pharmacokinetics": Activity,
  "pharmaceutical-analysis": Beaker,
};

/* The four labs and their one experiment each (src/lib/virtual-labs/catalog.ts). */
const LABS: { Icon: LucideIcon; lab: string; title: string; body: string }[] = [
  { Icon: FlaskConical, lab: "Pharm. Chemistry", title: "Citric acid assay", body: "Weigh on an analytical balance, make up to volume and titrate with NaOH to the phenolphthalein end-point." },
  { Icon: FlaskRound, lab: "Pharmaceutics", title: "Simple Syrup", body: "Dissolve sucrose with gentle heat, make up the batch and measure its density." },
  { Icon: HeartPulse, lab: "Pharmacology", title: "Dose–response curve", body: "Dose an organ bath, record the contractions and read the EC50 from your own log-dose plot." },
  { Icon: Microscope, lab: "Pharmacognosy", title: "Clove powder microscopy", body: "Mount and clear a powdered drug, focus it, and find its diagnostic elements at 10× and 40×." },
];

const BONES: { Icon: LucideIcon; title: string; body: string }[] = [
  { Icon: Bone, title: `${OSTEOLOGY.bones} bones in 3D`, body: "Rotate each bone, switch sides and fly to any landmark from a searchable list." },
  { Icon: Layers, title: `${OSTEOLOGY.joints} joints`, body: "Each articulation with its capsule, ligaments, discs and menisci, highlighted one by one." },
  { Icon: ScanSearch, title: "Spotting and viva", body: `Identify rendered specimens and practise ${OSTEOLOGY.viva} viva questions.` },
  { Icon: Timer, title: "Timed mock practicals", body: `${OSTEOLOGY.mocks} exam formats, marked on the server so the score is the one you earned.` },
];

const APP_POINTS: { Icon: LucideIcon; title: string; body: string }[] = [
  { Icon: WifiOff, title: "Works with no internet", body: "Every calculator lives on the phone — in the lab, on a ward, or anywhere without signal." },
  { Icon: Calculator, title: `All ${STATS.calculators} calculators`, body: "The full set from the website, with the same formulas and units." },
  { Icon: ShieldCheck, title: "No account, no tracking", body: "Nothing to sign in to, and nothing you type leaves your phone." },
];

/* The close's starting points: every one a real section of the site, with its own still. */
const DOORS: { href: string; title: string; body: string; img: keyof typeof IMG; shot?: boolean }[] = [
  { href: "/calculation-tools", title: "Calculators", body: `${STATS.calculators} tools for practicals and dosing`, img: "balance" },
  { href: "/virtual-labs", title: "Virtual Labs", body: `${STATS.virtualLabs} experiments to perform in 3D`, img: "microscope" },
  { href: "/osteology-lab", title: "Osteology Lab", body: `${OSTEOLOGY.bones} bones, ${OSTEOLOGY.joints} joints, mock exams`, img: "femur" },
  { href: "/courses", title: "Courses", body: `${STATS.lessons} lessons with MCQs`, img: "glassware" },
  { href: "/download", title: "Android app", body: "Every calculator, offline", img: "appHome", shot: true },
];

function Img({ name, className, eager }: { name: keyof typeof IMG; className?: string; eager?: boolean }) {
  const a = IMG[name];
  return (
    // Decorative stills: the copy beside them carries the content.
    // eslint-disable-next-line @next/next/no-img-element
    <img className={className} src={a.src} width={a.w} height={a.h} alt="" aria-hidden="true" draggable={false} loading={eager ? "eager" : "lazy"} decoding="async" />
  );
}

function Card({ Icon, title, tag, body, href }: { Icon: LucideIcon; title: string; tag?: string; body: string; href?: string }) {
  const inner = (
    <>
      <div className="top">
        <span className="icon">
          <Icon aria-hidden="true" />
        </span>
        <div>
          {tag ? <span className="tag">{tag}</span> : null}
          <h3>{title}</h3>
        </div>
      </div>
      <p>{body}</p>
    </>
  );
  return href ? (
    <Link className="card" href={href}>
      {inner}
    </Link>
  ) : (
    <div className="card">{inner}</div>
  );
}

function More({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link className="link more" href={href}>
      {children}
      <ArrowRight aria-hidden="true" />
    </Link>
  );
}

/**
 * The molecule landing page: a hero, three feature sections, the Android app and
 * a close, with paracetamol flying between the sections (flight.ts) and parking
 * on each one's stage. Previewed at /home-preview before it replaces "The Index"
 * at /. Motion is CSS + one rAF loop: no GSAP, no framer-motion.
 */
export default function MoleculeLanding({ subjects }: { subjects: SubjectSummary[] }) {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.classList.add("loaded");
    // Section-to-section snapping is this page's alone: switched on for <html> while
    // it is mounted, off again when the visitor navigates away.
    document.documentElement.classList.add("pw-mol-snap");

    const sections = Array.from(el.querySelectorAll<HTMLElement>("[data-flight]"));
    const docks = sections.map((s) => s.querySelector<HTMLElement>(".dock")).filter((d): d is HTMLElement => !!d);

    // Low threshold: on a phone a feature section is taller than the screen.
    const io = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("in")), { threshold: 0.12 });
    sections.forEach((s) => io.observe(s));

    // The badge turns light over the brand-surface sections. One rAF per scroll burst.
    const darks = Array.from(el.querySelectorAll<HTMLElement>('[data-theme="dark"]'));
    let ticking = false;
    const update = () => {
      ticking = false;
      const y = innerHeight - 30;
      el.classList.toggle(
        "on-dark",
        darks.some((d) => {
          const r = d.getBoundingClientRect();
          return r.top <= y && r.bottom >= y;
        }),
      );
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);

    // The molecule loads after first paint and only where WebGL exists; the page
    // is complete without it.
    let flight: { dispose(): void } | null = null;
    let cancelled = false;
    const boot = () => {
      const c = canvas.current;
      if (!c || cancelled || docks.length !== sections.length) return;
      const probe = document.createElement("canvas");
      if (!(probe.getContext("webgl2") || probe.getContext("webgl"))) return;
      import("./flight")
        .then(({ startFlight }) => {
          if (cancelled) return;
          flight = startFlight(c, { sections, docks, reducedMotion: reduce, onReady: () => c.classList.add("ready") });
        })
        .catch(() => {
          /* no molecule — the page stands on its own */
        });
    };
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    const handle = idle ? idle(boot, { timeout: 1500 }) : window.setTimeout(boot, 300);

    return () => {
      cancelled = true;
      document.documentElement.classList.remove("pw-mol-snap");
      if (!idle) window.clearTimeout(handle);
      io.disconnect();
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      flight?.dispose();
    };
  }, []);

  return (
    <div ref={root} className="pw-mol">
      <canvas ref={canvas} className="mol-canvas" aria-hidden="true" />

      {/* ── Hero ── */}
      <section className="hero dark" data-flight>
        <div className="wrap split">
          <div>
            <span className="eyebrow fade">
              <GraduationCap aria-hidden="true" width={16} height={16} />
              Made for Pharm-D students
            </span>
            <h1>
              <span className="line">
                <span>Pharmacy, worked out</span>
              </span>
              <span className="line">
                <span className="grad">atom by atom.</span>
              </span>
            </h1>
            <p className="lede fade d1">
              Calculators that work through your practical sheets, 3D labs where you perform the experiment yourself, and an osteology lab you can turn in your hand — on the web, and offline in our Android app.
            </p>
            <div className="actions fade d2">
              <Link className="btn btn--primary" href="/calculation-tools">
                <Calculator aria-hidden="true" />
                Start calculating
              </Link>
              <a className="btn btn--ghost" href="#app">
                <Download aria-hidden="true" />
                Get the Android app
              </a>
            </div>
            <div className="stats fade d3">
              <div>
                <strong>{STATS.calculators}</strong>
                <span>calculators</span>
              </div>
              <div>
                <strong>{STATS.virtualLabs}</strong>
                <span>3D labs</span>
              </div>
              <div>
                <strong>{OSTEOLOGY.bones + OSTEOLOGY.joints}</strong>
                <span>bones &amp; joints</span>
              </div>
              <div>
                <strong>{STATS.lessons}</strong>
                <span>lessons</span>
              </div>
            </div>
          </div>
          <div className="stage">
            <Img name="glassware" className="art art--glassware" eager />
            <div className="dock" />
          </div>
        </div>
      </section>

      {/* ── 01 Calculators ── */}
      <section className="feature s1 light" data-flight>
        <div className="wrap split">
          <div className="stage reveal">
            <span className="ghost" aria-hidden="true">
              01
            </span>
            <Img name="balance" className="art art--balance" />
            <div className="dock" />
          </div>
          <div>
            <span className="eyebrow reveal">
              <span className="n">01</span> Calculators
            </span>
            <h2 className="title reveal d1">Every calculation a pharmacy student has to make</h2>
            <p className="lede reveal d2">
              {STATS.calculators} calculators built around the Pharm-D practicals — from C₁V₁ = C₂V₂ to calibration curves, dissolution and pharmacokinetics. Results update as you type, and the lab-practical tools show their working step by step, ready for your record book.
            </p>
            <div className="cards reveal d3">
              {subjects.map((s) => (
                <Card key={s.id} Icon={SUBJECT_ICONS[s.id] ?? Calculator} title={s.label} tag={`${s.count} tools`} body={s.desc} href={`/calculation-tools#${s.id}`} />
              ))}
            </div>
            <More href="/calculation-tools">See all {STATS.calculators} calculators</More>
          </div>
        </div>
      </section>

      {/* ── 02 Virtual Labs ── */}
      <section className="feature s2 dark flip" data-flight data-theme="dark">
        <div className="wrap split">
          <div className="stage reveal">
            <span className="ghost" aria-hidden="true">
              02
            </span>
            <Img name="microscope" className="art art--microscope" />
            <div className="dock" />
          </div>
          <div>
            <span className="eyebrow reveal">
              <span className="n">02</span> Virtual Labs
            </span>
            <h2 className="title reveal d1">Step into the lab and do the experiment yourself</h2>
            <p className="lede reveal d2">
              {STATS.virtualLabs} 3D laboratories, one complete experiment in each. You pick up the real equipment — balance, pipette, burette, microscope — and the readings come from what you did. Learning mode points the way; Practical mode leaves you to it and marks the result.
            </p>
            <div className="cards reveal d3">
              {LABS.map((l) => (
                <Card key={l.title} Icon={l.Icon} title={l.title} tag={l.lab} body={l.body} />
              ))}
            </div>
            <More href="/virtual-labs">Enter the virtual labs</More>
          </div>
        </div>
      </section>

      {/* ── 03 Osteology ── */}
      <section className="feature s3 light" data-flight>
        <div className="wrap split">
          <div className="stage reveal">
            <span className="ghost" aria-hidden="true">
              03
            </span>
            <Img name="femur" className="art art--femur" />
            <div className="dock" />
          </div>
          <div>
            <span className="eyebrow reveal">
              <span className="n">03</span> Osteology Lab
            </span>
            <h2 className="title reveal d1">Bones you can turn in your hand</h2>
            <p className="lede reveal d2">
              {OSTEOLOGY.bones} bones and {OSTEOLOGY.joints} joints, modelled from the Z-Anatomy atlas. Learn the landmarks on the model, then test yourself with spotting, a viva trainer and timed mock practicals.
            </p>
            <div className="cards reveal d3">
              {BONES.map((b) => (
                <Card key={b.title} Icon={b.Icon} title={b.title} body={b.body} />
              ))}
            </div>
            <More href="/osteology-lab">Open the osteology lab</More>
          </div>
        </div>
      </section>

      {/* ── Android app ── */}
      <section className="app dark" id="app" data-flight data-theme="dark">
        <div className="wrap split">
            <div className="copy">
              <span className="eyebrow reveal">
                <Download aria-hidden="true" width={16} height={16} />
                Android app
              </span>
              <h2 className="title reveal d1">Your calculators, even with no signal</h2>
              <p className="lede reveal d2">
                The PharmaWallah app puts every calculator on your phone. Install it once and it keeps working in the lab, on a ward round or on the bus home — free, with no ads and nothing to sign up for.
              </p>
              <ul className="reveal d2">
                {APP_POINTS.map((p) => (
                  <li key={p.title}>
                    <span className="icon">
                      <p.Icon aria-hidden="true" />
                    </span>
                    <div>
                      <strong>{p.title}</strong>
                      <span>{p.body}</span>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="actions reveal d3">
                <Link className="btn btn--primary" href="/download">
                  <Download aria-hidden="true" />
                  Download for Android
                </Link>
                <span className="note">Free APK · install steps on the download page</span>
              </div>
            </div>
            <div className="phones reveal d1" aria-hidden="true">
              <div className="phone phone--back">
                <Img name="appDilution" />
              </div>
              <div className="phone phone--front">
                <Img name="appHome" />
              </div>
              <div className="dock" />
            </div>
        </div>
      </section>

      {/* ── Close: five places to start, each with its own still ── */}
      <section className="close light" data-flight>
        <div className="wrap">
          <div className="head">
            <div className="dock" aria-hidden="true" />
            <span className="eyebrow reveal">Start here</span>
            <h2 className="title reveal d1">Begin anywhere.</h2>
            <p className="lede reveal d1">Open a calculator for tonight&apos;s practical, revise a unit before class, or spend ten minutes spotting bones.</p>
          </div>
          <div className="doors reveal d2">
            {DOORS.map((d) => (
              <Link key={d.href} className={`door${d.shot ? " door--app" : ""}`} href={d.href}>
                <span className="art-box">
                  <Img name={d.img} />
                </span>
                <span className="txt">
                  <strong>
                    {d.title}
                    <ArrowRight aria-hidden="true" />
                  </strong>
                  <span>{d.body}</span>
                </span>
              </Link>
            ))}
          </div>
          <nav className="quick reveal d3" aria-label="More from PharmaWallah">
            <Link href="/spotting">Spotting</Link>
            <Link href="/mcqs-bank">MCQ bank</Link>
            <Link href="/ai-guide">AI Guide</Link>
            <Link href="/molecular-lab">Molecular Lab</Link>
            <Link href="/guides">Guides</Link>
          </nav>
        </div>
      </section>

      {/* Names the molecule that is flying, and opens it in the Molecular Lab. */}
      <Link className="badge" href="/molecular-lab">
        <Atom aria-hidden="true" />
        <span>
          <b>Paracetamol</b> · C₈H₉NO₂
        </span>
      </Link>
    </div>
  );
}
