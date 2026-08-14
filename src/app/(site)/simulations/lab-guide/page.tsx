"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
    AlertTriangle,
    Play,
    Pause,
    ChevronLeft,
    ChevronRight,
    RotateCcw,
    ShieldAlert,
    CheckCircle2,
    Clock,
    FlaskConical,
    FileText,
    Activity,
    Award,
    Info,
    Check,
} from "lucide-react";
import confetti from "canvas-confetti";

/* ------------------------------------------------------------------ */
/*  Types & Data Definitions                                           */
/* ------------------------------------------------------------------ */

type StepId =
    | "prep"
    | "puncture"
    | "timer-start"
    | "blot"
    | "timer-stop"
    | "result";

interface LabStep {
    id: StepId;
    index: number;
    title: string;
    description: string;
    duration: number; // seconds, for autoplay pacing
    warning?: string;
    tip?: string;
}

const PROCEDURE = {
    title: "Determination of Bleeding Time",
    method: "Duke's Method (Earlobe / Fingertip)",
    subject: "Pharmacology & Physiology Practical",
    difficulty: "Beginner",
    estimatedTime: "10–15 min",
    equipment: [
        "Sterile single-use lancet (3mm depth)",
        "Whatman No. 1 circular filter paper",
        "70% Isopropyl alcohol swabs",
        "Precision digital/analog stopwatch",
        "Sterile surgical gloves & sharps container",
        "Adhesive bandage strip",
    ],
    safetyNotes: [
        "Always use a sterile, single-use lancet — never reuse lancets across subjects.",
        "Wear protective nitrile or surgical gloves throughout the clinical procedure.",
        "Dispose of used lancets immediately into a biohazard sharps container.",
        "Never wipe or squeeze the puncture site — touching gently avoids tissue fluid dilution.",
    ],
};

const STEPS: LabStep[] = [
    {
        id: "prep",
        index: 1,
        title: "Site Preparation & Disinfection",
        description:
            "Thoroughly clean the earlobe or fingertip puncture site using a 70% spirit swab. Allow the alcohol to air-dry completely so residual spirit does not hemolyze blood cells or alter timing.",
        duration: 4,
        tip: "Air-drying takes ~15 seconds. Never blow air on the site to accelerate drying.",
    },
    {
        id: "puncture",
        index: 2,
        title: "Standardized Skin Puncture",
        description:
            "Make a quick, controlled puncture roughly 3 mm deep using a sterile lancet on the cleansed site. Allow capillary blood to flow freely without squeezing.",
        duration: 4,
        warning: "Varying puncture depth causes inconsistent bleeding rates. Squeezing dilutes blood with tissue fluid.",
    },
    {
        id: "timer-start",
        index: 3,
        title: "Instantaneous Timer Activation",
        description:
            "Start the stopwatch the exact instant the puncture is made and the first drop of capillary blood appears. Timing commences with blood emergence.",
        duration: 3.5,
        tip: "Have your stopwatch ready in your non-dominant hand to click 'Start' synchronously.",
    },
    {
        id: "blot",
        index: 4,
        title: "30-Second Interval Blotting",
        description:
            "Gently touch the edge of circular filter paper to the emerging blood drop every 30 seconds. Blot around the filter paper circumference without touching skin directly.",
        duration: 6,
        warning: "Do not wipe the wound or press against the skin. Wiping dislodges initial platelet plugs and invalidates results.",
    },
    {
        id: "timer-stop",
        index: 5,
        title: "Stop Stopwatch at Hemostasis",
        description:
            "Stop the timer the moment the filter paper no longer absorbs blood (no stain transfer). Record the exact total elapsed time in minutes and seconds.",
        duration: 3.5,
        tip: "A completely blank spot on the filter paper confirms platelet plug formation and hemostasis.",
    },
    {
        id: "result",
        index: 6,
        title: "Result Recording & Clinical Correlation",
        description:
            "Normal bleeding time by Duke's method is 2 to 7 minutes (120–420 seconds). Prolonged bleeding time indicates platelet dysfunction (e.g. von Willebrand disease, thrombocytopenia) or anticoagulant therapy.",
        duration: 5,
    },
];

/* ------------------------------------------------------------------ */
/*  Shared SVG Gradients & Frame                                       */
/* ------------------------------------------------------------------ */

