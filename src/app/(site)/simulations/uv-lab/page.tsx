"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ComposedChart,
    Scatter,
} from "recharts";
import { jsPDF } from "jspdf";
import {
    FlaskConical,
    Beaker,
    Sun,
    Gauge,
    Download,
    PlayCircle,
    CheckCircle2,
    XCircle,
    ChevronRight,
    ChevronLeft,
    Info,
    RefreshCw,
    Droplet
} from "lucide-react";

// ============================================================
//  PIPETTE SVG — photorealistic borosilicate glass + rubber bulb
// ============================================================
const PipetteSVG = ({
    filledColor,
    fillPercent = 0.6,
}: {
    filledColor?: string;
    fillPercent?: number;
}) => {
    const liquidTop = 38 + (1 - fillPercent) * 56;
    return (
        <svg
            viewBox="0 0 56 200"
            className="w-8 h-32 sm:w-10 sm:h-40 md:w-12 md:h-48 drop-shadow-lg select-none"
            aria-label="Glass pipette"
        >
            <defs>
                <radialGradient id="bulbGrad" cx="40%" cy="35%" r="55%">
                    <stop offset="0%" stopColor="#f87171" />
                    <stop offset="45%" stopColor="#dc2626" />
                    <stop offset="100%" stopColor="#7f1d1d" />
                </radialGradient>
                <linearGradient id="tubeGlass" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.85)" />
                    <stop offset="18%" stopColor="rgba(255,255,255,0.25)" />
                    <stop offset="50%" stopColor="rgba(200,230,255,0.08)" />
                    <stop offset="82%" stopColor="rgba(180,210,240,0.15)" />
                    <stop offset="100%" stopColor="rgba(100,150,200,0.55)" />
                </linearGradient>
                <linearGradient id="liquidGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
                    <stop offset="30%" stopColor={filledColor || "transparent"} stopOpacity="0.9" />
                    <stop offset="100%" stopColor="rgba(0,0,0,0.25)" />
                </linearGradient>
                <linearGradient id="tipGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.7)" />
                    <stop offset="40%" stopColor="rgba(200,225,250,0.3)" />
                    <stop offset="100%" stopColor="rgba(100,150,200,0.5)" />
                </linearGradient>
                <clipPath id="tubeClip">
                    <rect x="19" y="34" width="18" height="100" />
                </clipPath>
                <clipPath id="tipClip">
                    <polygon points="19,134 23,198 33,198 37,134" />
                </clipPath>
            </defs>

            <ellipse cx="28" cy="17" rx="16" ry="18" fill="url(#bulbGrad)" />
            <ellipse cx="23" cy="11" rx="6" ry="5" fill="rgba(255,255,255,0.22)" />
            <rect x="22" y="30" width="12" height="6" rx="2" fill="#b91c1c" />

            {filledColor && (
                <rect
                    x="20"
                    y={liquidTop}
                    width="16"
                    height={134 - liquidTop}
                    fill={`url(#liquidGrad)`}
                    clipPath="url(#tubeClip)"
                />
            )}
            {filledColor && (
                <ellipse
                    cx="28"
                    cy={liquidTop + 1}
                    rx="8"
                    ry="2.5"
                    fill={filledColor}
                    opacity="0.7"
                    clipPath="url(#tubeClip)"
                />
            )}
            <rect x="19" y="34" width="18" height="100" fill="url(#tubeGlass)" stroke="#93c5fd" strokeWidth="1.2" rx="1" />
            {[0, 14, 28, 42, 56, 70, 84].map((offset, i) => (
                <g key={i}>
                    <line
                        x1={i % 2 === 0 ? "19" : "21"}
                        y1={44 + offset}
                        x2="24"
                        y2={44 + offset}
                        stroke="rgba(30,60,100,0.5)"
                        strokeWidth="0.8"
                    />
                    {i % 2 === 0 && (
                        <text
                            x="25.5"
                            y={44 + offset + 3}
                            fontSize="5"
                            fill="rgba(30,60,100,0.6)"
                            fontFamily="monospace"
                        >
                            {(5 - i / 2).toFixed(0)}
                        </text>
                    )}
                </g>
            ))}
            <rect x="20.5" y="35" width="2.5" height="98" rx="1" fill="rgba(255,255,255,0.45)" />

            {filledColor && (
                <polygon
                    points="20,134 24,196 32,196 36,134"
                    fill={`url(#liquidGrad)`}
                    clipPath="url(#tipClip)"
                />
            )}
            <polygon
                points="19,134 23,198 33,198 37,134"
                fill="url(#tipGrad)"
                stroke="#93c5fd"
                strokeWidth="1"
                strokeLinejoin="round"
            />
            <line x1="21" y1="136" x2="24" y2="195" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" strokeLinecap="round" />
            <ellipse cx="28" cy="198" rx="5" ry="1.5" fill="rgba(200,225,255,0.6)" stroke="#93c5fd" strokeWidth="0.8" />
        </svg>
    );
};

