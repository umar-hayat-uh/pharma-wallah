"use client";

import { useEffect, useState } from "react";
import {
  Apple,
  ArrowRight,
  Calculator,
  Check,
  CircleAlert,
  Download,
  ExternalLink,
  Github,
  Monitor,
  ShieldCheck,
  Smartphone,
  WifiOff,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BRAND_BUTTON, BRAND_SURFACE, Eyebrow, Reveal } from "@/components/page-kit";
import { cn } from "@/lib/utils";

/**
 * The download page for all three PharmaWallah apps.
 *
 * The signature idea: ONE page, three platforms, and the right one already
 * chosen. A student on a lab PC and a student on a phone should both land on
 * the instructions that apply to them without reading a word of the other two.
 *
 * Everything that can go stale is measured rather than typed — the file sizes
 * come from `statSync` in page.tsx, and a platform with no build committed
 * renders an honest "not ready yet" panel instead of a button that 404s.
 */

export type PlatformFile = { href: string; size: string } | null;

/*
 * Release metadata. Bump the version together with the build it describes:
 *   Android — `versionCode`/`versionName` in android/app/build.gradle
 *   Windows — `version` in src-tauri/tauri.conf.json
 * Sizes are NOT here on purpose; they are measured from the file (see page.tsx).
 */
const ANDROID_VERSION = "1.4";
const WINDOWS_VERSION = "1.0.0";

/**
 * Calculators in the packaged apps: the number of tool directories under
 * src/app/(site)/calculation-tools/(tools)/. Both packaged builds ship every
 * one of them. The generated slug lists that prove this are gitignored, so the
 * web build cannot import them — re-count with
 * `ls src/app/(site)/calculation-tools/\(tools\)/ | wc -l` when tools are added.
 */
const TOOL_COUNT = 105;

const RELEASES_URL = "https://github.com/umar-hayat-uh/pharma-wallah/releases";

type PlatformId = "windows" | "android" | "ios";

const HIGHLIGHTS: { Icon: LucideIcon; title: string; body: string }[] = [
  {
    Icon: WifiOff,
    title: "Works with no internet",
    body: "Every calculator is stored on the device. Use it in a lab, on a ward, or in a basement with no signal.",
  },
  {
    Icon: Calculator,
    title: `All ${TOOL_COUNT} calculators`,
    body: "Dosing, pharmacokinetics, formulation, analysis, microbiology and clinical tools — the full set, not a sample.",
  },
  {
    Icon: ShieldCheck,
    title: "No account, no tracking",
    body: "No sign-up, no login, no analytics. Nothing you type is sent anywhere, because nothing is sent anywhere.",
  },
];

const LIMITS = [
  "Updates are manual for now — come back to this page for a newer version.",
  "The apps contain the calculators only. Courses, MCQs, spotting labs and the tournament stay on the website.",
  "Automatic colony counting and TLC spot detection are estimates — check every marker before you use the result.",
  "Educational use only. Check every figure against your own reference before it is used for a patient.",
];