function SVGDefs() {
    return (
        <defs>
            {/* Real Anatomical Skin Tone Gradients */}
            <linearGradient id="skinBase" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE4D6" />
                <stop offset="45%" stopColor="#FDBA74" />
                <stop offset="80%" stopColor="#FB923C" />
                <stop offset="100%" stopColor="#EA580C" />
            </linearGradient>

            <linearGradient id="skinHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.75" />
                <stop offset="50%" stopColor="#FFE4D6" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#FDBA74" stopOpacity="0" />
            </linearGradient>

            <linearGradient id="skinShadow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#C2410C" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#9A3412" stopOpacity="0.45" />
            </linearGradient>

            {/* Fingernail Bed Gradients */}
            <linearGradient id="nailGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFF1F2" />
                <stop offset="40%" stopColor="#FFE4E6" />
                <stop offset="85%" stopColor="#FECDD3" />
                <stop offset="100%" stopColor="#FDA4AF" />
            </linearGradient>

            <radialGradient id="lunulaGrad" cx="50%" cy="100%" r="80%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
                <stop offset="60%" stopColor="#FFF1F2" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#FFE4E6" stopOpacity="0" />
            </radialGradient>

            {/* Blood Droplet Radial Gradient */}
            <radialGradient id="bloodDropGrad" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#F87171" />
                <stop offset="35%" stopColor="#EF4444" />
                <stop offset="70%" stopColor="#DC2626" />
                <stop offset="90%" stopColor="#991B1B" />
                <stop offset="100%" stopColor="#7F1D1D" />
            </radialGradient>

            {/* Blood Absorption Stain Gradient */}
            <radialGradient id="bloodStainGrad" cx="40%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#7F1D1D" />
                <stop offset="45%" stopColor="#991B1B" />
                <stop offset="75%" stopColor="#DC2626" />
                <stop offset="92%" stopColor="#EF4444" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#F87171" stopOpacity="0.15" />
            </radialGradient>

            {/* Lancet Metallic Finish */}
            <linearGradient id="lancetMetal" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="30%" stopColor="#E2E8F0" />
                <stop offset="70%" stopColor="#94A3B8" />
                <stop offset="100%" stopColor="#475569" />
            </linearGradient>

            <linearGradient id="lancetBlue" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="60%" stopColor="#2563EB" />
                <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>

            {/* Whatman Filter Paper Disc */}
            <radialGradient id="filterPaperGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="80%" stopColor="#F8FAFC" />
                <stop offset="100%" stopColor="#E2E8F0" />
            </radialGradient>

            {/* Stopwatch Metallic Bezel */}
            <linearGradient id="stopwatchBezel" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="25%" stopColor="#E2E8F0" />
                <stop offset="65%" stopColor="#94A3B8" />
                <stop offset="100%" stopColor="#334155" />
            </linearGradient>

            <radialGradient id="stopwatchDial" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="85%" stopColor="#F8FAFC" />
                <stop offset="100%" stopColor="#E2E8F0" />
            </radialGradient>

            {/* Soft Drop Shadows & Glow Filters */}
            <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="5" stdDeviation="6" floodColor="#0F172A" floodOpacity="0.12" />
            </filter>

            <filter id="bloodGlow" x="-40%" y="-40%" width="180%" height="180%">
                <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#DC2626" floodOpacity="0.45" />
            </filter>

            <filter id="handShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="2" dy="8" stdDeviation="10" floodColor="#0F172A" floodOpacity="0.15" />
            </filter>
        </defs>
    );
}

function SceneFrame({ children }: { children: React.ReactNode }) {
    return (
        <svg
            viewBox="0 0 380 320"
            className="w-full h-full select-none"
            role="img"
            aria-hidden="true"
        >
            <SVGDefs />
            {/* Light backdrop frame */}
            <rect x="0" y="0" width="380" height="320" rx="20" fill="#F8FAFC" />
            <rect
                x="0.5"
                y="0.5"
                width="379"
                height="319"
                rx="19.5"
                fill="none"
                stroke="#E2E8F0"
                strokeWidth="1"
            />
            {/* Soft center glow */}
            <circle cx="190" cy="160" r="140" fill="#2563EB" opacity="0.025" />
            {children}
        </svg>
    );
}

/* ------------------------------------------------------------------ */
/*  Realistic Finger Vector Component (Built from Vector Geometry)    */
/* ------------------------------------------------------------------ */