// ============================================================
//  CUVETTE SVG — realistic optical glass / plastic cuvette
// ============================================================
const CuvetteSVG = ({
    fillColor,
    fillLevel = 0,
    isCapped = false,
    isQuartz = true,
}: {
    fillColor?: string;
    fillLevel?: number;
    isCapped?: boolean;
    isQuartz?: boolean;
}) => {
    const glassBase = isQuartz
        ? { hi: "rgba(255,255,255,0.88)", mid: "rgba(220,240,255,0.12)", lo: "rgba(180,215,250,0.55)" }
        : { hi: "rgba(200,230,255,0.75)", mid: "rgba(130,190,240,0.15)", lo: "rgba(80,140,200,0.60)" };

    const innerTop = 16 + (1 - fillLevel) * 76;
    return (
        <svg
            viewBox="0 0 60 120"
            className="w-10 h-20 sm:w-12 sm:h-24 md:w-14 md:h-28 drop-shadow-md transition-all duration-300"
            aria-label={isQuartz ? "Quartz cuvette" : "Plastic cuvette"}
        >
            <defs>
                <linearGradient id={`cvGlass_${isQuartz}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={glassBase.hi} />
                    <stop offset="15%" stopColor="rgba(255,255,255,0.15)" />
                    <stop offset="50%" stopColor={glassBase.mid} />
                    <stop offset="85%" stopColor="rgba(255,255,255,0.08)" />
                    <stop offset="100%" stopColor={glassBase.lo} />
                </linearGradient>
                <linearGradient id="cvLiquid" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
                    <stop offset="25%" stopColor={fillColor || "transparent"} stopOpacity="0.85" />
                    <stop offset="75%" stopColor={fillColor || "transparent"} stopOpacity="0.85" />
                    <stop offset="100%" stopColor="rgba(0,0,0,0.2)" />
                </linearGradient>
                <linearGradient id="cvCap" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#475569" />
                    <stop offset="100%" stopColor="#1e293b" />
                </linearGradient>
                <linearGradient id="cvBottom" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(200,220,255,0.4)" />
                    <stop offset="100%" stopColor={glassBase.lo} />
                </linearGradient>
                <clipPath id="cvBodyClip">
                    <rect x="5" y="14" width="50" height="90" rx="2" />
                </clipPath>
            </defs>

            {isCapped && (
                <g>
                    <rect x="2" y="0" width="56" height="16" fill="url(#cvCap)" rx="3" />
                    {[9, 14, 19, 24, 29, 34, 39, 44, 49].map((x) => (
                        <line key={x} x1={x} y1="3" x2={x} y2="13" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
                    ))}
                    <rect x="3" y="1" width="54" height="3" rx="1.5" fill="rgba(255,255,255,0.15)" />
                </g>
            )}

            {fillColor && fillLevel > 0 && (
                <>
                    <rect
                        x="6"
                        y={innerTop}
                        width="48"
                        height={92 - innerTop}
                        fill={`url(#cvLiquid)`}
                        clipPath="url(#cvBodyClip)"
                    />
                    <ellipse
                        cx="30"
                        cy={innerTop}
                        rx="24"
                        ry="3"
                        fill={fillColor}
                        opacity="0.45"
                        clipPath="url(#cvBodyClip)"
                    />
                    <ellipse
                        cx="30"
                        cy={innerTop + 1}
                        rx="18"
                        ry="1.5"
                        fill="rgba(255,255,255,0.3)"
                        clipPath="url(#cvBodyClip)"
                    />
                </>
            )}

            <rect
                x="4"
                y="14"
                width="52"
                height="92"
                fill={`url(#cvGlass_${isQuartz})`}
                stroke={isQuartz ? "#bfdbfe" : "#93c5fd"}
                strokeWidth="1.5"
                rx="2"
            />

            <rect x="4" y="101" width="52" height="5" fill="url(#cvBottom)" rx="1" />

            {isQuartz && (
                <>
                    <line x1="4" y1="20" x2="4" y2="100" stroke="rgba(96,165,250,0.5)" strokeWidth="1.5" />
                    <line x1="56" y1="20" x2="56" y2="100" stroke="rgba(96,165,250,0.5)" strokeWidth="1.5" />
                    {[[4, 20], [4, 100], [56, 20], [56, 100]].map(([x, y], i) => (
                        <circle key={i} cx={x} cy={y} r="2" fill="rgba(96,165,250,0.6)" />
                    ))}
                </>
            )}

            <rect x="5.5" y="15" width="3" height="88" rx="1.5" fill="rgba(255,255,255,0.55)" />
            <rect x="5" y="15" width="50" height="2.5" rx="1" fill="rgba(255,255,255,0.4)" />
            <rect x="52" y="15" width="3" height="88" rx="1.5" fill="rgba(30,80,140,0.18)" />

            {!isQuartz && (
                <rect x="4" y="14" width="52" height="92" fill="rgba(147,197,253,0.08)" rx="2" />
            )}
        </svg>
    );
};

// ============================================================
//  REAGENT BOTTLE SVG — lab brown/amber glass bottle
// ============================================================
const ReagentBottleSVG = ({
    liquidColor = "#8b008b",
    label = "Sample",
}: {
    liquidColor?: string;
    label?: string;
}) => (
    <svg
        viewBox="0 0 80 140"
        className="w-14 h-24 sm:w-16 sm:h-28 md:w-20 md:h-36 drop-shadow-lg select-none"
        aria-label={`Reagent bottle: ${label}`}
    >
        <defs>
            <linearGradient id="bottleGlass" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.6)" />
                <stop offset="12%" stopColor="rgba(200,220,200,0.15)" />
                <stop offset="50%" stopColor="rgba(140,180,140,0.06)" />
                <stop offset="88%" stopColor="rgba(100,140,100,0.12)" />
                <stop offset="100%" stopColor="rgba(60,100,60,0.55)" />
            </linearGradient>
            <linearGradient id="bottleLiquid" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.25)" />
                <stop offset="30%" stopColor={liquidColor} stopOpacity="0.9" />
                <stop offset="70%" stopColor={liquidColor} stopOpacity="0.85" />
                <stop offset="100%" stopColor="rgba(0,0,0,0.3)" />
            </linearGradient>
            <linearGradient id="bottleNeck" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.5)" />
                <stop offset="50%" stopColor="rgba(180,220,180,0.1)" />
                <stop offset="100%" stopColor="rgba(60,100,60,0.45)" />
            </linearGradient>
            <linearGradient id="bottleCap" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#f8fafc" />
                <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>
            <clipPath id="bottleBodyClip">
                <path d="M10,55 Q8,58 8,65 L8,128 Q8,132 12,132 L68,132 Q72,132 72,128 L72,65 Q72,58 70,55 Z" />
            </clipPath>
        </defs>

        <rect x="28" y="4" width="24" height="14" rx="3" fill="url(#bottleCap)" stroke="#94a3b8" strokeWidth="1" />
        {[33, 38, 43, 48].map(x => (
            <line key={x} x1={x} y1="6" x2={x} y2="16" stroke="rgba(0,0,0,0.1)" strokeWidth="1.2" />
        ))}

        <path d="M30,18 L30,38 Q30,50 22,55 L58,55 Q50,50 50,38 L50,18 Z"
            fill="url(#bottleNeck)" stroke="#86efac" strokeWidth="1" strokeLinejoin="round" />
        <line x1="33" y1="19" x2="33" y2="53" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" />

        <path
            d="M10,55 Q8,58 8,65 L8,128 Q8,132 12,132 L68,132 Q72,132 72,128 L72,65 Q72,58 70,55 Z"
            fill={`url(#bottleLiquid)`}
        />
        <ellipse cx="40" cy="62" rx="24" ry="4" fill="rgba(255,255,255,0.2)" />
        <ellipse cx="40" cy="62" rx="14" ry="2" fill="rgba(255,255,255,0.18)" />

        <path
            d="M10,55 Q8,58 8,65 L8,128 Q8,132 12,132 L68,132 Q72,132 72,128 L72,65 Q72,58 70,55 Z"
            fill="url(#bottleGlass)"
            stroke="#86efac"
            strokeWidth="1.5"
            strokeLinejoin="round"
        />

        <path d="M11,58 Q10,60 10,66 L10,126" stroke="rgba(255,255,255,0.55)" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M69,58 Q70,60 70,66 L70,126" stroke="rgba(0,60,0,0.2)" strokeWidth="3" strokeLinecap="round" fill="none" />

        <rect x="15" y="75" width="50" height="40" rx="3" fill="rgba(255,255,255,0.88)" stroke="rgba(0,0,0,0.12)" strokeWidth="0.8" />
        <rect x="15" y="75" width="50" height="6" rx="3" fill={liquidColor} opacity="0.7" />
        <text x="40" y="101" fontSize="7" fill="#1e293b" textAnchor="middle" fontFamily="monospace" fontWeight="600">
            {label.length > 10 ? label.slice(0, 10) : label}
        </text>
        <text x="40" y="110" fontSize="5.5" fill="#64748b" textAnchor="middle" fontFamily="monospace">
            Unknown
        </text>

        <rect x="8" y="128" width="64" height="5" rx="2" fill="rgba(100,180,100,0.35)" />
    </svg>
);