export default function DownloadClient({
  android,
  windows,
}: {
  android: PlatformFile;
  windows: PlatformFile;
}) {
  const [platform, setPlatform] = useState<PlatformId>("android");

  /*
   * Preselect the visitor's own platform. Deliberately after mount rather than
   * during render: the server has no user agent, so choosing there would
   * mismatch hydration. Android is the server default because it is the app
   * with the widest reach — never iOS, which has nothing to download.
   */
  useEffect(() => {
    const ua = navigator.userAgent;
    if (/Android/i.test(ua)) setPlatform("android");
    else if (/iPhone|iPad|iPod/i.test(ua)) setPlatform("ios");
    else if (/Windows/i.test(ua)) setPlatform("windows");
  }, []);

  return (
    <main className="bg-[#fcfcfa]">
      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden text-white" style={{ background: BRAND_SURFACE }}>
        <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 md:py-24">
          <Eyebrow className="text-white/80">PharmaWallah apps</Eyebrow>

          {/* Scale contrast is the point: the headline is ~4× the lead, and the
              second line carries the promise that makes people download. */}
          <h1 className="mt-4 max-w-4xl text-[clamp(2.4rem,7vw,4.75rem)] font-bold leading-[0.98] tracking-[-0.04em] [text-wrap:balance]">
            {TOOL_COUNT} pharmacy calculators.
            <span className="block text-white/70">Nothing to sign in to.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-white/90">
            Install once and every calculator keeps working with the network off — on a Windows PC
            or an Android phone. No account, no cloud, no data leaving the device.
          </p>

          <dl className="mt-10 flex flex-wrap gap-x-12 gap-y-6">
            {[
              { value: TOOL_COUNT, label: "Calculators" },
              { value: "2", label: "Platforms" },
              { value: "0", label: "Accounts needed" },
            ].map((figure) => (
              <div key={figure.label}>
                <dd className="text-4xl font-bold leading-none tracking-[-0.04em] tabular-nums">
                  {figure.value}
                </dd>
                <dt className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.16em] text-white/70">
                  {figure.label}
                </dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Platform picker ────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 md:py-20">
        <Tabs value={platform} onValueChange={(next) => setPlatform(next as PlatformId)}>
          <TabsList className="mb-8 grid h-auto w-full max-w-2xl grid-cols-3 gap-1.5 rounded-2xl bg-[#f1f2ef] p-1.5">
            <PlatformTab id="windows" icon={Monitor} label="Windows" />
            <PlatformTab id="android" icon={Smartphone} label="Android" />
            <PlatformTab id="ios" icon={Apple} label="iPhone" />
          </TabsList>

          <TabsContent value="windows">
            <PlatformPanel
              title="PharmaWallah for Windows"
              lead="A desktop program, not a website in a window. The calculators, a searchable values library, a formula reference, unit conversions and a saved calculation history."
              file={windows}
              version={WINDOWS_VERSION}
              requirement="Windows 10 or 11, 64-bit"
              fileName="PharmaWallah-Setup.exe"
              pendingTitle="The Windows build is not published yet"
              pendingBody="It is built and verified, but the installer has not been attached to this site. Until it is, the latest build is on GitHub Releases."
              steps={[
                { title: "Download the installer", body: "Your browser saves PharmaWallah-Setup.exe to your Downloads folder." },
                { title: "Run it", body: "Double-click the file. Windows installs it for your user account only — no administrator password needed." },
                { title: "Click through the SmartScreen warning", body: "Windows shows “Windows protected your PC” for any installer without a paid code-signing certificate. Choose More info, then Run anyway." },
                { title: "Open PharmaWallah", body: "It appears in your Start menu. You can disconnect from the internet now." },
              ]}
              warning={{
                title: "You will see a SmartScreen warning.",
                body: "Windows shows it for every program that is not code-signed, which costs money per year. Download only from this page — a PharmaWallah installer from anywhere else is not ours.",
              }}
            />
          </TabsContent>

          <TabsContent value="android">
            <PlatformPanel
              title="PharmaWallah for Android"
              lead="Every calculator on your phone, plus the two camera tools: photograph a TLC plate for Rf values, or an agar plate to count colonies. The photo is analysed on the phone and never uploaded."
              file={android}
              version={ANDROID_VERSION}
              requirement="Android 7.0 or newer"
              fileName="pharmawallah-calculators.apk"
              pendingTitle="The Android build is not available right now"
              pendingBody="The APK is normally served from this page. If you are seeing this, a release is in progress."
              steps={[
                { title: "Tap Download", body: "Your browser saves pharmawallah-calculators.apk to your Downloads folder." },
                { title: "Open the file", body: "Tap the download notification, or find the file in your Files app and tap it." },
                { title: "Allow the install", body: "Android asks permission to install apps from your browser. Tap Settings → allow, then go back." },
                { title: "Open the app", body: "PharmaWallah Calculators appears in your app drawer. You can go offline now." },
              ]}
              warning={{
                title: "You will see an “unknown apps” warning.",
                body: "Android shows this for every app installed outside the Play Store. Download only from this page — a PharmaWallah APK from anywhere else is not ours.",
              }}
            />
          </TabsContent>

          <TabsContent value="ios">
            <IosPanel />
          </TabsContent>
        </Tabs>
      </section>

      {/* ── What you get ───────────────────────────────────────────────── */}
      <section className="border-y border-[#16181d]/10 bg-white">
        <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 md:py-20">
          <h2 className="text-[clamp(1.6rem,3vw,2.25rem)] font-bold leading-tight tracking-[-0.03em] text-[#16181d]">
            The same promise on every platform
          </h2>

          <ul className="mt-9 grid gap-5 md:grid-cols-3">
            {HIGHLIGHTS.map(({ Icon, title, body }, index) => (
              <Reveal as="li" key={title} delay={index * 70}>
                <div className="h-full rounded-2xl border border-[#16181d]/10 bg-[#fcfcfa] p-6">
                  <span
                    className="grid h-11 w-11 place-items-center rounded-xl bg-brandBlue/10 text-brandBlue ring-1 ring-inset ring-brandBlue/15"
                    aria-hidden="true"
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-[15px] font-semibold tracking-[-0.01em] text-[#16181d]">
                    {title}
                  </h3>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-[#16181d]/65">{body}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Honest limits ──────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 md:py-20">
        <h2 className="text-[clamp(1.6rem,3vw,2.25rem)] font-bold leading-tight tracking-[-0.03em] text-[#16181d]">
          Good to know
        </h2>

        <ul className="mt-7 max-w-3xl space-y-3.5">
          {LIMITS.map((line) => (
            <li key={line} className="flex gap-3">
              <Check className="mt-0.5 h-[18px] w-[18px] shrink-0 text-brandGreen" aria-hidden="true" />
              <span className="text-[14.5px] leading-relaxed text-[#16181d]/75">{line}</span>
            </li>
          ))}
        </ul>

        <a
          href="/calculation-tools"
          className="group mt-10 inline-flex items-center gap-2 text-[15px] font-semibold text-brandBlue"
        >
          Or use the calculators in your browser
          <ArrowRight
            className="h-4 w-4 transition-transform duration-300 ease-out-expo group-hover:translate-x-1"
            aria-hidden="true"
          />
        </a>
      </section>
    </main>
  );
}

/* ── Pieces ───────────────────────────────────────────────────────────── */

function PlatformTab({ id, icon: Icon, label }: { id: PlatformId; icon: LucideIcon; label: string }) {
  return (
    <TabsTrigger
      value={id}
      className={cn(
        "flex h-auto items-center justify-center gap-2 rounded-xl px-3 py-3 text-[14px] font-semibold",
        "data-[state=active]:bg-white data-[state=active]:text-[#16181d] data-[state=active]:shadow-sm",
        "text-[#16181d]/55",
      )}
    >
      <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
      {label}
    </TabsTrigger>
  );
}

function PlatformPanel({
  title,
  lead,
  file,
  version,
  requirement,
  fileName,
  pendingTitle,
  pendingBody,
  steps,
  warning,
}: {
  title: string;
  lead: string;
  file: PlatformFile;
  version: string;
  requirement: string;
  fileName: string;
  pendingTitle: string;
  pendingBody: string;
  steps: { title: string; body: string }[];
  warning: { title: string; body: string };
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_23rem] lg:gap-12">
      <div className="order-2 lg:order-1">
        <h2 className="text-[clamp(1.5rem,2.6vw,2rem)] font-bold leading-tight tracking-[-0.03em] text-[#16181d]">
          {title}
        </h2>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-[#16181d]/70">{lead}</p>

        <h3 className="mt-10 font-mono text-[10.5px] uppercase tracking-[0.16em] text-[#16181d]/50">
          How to install
        </h3>
        <ol className="mt-4 space-y-4">
          {steps.map((step, index) => (
            <li key={step.title} className="flex gap-4">
              <span
                className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#16181d]/5 font-mono text-[12px] font-semibold tabular-nums text-[#16181d]/70"
                aria-hidden="true"
              >
                {index + 1}
              </span>
              <div className="min-w-0">
                <p className="text-[14.5px] font-semibold text-[#16181d]">{step.title}</p>
                <p className="mt-0.5 text-[13.5px] leading-relaxed text-[#16181d]/65">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>

        {/* Naming the scary screen before the user meets it is what stops them
            abandoning the install halfway through. */}
        <Alert className="mt-8 border-amber-200 bg-amber-50 text-amber-900">
          <CircleAlert className="h-[18px] w-[18px] text-amber-600" />
          <AlertTitle className="text-[14px] font-semibold">{warning.title}</AlertTitle>
          <AlertDescription className="text-[13px] leading-relaxed text-amber-900/85">
            {warning.body}
          </AlertDescription>
        </Alert>
      </div>

      {/* The download card is sticky on a desktop, so the action stays put while
          the installation steps are read. */}
      <div className="order-1 lg:order-2">
        <div className="lg:sticky lg:top-[calc(var(--calc-top-offset,0px)+1.5rem)]">
          {file ? (
            <div className="overflow-hidden rounded-2xl text-white" style={{ background: BRAND_SURFACE }}>
              <div className="p-6">
                <Badge className="border-0 bg-white/15 text-white hover:bg-white/15">
                  Version {version}
                </Badge>
                <p className="mt-4 text-[15px] font-semibold leading-snug">Ready to install</p>
                <p className="mt-1 text-[13px] leading-relaxed text-white/80">
                  {file.size} · {requirement}
                </p>

                <Button
                  asChild
                  className="mt-5 w-full border-0 text-white shadow-none hover:opacity-95"
                  style={{ background: BRAND_BUTTON }}
                >
                  <a href={file.href} download={fileName}>
                    <Download />
                    Download
                  </a>
                </Button>

                <p className="mt-3 break-all text-center font-mono text-[11px] text-white/65">
                  {fileName}
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#16181d]/20 bg-white p-6">
              <p className="text-[15px] font-semibold text-[#16181d]">{pendingTitle}</p>
              <p className="mt-2 text-[13px] leading-relaxed text-[#16181d]/65">{pendingBody}</p>
              <Button asChild variant="outline" className="mt-5 w-full">
                <a href={RELEASES_URL} target="_blank" rel="noopener noreferrer">
                  <Github />
                  Open GitHub Releases
                  <ExternalLink className="opacity-60" />
                </a>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * iPhone gets an explanation, not a download.
 *
 * Apple does not allow an app to be installed from a website the way Android
 * and Windows do — distribution goes through the App Store or TestFlight, and
 * both require a paid Apple Developer account. Offering an "iOS download" here
 * would be a button that cannot work, so the panel says what is actually true
 * and points at the thing that does work today.
 */
function IosPanel() {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_23rem] lg:gap-12">
      <div className="order-2 lg:order-1">
        <h2 className="text-[clamp(1.5rem,2.6vw,2rem)] font-bold leading-tight tracking-[-0.03em] text-[#16181d]">
          PharmaWallah on iPhone
        </h2>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-[#16181d]/70">
          There is no iPhone download yet — and that is Apple&rsquo;s rule, not an oversight. iOS
          apps cannot be installed from a website the way an Android APK or a Windows installer can;
          they have to come through the App Store or TestFlight, which needs a paid Apple Developer
          account. The iPhone build exists and is being prepared for TestFlight.
        </p>

        <h3 className="mt-10 font-mono text-[10.5px] uppercase tracking-[0.16em] text-[#16181d]/50">
          What works today
        </h3>
        <ol className="mt-4 space-y-4">
          {[
            {
              title: "Open the calculators in Safari",
              body: "Every calculator on this site runs in the browser — the same code that is inside the apps.",
            },
            {
              title: "Add it to your Home Screen",
              body: "Share → Add to Home Screen puts a PharmaWallah icon next to your apps, and it opens without Safari's address bar.",
            },
            {
              title: "Keep a tab open before a lab",
              body: "Safari keeps a loaded page usable for a while without signal, but this is not a real offline app — do not rely on it in a basement.",
            },
          ].map((step, index) => (
            <li key={step.title} className="flex gap-4">
              <span
                className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#16181d]/5 font-mono text-[12px] font-semibold tabular-nums text-[#16181d]/70"
                aria-hidden="true"
              >
                {index + 1}
              </span>
              <div className="min-w-0">
                <p className="text-[14.5px] font-semibold text-[#16181d]">{step.title}</p>
                <p className="mt-0.5 text-[13.5px] leading-relaxed text-[#16181d]/65">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="order-1 lg:order-2">
        <div className="lg:sticky lg:top-[calc(var(--calc-top-offset,0px)+1.5rem)]">
          <div className="rounded-2xl border border-dashed border-[#16181d]/20 bg-white p-6">
            <Badge variant="secondary">In preparation</Badge>
            <p className="mt-4 text-[15px] font-semibold leading-snug text-[#16181d]">
              Use the website meanwhile
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-[#16181d]/65">
              All {TOOL_COUNT} calculators work in Safari. Nothing to install, nothing to sign in to.
            </p>
            <Button asChild className="mt-5 w-full border-0 text-white hover:opacity-95" style={{ background: BRAND_BUTTON }}>
              <a href="/calculation-tools">
                <Calculator />
                Open the calculators
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