function RealisticFinger({ bloodDropSize = 0 }: { bloodDropSize?: number }) {
    return (
        <g transform="translate(190, 160) scale(0.55) translate(-219, -219)" filter="url(#handShadow)">
            {/* Outer Hand Contour & Side Finger Silhouettes */}
            <path
                d="M316.198,66.434 C309.771,25.098,273.763,0,219.001,0 C164.238,0,128.229,25.098,121.802,66.434 C93.722,93.048,77.673,130.224,77.673,168.931 V428 C77.673,433.523,82.15,438,87.673,438 C93.196,438,97.673,433.523,97.673,428 V168.931 C97.673,143.261,105.9,118.372,120.761,97.842 V201.625 C120.761,224.961,128.946,246.419,142.588,263.291 C142.804,263.592,143.04,263.881,143.292,264.161 C161.326,285.955,188.57,299.864,219.001,299.864 C249.214,299.864,276.28,286.151,294.316,264.626 C294.838,264.115,295.29,263.556,295.677,262.964 C309.161,246.143,317.24,224.812,317.24,201.626 V97.842 C332.101,118.372,340.328,143.261,340.328,168.931 V428 C340.328,433.523,344.805,438,350.328,438 C355.851,438,360.328,433.523,360.328,428 V168.931 C360.328,130.224,344.278,93.048,316.198,66.434 Z"
                fill="url(#skinBase)"
                stroke="#EA580C"
                strokeWidth="1.5"
                strokeOpacity="0.35"
            />

            {/* Skin Fold Shading Overlay */}
            <path
                d="M121.802,66.434 C128.229,25.098,164.238,0,219.001,0 C273.763,0,309.771,25.098,316.198,66.434 Z"
                fill="url(#skinHighlight)"
            />

            {/* Fingernail Matrix */}
            <path
                d="M140.76,80.184 C140.76,25.864,195.476,20,219.001,20 C242.525,20,297.24,25.864,297.24,80.184 V201.625 C297.24,216.213,293.215,229.875,286.234,241.578 C268.122,224.283,244.246,214.568,219.001,214.568 C193.758,214.568,169.879,224.283,151.767,241.579 C144.786,229.876,140.76,216.214,140.76,201.625 V80.184 Z"
                fill="url(#nailGrad)"
                stroke="#E11D48"
                strokeWidth="1"
                strokeOpacity="0.25"
            />

            {/* Lunula Half-Moon Crescent */}
            <path
                d="M164.196,257.393 C178.767,242.797,198.316,234.568,219.001,234.568 C239.687,234.568,259.235,242.797,273.805,257.393 C259.678,271.278,240.327,279.864,219.001,279.864 C197.675,279.864,178.324,271.277,164.196,257.393 Z"
                fill="url(#lunulaGrad)"
            />

            {/* Fingernail Specular Reflection Gloss */}
            <path
                d="M152 70 C170 35 220 35 235 70 V180 C200 190 165 190 152 180 Z"
                fill="#FFFFFF"
                opacity="0.35"
            />

            {/* Nail Tip Free-Edge Highlight */}
            <path
                d="M140.76 80.184 C140.76 25.864 195.476 20 219.001 20 C242.525 20 297.24 25.864 297.24 80.184"
                stroke="#FFFFFF"
                strokeWidth="3"
                fill="none"
                opacity="0.75"
                strokeLinecap="round"
            />

            {/* Cuticle Border Shadow */}
            <path
                d="M140.76 201.625 C140.76 220 180 235 219 235 C258 235 297.24 220 297.24 201.625"
                stroke="#E11D48"
                strokeWidth="2"
                fill="none"
                opacity="0.2"
            />

            {/* Fingerprint Pad Contours */}
            <path
                d="M170 120 Q 219 110 268 120"
                stroke="#C2410C"
                strokeWidth="1.5"
                fill="none"
                opacity="0.15"
            />
            <path
                d="M165 140 Q 219 130 273 140"
                stroke="#C2410C"
                strokeWidth="1.5"
                fill="none"
                opacity="0.15"
            />
            <path
                d="M160 160 Q 219 150 278 160"
                stroke="#C2410C"
                strokeWidth="1.2"
                fill="none"
                opacity="0.12"
            />

            {/* Emerging Capillary Blood Droplet at Fingertip */}
            {bloodDropSize > 0 && (
                <g transform="translate(219, 12)">
                    <motion.circle
                        cx="0"
                        cy="0"
                        r={bloodDropSize * 2.2}
                        fill="url(#bloodDropGrad)"
                        filter="url(#bloodGlow)"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3, type: "spring" }}
                    />
                    <circle
                        cx={-bloodDropSize * 0.6}
                        cy={-bloodDropSize * 0.6}
                        r={Math.max(1.5, bloodDropSize * 0.6)}
                        fill="#FFFFFF"
                        opacity="0.85"
                    />
                </g>
            )}
        </g>
    );
}

/* ------------------------------------------------------------------ */
/*  Step 1 — Disinfection Scene                                       */
/* ------------------------------------------------------------------ */

function PrepScene({ reduced }: { reduced: boolean }) {
    return (
        <SceneFrame>
            <g>
                <RealisticFinger bloodDropSize={0} />

                {/* Evaporating Spirit Vapor Particles */}
                <motion.g
                    animate={
                        reduced ? { opacity: 0.6 } : { opacity: [0.3, 0.9, 0.3], y: [-2, 2, -2] }
                    }
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                    <circle cx="160" cy="85" r="2.5" fill="#2563EB" opacity="0.4" />
                    <circle cx="210" cy="75" r="3" fill="#60A5FA" opacity="0.6" />
                    <circle cx="180" cy="65" r="2" fill="#93C5FD" opacity="0.7" />
                    <circle cx="225" cy="95" r="2" fill="#2563EB" opacity="0.3" />
                </motion.g>

                {/* 70% Spirit Swab Cotton Pad */}
                <motion.g
                    initial={{ x: 60, y: -20, rotate: -15 }}
                    animate={
                        reduced
                            ? { x: 0, y: 0, rotate: 0 }
                            : { x: [70, -50, 70], y: [-20, 10, -20], rotate: [-15, 10, -15] }
                    }
                    transition={
                        reduced ? {} : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
                    }
                >
                    <rect
                        x="130"
                        y="70"
                        width="65"
                        height="42"
                        rx="10"
                        fill="#FFFFFF"
                        stroke="#94A3B8"
                        strokeWidth="1.5"
                        filter="url(#softShadow)"
                    />
                    {/* Cotton texture lines */}
                    <line x1="140" y1="80" x2="185" y2="80" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
                    <line x1="142" y1="90" x2="180" y2="90" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
                    <line x1="145" y1="100" x2="175" y2="100" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />

                    {/* Blue alcohol swab packet tab */}
                    <rect x="175" y="62" width="30" height="20" rx="4" fill="#2563EB" opacity="0.9" />
                    <text x="190" y="76" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="700" fontFamily="sans-serif">
                        70%
                    </text>
                </motion.g>
            </g>

            {/* Label Badge */}
            <g transform="translate(190, 285)">
                <rect x="-115" y="-14" width="230" height="28" rx="14" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="1" />
                <text
                    textAnchor="middle"
                    y="4"
                    fill="#1E40AF"
                    fontSize="12"
                    fontFamily="DM Sans, sans-serif"
                    fontWeight="600"
                >
                    Disinfect & Air-Dry Site with 70% Spirit
                </text>
            </g>
        </SceneFrame>
    );
}

/* ------------------------------------------------------------------ */
/*  Step 2 — Puncture Scene                                           */
/* ------------------------------------------------------------------ */

