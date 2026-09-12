"use client";

import { motion } from "framer-motion";
import {
    Download, WifiOff, Calculator, ShieldCheck, Smartphone,
    CircleAlert, CheckCircle2, ArrowRight,
} from "lucide-react";

/*
 * Release metadata. Bump these together with `versionCode`/`versionName` in
 * android/app/build.gradle when you publish a new APK.
 *
 * The APK is served from this site's own /public directory (committed to the
 * repo and deployed with the site), so the download never leaves the domain.
 * `npm run mobile:apk` copies the freshly built file into place — see
 * scripts/build-apk.sh.
 */
const APK_URL = "/downloads/pharmawallah-calculators.apk";
const APP_VERSION = "1.0";
const APK_SIZE = "4.9 MB";
const MIN_ANDROID = "Android 7.0 or newer";

const HIGHLIGHTS = [
    {
        Icon: WifiOff,
        title: "Works with no internet",
        body: "Every calculator is stored on your phone. Use it in a lab, a ward, or a basement with no signal.",
    },
    {
        Icon: Calculator,
        title: "All 89 calculators",
        body: "Dosing, pharmacokinetics, formulation, analysis, microbiology and clinical tools — the full set.",
    },
    {
        Icon: ShieldCheck,
        title: "No account needed",
        body: "No sign-up, no login, no data collected. Install it and start calculating.",
    },
];

const STEPS = [
    { title: "Tap Download", body: "Your browser saves pharmawallah-calculators.apk to your Downloads folder." },
    { title: "Open the file", body: "Tap the download notification, or find the file in your Files app and tap it." },
    { title: "Allow the install", body: "Android will ask permission to install apps from your browser. Tap Settings → allow, then go back." },
    { title: "Open the app", body: "PharmaWallah Calculators appears in your app drawer. You can go offline now." },
];

export default function DownloadClient() {
    return (
        <main className="bg-white">
            {/* ── Hero ─────────────────────────────────────────────────── */}
            <section className="relative overflow-hidden bg-gradient-to-br from-brandBlue to-[#155fa8] text-white">
                <div className="max-w-5xl mx-auto px-5 py-16 md:py-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
                            <Smartphone className="w-3.5 h-3.5" />
                            Android app
                        </span>

                        <h1 className="mt-5 text-3xl md:text-5xl font-bold leading-tight">
                            89 pharmacy calculators.
                            <br />
                            <span className="text-brandGreen">Offline, on your phone.</span>
                        </h1>

                        <p className="mt-4 max-w-xl text-white/85 text-base md:text-lg">
                            The PharmaWallah calculation tools, packaged as an Android app. Install once
                            and every calculator keeps working without a connection.
                        </p>

                        <div className="mt-8 flex flex-wrap items-center gap-4">
                            <a
                                href={APK_URL}
                                download="pharmawallah-calculators.apk"
                                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-semibold text-brandBlue shadow-lg transition hover:bg-white/90"
                            >
                                <Download className="w-5 h-5" />
                                Download APK
                            </a>
                            <p className="text-sm text-white/70">
                                Version {APP_VERSION} · {APK_SIZE} · {MIN_ANDROID}
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── What you get ─────────────────────────────────────────── */}
            <section className="max-w-5xl mx-auto px-5 py-14 md:py-20">
                <div className="grid gap-6 md:grid-cols-3">
                    {HIGHLIGHTS.map(({ Icon, title, body }, index) => (
                        <motion.div
                            key={title}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: index * 0.08 }}
                            className="rounded-2xl border border-slate-200 p-6"
                        >
                            <span className="grid place-items-center w-11 h-11 rounded-xl bg-brandBlue/10 text-brandBlue">
                                <Icon className="w-5 h-5" />
                            </span>
                            <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
                            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{body}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ── How to install ───────────────────────────────────────── */}
            <section className="bg-slate-50 border-y border-slate-200">
                <div className="max-w-5xl mx-auto px-5 py-14 md:py-20">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900">How to install</h2>
                    <p className="mt-2 text-slate-600">
                        The app is not on the Play Store yet, so Android asks for one extra permission.
                        This is normal for apps installed directly.
                    </p>

                    <ol className="mt-8 grid gap-5 md:grid-cols-2">
                        {STEPS.map((step, index) => (
                            <li key={step.title} className="flex gap-4 rounded-2xl bg-white border border-slate-200 p-5">
                                <span className="grid place-items-center w-8 h-8 shrink-0 rounded-full bg-brandBlue text-white text-sm font-semibold">
                                    {index + 1}
                                </span>
                                <div>
                                    <h3 className="font-semibold text-slate-900">{step.title}</h3>
                                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{step.body}</p>
                                </div>
                            </li>
                        ))}
                    </ol>

                    {/* Being upfront about the warning screen stops people abandoning the install. */}
                    <div className="mt-8 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                        <CircleAlert className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
                        <div className="text-sm text-amber-900">
                            <p className="font-semibold">You will see an “unknown apps” warning.</p>
                            <p className="mt-1 leading-relaxed">
                                Android shows this for every app installed outside the Play Store. Download
                                only from this page — a PharmaWallah APK from anywhere else is not ours.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Honest limits ────────────────────────────────────────── */}
            <section className="max-w-5xl mx-auto px-5 py-14 md:py-20">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Good to know</h2>
                <ul className="mt-6 space-y-3">
                    {[
                        "Updates are manual for now — come back to this page to get a newer version.",
                        "The app contains the calculators only. Courses, MCQs, spotting and the tournament stay on the website.",
                        "The CFU Calculator's photo-scanning step needs a connection; its manual entry works offline like everything else.",
                        "iPhone is not supported yet. On iOS, use the website.",
                    ].map((line) => (
                        <li key={line} className="flex gap-3 text-slate-700">
                            <CheckCircle2 className="w-5 h-5 shrink-0 text-brandGreen mt-0.5" />
                            <span className="text-sm leading-relaxed">{line}</span>
                        </li>
                    ))}
                </ul>

                <a
                    href="/calculation-tools"
                    className="mt-10 inline-flex items-center gap-2 font-semibold text-brandBlue hover:gap-3 transition-all"
                >
                    Or use the calculators in your browser
                    <ArrowRight className="w-4 h-4" />
                </a>
            </section>
        </main>
    );
}