// ============================================================
//  SPECTROPHOTOMETER SVG — Shimadzu UV-1900 style
// ============================================================
const SpectrophotometerSVG = ({
    isLidOpen = false,
    hasCuvette = false,
    cuvetteColor = "#8b008b",
    wavelength = 525,
    absorbance = 0.0,
    isScanning = false,
}: {
    isLidOpen?: boolean;
    hasCuvette?: boolean;
    cuvetteColor?: string;
    wavelength?: number;
    absorbance?: number;
    isScanning?: boolean;
}) => (
    <svg
        viewBox="0 0 480 300"
        className="w-full max-w-xl drop-shadow-2xl select-none"
        aria-label="UV-Vis spectrophotometer"
    >
        <defs>
            <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#f8fafc" />
                <stop offset="40%" stopColor="#e2e8f0" />
                <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>
            <linearGradient id="bodyTop" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#f1f5f9" />
                <stop offset="100%" stopColor="#e2e8f0" />
            </linearGradient>
            <linearGradient id="screenBg" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#020617" />
            </linearGradient>
            <linearGradient id="chamberInner" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="40%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
            <linearGradient id="beamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={isScanning ? "#fbbf24" : "#94a3b8"} stopOpacity={isScanning ? "1" : "0.4"} />
                <stop offset="100%" stopColor={isScanning ? "#f59e0b" : "#64748b"} stopOpacity={isScanning ? "0.7" : "0.2"} />
            </linearGradient>
            <linearGradient id="lidGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#e2e8f0" />
                <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>
            <filter id="screenGlow" x="-10%" y="-10%" width="120%" height="120%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="lampGlow">
                <feGaussianBlur stdDeviation={isScanning ? "5" : "2"} result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <clipPath id="chamberClip">
                <rect x="62" y="75" width="138" height="130" />
            </clipPath>
        </defs>

        <rect x="8" y="45" width="464" height="220" fill="url(#bodyGrad)" stroke="#94a3b8" strokeWidth="2" rx="12" />
        <rect x="8" y="45" width="464" height="52" fill="url(#bodyTop)" stroke="#cbd5e1" strokeWidth="1" rx="12" />
        <rect x="10" y="47" width="460" height="4" rx="2" fill="rgba(255,255,255,0.7)" />
        <rect x="10" y="258" width="460" height="5" rx="2" fill="rgba(0,0,0,0.1)" />

        <rect x="58" y="68" width="148" height="148" fill="#334155" stroke="#475569" strokeWidth="2" rx="8" />
        <rect x="64" y="74" width="136" height="136" fill="url(#chamberInner)" stroke="#1e293b" strokeWidth="1" rx="4" />
        <text x="132" y="64" fontSize="9" fill="#94a3b8" textAnchor="middle" fontFamily="monospace" letterSpacing="1">
            SAMPLE CHAMBER
        </text>

        <rect x="70" y="120" width="26" height="26" fill="#1e293b" stroke="#334155" strokeWidth="1" rx="4" />
        <circle cx="83" cy="133" r="9" fill={isScanning ? "#fef3c7" : "#334155"} filter="url(#lampGlow)"
            stroke={isScanning ? "#fbbf24" : "#475569"} strokeWidth="1.5" />
        <path d="M78,133 Q81,129 83,133 Q85,137 88,133" stroke={isScanning ? "#f59e0b" : "#64748b"}
            strokeWidth="1.5" fill="none" strokeLinecap="round" />

        {isScanning && (
            <g>
                <rect x="97" y="129" width="95" height="8" fill="url(#beamGrad)" opacity="0.85" rx="2">
                    <animate attributeName="opacity" values="0.85;0.5;0.85" dur="1s" repeatCount="indefinite" />
                </rect>
                {[110, 125, 140, 155, 170].map((x, i) => (
                    <circle key={i} cx={x} cy="133" r="1.5" fill="#fbbf24" opacity="0.6">
                        <animate attributeName="opacity" values="0.6;0;0.6" dur={`${0.8 + i * 0.1}s`}
                            begin={`${i * 0.12}s`} repeatCount="indefinite" />
                    </circle>
                ))}
            </g>
        )}
        {!isScanning && (
            <line x1="97" y1="133" x2="192" y2="133" stroke="#64748b" strokeWidth="1.5"
                strokeDasharray="4,4" opacity="0.3" />
        )}

        <rect x="192" y="120" width="22" height="26" fill="#1e293b" stroke="#334155" strokeWidth="1" rx="3" />
        <rect x="195" y="123" width="16" height="20" fill={isScanning ? "#1d4ed8" : "#334155"}
            stroke="#3b82f6" strokeWidth="1" rx="2">
            {isScanning && (
                <animate attributeName="fill" values="#1d4ed8;#1e40af;#1d4ed8" dur="0.8s" repeatCount="indefinite" />
            )}
        </rect>
        <text x="203" y="137" fontSize="5" fill={isScanning ? "#93c5fd" : "#475569"}
            textAnchor="middle" fontFamily="monospace">DET</text>

        {hasCuvette && (
            <g transform="translate(127, 88) scale(0.72)" clipPath="url(#chamberClip)">
                <CuvetteSVG fillColor={cuvetteColor} fillLevel={0.75} isCapped={false} isQuartz />
            </g>
        )}

        <g style={{ transition: "transform 0.5s ease" }}
            transform={isLidOpen ? "rotate(-42, 58, 74)" : "rotate(0, 58, 74)"}>
            <rect x="58" y="54" width="148" height="20" fill="url(#lidGrad)"
                stroke="#94a3b8" strokeWidth="1.5" rx="4" />
            <rect x="60" y="55" width="144" height="5" rx="2" fill="rgba(255,255,255,0.4)" />
            <circle cx="68" cy="74" r="4" fill="#94a3b8" stroke="#64748b" strokeWidth="1" />
            <circle cx="196" cy="74" r="4" fill="#94a3b8" stroke="#64748b" strokeWidth="1" />
            <rect x="116" y="56" width="36" height="8" rx="4" fill="#94a3b8" stroke="#64748b" strokeWidth="0.8" />
            <rect x="120" y="58" width="28" height="4" rx="2" fill="rgba(255,255,255,0.3)" />
        </g>

        <rect x="220" y="80" width="55" height="108" fill="#1e293b" stroke="#334155" strokeWidth="1.5" rx="6" />
        <text x="247" y="132" fontSize="7" fill="#64748b" textAnchor="middle" fontFamily="monospace"
            transform="rotate(-90, 247, 132)">MONOCHROMATOR</text>
        {[90, 96, 102, 108, 114, 120, 126, 132, 138, 144, 150, 156, 162, 168, 174].map((y, i) => (
            <line key={i} x1="226" y1={y} x2="269" y2={y} stroke="rgba(100,160,220,0.2)" strokeWidth="0.8" />
        ))}

        <rect x="294" y="72" width="158" height="118" fill="url(#screenBg)" stroke="#1e40af"
            strokeWidth="2" rx="6" />
        <rect x="296" y="74" width="154" height="3" rx="1.5" fill="rgba(96,165,250,0.2)" />
        <path d="M296,74 Q330,76 340,82 L340,104 Q330,98 296,96 Z" fill="rgba(255,255,255,0.04)" />

        <text x="305" y="101" fontSize="8" fill="#6ee7b7" fontFamily="monospace" letterSpacing="1">
            WAVELENGTH
        </text>
        <text x="305" y="122" fontSize="20" fill="#10b981" fontFamily="monospace" fontWeight="bold"
            filter="url(#screenGlow)">
            {wavelength} nm
        </text>

        <text x="305" y="143" fontSize="8" fill="#7dd3fc" fontFamily="monospace" letterSpacing="1">
            ABSORBANCE
        </text>
        <text x="305" y="164" fontSize="22" fill="#38bdf8" fontFamily="monospace" fontWeight="bold"
            filter="url(#screenGlow)">
            {absorbance.toFixed(3)} A
        </text>

        {isScanning && (
            <text x="305" y="182" fontSize="9" fill="#fbbf24" fontFamily="monospace">
                ▶ SCANNING...
                <animate attributeName="opacity" values="1;0.2;1" dur="1s" repeatCount="indefinite" />
            </text>
        )}
        {!isScanning && absorbance > 0 && (
            <text x="305" y="182" fontSize="9" fill="#4ade80" fontFamily="monospace">✓ READY</text>
        )}

        <rect x="294" y="200" width="44" height="28" fill={isScanning ? "#7f1d1d" : "#14532d"}
            stroke={isScanning ? "#ef4444" : "#22c55e"} strokeWidth="1.5" rx="5" />
        <text x="316" y="218" fontSize="7" fill={isScanning ? "#fca5a5" : "#86efac"}
            textAnchor="middle" fontFamily="monospace">{isScanning ? "STOP" : "START"}</text>

        <circle cx="374" cy="214" r="15" fill="#1e293b" stroke="#475569" strokeWidth="2" />
        <circle cx="374" cy="214" r="11" fill="#0f172a" stroke="#334155" strokeWidth="1" />
        {Array.from({ length: 12 }, (_, i) => {
            const angle = (i * 30 * Math.PI) / 180;
            return (
                <line key={i}
                    x1={374 + 8 * Math.cos(angle - Math.PI / 2)}
                    y1={214 + 8 * Math.sin(angle - Math.PI / 2)}
                    x2={374 + 12 * Math.cos(angle - Math.PI / 2)}
                    y2={214 + 12 * Math.sin(angle - Math.PI / 2)}
                    stroke="#64748b" strokeWidth={i % 3 === 0 ? "1.5" : "0.8"} />
            );
        })}
        <line x1="374" y1="214"
            x2={374 + 8 * Math.cos(((wavelength - 200) / 700 * 360 - 90) * Math.PI / 180)}
            y2={214 + 8 * Math.sin(((wavelength - 200) / 700 * 360 - 90) * Math.PI / 180)}
            stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
        <text x="374" y="235" fontSize="6" fill="#64748b" textAnchor="middle" fontFamily="monospace">λ DIAL</text>

        <rect x="400" y="200" width="44" height="28" fill="#1e293b" stroke="#475569"
            strokeWidth="1.5" rx="5" />
        <text x="422" y="218" fontSize="7" fill="#94a3b8" textAnchor="middle" fontFamily="monospace">MODE</text>

        <text x="40" y="272" fontSize="9" fill="#94a3b8" fontFamily="monospace" fontWeight="bold" letterSpacing="2">
            UV-VIS SPECTROPHOTOMETER
        </text>
        <text x="40" y="284" fontSize="7" fill="#64748b" fontFamily="monospace">
            Model: UV-1900i  |  PharmaWallah Lab
        </text>

        {[420, 428, 436, 444, 452].map((x) => (
            <rect key={x} x={x} y="258" width="2" height="18" rx="1" fill="#94a3b8" opacity="0.4" />
        ))}

        <circle cx="445" cy="80" r="5" fill={isScanning ? "#22c55e" : "#4ade80"}
            stroke="#14532d" strokeWidth="1">
            {isScanning && (
                <animate attributeName="opacity" values="1;0.3;1" dur="0.6s" repeatCount="indefinite" />
            )}
        </circle>
        <text x="445" y="93" fontSize="6" fill="#64748b" textAnchor="middle" fontFamily="monospace">PWR</text>

        <rect x="30" y="262" width="40" height="8" rx="4" fill="#94a3b8" />
        <rect x="410" y="262" width="40" height="8" rx="4" fill="#94a3b8" />
    </svg>
);