function PunctureScene({ reduced }: { reduced: boolean }) {
    return (
        <SceneFrame>
            <g>
                <RealisticFinger bloodDropSize={0} />

                {/* Blood drop emerging at instant of contact */}
                <motion.g
                    initial={{ opacity: 0, scale: 0 }}
                    animate={
                        reduced
                            ? { opacity: 1, scale: 1 }
                            : { opacity: [0, 0, 1, 1], scale: [0, 0, 1, 1] }
                    }
                    transition={
                        reduced ? {} : { duration: 2, repeat: Infinity, times: [0, 0.5, 0.7, 1] }
                    }
                >
                    <circle cx="190" cy="46" r="7" fill="url(#bloodDropGrad)" filter="url(#bloodGlow)" />
                    <circle cx="187" cy="43" r="2" fill="#FFFFFF" opacity="0.85" />
                </motion.g>

                {/* High-Precision Sterile Lancet Assembly */}
                <motion.g
                    initial={{ y: -70 }}
                    animate={reduced ? { y: -10 } : { y: [-70, -8, -70] }}
                    transition={
                        reduced ? {} : { duration: 2, repeat: Infinity, ease: "easeInOut" }
                    }
                >
                    {/* Depth limit stopper ring (3mm marker) */}
                    <rect x="178" y="26" width="24" height="6" rx="2" fill="#F59E0B" stroke="#D97706" strokeWidth="1" />
                    <text x="190" y="22" textAnchor="middle" fill="#D97706" fontSize="9" fontWeight="700" fontFamily="JetBrains Mono, monospace">
                        3mm
                    </text>

                    {/* Stainless steel needle tip */}
                    <polygon points="188,32 192,32 190,44" fill="url(#lancetMetal)" stroke="#475569" strokeWidth="0.8" />

                    {/* Blue ergonomic lancet casing */}
                    <path
                        d="M172 -34 L208 -34 C212 -34 214 -30 212 -19 L202 26 L178 26 L168 -19 C166 -30 168 -34 172 -34 Z"
                        fill="url(#lancetBlue)"
                        stroke="#1E40AF"
                        strokeWidth="1.5"
                        filter="url(#softShadow)"
                    />

                    {/* Lancet rib grips */}
                    <line x1="174" y1="-18" x2="206" y2="-18" stroke="#93C5FD" strokeWidth="1.5" />
                    <line x1="176" y1="-8" x2="204" y2="-8" stroke="#93C5FD" strokeWidth="1.5" />
                    <line x1="178" y1="2" x2="202" y2="2" stroke="#93C5FD" strokeWidth="1.5" />

                    {/* Safety Lock Tag */}
                    <rect x="180" y="-28" width="20" height="6" rx="2" fill="#10B981" />
                </motion.g>
            </g>

            {/* Label Badge */}
            <g transform="translate(190, 285)">
                <rect x="-120" y="-14" width="240" height="28" rx="14" fill="#FEF3C7" stroke="#FDE68A" strokeWidth="1" />
                <text
                    textAnchor="middle"
                    y="4"
                    fill="#92400E"
                    fontSize="12"
                    fontFamily="DM Sans, sans-serif"
                    fontWeight="600"
                >
                    Quick, Standardized 3.0mm Puncture
                </text>
            </g>
        </SceneFrame>
    );
}

/* ------------------------------------------------------------------ */
/*  Step 3 — Timer Scene                                              */
/* ------------------------------------------------------------------ */

function TimerScene({
    reduced,
    running,
    label,
}: {
    reduced: boolean;
    running: boolean;
    label: string;
}) {
    return (
        <SceneFrame>
            <g transform="translate(190, 138)">
                {/* Shadow */}
                <circle r="92" fill="#0F172A" opacity="0.08" transform="translate(4, 6)" />

                {/* Stopwatch Outer Metallic Bezel */}
                <circle r="90" fill="url(#stopwatchBezel)" stroke="#64748B" strokeWidth="2" />
                <circle r="82" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1" />
                <circle r="78" fill="url(#stopwatchDial)" stroke="#94A3B8" strokeWidth="1" />

                {/* Top Start/Stop Crown Button */}
                <rect x="-14" y="-112" width="28" height="18" rx="4" fill="url(#stopwatchBezel)" stroke="#475569" strokeWidth="1.5" />
                <rect x="-8" y="-120" width="16" height="10" rx="3" fill="#2563EB" stroke="#1D4ED8" strokeWidth="1" />

                {/* Side Reset Button */}
                <rect x="74" y="-56" width="14" height="22" rx="4" fill="url(#stopwatchBezel)" transform="rotate(45 74 -56)" stroke="#475569" strokeWidth="1" />

                {/* Dial Ticks (60 seconds) */}
                {Array.from({ length: 12 }).map((_, i) => {
                    const angle = (i * 30 * Math.PI) / 180;
                    const isMajor = i % 3 === 0;
                    const r1 = isMajor ? 62 : 68;
                    const r2 = 74;
                    return (
                        <line
                            key={i}
                            x1={r1 * Math.sin(angle)}
                            y1={-r1 * Math.cos(angle)}
                            x2={r2 * Math.sin(angle)}
                            y2={-r2 * Math.cos(angle)}
                            stroke={isMajor ? "#0F172A" : "#64748B"}
                            strokeWidth={isMajor ? "2.5" : "1.5"}
                        />
                    );
                })}

                {/* Minute Sub-dial */}
                <g transform="translate(0, 32)">
                    <circle r="20" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
                    {Array.from({ length: 4 }).map((_, i) => {
                        const angle = (i * 90 * Math.PI) / 180;
                        return (
                            <line
                                key={i}
                                x1={14 * Math.sin(angle)}
                                y1={-14 * Math.cos(angle)}
                                x2={18 * Math.sin(angle)}
                                y2={-18 * Math.cos(angle)}
                                stroke="#64748B"
                                strokeWidth="1.5"
                            />
                        );
                    })}
                    <line x1="0" y1="0" x2="0" y2="-12" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" />
                    <circle r="2.5" fill="#2563EB" />
                </g>

                {/* Stopwatch Main Needle */}
                <motion.g
                    animate={
                        running && !reduced
                            ? { rotate: 360 }
                            : { rotate: running ? 60 : 0 }
                    }
                    transition={
                        running && !reduced
                            ? { duration: 4, repeat: Infinity, ease: "linear" }
                            : {}
                    }
                >
                    <line
                        x1="0"
                        y1="12"
                        x2="0"
                        y2="-68"
                        stroke="#DC2626"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                    />
                    <circle cx="0" cy="-55" r="4" fill="#DC2626" />
                </motion.g>

                {/* Center Pivot Cap */}
                <circle r="6" fill="#0F172A" stroke="#FFFFFF" strokeWidth="1.5" />
            </g>

            {/* Digital Readout & Label */}
            <g transform="translate(190, 275)">
                <rect x="-85" y="-18" width="170" height="34" rx="12" fill="#0F172A" />
                <text
                    textAnchor="middle"
                    y="4"
                    fill="#4ADE80"
                    fontSize="15"
                    fontFamily="JetBrains Mono, monospace"
                    fontWeight="700"
                >
                    {label}
                </text>
            </g>
        </SceneFrame>
    );
}

/* ------------------------------------------------------------------ */
/*  Step 4 — Blotting Scene                                           */
/* ------------------------------------------------------------------ */

function BlotScene({ reduced }: { reduced: boolean }) {
    const [stepIndex, setStepIndex] = useState(0);

    useEffect(() => {
        if (reduced) return;
        const interval = setInterval(() => {
            setStepIndex((prev) => (prev + 1) % 5);
        }, 1600);
        return () => clearInterval(interval);
    }, [reduced]);

    const times = ["00:30", "01:00", "01:30", "02:00", "02:30"];
    const currentTime = times[stepIndex];

    const spots = [
        { cx: 80, cy: 90, r: 12 },
        { cx: 120, cy: 60, r: 10 },
        { cx: 170, cy: 50, r: 8 },
        { cx: 220, cy: 60, r: 6 },
        { cx: 260, cy: 90, r: 4 },
    ];

    return (
        <SceneFrame>
            <g>
                {/* Whatman Filter Paper Disc */}
                <g transform="translate(190, 142)">
                    <circle r="105" fill="#0F172A" opacity="0.06" transform="translate(4, 4)" />
                    <circle r="105" fill="url(#filterPaperGrad)" stroke="#CBD5E1" strokeWidth="1.5" />
                    <circle r="85" fill="none" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" />

                    <text
                        x="0"
                        y="-10"
                        textAnchor="middle"
                        fill="#94A3B8"
                        fontSize="12"
                        fontFamily="DM Sans, sans-serif"
                        fontWeight="700"
                        opacity="0.4"
                    >
                        WHATMAN No. 1
                    </text>
                    <text
                        x="0"
                        y="8"
                        textAnchor="middle"
                        fill="#94A3B8"
                        fontSize="10"
                        fontFamily="JetBrains Mono, monospace"
                        opacity="0.4"
                    >
                        FILTER PAPER
                    </text>

                    {/* Accumulated Blood Stains */}
                    {spots.map((spot, idx) => {
                        if (idx > stepIndex) return null;
                        return (
                            <g key={idx} transform="translate(-190, -142)">
                                <motion.circle
                                    cx={spot.cx}
                                    cy={spot.cy}
                                    r={spot.r}
                                    fill="url(#bloodStainGrad)"
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.4 }}
                                />
                                <text
                                    x={spot.cx}
                                    y={spot.cy + spot.r + 12}
                                    textAnchor="middle"
                                    fill="#64748B"
                                    fontSize="9"
                                    fontFamily="JetBrains Mono, monospace"
                                    fontWeight="600"
                                >
                                    {times[idx]}
                                </text>
                            </g>
                        );
                    })}
                </g>

                {/* Animated Fingertip Blood Drop Dabbing */}
                <motion.g
                    initial={{ x: 60, y: -30 }}
                    animate={
                        reduced
                            ? { x: 0, y: 0 }
                            : { x: [50, -10, 50], y: [-30, 20, -30] }
                    }
                    transition={
                        reduced ? {} : { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
                    }
                >
                    <circle cx="260" cy="90" r="7" fill="url(#bloodDropGrad)" filter="url(#bloodGlow)" />
                </motion.g>
            </g>

            {/* Readout */}
            <g transform="translate(190, 280)">
                <rect x="-70" y="-16" width="140" height="32" rx="16" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2" filter="url(#softShadow)" />
                <text
                    textAnchor="middle"
                    y="5"
                    fill="#2563EB"
                    fontSize="15"
                    fontFamily="JetBrains Mono, monospace"
                    fontWeight="700"
                >
                    Blot @ {currentTime}
                </text>
            </g>
        </SceneFrame>
    );
}

/* ------------------------------------------------------------------ */
/*  Step 5 — Timer Stop Scene                                         */
/* ------------------------------------------------------------------ */