// ============================================================
//  STANDARD VIALS ROW — small test tubes in rack
// ============================================================
const StandardVialSVG = ({
    concentration,
    unit,
    liquidColor = "#8b008b",
    opacity = 0.6,
    measured = false,
    onClick,
}: {
    concentration: number;
    unit: string;
    liquidColor?: string;
    opacity?: number;
    measured?: boolean;
    onClick?: () => void;
}) => (
    <svg
        viewBox="0 0 44 90"
        className={`w-8 h-16 sm:w-9 sm:h-20 md:w-10 md:h-24 drop-shadow transition-all duration-200 cursor-pointer
      ${measured ? "opacity-30 grayscale" : "hover:-translate-y-1"}`}
        onClick={onClick}
        aria-label={`Standard vial ${concentration} ${unit}`}
    >
        <defs>
            <linearGradient id={`vialGlass_${concentration}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.75)" />
                <stop offset="20%" stopColor="rgba(255,255,255,0.15)" />
                <stop offset="80%" stopColor="rgba(200,220,255,0.1)" />
                <stop offset="100%" stopColor="rgba(100,150,220,0.5)" />
            </linearGradient>
            <linearGradient id={`vialLiq_${concentration}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
                <stop offset="40%" stopColor={liquidColor} stopOpacity={opacity} />
                <stop offset="100%" stopColor="rgba(0,0,0,0.2)" />
            </linearGradient>
            <clipPath id={`vialClip_${concentration}`}>
                <path d="M8,16 L8,70 Q8,78 22,78 Q36,78 36,70 L36,16 Z" />
            </clipPath>
        </defs>

        <rect x="6" y="4" width="32" height="14" rx="3" fill="#334155" />
        <rect x="7" y="5" width="30" height="4" rx="2" fill="rgba(255,255,255,0.2)" />

        <path d="M8,30 L8,70 Q8,78 22,78 Q36,78 36,70 L36,30 Z"
            fill={`url(#vialLiq_${concentration})`}
            clipPath={`url(#vialClip_${concentration})`} />
        <ellipse cx="22" cy="30" rx="14" ry="2.5" fill={liquidColor} opacity={opacity * 0.5}
            clipPath={`url(#vialClip_${concentration})`} />

        <path d="M8,16 L8,70 Q8,78 22,78 Q36,78 36,70 L36,16 Z"
            fill={`url(#vialGlass_${concentration})`}
            stroke="#93c5fd" strokeWidth="1.2" />
        <line x1="10" y1="18" x2="10" y2="68" stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeLinecap="round" />
        <ellipse cx="22" cy="70" rx="14" ry="4" fill="rgba(140,180,240,0.3)" />

        <text x="22" y="87" fontSize="6" fill="#334155" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
            {concentration}
        </text>
    </svg>
);

// --- Types & Interfaces ---
type Phase = "tutorial" | "quiz" | "simulation";
type CuvetteType = "quartz" | "plastic" | null;

interface Sample {
    id: string;
    name: string;
    color: string;
    lambdaMax: number;
    epsilon: number;
    pathLength: number;
    standards: number[];
    unknown: number;
    unit: string;
}

// --- Data Presets ---
const SAMPLES: Sample[] = [
    {
        id: "kmno4",
        name: "KMnO₄ (Potassium Permanganate)",
        color: "#8b008b",
        lambdaMax: 525,
        epsilon: 2400,
        pathLength: 1,
        standards: [0.1, 0.2, 0.3, 0.4, 0.5],
        unknown: 0.35,
        unit: "mM",
    },
    {
        id: "cuso4",
        name: "CuSO₄ (Copper Sulfate)",
        color: "#3b82f6",
        lambdaMax: 810,
        epsilon: 15,
        pathLength: 1,
        standards: [0.05, 0.1, 0.15, 0.2, 0.25],
        unknown: 0.18,
        unit: "M",
    },
    {
        id: "methylene_blue",
        name: "Methylene Blue",
        color: "#000080",
        lambdaMax: 664,
        epsilon: 84000,
        pathLength: 1,
        standards: [1, 2, 3, 4, 5],
        unknown: 3.2,
        unit: "µM",
    },
    {
        id: "crystal_violet",
        name: "Crystal Violet",
        color: "#4a044e",
        lambdaMax: 590,
        epsilon: 87000,
        pathLength: 1,
        standards: [0.5, 1.0, 1.5, 2.0, 2.5],
        unknown: 1.8,
        unit: "µM",
    },
];

const TUTORIAL_SLIDES = [
    {
        emoji: "🌈",
        title: "What is UV‑Vis Spectrophotometry?",
        text: "UV-Visible Spectrophotometry is an analytical technique that measures the amount of ultraviolet or visible light absorbed by a sample. By measuring this absorbance, we can determine the concentration of a specific substance in a solution.",
    },
    {
        emoji: "📐",
        title: "The Beer‑Lambert Law",
        text: "The fundamental principle behind UV-Vis is the Beer-Lambert Law: A = ε·c·l. Absorbance (A) is directly proportional to the molar absorptivity (ε), the concentration (c), and the path length of the cuvette (l).",
    },
    {
        emoji: "🔬",
        title: "Instrument Components",
        text: "A spectrophotometer consists of a Light Source, a Monochromator (to select a specific wavelength), a Sample Chamber (holding the cuvette), and a Detector that measures the light passing through the sample.",
    },
    {
        emoji: "📈",
        title: "Calibration Curve",
        text: "To find the concentration of an unknown sample, we first measure the absorbance of standard solutions with known concentrations. We plot these points to create a Calibration Curve (a straight line), then use it to determine our unknown.",
    },
];

const QUIZ_QUESTIONS = [
    {
        question: "What does UV‑Vis spectroscopy directly measure?",
        options: ["Temperature", "Absorbance of light", "Mass of the sample", "pH of the solution"],
        correctIndex: 1,
    },
    {
        question: "According to the Beer‑Lambert law, absorbance is directly proportional to:",
        options: ["Volume", "Wavelength", "Concentration", "Viscosity"],
        correctIndex: 2,
    },
    {
        question: "What is the primary purpose of a monochromator?",
        options: ["To hold the sample", "To select a specific wavelength of light", "To display the results", "To generate light"],
        correctIndex: 1,
    },
    {
        question: "Why do we construct a calibration curve?",
        options: ["To calibrate the light source", "To verify the path length", "To relate absorbance to concentration for unknown samples", "To determine the molar mass of the compound"],
        correctIndex: 2,
    },
];

// --- Helper Functions ---
const generateAbsorbance = (w: number, lambdaMax: number, maxAbs: number) => {
    const sigma = 35;
    const baseAbs = maxAbs * Math.exp(-Math.pow(w - lambdaMax, 2) / (2 * sigma * sigma));
    const noise = (Math.random() - 0.5) * 0.005;
    return Math.max(0, baseAbs + noise);
};

// --- Main Component ---
export default function UVVisLabPage() {
    const [phase, setPhase] = useState<Phase>("tutorial");
    const [currentSlide, setCurrentSlide] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [quizFinished, setQuizFinished] = useState(false);
    const [toastMsg, setToastMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
    const [step, setStep] = useState(1);
    const [selectedSample, setSelectedSample] = useState<Sample | null>(null);
    const [cuvetteType, setCuvetteType] = useState<CuvetteType>(null);
    const [pipetteFilled, setPipetteFilled] = useState(false);
    const [cuvetteFillLevel, setCuvetteFillLevel] = useState(0);
    const [isCapped, setIsCapped] = useState(false);
    const [cuvetteLoaded, setCuvetteLoaded] = useState(false);
    const [lidOpen, setLidOpen] = useState(true);
    const [wavelength, setWavelength] = useState(200);
    const [isScanning, setIsScanning] = useState(false);
    const [spectrumData, setSpectrumData] = useState<{ wavelength: number; absorbance: number }[]>([]);
    const [studentLambdaMax, setStudentLambdaMax] = useState<string>("");
    const [studentAbsorbance, setStudentAbsorbance] = useState<string>("");
    const [scanValidated, setScanValidated] = useState(false);
    const [calibrationData, setCalibrationData] = useState<{ concentration: number; absorbance: number }[]>([]);
    const [measuredStandards, setMeasuredStandards] = useState<number[]>([]);
    const [currentStandardIndex, setCurrentStandardIndex] = useState<number | null>(null);
    const [studentUnknownConc, setStudentUnknownConc] = useState<string>("");
    const [calibrationValidated, setCalibrationValidated] = useState(false);

    const showToast = (text: string, type: "success" | "error") => {
        setToastMsg({ text, type });
        setTimeout(() => setToastMsg(null), 3000);
    };

    const getAbs = (w: number, c: number) => {
        if (!selectedSample) return 0;
        let concInMolar = c;
        if (selectedSample.unit === "mM") concInMolar = c * 1e-3;
        if (selectedSample.unit === "µM") concInMolar = c * 1e-6;
        const peakA = selectedSample.epsilon * concInMolar * selectedSample.pathLength;
        return generateAbsorbance(w, selectedSample.lambdaMax, peakA);
    };

    const currentReading = isScanning
        ? getAbs(wavelength, selectedSample?.unknown || 0)
        : 0.0;

    useEffect(() => {
        if (isScanning && step === 4) {
            const interval = setInterval(() => {
                setWavelength((prev) => {
                    if (prev >= 900) {
                        setIsScanning(false);
                        return 900;
                    }
                    const nextW = prev + 5;
                    const abs = getAbs(nextW, selectedSample?.unknown || 0);
                    setSpectrumData((data) => [...data, { wavelength: nextW, absorbance: abs }]);
                    return nextW;
                });
            }, 50);
            return () => clearInterval(interval);
        }
    }, [isScanning, step, selectedSample]);

    const generatePDF = () => {
        if (!selectedSample) return;
        const doc = new jsPDF();
        doc.setFillColor(37, 99, 235);
        doc.rect(0, 0, 210, 30, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.text("PharmaWallah E-Learning", 15, 20);
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(16);
        doc.text("UV-Visible Spectrophotometry Lab Report", 15, 45);
        doc.setFontSize(12);
        doc.text(`Sample: ${selectedSample.name}`, 15, 60);
        doc.text(`Cuvette Type: ${cuvetteType === 'quartz' ? 'Quartz' : 'Plastic'}`, 15, 68);
        doc.text(`Recorded λmax: ${studentLambdaMax} nm`, 15, 76);
        doc.text(`Maximum Absorbance: ${studentAbsorbance}`, 15, 84);
        doc.setDrawColor(200, 200, 200);
        doc.line(15, 95, 195, 95);
        doc.setFont('helvetica', 'bold');
        doc.text(`Concentration (${selectedSample.unit})`, 20, 102);
        doc.text("Absorbance (A)", 120, 102);
        doc.line(15, 106, 195, 106);
        doc.setFont('helvetica', 'normal');
        let y = 114;
        calibrationData.forEach((row) => {
            doc.text(row.concentration.toFixed(3), 20, y);
            doc.text(row.absorbance.toFixed(3), 120, y);
            y += 8;
        });
        doc.line(15, y, 195, y);
        y += 10;
        doc.setFont('helvetica', 'bold');
        doc.text(`Calculated Unknown Concentration: ${studentUnknownConc} ${selectedSample.unit}`, 15, y + 10);
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text("Generated by PharmaWallah Lab Simulations", 15, 280);
        doc.save("UV_Vis_Report.pdf");
    };

    const handleQuizAnswer = (idx: number) => {
        const isCorrect = idx === QUIZ_QUESTIONS[currentQuestion].correctIndex;
        if (isCorrect) {
            showToast("Correct! Great job.", "success");
            setScore((s) => s + 1);
        } else {
            showToast("Incorrect. Let's keep going!", "error");
        }
        setTimeout(() => {
            if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
                setCurrentQuestion((q) => q + 1);
            } else {
                setQuizFinished(true);
            }
        }, 1500);
    };

    const validateScan = () => {
        if (!selectedSample) return;
        const lambdaNum = parseFloat(studentLambdaMax);
        const absNum = parseFloat(studentAbsorbance);
        const truePeakA = getAbs(selectedSample.lambdaMax, selectedSample.unknown);
        if (Math.abs(lambdaNum - selectedSample.lambdaMax) <= 10 && Math.abs(absNum - truePeakA) <= 0.1) {
            showToast("Perfect! Values match the spectrum.", "success");
            setScanValidated(true);
        } else {
            showToast("Values are incorrect. Check the peak of the graph again.", "error");
        }
    };

    const validateCalibration = () => {
        if (!selectedSample) return;
        const studentConc = parseFloat(studentUnknownConc);
        const trueConc = selectedSample.unknown;
        if (Math.abs(studentConc - trueConc) / trueConc <= 0.1) {
            showToast("Excellent! Your calculation is correct.", "success");
            setCalibrationValidated(true);
        } else {
            showToast(`Not quite. Try reading the graph at absorbance = ${getAbs(selectedSample.lambdaMax, selectedSample.unknown).toFixed(3)}.`, "error");
        }
    };

    const measureStandard = (index: number) => {
        if (!selectedSample || measuredStandards.includes(index)) return;
        setCurrentStandardIndex(index);
        setLidOpen(false);
        setTimeout(() => {
            const conc = selectedSample.standards[index];
            const abs = getAbs(selectedSample.lambdaMax, conc);
            setCalibrationData((prev) => [...prev, { concentration: conc, absorbance: abs }].sort((a, b) => a.concentration - b.concentration));
            setMeasuredStandards((prev) => [...prev, index]);
            setLidOpen(true);
            setCurrentStandardIndex(null);
        }, 1200);
    };

    const regressionData = () => {
        if (calibrationData.length < 2) return [];
        const maxA = calibrationData[calibrationData.length - 1].absorbance;
        const maxC = calibrationData[calibrationData.length - 1].concentration;
        return [
            { concentration: 0, regressionLine: 0 },
            { concentration: maxC, regressionLine: maxA }
        ];
    };

    // --- Tutorial Render (unchanged from original) ---
    const renderTutorial = () => (
        <div className="max-w-2xl mx-auto text-center space-y-8 mt-10">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200"
                >
                    <div className="text-6xl mb-4">{TUTORIAL_SLIDES[currentSlide].emoji}</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">{TUTORIAL_SLIDES[currentSlide].title}</h2>
                    <p className="text-lg text-gray-600 leading-relaxed">{TUTORIAL_SLIDES[currentSlide].text}</p>
                </motion.div>
            </AnimatePresence>
            <div className="flex justify-between items-center px-4">
                <button
                    disabled={currentSlide === 0}
                    onClick={() => setCurrentSlide((s) => s - 1)}
                    className="p-3 text-blue-600 font-bold disabled:opacity-30 flex items-center"
                >
                    <ChevronLeft className="w-5 h-5 mr-1" /> Prev
                </button>
                <div className="flex space-x-2">
                    {TUTORIAL_SLIDES.map((_, i) => (
                        <div key={i} className={`w-3 h-3 rounded-full ${i === currentSlide ? "bg-blue-600" : "bg-gray-300"}`} />
                    ))}
                </div>
                {currentSlide < TUTORIAL_SLIDES.length - 1 ? (
                    <button
                        onClick={() => setCurrentSlide((s) => s + 1)}
                        className="p-3 text-blue-600 font-bold flex items-center"
                    >
                        Next <ChevronRight className="w-5 h-5 ml-1" />
                    </button>
                ) : (
                    <button
                        onClick={() => setPhase("quiz")}
                        className="bg-gradient-to-r from-blue-600 to-green-400 text-white px-6 py-3 rounded-2xl font-bold shadow-md hover:opacity-90 transition"
                    >
                        Take Quiz
                    </button>
                )}
            </div>
        </div>
    );

    // --- Quiz Render (unchanged from original) ---
    const renderQuiz = () => (
        <div className="max-w-2xl mx-auto mt-10">
            {!quizFinished ? (
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Question {currentQuestion + 1} of 4</h2>
                    <h3 className="text-xl font-bold text-gray-800 mb-6">{QUIZ_QUESTIONS[currentQuestion].question}</h3>
                    <div className="space-y-3">
                        {QUIZ_QUESTIONS[currentQuestion].options.map((opt, i) => (
                            <button
                                key={i}
                                onClick={() => handleQuizAnswer(i)}
                                className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition font-medium text-gray-700"
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center">
                    <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Quiz Complete!</h2>
                    <p className="text-lg text-gray-600 mb-8">You scored {score} out of 4.</p>
                    <button
                        onClick={() => {
                            const randomSample = SAMPLES[Math.floor(Math.random() * SAMPLES.length)];
                            setSelectedSample(randomSample);
                            setPhase("simulation");
                        }}
                        className="bg-gradient-to-r from-blue-600 to-green-400 text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:opacity-90 transition text-lg w-full sm:w-auto"
                    >
                        Start UV-Vis Lab Simulation
                    </button>
                </div>
            )}
        </div>
    );

    // --- Simulation Step Renderers (with new SVGs) ---
    const renderSimulationSteps = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                <Beaker className="mr-2 text-blue-600" /> 1. Select Sample
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {SAMPLES.map((s) => (
                                    <button
                                        key={s.id}
                                        onClick={() => setSelectedSample(s)}
                                        className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${selectedSample?.id === s.id ? "border-blue-500 bg-blue-50 scale-105" : "border-gray-200 bg-white hover:border-blue-300"}`}
                                    >
                                        <div className="w-12 h-16 rounded-b-md rounded-t-sm border-2 border-gray-300 relative overflow-hidden">
                                            <div className="absolute bottom-0 w-full h-3/4" style={{ backgroundColor: s.color }}></div>
                                        </div>
                                        <span className="font-semibold text-sm text-center">{s.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={`transition-opacity duration-500 ${selectedSample ? "opacity-100" : "opacity-30 pointer-events-none"}`}>
                            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                <Sun className="mr-2 text-blue-600" /> 2. Select Cuvette
                            </h3>
                            <div className="grid grid-cols-2 gap-4 max-w-md">
                                <button
                                    onClick={() => { setCuvetteType("quartz"); setTimeout(() => setStep(2), 800); }}
                                    className={`p-4 rounded-xl border-2 transition flex items-center justify-center gap-4 ${cuvetteType === "quartz" ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white"}`}
                                >
                                    <CuvetteSVG isQuartz={true} />
                                    <div className="text-left">
                                        <div className="font-bold">Quartz</div>
                                        <div className="text-xs text-gray-500">Transparent to UV</div>
                                    </div>
                                </button>
                                <button
                                    onClick={() => { setCuvetteType("plastic"); setTimeout(() => setStep(2), 800); }}
                                    className={`p-4 rounded-xl border-2 transition flex items-center justify-center gap-4 ${cuvetteType === "plastic" ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white"}`}
                                >
                                    <CuvetteSVG isQuartz={false} />
                                    <div className="text-left">
                                        <div className="font-bold">Plastic</div>
                                        <div className="text-xs text-gray-500">Blocks UV rays</div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                            <Info className="text-blue-600 shrink-0 mt-1" />
                            <p className="text-sm text-blue-800">
                                <strong>Prepare Sample:</strong> Tap the bottle to draw liquid into the pipette, then tap the cuvette to fill it. Cap when done.
                            </p>
                        </div>

                        <div className="flex justify-around items-end h-64 bg-white rounded-2xl border border-gray-200 shadow-sm p-8 relative">
                            <div
                                className="flex flex-col items-center cursor-pointer"
                                onClick={() => setPipetteFilled(true)}
                            >
                                <ReagentBottleSVG liquidColor={selectedSample?.color || "#8b008b"} label={selectedSample?.name || "Sample"} />
                                <div className="mt-2 font-bold text-sm">Unknown Sample</div>
                            </div>

                            <motion.div
                                drag
                                dragSnapToOrigin
                                dragElastic={0.1}
                                dragMomentum={false}
                                onDragEnd={(_, info) => {
                                    if (info.offset.y > 50 && pipetteFilled) {
                                        setCuvetteFillLevel(0.8);
                                        setPipetteFilled(false);
                                    }
                                }}
                                className="absolute top-4 left-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing"
                            >
                                <PipetteSVG filledColor={pipetteFilled ? selectedSample?.color : undefined} fillPercent={0.6} />
                            </motion.div>

                            <div
                                className="flex flex-col items-center cursor-pointer"
                                onClick={() => {
                                    if (pipetteFilled) {
                                        setCuvetteFillLevel(0.8);
                                        setPipetteFilled(false);
                                    }
                                }}
                            >
                                <CuvetteSVG
                                    fillColor={selectedSample?.color}
                                    fillLevel={cuvetteFillLevel}
                                    isQuartz={cuvetteType === "quartz"}
                                    isCapped={isCapped}
                                />
                                <div className="mt-2 font-bold text-sm">Cuvette</div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4">
                            {cuvetteFillLevel > 0 && !isCapped && (
                                <button onClick={() => setIsCapped(true)} className="px-6 py-3 bg-gray-800 text-white rounded-xl font-bold">
                                    Cap Cuvette
                                </button>
                            )}
                            {isCapped && (
                                <button onClick={() => setStep(3)} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-green-400 text-white rounded-xl font-bold flex items-center">
                                    Next Step <ChevronRight className="ml-2 w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                            <p className="text-sm text-blue-800 text-center font-medium">
                                Drag the cuvette into the spectrophotometer sample chamber.
                            </p>
                        </div>

                        <div className="flex flex-col items-center gap-12 bg-white rounded-2xl border border-gray-200 shadow-sm p-8 relative min-h-[400px]">
                            {!cuvetteLoaded && (
                                <motion.div
                                    drag
                                    dragSnapToOrigin
                                    dragElastic={0.1}
                                    dragMomentum={false}
                                    onClick={() => {
                                        setLidOpen(true);
                                        setTimeout(() => {
                                            setCuvetteLoaded(true);
                                            setLidOpen(false);
                                        }, 500);
                                    }}
                                    onDragEnd={(e, info) => {
                                        if (info.offset.y > 50) {
                                            setLidOpen(true);
                                            setTimeout(() => {
                                                setCuvetteLoaded(true);
                                                setLidOpen(false);
                                            }, 500);
                                        }
                                    }}
                                    className="cursor-grab active:cursor-grabbing absolute top-8 z-10"
                                >
                                    <CuvetteSVG fillColor={selectedSample?.color} fillLevel={0.8} isCapped={true} isQuartz={cuvetteType === "quartz"} />
                                </motion.div>
                            )}

                            <div className="mt-24 w-full flex justify-center">
                                <SpectrophotometerSVG
                                    hasCuvette={cuvetteLoaded}
                                    cuvetteColor={selectedSample?.color}
                                    isLidOpen={lidOpen}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            {cuvetteLoaded && !lidOpen && (
                                <button onClick={() => setStep(4)} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-green-400 text-white rounded-xl font-bold flex items-center">
                                    Start Scan <ChevronRight className="ml-2 w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col items-center">
                                <SpectrophotometerSVG
                                    hasCuvette={true}
                                    cuvetteColor={selectedSample?.color}
                                    isLidOpen={false}
                                    wavelength={wavelength}
                                    absorbance={currentReading}
                                    isScanning={isScanning}
                                />
                                <div className="mt-8 flex gap-4 w-full">
                                    <button
                                        onClick={() => {
                                            setWavelength(200);
                                            setSpectrumData([]);
                                            setIsScanning(true);
                                        }}
                                        disabled={isScanning || spectrumData.length > 0}
                                        className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold flex justify-center items-center disabled:opacity-50"
                                    >
                                        <PlayCircle className="mr-2" /> Start Scan
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsScanning(false);
                                            setSpectrumData([]);
                                            setWavelength(200);
                                            setScanValidated(false);
                                        }}
                                        className="p-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition"
                                    >
                                        <RefreshCw />
                                    </button>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col">
                                <h3 className="text-lg font-bold text-gray-800 mb-2">Absorption Spectrum</h3>
                                <div className="h-64 w-full bg-gray-50 border border-gray-100 rounded-lg mb-6 p-2">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={spectrumData}>
                                            <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
                                            <XAxis dataKey="wavelength" domain={[200, 900]} type="number" tickCount={8} label={{ value: "Wavelength (nm)", position: "insideBottom", offset: -5 }} />
                                            <YAxis domain={[0, 1.5]} label={{ value: "Absorbance", angle: -90, position: "insideLeft" }} />
                                            <Tooltip />
                                            <Line type="monotone" dataKey="absorbance" stroke={selectedSample?.color} strokeWidth={3} dot={false} isAnimationActive={false} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                                {spectrumData.length > 50 && (
                                    <div className="space-y-4 animate-in fade-in">
                                        <p className="text-sm text-gray-600">Analyze the graph to find the wavelength of maximum absorbance (λmax).</p>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase">λmax (nm)</label>
                                                <input
                                                    type="number"
                                                    value={studentLambdaMax}
                                                    onChange={(e) => setStudentLambdaMax(e.target.value)}
                                                    disabled={scanValidated}
                                                    className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                    placeholder="e.g. 520"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase">Absorbance</label>
                                                <input
                                                    type="number"
                                                    value={studentAbsorbance}
                                                    onChange={(e) => setStudentAbsorbance(e.target.value)}
                                                    disabled={scanValidated}
                                                    className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                    placeholder="e.g. 0.85"
                                                />
                                            </div>
                                        </div>
                                        {!scanValidated ? (
                                            <button onClick={validateScan} className="w-full py-3 bg-gray-800 text-white font-bold rounded-lg hover:bg-gray-700">
                                                Verify Data
                                            </button>
                                        ) : (
                                            <button onClick={() => setStep(5)} className="w-full py-3 bg-gradient-to-r from-blue-600 to-green-400 text-white font-bold rounded-lg flex justify-center items-center">
                                                Proceed to Calibration <ChevronRight className="ml-2 w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );

            case 5:
                return (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                            <p className="text-sm text-blue-800 font-medium">
                                Tap each standard solution to measure its absorbance at {studentLambdaMax || selectedSample?.lambdaMax} nm. Then find the unknown concentration.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Standard Solutions</h3>
                                <div className="flex flex-wrap justify-center items-end gap-4 pb-4 mb-8 min-h-[150px]">
                                    {selectedSample?.standards.map((conc, i) => {
                                        const opacity = 0.3 + i * 0.15;
                                        return (
                                            <StandardVialSVG
                                                key={i}
                                                concentration={conc}
                                                unit={selectedSample.unit}
                                                liquidColor={selectedSample.color}
                                                opacity={opacity}
                                                measured={measuredStandards.includes(i)}
                                                onClick={() => measureStandard(i)}
                                            />
                                        );
                                    })}
                                </div>
                                <div className="flex justify-center mb-4">
                                    <SpectrophotometerSVG
                                        hasCuvette={currentStandardIndex !== null}
                                        cuvetteColor={selectedSample?.color}
                                        isLidOpen={lidOpen}
                                        wavelength={parseFloat(studentLambdaMax) || selectedSample?.lambdaMax || 0}
                                        absorbance={currentStandardIndex !== null ? getAbs(selectedSample!.lambdaMax, selectedSample!.standards[currentStandardIndex]) : 0}
                                    />
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col">
                                <h3 className="text-lg font-bold text-gray-800 mb-2">Calibration Curve</h3>
                                <div className="h-64 w-full bg-gray-50 border border-gray-100 rounded-lg mb-6 p-2">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ComposedChart>
                                            <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
                                            <XAxis dataKey="concentration" type="number" domain={[0, 'dataMax + 0.1']} label={{ value: `Concentration (${selectedSample?.unit})`, position: "insideBottom", offset: -5 }} />
                                            <YAxis dataKey="absorbance" type="number" domain={[0, 'auto']} label={{ value: "Absorbance", angle: -90, position: "insideLeft" }} />
                                            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                            {calibrationData.length > 1 && (
                                                <Line data={regressionData()} dataKey="regressionLine" stroke="#10b981" strokeWidth={2} dot={false} activeDot={false} isAnimationActive={false} />
                                            )}
                                            <Scatter data={calibrationData} fill="#3b82f6" line={false} />
                                            {calibrationValidated && (
                                                <Scatter data={[{ concentration: parseFloat(studentUnknownConc), absorbance: parseFloat(studentAbsorbance) }]} fill="#ef4444" shape="star" />
                                            )}
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </div>

                                {measuredStandards.length === selectedSample?.standards.length && (
                                    <div className="space-y-4 animate-in fade-in">
                                        <p className="text-sm text-gray-600">The unknown sample's absorbance is <strong className="text-gray-900">{getAbs(selectedSample.lambdaMax, selectedSample.unknown).toFixed(3)}</strong>. Calculate its concentration.</p>
                                        <div className="flex gap-4">
                                            <div className="flex-1">
                                                <input
                                                    type="number"
                                                    value={studentUnknownConc}
                                                    onChange={(e) => setStudentUnknownConc(e.target.value)}
                                                    disabled={calibrationValidated}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                    placeholder={`Conc. (${selectedSample?.unit})`}
                                                />
                                            </div>
                                            {!calibrationValidated ? (
                                                <button onClick={validateCalibration} className="px-6 bg-gray-800 text-white font-bold rounded-lg hover:bg-gray-700">
                                                    Verify
                                                </button>
                                            ) : (
                                                <button onClick={() => setStep(6)} className="px-6 bg-gradient-to-r from-blue-600 to-green-400 text-white font-bold rounded-lg flex items-center">
                                                    Finish <ChevronRight className="ml-1 w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );

            case 6:
                return (
                    <div className="max-w-2xl mx-auto space-y-6 animate-in zoom-in duration-500 mt-10">
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-green-400"></div>
                            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">Lab Completed</h2>
                            <p className="text-gray-600 mb-8">You successfully analyzed {selectedSample?.name}.</p>
                            <div className="grid grid-cols-2 gap-4 text-left bg-gray-50 p-6 rounded-xl border border-gray-100 mb-8">
                                <div>
                                    <span className="text-xs text-gray-500 font-bold uppercase block mb-1">Target λmax</span>
                                    <span className="text-lg font-semibold text-gray-800">{studentLambdaMax} nm</span>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-500 font-bold uppercase block mb-1">Max Absorbance</span>
                                    <span className="text-lg font-semibold text-gray-800">{studentAbsorbance} A</span>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-500 font-bold uppercase block mb-1">Cuvette Type</span>
                                    <span className="text-lg font-semibold text-gray-800 capitalize">{cuvetteType}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-500 font-bold uppercase block mb-1">Unknown Concentration</span>
                                    <span className="text-lg font-semibold text-green-600">{studentUnknownConc} {selectedSample?.unit}</span>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button onClick={generatePDF} className="flex-1 py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition flex items-center justify-center">
                                    <Download className="mr-2 w-5 h-5" /> Download PDF Report
                                </button>
                                <button onClick={() => window.location.reload()} className="flex-1 py-4 bg-gray-200 text-gray-800 font-bold rounded-xl hover:bg-gray-300 transition">
                                    New Experiment
                                </button>
                            </div>
                        </div>
                    </div>
                );

            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4 md:p-8 font-sans pb-20">
            <header className="max-w-5xl mx-auto mb-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-blue-600 to-green-400 p-2 rounded-lg text-white"><FlaskConical className="w-6 h-6" /></div>
                    <h1 className="text-2xl font-black tracking-tight text-gray-900">PharmaWallah <span className="text-blue-600 font-medium">| UV-Vis Spectrophotometry</span></h1>
                </div>
                {phase === "simulation" && (
                    <div className="hidden sm:flex space-x-2">
                        {Array.from({ length: 6 }, (_, i) => (
                            <div key={i} className={`w-8 h-2 rounded-full ${step >= i + 1 ? 'bg-blue-600' : 'bg-gray-200'}`} />
                        ))}
                    </div>
                )}
            </header>
            <main className="max-w-5xl mx-auto">
                {phase === "tutorial" && renderTutorial()}
                {phase === "quiz" && renderQuiz()}
                {phase === "simulation" && renderSimulationSteps()}
            </main>
            <AnimatePresence>
                {toastMsg && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-lg font-bold flex items-center gap-2 z-50 ${toastMsg.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}
                    >
                        {toastMsg.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                        {toastMsg.text}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}