function TimerStopScene({ reduced }: { reduced: boolean }) {
    return (
        <SceneFrame>
            <g transform="translate(190, 135)">
                {/* Stopwatch stopped at 04:30 */}
                <circle r="88" fill="#0F172A" opacity="0.08" transform="translate(4, 6)" />
                <circle r="86" fill="url(#stopwatchBezel)" stroke="#475569" strokeWidth="2" />
                <circle r="76" fill="url(#stopwatchDial)" stroke="#94A3B8" strokeWidth="1" />

                {/* Top Crown Button Pressed */}
                <rect x="-14" y="-104" width="28" height="14" rx="3" fill="#10B981" stroke="#059669" strokeWidth="1.5" />

                {/* Dial Ticks */}
                {Array.from({ length: 12 }).map((_, i) => {
                    const angle = (i * 30 * Math.PI) / 180;
                    return (
                        <line
                            key={i}
                            x1={60 * Math.sin(angle)}
                            y1={-60 * Math.cos(angle)}
                            x2={70 * Math.sin(angle)}
                            y2={-70 * Math.cos(angle)}
                            stroke="#64748B"
                            strokeWidth="2"
                        />
                    );
                })}

                {/* Needle Locked at 4min 30sec */}
                <line
                    x1="0"
                    y1="10"
                    x2="-55"
                    y2="0"
                    stroke="#10B981"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                />
                <circle r="6" fill="#10B981" />

                {/* Checkmark Badge Overlay */}
                <motion.g
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: reduced ? 0 : 0.3, duration: 0.5, type: "spring" }}
                >
                    <circle cx="48" cy="-48" r="26" fill="#10B981" filter="url(#softShadow)" />
                    <path
                        d="M38 -48 L45 -41 L58 -56"
                        stroke="#FFFFFF"
                        strokeWidth="4"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </motion.g>
            </g>

            {/* Readout */}
            <g transform="translate(190, 275)">
                <rect x="-105" y="-18" width="210" height="36" rx="18" fill="#ECFDF5" stroke="#10B981" strokeWidth="2" />
                <text
                    textAnchor="middle"
                    y="5"
                    fill="#065F46"
                    fontSize="16"
                    fontFamily="JetBrains Mono, monospace"
                    fontWeight="700"
                >
                    04:30 · Bleeding Stopped
                </text>
            </g>
        </SceneFrame>
    );
}

/* ------------------------------------------------------------------ */
/*  Step 6 — Result Range Scene                                       */
/* ------------------------------------------------------------------ */

function ResultScene({ reduced }: { reduced: boolean }) {
    const minVal = 0;
    const maxVal = 10;
    const recordedVal = 4.5; // 4 min 30 sec

    const getX = (val: number) => 40 + ((val - minVal) / (maxVal - minVal)) * 300;

    return (
        <SceneFrame>
            <g transform="translate(0, 30)">
                {/* Title */}
                <text
                    x="190"
                    y="25"
                    textAnchor="middle"
                    fill="#0F172A"
                    fontSize="16"
                    fontFamily="Playfair Display, Georgia, serif"
                    fontWeight="700"
                >
                    Duke's Bleeding Time Spectrum
                </text>

                {/* Base Track */}
                <rect x="40" y="90" width="300" height="16" rx="8" fill="#E2E8F0" />

                {/* Shortened (<2 min) Zone */}
                <rect
                    x={getX(0)}
                    y="90"
                    width={getX(2) - getX(0)}
                    height="16"
                    rx="8"
                    fill="#FEF3C7"
                />

                {/* Normal (2 - 7 min) Green Zone */}
                <rect
                    x={getX(2)}
                    y="90"
                    width={getX(7) - getX(2)}
                    height="16"
                    fill="#10B981"
                    opacity="0.9"
                />

                {/* Prolonged (>7 min) Rose Zone */}
                <rect
                    x={getX(7)}
                    y="90"
                    width={getX(10) - getX(7)}
                    height="16"
                    rx="8"
                    fill="#FEE2E2"
                />

                {/* Normal Zone Highlight Border */}
                <rect
                    x={getX(2)}
                    y="88"
                    width={getX(7) - getX(2)}
                    height="20"
                    rx="4"
                    fill="none"
                    stroke="#059669"
                    strokeWidth="2"
                />

                {/* Tick Marks & Scale Labels */}
                {[0, 2, 4.5, 7, 10].map((v) => (
                    <g key={v} transform={`translate(${getX(v)}, 114)`}>
                        <line x1="0" y1="-8" x2="0" y2="2" stroke="#64748B" strokeWidth="1.5" />
                        <text
                            x="0"
                            y="16"
                            textAnchor="middle"
                            fill="#475569"
                            fontSize="11"
                            fontFamily="JetBrains Mono, monospace"
                            fontWeight="600"
                        >
                            {v}m
                        </text>
                    </g>
                ))}

                {/* Zone Labels */}
                <text x={getX(1)} y="82" textAnchor="middle" fill="#92400E" fontSize="10" fontFamily="DM Sans, sans-serif" fontWeight="700">
                    Short
                </text>
                <text x={getX(4.5)} y="82" textAnchor="middle" fill="#065F46" fontSize="11" fontFamily="DM Sans, sans-serif" fontWeight="700">
                    NORMAL RANGE (2–7 min)
                </text>
                <text x={getX(8.5)} y="82" textAnchor="middle" fill="#991B1B" fontSize="10" fontFamily="DM Sans, sans-serif" fontWeight="700">
                    Prolonged
                </text>

                {/* Animated Pin Pointer at 4.5 min */}
                <motion.g
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: reduced ? 0 : 0.4, duration: 0.6, type: "spring" }}
                    transform={`translate(${getX(recordedVal)}, 90)`}
                >
                    <line x1="0" y1="-28" x2="0" y2="16" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="0" cy="-32" r="14" fill="#2563EB" filter="url(#softShadow)" />
                    <circle cx="0" cy="-32" r="6" fill="#FFFFFF" />

                    {/* Result Tag */}
                    <g transform="translate(0, -56)">
                        <rect x="-55" y="-12" width="110" height="24" rx="12" fill="#2563EB" />
                        <text
                            textAnchor="middle"
                            y="4"
                            fill="#FFFFFF"
                            fontSize="12"
                            fontFamily="JetBrains Mono, monospace"
                            fontWeight="700"
                        >
                            4:30 · Normal
                        </text>
                    </g>
                </motion.g>
            </g>

            {/* Clinical Interpretation Banner */}
            <g transform="translate(190, 260)">
                <rect x="-160" y="-22" width="320" height="44" rx="12" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="1" />
                <text
                    textAnchor="middle"
                    y="-4"
                    fill="#1E40AF"
                    fontSize="12"
                    fontFamily="DM Sans, sans-serif"
                    fontWeight="700"
                >
                    Interpretation: Normal Primary Hemostasis
                </text>
                <text
                    textAnchor="middle"
                    y="14"
                    fill="#3B82F6"
                    fontSize="11"
                    fontFamily="DM Sans, sans-serif"
                >
                    Platelet count, vWF activity, & capillary integrity intact.
                </text>
            </g>
        </SceneFrame>
    );
}

/* ------------------------------------------------------------------ */
/*  Illustration Dispatcher                                            */
/* ------------------------------------------------------------------ */

function StepIllustration({ step, reduced }: { step: StepId; reduced: boolean }) {
    switch (step) {
        case "prep":
            return <PrepScene reduced={reduced} />;
        case "puncture":
            return <PunctureScene reduced={reduced} />;
        case "timer-start":
            return <TimerScene reduced={reduced} running label="00:00 → START" />;
        case "blot":
            return <BlotScene reduced={reduced} />;
        case "timer-stop":
            return <TimerStopScene reduced={reduced} />;
        case "result":
            return <ResultScene reduced={reduced} />;
        default:
            return null;
    }
}

/* ------------------------------------------------------------------ */
/*  Main Component Page                                               */
/* ------------------------------------------------------------------ */

export default function BleedingTimeLabGuide() {
    const [current, setCurrent] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [completed, setCompleted] = useState(false);
    const reducedMotion = useReducedMotion();
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const step = STEPS[current];
    const isLast = current === STEPS.length - 1;

    const goNext = useCallback(() => {
        setCurrent((c) => {
            if (c >= STEPS.length - 1) {
                setPlaying(false);
                setCompleted(true);
                return c;
            }
            return c + 1;
        });
    }, []);

    const goPrev = useCallback(() => {
        setCompleted(false);
        setCurrent((c) => Math.max(0, c - 1));
    }, []);

    const restart = useCallback(() => {
        setCompleted(false);
        setPlaying(false);
        setCurrent(0);
    }, []);

    // Autoplay pacing
    useEffect(() => {
        if (!playing) return;
        if (isLast) {
            setPlaying(false);
            return;
        }
        timeoutRef.current = setTimeout(goNext, step.duration * 1000);
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [playing, current, step.duration, isLast, goNext]);

    // Confetti trigger on complete
    useEffect(() => {
        if (!completed) return;
        confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 },
            colors: ["#2563EB", "#4ADE80", "#10B981", "#3B82F6"],
        });
    }, [completed]);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased pb-16">
            <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400&family=Playfair+Display:wght@600;700;800;900&family=JetBrains+Mono:wght@500;600;700&display=swap");

        body {
          font-family: 'DM Sans', sans-serif;
        }
        .font-serif {
          font-family: 'Playfair Display', Georgia, serif;
        }
        .font-mono {
          font-family: 'JetBrains Mono', monospace;
        }
      `}</style>

    
            <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-8 md:pt-12">
                {/* Header Section */}
                <header className="mb-8">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-slate-300">•</span>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            {PROCEDURE.method}
                        </span>
                    </div>

                    <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-3">
                        {PROCEDURE.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm font-medium text-slate-500">
                        <span className="flex items-center gap-1.5">
                            <Activity size={15} className="text-blue-600" /> Difficulty: <strong>{PROCEDURE.difficulty}</strong>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1.5">
                            <Clock size={15} className="text-blue-600" /> Est. Duration: <strong>{PROCEDURE.estimatedTime}</strong>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1.5">
                            <FileText size={15} className="text-blue-600" /> Protocol Steps: <strong>{STEPS.length} Steps</strong>
                        </span>
                    </div>
                </header>

                {/* Equipment & Safety Guidelines Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                    {/* Equipment Card */}
                    <div className="relative rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-600 to-green-400" />
                        <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                            <FlaskConical size={18} className="text-blue-600" />
                            Required Reagents & Equipment
                        </h2>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-slate-700 font-medium">
                            {PROCEDURE.equipment.map((item) => (
                                <li key={item} className="flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Safety Notes Card */}
                    <div className="relative rounded-2xl border border-amber-200 bg-amber-50/70 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-[3px] bg-amber-400" />
                        <h2 className="text-base font-bold text-amber-950 mb-3 flex items-center gap-2">
                            <AlertTriangle size={18} className="text-amber-600" />
                            Biosafety & Precautionary Directives
                        </h2>
                        <ul className="space-y-2 text-xs sm:text-sm text-amber-900 font-medium">
                            {PROCEDURE.safetyNotes.map((note) => (
                                <li key={note} className="flex items-start gap-2">
                                    <span className="text-amber-600 font-bold shrink-0">•</span>
                                    <span>{note}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Step Navigation Pill Stepper */}
                <div className="mb-6 overflow-x-auto pb-2 scrollbar-none">
                    <div className="flex items-center gap-2 min-w-max">
                        {STEPS.map((s, i) => {
                            const isActive = i === current;
                            const isDone = i < current;
                            return (
                                <button
                                    key={s.id}
                                    onClick={() => {
                                        setCompleted(false);
                                        setPlaying(false);
                                        setCurrent(i);
                                    }}
                                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 ${isActive
                                            ? "bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-md scale-[1.02]"
                                            : isDone
                                                ? "bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                                                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                                        }`}
                                    aria-label={`Step ${s.index}: ${s.title}`}
                                >
                                    <span
                                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold ${isActive
                                                ? "bg-white text-blue-700"
                                                : isDone
                                                    ? "bg-emerald-600 text-white"
                                                    : "bg-slate-100 text-slate-600"
                                            }`}
                                    >
                                        {isDone ? <Check size={12} strokeWidth={3} /> : s.index}
                                    </span>
                                    <span>{s.title}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Main Step Card Container */}
                <div className="relative rounded-3xl border border-slate-200 bg-white shadow-lg overflow-hidden transition-all duration-300">
                    <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-blue-600 to-green-400" />

                    <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
                        {/* SVG Visual Frame Column */}
                        <div className="lg:col-span-6 bg-slate-50/90 p-6 sm:p-8 flex items-center justify-center border-b lg:border-b-0 lg:border-r border-slate-200">
                            <div className="w-full max-w-[420px] aspect-[19/16]">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={step.id}
                                        initial={{ opacity: 0, scale: 0.96 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.96 }}
                                        transition={{ duration: 0.3 }}
                                        className="w-full h-full"
                                    >
                                        <StepIllustration step={step.id} reduced={!!reducedMotion} />
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Step Description & Controls Column */}
                        <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="font-mono text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                                        Step {step.index} of {STEPS.length}
                                    </span>
                                    <span className="font-mono text-xs font-semibold text-slate-400">
                                        Pacing: {step.duration}s
                                    </span>
                                </div>

                                <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3 leading-snug">
                                    {step.title}
                                </h2>

                                <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
                                    {step.description}
                                </p>

                                {/* Warning Callout Box */}
                                {step.warning && (
                                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 mb-6 flex items-start gap-3 text-xs sm:text-sm text-amber-950">
                                        <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                                        <div>
                                            <strong className="font-bold text-amber-900 block mb-0.5">Critical Technique Warning:</strong>
                                            {step.warning}
                                        </div>
                                    </div>
                                )}

                                {/* Practical Tip Callout Box */}
                                {step.tip && (
                                    <div className="rounded-xl border border-blue-200 bg-blue-50/80 p-4 mb-6 flex items-start gap-3 text-xs sm:text-sm text-blue-950">
                                        <Info size={18} className="text-blue-600 shrink-0 mt-0.5" />
                                        <div>
                                            <strong className="font-bold text-blue-900 block mb-0.5">Laboratory Tip:</strong>
                                            {step.tip}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Navigation Action Buttons */}
                            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                                <button
                                    onClick={goPrev}
                                    disabled={current === 0}
                                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs sm:text-sm shadow-xs hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-all"
                                >
                                    <ChevronLeft size={16} /> Back
                                </button>

                                <button
                                    onClick={() => setPlaying((p) => !p)}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-green-400 text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
                                >
                                    {playing ? <Pause size={16} /> : <Play size={16} />}
                                    <span>{playing ? "Pause Guide" : "Auto-Play Procedure"}</span>
                                </button>

                                {!isLast ? (
                                    <button
                                        onClick={() => {
                                            setPlaying(false);
                                            goNext();
                                        }}
                                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs sm:text-sm shadow-xs hover:bg-slate-50 transition-all"
                                    >
                                        Next <ChevronRight size={16} />
                                    </button>
                                ) : (
                                    <button
                                        onClick={restart}
                                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border-2 border-blue-600 text-blue-600 font-bold text-xs sm:text-sm hover:bg-blue-50 transition-all"
                                    >
                                        <RotateCcw size={16} /> Restart
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Procedure Completion State */}
                <AnimatePresence>
                    {completed && (
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 16 }}
                            className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-6 sm:p-8 flex items-center justify-between gap-4 shadow-sm"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-emerald-600 text-white shrink-0 shadow-md">
                                    <CheckCircle2 size={32} />
                                </div>
                                <div>
                                    <h3 className="font-serif text-xl font-bold text-emerald-950 mb-1">
                                        Practical Demonstration Complete!
                                    </h3>
                                    <p className="text-xs sm:text-sm text-emerald-800 font-medium">
                                        You have successfully walked through all {STEPS.length} steps of Duke&apos;s Bleeding Time Determination.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={restart}
                                className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md hover:bg-emerald-800 transition-all shrink-0"
                            >
                                <RotateCcw size={16} /> Replay Demonstration
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}