'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import {
    CheckCircle, AlertTriangle, X, ChevronRight, RotateCcw,
    Download, BookOpen, Microscope, Flame, AlertCircle, FileText,
    Menu, ChevronLeft, FlaskConical, Pipette, MoveHorizontal,
    Clock, Info, Star, DoorOpen, DoorClosed, Play, ArrowRight,
    Ruler, Thermometer, ChevronDown, Award, Beaker, Shield,
    HelpCircle, Zap, ArrowLeft, Eye,
} from 'lucide-react';
import jsPDF from 'jspdf';

// ────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────
type Phase = 'tutorial' | 'quiz' | 'sim';
type NotifType = 'success' | 'error' | 'info' | 'warn';

interface Organism {
    id: string; name: string; short: string; gram: string;
    color: string; lawnColor: string; caseStudy: string;
    atcc: string; morphology: string; clinicalNote: string;
    zones: Record<string, number>;
}
interface AntibDisk {
    id: string; name: string; shortClass: string; color: string; bpS: number; bpR: number;
}
interface QuizQ {
    q: string; opts: string[]; correct: number; explanation: string;
}

// ────────────────────────────────────────────────────────────
// DATA
// ────────────────────────────────────────────────────────────
const ORGANISMS: Organism[] = [
    { id: 'ec', name: 'Escherichia coli', short: 'E. coli', gram: 'Gram-negative rod', color: '#dc2626', lawnColor: '#bbf7d0', atcc: 'ATCC 25922', morphology: 'Non-spore-forming, motile, facultative anaerobe', clinicalNote: 'Leading cause of UTI, neonatal meningitis & bacteremia. Watch for ESBL producers.', caseStudy: '45-year-old female with dysuria, frequency, and left flank pain ×3 days. Temp 38.4°C. Urinalysis: pyuria, nitrites +ve. Urine culture growing lactose-fermenting colonies on MacConkey agar.', zones: { AMP: 12, CIP: 28, GEN: 21, TET: 16, CTX: 29 } },
    { id: 'sa', name: 'Staphylococcus aureus', short: 'S. aureus', gram: 'Gram-positive coccus', color: '#d97706', lawnColor: '#fef9c3', atcc: 'ATCC 25923', morphology: 'Grape-like clusters, beta-hemolytic, coagulase-positive', clinicalNote: 'Leading cause of skin/soft-tissue, bone, endovascular infections. Screen for MRSA.', caseStudy: '28-year-old male, painful fluctuant abscess left forearm post-trauma. Wound aspirate: Gram+ve cocci clusters, beta-hemolytic, catalase+ve, coagulase+ve.', zones: { AMP: 8, CIP: 22, GEN: 19, TET: 24, CTX: 31 } },
    { id: 'pa', name: 'Pseudomonas aeruginosa', short: 'P. aeruginosa', gram: 'Gram-negative rod', color: '#16a34a', lawnColor: '#d1fae5', atcc: 'ATCC 27853', morphology: 'Motile non-fermenter, produces pyocyanin (blue-green pigment)', clinicalNote: 'Intrinsically resistant to many antibiotics. Critical in ICU, burns, cystic fibrosis.', caseStudy: '67-year-old male, COPD, intubated in ICU ×5 days. Fever 39°C. Green purulent sputum via ETT. BAL: oxidase+ve non-fermenter, grape-like odour, pyocyanin.', zones: { AMP: 6, CIP: 18, GEN: 15, TET: 10, CTX: 12 } },
];

const DISKS: AntibDisk[] = [
    { id: 'AMP', name: 'Ampicillin', shortClass: 'Penicillin', color: '#2563eb', bpS: 17, bpR: 13 },
    { id: 'CIP', name: 'Ciprofloxacin', shortClass: 'Fluoroquinolone', color: '#db2777', bpS: 21, bpR: 15 },
    { id: 'GEN', name: 'Gentamicin', shortClass: 'Aminoglycoside', color: '#16a34a', bpS: 15, bpR: 12 },
    { id: 'CTX', name: 'Cefotaxime', shortClass: '3rd-gen Ceph', color: '#9333ea', bpS: 26, bpR: 22 },
    { id: 'TET', name: 'Tetracycline', shortClass: 'Tetracycline', color: '#ea580c', bpS: 15, bpR: 11 },
];

const SIM_STEPS = [
    { title: 'Clinical Case & Media', short: 'Media', desc: 'Pour Mueller-Hinton agar (4 mm depth) onto the petri dish.', icon: FlaskConical },
    { title: 'Select Isolate', short: 'Isolate', desc: 'Choose the bacterial organism matching the clinical presentation.', icon: Microscope },
    { title: 'Inoculate Plate', short: 'Inoculate', desc: 'Light the Bunsen burner, then streak the plate 3× at 60° angles.', icon: Flame },
    { title: 'Apply Disks', short: 'Disks', desc: 'Place ≥4 antibiotic disks (≥24 mm apart) on the inoculated agar.', icon: Pipette },
    { title: 'Incubate', short: 'Incubate', desc: 'Open door → slide plate in → close door → start incubation at 35°C/18 h.', icon: Thermometer },
    { title: 'Measure Zones', short: 'Measure', desc: 'Tap each pulsing ring to measure the inhibition zone diameter.', icon: Ruler },
    { title: 'Interpret & Report', short: 'Report', desc: 'Compare zones to CLSI M100 breakpoints and generate your report.', icon: FileText },
];

// Tutorial slides
const TUTORIAL_SLIDES = [
    {
        icon: '🧫', color: 'from-blue-600 to-cyan-500',
        title: 'What is Antibiotic Susceptibility Testing?',
        body: 'Antibiotic Susceptibility Testing (AST) tells clinicians which antibiotics will effectively kill a patient\'s bacterial infection. Without it, treatment is guesswork — leading to failure or resistance.',
        highlight: 'The goal: right drug, right dose, right patient.',
    },
    {
        icon: '💊', color: 'from-purple-600 to-pink-500',
        title: 'The Kirby-Bauer Disk Diffusion Method',
        body: 'Standardised by CLSI, this gold-standard method places paper disks impregnated with known antibiotic concentrations onto a bacteria-covered agar plate. The antibiotic diffuses outward creating a gradient — bacteria unable to grow form a clear "zone of inhibition".',
        highlight: 'Larger zone = more effective antibiotic.',
    },
    {
        icon: '📏', color: 'from-green-600 to-emerald-500',
        title: 'Reading & Interpreting Results',
        body: 'Zones are measured in millimetres and compared to CLSI M100 breakpoints. Results are reported as:\n• S (Susceptible) — antibiotic will likely work\n• I (Intermediate) — may work at higher dose\n• R (Resistant) — antibiotic will likely fail',
        highlight: 'CLSI breakpoints are species- and drug-specific.',
    },
    {
        icon: '⚠️', color: 'from-amber-500 to-orange-500',
        title: 'Critical Pre-Analytical Steps',
        body: 'Accuracy depends entirely on technique:\n• Mueller-Hinton agar must be 4 mm deep, pH 7.2–7.4\n• Inoculum must match 0.5 McFarland turbidity\n• Loop must be flamed to prevent contamination\n• Disks must be ≥24 mm apart (centre-to-centre)',
        highlight: 'One wrong step = invalid result = wrong treatment.',
    },
];

// Pre-simulation quiz
const QUIZ_QUESTIONS: QuizQ[] = [
    {
        q: 'What agar is recommended by CLSI for disk diffusion susceptibility testing?',
        opts: ['Blood agar', 'MacConkey agar', 'Mueller-Hinton agar', 'Sabouraud dextrose agar'],
        correct: 2,
        explanation: 'Mueller-Hinton agar (MHA) is the CLSI standard — it has low levels of thymidine/thymine (which interfere with sulfonamides), and standardised cation content.',
    },
    {
        q: 'What does a large zone of inhibition around an antibiotic disk indicate?',
        opts: ['The bacterium is resistant', 'The agar is too thin', 'The bacterium is susceptible', 'The disk is faulty'],
        correct: 2,
        explanation: 'A large clear zone means bacterial growth was inhibited far from the disk — the antibiotic reached inhibitory concentrations across a wide area, indicating susceptibility.',
    },
    {
        q: 'Why must the inoculation loop be flamed before streaking the plate?',
        opts: ['To add nutrients', 'To prevent contamination from external organisms', 'To warm the agar', 'To activate the culture'],
        correct: 1,
        explanation: 'Flaming destroys residual organisms on the loop. Streaking without flaming introduces contaminants that invalidate zone measurements and produce false results.',
    },
    {
        q: 'What is the minimum centre-to-centre distance between two antibiotic disks?',
        opts: ['10 mm', '15 mm', '24 mm', '30 mm'],
        correct: 2,
        explanation: 'CLSI mandates ≥24 mm between disk centres to prevent overlapping zones that would make measurement impossible and results uninterpretable.',
    },
];

// ────────────────────────────────────────────────────────────
// PDF GENERATOR
// ────────────────────────────────────────────────────────────
const generatePDF = (
    org: Organism | null, placedDisks: string[], measuredZones: Record<string, number>,
    calcZone: (id: string) => number, interp: (id: string, z: number) => string,
    score: number, grade: string
) => {
    const doc = new jsPDF(); const W = doc.internal.pageSize.getWidth(); const H = doc.internal.pageSize.getHeight();
    doc.setFillColor(37, 99, 235); doc.rect(0, 0, W, 32, 'F');
    doc.setFillColor(22, 163, 74); doc.rect(0, 29, W, 4, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(20); doc.setFont('helvetica', 'bold');
    doc.text('PharmaWallah', 15, 16);
    doc.setFontSize(9); doc.setFont('helvetica', 'normal');
    doc.text('Clinical Microbiology — Antimicrobial Susceptibility Report', 15, 26);
    doc.text(new Date().toLocaleString('en-PK'), W - 15, 16, { align: 'right' });
    doc.setTextColor(30, 41, 59); doc.setFontSize(14); doc.setFont('helvetica', 'bold');
    doc.text('Susceptibility Test Report', 15, 48);
    doc.setFillColor(248, 250, 252); doc.roundedRect(15, 54, W - 30, 40, 3, 3, 'F');
    doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.text('Clinical Case:', 20, 63);
    doc.setFont('helvetica', 'normal');
    const cl = doc.splitTextToSize(org?.caseStudy || '', W - 50); doc.text(cl, 20, 70);
    doc.setFont('helvetica', 'bold'); doc.text(`Isolate: ${org?.name || ''}`, 20, 88);
    doc.setFont('helvetica', 'normal'); doc.text(`${org?.gram || ''}  ·  ${org?.atcc || ''}`, 20, 94);
    doc.setFontSize(12); doc.setFont('helvetica', 'bold'); doc.text('Susceptibility Results', 15, 110);
    doc.setFillColor(241, 245, 249); doc.rect(15, 114, W - 30, 8, 'F');
    doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(100, 116, 139);
    ['Antibiotic', 'Class', 'Zone (mm)', 'Breakpoints', 'Interpretation'].forEach((h, i) => doc.text(h, [18, 65, 100, 128, 158][i], 120));
    let y = 128;
    placedDisks.forEach((id, i) => {
        const d = DISKS.find(x => x.id === id)!; const z = measuredZones[id] || calcZone(id);
        const r = interp(id, z); const rt = r === 'S' ? 'Susceptible' : r === 'R' ? 'Resistant' : 'Intermediate';
        if (i % 2 === 0) { doc.setFillColor(249, 250, 251); doc.rect(15, y - 5, W - 30, 9, 'F'); }
        doc.setTextColor(30, 41, 59); doc.setFont('helvetica', 'bold'); doc.text(d.name, 18, y);
        doc.setFont('helvetica', 'normal'); doc.text(d.shortClass, 65, y); doc.text(`${z}`, 104, y);
        doc.text(`S≥${d.bpS}  R≤${d.bpR}`, 128, y);
        const rc = r === 'S' ? [34, 197, 94] : r === 'R' ? [239, 68, 68] : [245, 158, 11];
        doc.setTextColor(rc[0], rc[1], rc[2]); doc.setFont('helvetica', 'bold'); doc.text(rt, 158, y); y += 9;
    });
    y += 6; doc.setFillColor(239, 246, 255); doc.roundedRect(15, y, W - 30, 28, 3, 3, 'F');
    doc.setTextColor(30, 41, 59); doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.text('Clinical Interpretation:', 20, y + 8);
    doc.setFont('helvetica', 'normal'); const cn = doc.splitTextToSize(org?.clinicalNote || '', W - 50); doc.text(cn, 20, y + 15);
    doc.setFillColor(241, 245, 249); doc.rect(0, H - 22, W, 22, 'F');
    doc.setTextColor(100, 116, 139); doc.setFontSize(8);
    doc.text(`Score: ${score}/500  ·  Grade: ${grade}  ·  CLSI M100`, 15, H - 13);
    doc.text("PharmaWallah – Pakistan's Leading Pharmacy eLearning Platform", W / 2, H - 6, { align: 'center' });
    doc.save(`PharmaWallah_AST_${org?.id || 'report'}_${Date.now()}.pdf`);
};

// ────────────────────────────────────────────────────────────
// PETRI DISH SVG
// ────────────────────────────────────────────────────────────
function PetriDish({ org, placedDisks, diskPositions, measuredZones, streaks, agarPoured, incubDone, calcZone, interp, step, onZoneClick, measuringId }: {
    org: Organism | null; placedDisks: string[]; diskPositions: Record<string, { x: number; y: number }>;
    measuredZones: Record<string, number>; streaks: number; agarPoured: boolean; incubDone: boolean;
    calcZone: (id: string) => number; interp: (id: string, z: number) => string; step: number;
    onZoneClick: (id: string) => void; measuringId: string | null;
}) {
    const lawnAlpha = streaks === 0 ? 0 : streaks === 1 ? 0.15 : streaks === 2 ? 0.35 : incubDone ? 0.82 : 0.52;
    const n = placedDisks.length;
    const pos = (idx: number) => {
        const p = diskPositions[placedDisks[idx]]; if (p) return p;
        const a = (idx / n) * Math.PI * 2 - Math.PI / 4;
        return { x: 26 * Math.cos(a), y: 26 * Math.sin(a) };
    };
    return (
        <svg viewBox="0 0 200 200" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <radialGradient id="rim" cx="42%" cy="35%" r="60%"><stop offset="0%" stopColor="#f8fafc" /><stop offset="55%" stopColor="#e2e8f0" /><stop offset="100%" stopColor="#94a3b8" /></radialGradient>
                <radialGradient id="agar" cx="40%" cy="38%" r="62%">
                    <stop offset="0%" stopColor={agarPoured ? '#fefce8' : '#f8fafc'} />
                    <stop offset="50%" stopColor={agarPoured ? '#fef9c3' : '#f1f5f9'} />
                    <stop offset="100%" stopColor={agarPoured ? '#fde68a' : '#e2e8f0'} />
                </radialGradient>
                <radialGradient id="lawn" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor={org?.lawnColor || '#86efac'} stopOpacity="0.9" /><stop offset="100%" stopColor={org?.color || '#16a34a'} stopOpacity="0.6" /></radialGradient>
                <radialGradient id="dgrad" cx="35%" cy="30%" r="60%"><stop offset="0%" stopColor="#fff" /><stop offset="100%" stopColor="#f1f5f9" /></radialGradient>
                <linearGradient id="glare" x1="20%" y1="15%" x2="55%" y2="45%"><stop offset="0%" stopColor="rgba(255,255,255,0.65)" /><stop offset="100%" stopColor="rgba(255,255,255,0)" /></linearGradient>
                <linearGradient id="grrim" x1="15%" y1="10%" x2="50%" y2="40%"><stop offset="0%" stopColor="rgba(255,255,255,0.45)" /><stop offset="100%" stopColor="rgba(255,255,255,0)" /></linearGradient>
                <filter id="pshadow"><feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#0f172a" floodOpacity="0.2" /></filter>
                <filter id="dshadow"><feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#0f172a" floodOpacity="0.28" /></filter>
                <filter id="zshadow"><feDropShadow dx="0" dy="1" stdDeviation="3" floodColor="#0f172a" floodOpacity="0.07" /></filter>
                <clipPath id="plate"><circle cx="100" cy="100" r="88" /></clipPath>
                <clipPath id="inner"><circle cx="100" cy="100" r="82" /></clipPath>
            </defs>

            <circle cx="100" cy="100" r="96" fill="url(#rim)" stroke="#94a3b8" strokeWidth="1.5" filter="url(#pshadow)" />
            <circle cx="100" cy="100" r="88" fill="url(#agar)" />
            {agarPoured && <><circle cx="100" cy="100" r="88" fill="none" stroke="rgba(180,160,80,0.07)" strokeWidth="1" /><circle cx="100" cy="100" r="68" fill="none" stroke="rgba(180,160,80,0.05)" strokeWidth="0.8" /></>}

            {/* Lawn */}
            {agarPoured && org && lawnAlpha > 0 && <>
                <circle cx="100" cy="100" r="88" fill="url(#lawn)" fillOpacity={lawnAlpha} clipPath="url(#inner)" />
                {streaks >= 1 && <path d="M30,90 Q60,72 100,85 Q140,98 170,80" stroke={org.color} strokeWidth="2" fill="none" strokeOpacity="0.22" clipPath="url(#inner)" strokeLinecap="round" />}
                {streaks >= 2 && <path d="M35,115 Q70,130 100,118 Q135,106 165,122" stroke={org.color} strokeWidth="2" fill="none" strokeOpacity="0.22" clipPath="url(#inner)" strokeLinecap="round" />}
                {streaks >= 3 && <>
                    <path d="M50,75 Q80,55 100,70 Q122,87 150,68" stroke={org.color} strokeWidth="2" fill="none" strokeOpacity="0.18" clipPath="url(#inner)" strokeLinecap="round" />
                    <path d="M50,130 Q80,148 100,135 Q122,122 155,140" stroke={org.color} strokeWidth="2" fill="none" strokeOpacity="0.18" clipPath="url(#inner)" strokeLinecap="round" />
                    {Array.from({ length: 28 }, (_, i) => { const a = i * 23, r2 = 18 + Math.sin(i * 5) * 52; return <circle key={i} cx={100 + r2 * Math.cos(a)} cy={100 + r2 * Math.sin(a)} r={0.7 + Math.sin(i) * 0.5} fill={org.color} fillOpacity={0.28 * lawnAlpha} /> })}
                </>}
            </>}

            {/* Inhibition zones */}
            {incubDone && placedDisks.map((id, idx) => {
                const dk = DISKS.find(d => d.id === id)!; const zone = calcZone(id);
                const p = pos(idx); const px = 100 + p.x * 1.8, py = 100 + p.y * 1.8;
                const rPx = zone * 1.65; const measured = id in measuredZones;
                const res = interp(id, zone); const col = res === 'S' ? '#16a34a' : res === 'R' ? '#dc2626' : '#d97706';
                if (rPx < 8) return null;
                return (
                    <g key={id + '-z'} filter="url(#zshadow)">
                        <circle cx={px} cy={py} r={rPx} fill="#fefce8" fillOpacity="0.86" clipPath="url(#inner)" />
                        <circle cx={px} cy={py} r={rPx} fill="none" stroke={measured ? col : 'rgba(148,163,184,0.45)'} strokeWidth={measured ? 1.5 : 0.8} strokeDasharray={measured ? "4,3" : "3,3"} />
                        <circle cx={px} cy={py} r={rPx - 2} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.8" />
                        {measured && <>
                            <line x1={px - rPx} y1={py} x2={px + rPx} y2={py} stroke={col} strokeWidth="0.9" strokeDasharray="3,2" opacity="0.75" />
                            <line x1={px - rPx} y1={py - 4} x2={px - rPx} y2={py + 4} stroke={col} strokeWidth="1.4" />
                            <line x1={px + rPx} y1={py - 4} x2={px + rPx} y2={py + 4} stroke={col} strokeWidth="1.4" />
                        </>}
                    </g>
                );
            })}

            {/* Disks */}
            {placedDisks.map((id, idx) => {
                const dk = DISKS.find(d => d.id === id)!; const zone = calcZone(id);
                const p = pos(idx); const px = 100 + p.x * 1.8, py = 100 + p.y * 1.8;
                const measured = id in measuredZones; const res = interp(id, zone);
                const col = res === 'S' ? '#16a34a' : res === 'R' ? '#dc2626' : '#d97706';
                const canMeasure = step === 5 && incubDone && !measured;
                return (
                    <g key={id + '-d'} filter="url(#dshadow)">
                        {canMeasure && <circle cx={px} cy={py} r="24" fill="rgba(59,130,246,0.06)" stroke="rgba(59,130,246,0.6)" strokeWidth="1.8" strokeDasharray="4,3" style={{ cursor: 'pointer', animation: 'pulse-z 1.5s ease-in-out infinite' }} onClick={() => onZoneClick(id)} />}
                        {measuringId === id && <circle cx={px} cy={py} r="24" fill="rgba(59,130,246,0.14)" stroke="#3b82f6" strokeWidth="2" />}
                        <circle cx={px} cy={py} r="11" fill="url(#dgrad)" stroke={dk.color} strokeWidth="2.5" />
                        <circle cx={px} cy={py} r="7" fill={dk.color} fillOpacity="0.11" />
                        <circle cx={px} cy={py} r="3" fill={dk.color} fillOpacity="0.28" />
                        <text x={px} y={py + 1.5} fontSize="5.5" textAnchor="middle" dominantBaseline="middle" fill={dk.color} fontWeight="900" fontFamily="system-ui">{id}</text>
                        <circle cx={px - 3} cy={py - 3} r="2.5" fill="rgba(255,255,255,0.48)" />
                        {measured && incubDone && <>
                            <rect x={px - 13} y={py + 13} width="26" height="8" rx="4" fill={col} />
                            <text x={px} y={py + 17.5} fontSize="4.5" textAnchor="middle" dominantBaseline="middle" fill="white" fontWeight="800" fontFamily="system-ui">{zone}mm·{res}</text>
                        </>}
                    </g>
                );
            })}

            {!agarPoured && <text x="100" y="105" fontSize="10" textAnchor="middle" fill="#94a3b8" fontFamily="system-ui">Empty Petri Dish</text>}
            <circle cx="100" cy="100" r="88" fill="url(#glare)" clipPath="url(#inner)" />
            <circle cx="100" cy="100" r="95" fill="url(#grrim)" clipPath="url(#plate)" />
            <circle cx="100" cy="100" r="88" fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth="3.5" />
        </svg>
    );
}

// ────────────────────────────────────────────────────────────
// INCUBATOR SVG
// ────────────────────────────────────────────────────────────
function IncubatorSVG({ progress, org, disks, done, doorOpen, plateLoaded }: {
    progress: number; org: Organism | null; disks: string[]; done: boolean; doorOpen: boolean; plateLoaded: boolean;
}) {
    return (
        <svg viewBox="0 0 180 210" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="ib" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#e7e5e4" /><stop offset="100%" stopColor="#d6d3d1" /></linearGradient>
                <linearGradient id="ip" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#2563eb" /><stop offset="100%" stopColor="#16a34a" /></linearGradient>
                <filter id="ish"><feDropShadow dx="1" dy="3" stdDeviation="4" floodColor="#0f172a" floodOpacity="0.18" /></filter>
            </defs>
            <rect x="4" y="4" width="172" height="202" rx="12" fill="url(#ib)" stroke="#a8a29e" strokeWidth="1.5" filter="url(#ish)" />
            <rect x="4" y="4" width="172" height="24" rx="12" fill="#44403c" />
            <rect x="4" y="18" width="172" height="10" fill="#44403c" />
            <text x="90" y="19" fontSize="8" textAnchor="middle" fill="#a8a29e" fontFamily="system-ui" fontWeight="700" letterSpacing="2">PHARMAWALLAH</text>
            <text x="90" y="29" fontSize="5" textAnchor="middle" fill="#78716c" fontFamily="monospace">INCUBATOR 35°C</text>
            {/* Door frame */}
            <rect x="14" y="34" width="152" height="130" rx="8" fill="#57534e" stroke="#44403c" strokeWidth="1.5" />
            {/* Interior */}
            <rect x="18" y="38" width="144" height="122" rx="6" fill="#1c1917" />
            <rect x="20" y="40" width="140" height="118" rx="5" fill="#292524" />
            <rect x="22" y="110" width="136" height="5" rx="2" fill="#44403c" />
            {progress > 0 && <rect x="20" y="40" width="140" height="118" rx="5" fill="#f59e0b" fillOpacity={0.04 + progress / 100 * 0.08} />}
            {/* Plate inside when loaded and door closed */}
            {plateLoaded && !doorOpen && org && (
                <g transform="translate(90,95)">
                    <ellipse cx="0" cy="0" rx="42" ry="16" fill="#fef9c3" stroke="#d1d5db" strokeWidth="1.2" />
                    <ellipse cx="0" cy="-3" rx="40" ry="14" fill={org.lawnColor} fillOpacity={done ? 0.8 : 0.35 + progress / 100 * 0.45} />
                    {disks.slice(0, 5).map((id, i) => {
                        const d = DISKS.find(x => x.id === id)!; const a = (i / disks.length) * Math.PI * 2;
                        const px = 18 * Math.cos(a), py = 7 * Math.sin(a) - 2; const z = org.zones[id] || 0;
                        return <g key={id}>{done && z > 0 && <circle cx={px} cy={py} r={z * 0.45} fill="white" fillOpacity="0.5" />}<circle cx={px} cy={py} r="5" fill="white" stroke={d.color} strokeWidth="1.5" /><text x={px} y={py + 1} fontSize="2.8" textAnchor="middle" fill={d.color} fontWeight="900">{id}</text></g>;
                    })}
                    {done && <text x="0" y="22" fontSize="4" textAnchor="middle" fill="#4ade80" fontWeight="700">Complete ✓</text>}
                </g>
            )}
            {/* Door open state */}
            {doorOpen && <>
                <text x="90" y="85" fontSize="7.5" textAnchor="middle" fill="#78716c" fontFamily="system-ui">Door Open</text>
                <text x="90" y="97" fontSize="6" textAnchor="middle" fill="#57534e" fontFamily="system-ui">{plateLoaded ? 'Plate loaded ✓' : 'Tap "Load Plate" button'}</text>
                <ellipse cx="90" cy="112" rx="42" ry="16" fill={plateLoaded ? '#16a34a22' : 'none'} stroke={plateLoaded ? '#16a34a' : '#3b82f6'} strokeWidth="1.5" strokeDasharray={plateLoaded ? 'none' : '4,3'} opacity="0.6" />
                {plateLoaded && <text x="90" y="116" fontSize="5" textAnchor="middle" fill="#16a34a" fontWeight="700">🧫 Plate inside</text>}
            </>}
            {/* Animated door */}
            <motion.g animate={{ rotateY: doorOpen ? -65 : 0, x: doorOpen ? -28 : 0 }} transition={{ type: 'spring', stiffness: 180, damping: 22 }} style={{ transformOrigin: '18px 100px' }}>
                <rect x="14" y="34" width="152" height="130" rx="8" fill={doorOpen ? 'rgba(186,230,253,0.12)' : 'rgba(186,230,253,0.22)'} stroke="#94a3b8" strokeWidth="1" />
                {!doorOpen && <><rect x="24" y="44" width="36" height="56" rx="4" fill="white" opacity="0.07" /><line x1="28" y1="50" x2="54" y2="94" stroke="white" strokeWidth="0.5" opacity="0.1" /></>}
                <rect x="156" y="82" width="8" height="36" rx="3" fill="#94a3b8" stroke="#64748b" strokeWidth="1" />
                <rect x="157" y="87" width="6" height="26" rx="2" fill="#cbd5e1" />
            </motion.g>
            {/* Vents */}
            {[0, 1, 2, 3].map(i => <line key={i} x1="162" y1={46 + i * 16} x2="168" y2={46 + i * 16} stroke="#a8a29e" strokeWidth="1.5" strokeLinecap="round" />)}
            {/* Control panel */}
            <rect x="4" y="170" width="172" height="36" fill="#1c1917" />
            <rect x="4" y="200" width="172" height="6" fill="#1c1917" />
            <rect x="10" y="175" width="96" height="24" rx="3" fill="#0f172a" stroke="#334155" strokeWidth="1" />
            <text x="58" y="185" fontSize="6.5" textAnchor="middle" fill="#4ade80" fontFamily="monospace">TEMP: 35.0°C</text>
            <text x="58" y="194" fontSize="6.5" textAnchor="middle" fill={done ? '#4ade80' : '#fbbf24'} fontFamily="monospace">
                {done ? 'COMPLETE ✓' : progress > 0 ? `${Math.round(progress)}% · ${(progress / 100 * 18).toFixed(1)}h` : 'STANDBY'}
            </text>
            {[['PWR', '#4ade80'], ['HEAT', progress > 0 ? '#f97316' : '#374151'], ['DONE', done ? '#4ade80' : '#374151']].map(([l, c], i) => (
                <g key={l as string}><circle cx={116 + i * 18} cy={182} r="4" fill={c as string} /><text x={116 + i * 18} y="193" fontSize="3.5" textAnchor="middle" fill="#6b7280" fontFamily="system-ui">{l}</text></g>
            ))}
            <rect x="10" y="200" width="160" height="4" rx="2" fill="#374151" />
            <rect x="10" y="200" width={160 * (progress / 100)} height="4" rx="2" fill="url(#ip)" />
        </svg>
    );
}

// ────────────────────────────────────────────────────────────
// EQUIPMENT SVGs
// ────────────────────────────────────────────────────────────
function BunsenSVG({ lit }: { lit: boolean }) {
    return (
        <svg viewBox="0 0 80 130" width="80" height="130" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="bbg" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#78716c" /><stop offset="50%" stopColor="#a8a29e" /><stop offset="100%" stopColor="#78716c" /></linearGradient>
                <linearGradient id="bbbase" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#57534e" /><stop offset="50%" stopColor="#78716c" /><stop offset="100%" stopColor="#57534e" /></linearGradient>
                {lit && <filter id="fglow"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>}
            </defs>
            {lit && <>
                <ellipse cx="40" cy="18" rx="10" ry="16" fill="#f97316" fillOpacity="0.9" filter="url(#fglow)" />
                <ellipse cx="40" cy="22" rx="7" ry="12" fill="#fbbf24" fillOpacity="0.95" />
                <ellipse cx="40" cy="26" rx="4" ry="8" fill="#fef3c7" />
                <ellipse cx="40" cy="30" rx="2" ry="4" fill="#fff" />
            </>}
            <rect x="30" y="34" width="20" height="62" rx="4" fill="url(#bbg)" />
            <rect x="31" y="35" width="5" height="60" rx="2" fill="rgba(255,255,255,0.16)" />
            <rect x="28" y="56" width="24" height="10" rx="3" fill="#57534e" />
            <circle cx="56" cy="76" r="6" fill="#78716c" stroke="#57534e" strokeWidth="1" />
            <line x1="52" y1="76" x2="60" y2="76" stroke="#a8a29e" strokeWidth="1.5" />
            <rect x="15" y="104" width="50" height="18" rx="5" fill="url(#bbbase)" />
            <path d="M40,122 Q20,126 10,124" stroke="#78716c" strokeWidth="5" fill="none" strokeLinecap="round" />
        </svg>
    );
}

function AgarBottle({ selected }: { selected: boolean }) {
    return (
        <svg viewBox="0 0 70 160" width="70" height="160" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="aggl" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#d1d5db" /><stop offset="40%" stopColor="#f3f4f6" /><stop offset="100%" stopColor="#9ca3af" /></linearGradient>
                <linearGradient id="aglq" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#d9f99d" /><stop offset="100%" stopColor="#a3e635" /></linearGradient>
                <linearGradient id="aghi" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="rgba(255,255,255,0.7)" /><stop offset="100%" stopColor="rgba(255,255,255,0)" /></linearGradient>
                {selected && <filter id="agsel"><feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#22c55e" floodOpacity="0.8" /></filter>}
            </defs>
            <rect x="24" y="0" width="22" height="24" rx="5" fill="#374151" />
            <rect x="25" y="1" width="7" height="22" rx="3" fill="rgba(255,255,255,0.14)" />
            <rect x="22" y="22" width="26" height="14" rx="4" fill="#6b7280" />
            <rect x="8" y="34" width="54" height="118" rx="12" fill="url(#aggl)" stroke={selected ? '#22c55e' : '#9ca3af'} strokeWidth={selected ? 2.5 : 1.5} filter={selected ? 'url(#agsel)' : undefined} />
            <rect x="12" y="44" width="46" height="100" rx="8" fill="url(#aglq)" fillOpacity="0.85" />
            <line x1="12" y1="44" x2="58" y2="44" stroke="#84cc16" strokeWidth="1.5" />
            <circle cx="24" cy="90" r="4" fill="rgba(255,255,255,0.38)" />
            <circle cx="42" cy="110" r="2.5" fill="rgba(255,255,255,0.32)" />
            <rect x="12" y="60" width="46" height="58" rx="5" fill="white" fillOpacity="0.9" />
            <rect x="13" y="61" width="44" height="56" rx="4" fill="#f0fdf4" stroke="#86efac" strokeWidth="0.8" />
            <text x="35" y="76" fontSize="9" textAnchor="middle" fill="#15803d" fontWeight="900" fontFamily="system-ui">MHA</text>
            <line x1="16" y1="80" x2="54" y2="80" stroke="#86efac" strokeWidth="0.8" />
            <text x="35" y="88" fontSize="5.5" textAnchor="middle" fill="#166534" fontFamily="system-ui">Mueller-Hinton</text>
            <text x="35" y="96" fontSize="5" textAnchor="middle" fill="#15803d" fontFamily="system-ui">Agar · 500 mL</text>
            <text x="35" y="104" fontSize="4.5" textAnchor="middle" fill="#4ade80" fontFamily="system-ui">pH 7.2–7.4</text>
            <rect x="10" y="36" width="10" height="110" rx="6" fill="url(#aghi)" opacity="0.7" />
        </svg>
    );
}

function SwabSVG() {
    return (
        <svg viewBox="0 0 26 150" width="26" height="150" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="swst" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#d6d3d1" /><stop offset="50%" stopColor="#e7e5e4" /><stop offset="100%" stopColor="#a8a29e" /></linearGradient>
                <radialGradient id="swco" cx="40%" cy="35%" r="55%"><stop offset="0%" stopColor="#fffbeb" /><stop offset="70%" stopColor="#fef3c7" /><stop offset="100%" stopColor="#fde68a" /></radialGradient>
            </defs>
            <rect x="11" y="0" width="4" height="115" rx="2" fill="url(#swst)" />
            <rect x="12" y="2" width="1.5" height="112" rx="1" fill="rgba(255,255,255,0.38)" />
            <ellipse cx="13" cy="128" rx="11" ry="20" fill="url(#swco)" stroke="#f59e0b" strokeWidth="0.8" />
            <line x1="4" y1="118" x2="8" y2="122" stroke="rgba(255,255,255,0.65)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="22" y1="119" x2="18" y2="123" stroke="rgba(255,255,255,0.65)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="3" y1="128" x2="7" y2="130" stroke="rgba(255,255,255,0.55)" strokeWidth="1" strokeLinecap="round" />
            <line x1="23" y1="129" x2="19" y2="131" stroke="rgba(255,255,255,0.55)" strokeWidth="1" strokeLinecap="round" />
            <ellipse cx="13" cy="124" rx="6" ry="9" fill="rgba(255,255,255,0.2)" />
        </svg>
    );
}

// ────────────────────────────────────────────────────────────
// CLSI TABLE
// ────────────────────────────────────────────────────────────
function CLSITable({ org, placedDisks, measuredZones, calcZone, interp }: {
    org: Organism | null; placedDisks: string[]; measuredZones: Record<string, number>;
    calcZone: (id: string) => number; interp: (id: string, z: number) => string;
}) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-xs">
                <thead><tr className="border-b border-gray-200">
                    {['Drug', 'S ≥', 'R ≤', 'Zone', 'Result'].map(h => <th key={h} className="text-left py-1.5 px-2 font-semibold text-gray-500 uppercase tracking-wider text-[10px]">{h}</th>)}
                </tr></thead>
                <tbody className="divide-y divide-gray-100">
                    {placedDisks.length === 0 && <tr><td colSpan={5} className="text-center py-4 text-gray-400 text-xs">Place disks to see results</td></tr>}
                    {placedDisks.map(id => {
                        const d = DISKS.find(x => x.id === id)!;
                        const z = measuredZones[id] || (org ? calcZone(id) : 0);
                        const r = z > 0 ? interp(id, z) : '—';
                        const cl = r === 'S' ? 'text-green-700 bg-green-50' : r === 'R' ? 'text-red-700 bg-red-50' : r === 'I' ? 'text-amber-700 bg-amber-50' : 'text-gray-400';
                        return (
                            <tr key={id} className="hover:bg-gray-50">
                                <td className="py-2 px-2"><div className="font-bold text-gray-800">{d.name}</div><div className="text-gray-400 text-[10px]">{d.shortClass}</div></td>
                                <td className="text-center px-1 font-mono text-green-700 font-semibold">{d.bpS}</td>
                                <td className="text-center px-1 font-mono text-red-600 font-semibold">{d.bpR}</td>
                                <td className="text-center px-1 font-mono font-bold text-gray-800">{z > 0 ? z : '—'}</td>
                                <td className="text-center px-1">{r !== '—' && <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${cl}`}>{r}</span>}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

// ────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ────────────────────────────────────────────────────────────
export default function PharmaWallahKirbyBauer() {
    // Phase state
    const [phase, setPhase] = useState<Phase>('tutorial');
    const [tutSlide, setTutSlide] = useState(0);
    const [quizIdx, setQuizIdx] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
    const [quizChosen, setQuizChosen] = useState<number | null>(null);
    const [quizScore, setQuizScore] = useState(0);
    const [quizDone, setQuizDone] = useState(false);

    // Sim state
    const [step, setStep] = useState(0);
    const [score, setScore] = useState(0);
    const [notification, setNotification] = useState<{ msg: string; type: NotifType } | null>(null);
    const [timer, setTimer] = useState(0);
    const [timerActive, setTimerActive] = useState(false);

    const [agarPoured, setAgarPoured] = useState(false);
    const [bottleSelected, setBottleSelected] = useState(false);
    const [selectedOrg, setSelectedOrg] = useState<Organism | null>(null);
    const [flameUsed, setFlameUsed] = useState(false);
    const [streaks, setStreaks] = useState(0);
    const [contaminated, setContaminated] = useState(false);
    const [placedDisks, setPlacedDisks] = useState<string[]>([]);
    const [diskPositions, setDiskPositions] = useState<Record<string, { x: number; y: number }>>({});
    const [pendingDisk, setPendingDisk] = useState<string | null>(null);
    const [doorOpen, setDoorOpen] = useState(false);
    const [plateLoaded, setPlateLoaded] = useState(false);
    const [incubating, setIncubating] = useState(false);
    const [incubProg, setIncubProg] = useState(0);
    const [incubDone, setIncubDone] = useState(false);
    const [measuredZones, setMeasuredZones] = useState<Record<string, number>>({});
    const [measuringId, setMeasuringId] = useState<string | null>(null);
    const [showReport, setShowReport] = useState(false);

    // UI
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'case' | 'materials' | 'protocol' | 'clsi' | 'results'>('case');
    const [isMobile, setIsMobile] = useState(false);

    const plateRef = useRef<HTMLDivElement>(null);
    const incubRef = useRef<HTMLDivElement>(null);

    // Responsive
    useEffect(() => {
        const check = () => {
            const m = window.innerWidth < 768;
            setIsMobile(m);
            if (!m) setMobileDrawerOpen(false);
            if (m) setSidebarOpen(false);
        };
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    // Pulse animation
    useEffect(() => {
        const s = document.createElement('style');
        s.textContent = `@keyframes pulse-z{0%,100%{opacity:0.6;stroke-width:1.5}50%{opacity:1;stroke-width:2.5}}`;
        document.head.appendChild(s);
        return () => {
            document.head.removeChild(s);
        };
    }, []);

    // Timer
    useEffect(() => {
        if (!timerActive) return;
        const id = setInterval(() => setTimer(t => t + 1), 1000);
        return () => clearInterval(id);
    }, [timerActive]);
    useEffect(() => { if (step === 0 && agarPoured) setTimerActive(true); }, [step, agarPoured]);

    // Helpers
    const notify = useCallback((msg: string, type: NotifType = 'info') => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 3000);
    }, []);
    const addScore = useCallback((pts: number, reason?: string) => {
        setScore(p => Math.min(500, p + pts));
        if (reason) notify(`${reason} (+${pts} XP)`, 'success');
    }, [notify]);
    const deductScore = useCallback((pts: number, reason: string) => {
        setScore(p => Math.max(0, p - pts));
        notify(`${reason} (−${pts} XP)`, 'error');
    }, [notify]);

    const calcZone = useCallback((id: string): number => {
        if (!selectedOrg) return 0;
        let b = selectedOrg.zones[id] || 0; if (b === 0) return 0;
        if (contaminated) b -= 2; if (!flameUsed) b -= 1; if (streaks < 3) b -= 1;
        const p = diskPositions[id]; if (p && Math.sqrt(p.x ** 2 + p.y ** 2) > 35) b -= 1;
        return Math.max(6, Math.round(b));
    }, [selectedOrg, contaminated, flameUsed, streaks, diskPositions]);

    const interp = useCallback((id: string, zone: number): string => {
        const d = DISKS.find(x => x.id === id); if (!d) return 'R';
        if (zone >= d.bpS) return 'S'; if (zone <= d.bpR) return 'R'; return 'I';
    }, []);

    const canAdvance = (): boolean => {
        switch (step) {
            case 0: return agarPoured;
            case 1: return selectedOrg !== null;
            case 2: return streaks === 3 && flameUsed && !contaminated;
            case 3: return placedDisks.length >= 4;
            case 4: return incubDone;
            case 5: return Object.keys(measuredZones).length === placedDisks.length && placedDisks.length > 0;
            default: return true;
        }
    };
    const advanceStep = () => {
        if (!canAdvance()) { notify('Complete the current step first.', 'error'); return; }
        if (step === 6) { setShowReport(true); return; }
        setStep(p => p + 1);
    };

    const isValidPlacement = (x: number, y: number, excl?: string): boolean => {
        if (Math.sqrt(x * x + y * y) > 38) { notify('Too close to plate edge (min 15 mm).', 'error'); return false; }
        for (const [id, pos] of Object.entries(diskPositions)) {
            if (id === excl) continue;
            if (Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2) < 18) { notify(`Too close to ${id} — min 24 mm.`, 'error'); return false; }
        }
        return true;
    };

    // ── INTERACTION HANDLERS ───────────────────────────────────

    // Step 0
    const handleBottleClick = () => {
        if (agarPoured) return;
        setBottleSelected(v => { if (!v) notify('Bottle selected — now tap the petri dish to pour.', 'info'); return !v; });
    };
    const handlePlateClick = () => {
        if (step === 0 && bottleSelected && !agarPoured) {
            setAgarPoured(true); setBottleSelected(false);
            addScore(50, 'Mueller-Hinton agar poured');
        }
    };
    const handleAgarDragEnd = (_: unknown, info: PanInfo) => {
        const rect = plateRef.current?.getBoundingClientRect(); if (!rect) return;
        if (Math.hypot(info.point.x - (rect.left + rect.width / 2), info.point.y - (rect.top + rect.height / 2)) < 130) {
            setAgarPoured(true); setBottleSelected(false);
            addScore(50, 'Mueller-Hinton agar poured');
            notify('MHA poured — 4 mm depth, pH 7.2–7.4 ✓', 'success');
        } else notify('Drag the bottle over the petri dish.', 'error');
    };

    // Step 2
    const doStreak = () => {
        if (!flameUsed) { setContaminated(true); deductScore(30, 'Contamination — flame the loop first!'); return; }
        if (streaks >= 3) return;
        setStreaks(s => { const n = s + 1; addScore(25, `Streak ${n}/3`); if (n === 3) notify('Confluent lawn established ✓', 'success'); return n; });
    };
    const handleSwabDragEnd = (_: unknown, info: PanInfo) => {
        const rect = plateRef.current?.getBoundingClientRect(); if (!rect) return;
        if (Math.hypot(info.point.x - (rect.left + rect.width / 2), info.point.y - (rect.top + rect.height / 2)) < 120) doStreak();
        else notify('Drag the swab over the agar surface.', 'error');
    };

    // Step 3
    const handleDiskSelect = (id: string) => {
        if (placedDisks.includes(id)) return;
        setPendingDisk(v => v === id ? null : id);
        notify(`${id} selected — tap "Place on plate" or drag to dish.`, 'info');
    };
    const placePendingDisk = () => {
        if (!pendingDisk || placedDisks.includes(pendingDisk)) return;
        const n = placedDisks.length; const a = (n / 5) * Math.PI * 2 - Math.PI / 4;
        const pos = { x: 26 * Math.cos(a), y: 26 * Math.sin(a) };
        if (isValidPlacement(pos.x, pos.y, pendingDisk)) {
            setDiskPositions(p => ({ ...p, [pendingDisk]: pos }));
            setPlacedDisks(p => [...p, pendingDisk]);
            addScore(25, `${pendingDisk} placed`); setPendingDisk(null);
        }
    };
    const handleDiskDragEnd = (diskId: string, _: unknown, info: PanInfo) => {
        if (placedDisks.includes(diskId)) return;
        const rect = plateRef.current?.getBoundingClientRect(); if (!rect) return;
        if (Math.hypot(info.point.x - (rect.left + rect.width / 2), info.point.y - (rect.top + rect.height / 2)) < 110) {
            const relX = (info.point.x - (rect.left + rect.width / 2)) / (rect.width / 2) * 45;
            const relY = (info.point.y - (rect.top + rect.height / 2)) / (rect.height / 2) * 45;
            if (isValidPlacement(relX, relY, diskId)) {
                setDiskPositions(p => ({ ...p, [diskId]: { x: relX, y: relY } }));
                setPlacedDisks(p => [...p, diskId]); addScore(25, `${diskId} placed`);
                if (pendingDisk === diskId) setPendingDisk(null);
            }
        } else notify(`Drop ${diskId} onto the agar plate.`, 'error');
    };

    // Step 4 — incubator
    const toggleDoor = () => {
        if (incubating) return;
        setDoorOpen(v => {
            notify(v ? 'Door closed.' : 'Door opened — load the plate.', v ? 'info' : 'info');
            return !v;
        });
    };
    const handleLoadPlate = () => {
        if (!doorOpen) { notify('Open the incubator door first.', 'warn'); return; }
        if (plateLoaded) { notify('Plate already loaded.', 'info'); return; }
        setPlateLoaded(true); addScore(25, 'Plate loaded into incubator');
        notify('Plate loaded. Close door → start incubation.', 'success');
    };
    const handlePlateDragEnd = (_: unknown, info: PanInfo) => {
        if (step !== 4 || plateLoaded) return;
        const rect = incubRef.current?.getBoundingClientRect(); if (!rect) return;
        if (info.point.x > rect.left && info.point.x < rect.right && info.point.y > rect.top && info.point.y < rect.bottom) {
            if (!doorOpen) { notify('Open the door first!', 'warn'); return; }
            handleLoadPlate();
        }
    };
    const startIncubation = () => {
        if (!plateLoaded) { notify('Load plate first.', 'error'); return; }
        if (doorOpen) { notify('Close the door before starting.', 'warn'); return; }
        if (incubating || incubDone) return;
        setIncubating(true); notify('Incubation started — 35°C / 18 h.', 'info');
        const iv = setInterval(() => {
            setIncubProg(p => {
                if (p >= 100) { clearInterval(iv); setIncubating(false); setIncubDone(true); addScore(75, 'Incubation complete'); notify('Incubation complete! Zones visible.', 'success'); return 100; }
                return p + 2;
            });
        }, 40);
    };

    // Step 5
    const handleZoneClick = (id: string) => {
        if (step !== 5 || !incubDone || id in measuredZones) return;
        setMeasuringId(id);
        setTimeout(() => {
            const zone = calcZone(id);
            setMeasuredZones(p => ({ ...p, [id]: zone })); setMeasuringId(null);
            addScore(25, `Measured ${id}: ${zone} mm`);
            notify(`Zone recorded: ${zone} mm → ${interp(id, zone)}`, 'success');
        }, 600);
    };

    const resetLab = () => {
        setStep(0); setScore(0); setTimer(0); setTimerActive(false);
        setAgarPoured(false); setBottleSelected(false); setSelectedOrg(null);
        setFlameUsed(false); setStreaks(0); setContaminated(false);
        setPlacedDisks([]); setDiskPositions({}); setPendingDisk(null);
        setDoorOpen(false); setPlateLoaded(false);
        setIncubating(false); setIncubProg(0); setIncubDone(false);
        setMeasuredZones({}); setShowReport(false); setMeasuringId(null);
        notify('Lab reset.', 'info');
    };

    const grade = score >= 450 ? 'A+' : score >= 400 ? 'A' : score >= 350 ? 'B' : score >= 250 ? 'C' : 'F';
    const fmtTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

    // ── QUIZ ──────────────────────────────────────────────────
    const handleQuizAnswer = (optIdx: number) => {
        if (quizChosen !== null) return;
        setQuizChosen(optIdx);
        const correct = QUIZ_QUESTIONS[quizIdx].correct === optIdx;
        if (correct) setQuizScore(s => s + 1);
    };
    const nextQuizQ = () => {
        if (quizIdx < QUIZ_QUESTIONS.length - 1) {
            setQuizIdx(q => q + 1); setQuizChosen(null);
        } else {
            setQuizDone(true);
        }
    };
    const startSim = () => { setPhase('sim'); };

    // ── NOTEBOOK ──────────────────────────────────────────────
    const NotebookSidebar = () => (
        <div className="h-full flex flex-col bg-white overflow-hidden">
            <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-green-400 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-white" /><span className="text-xs font-extrabold text-white uppercase tracking-widest">Lab Notebook</span></div>
                {timerActive && <div className="flex items-center gap-1 bg-white/20 rounded-full px-2 py-0.5"><Clock className="w-3 h-3 text-white" /><span className="text-xs font-mono text-white font-bold">{fmtTime(timer)}</span></div>}
            </div>
            <div className="px-4 py-2 border-b border-gray-100 flex-shrink-0">
                <div className="flex items-center justify-between mb-1"><span className="text-xs text-gray-500 font-medium">Progress</span><span className="text-xs font-black text-gray-800">{score}<span className="text-gray-400 font-normal">/500 XP</span></span></div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><motion.div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-green-400" animate={{ width: `${(score / 500) * 100}%` }} transition={{ duration: 0.5 }} /></div>
                <div className="flex justify-between mt-1"><span className="text-[10px] text-gray-400">Grade: <span className="font-bold text-gray-700">{grade}</span></span><span className="text-[10px] text-gray-400">Step {step + 1}/7</span></div>
            </div>
            <div className="flex border-b border-gray-100 flex-shrink-0 bg-gray-50/50">
                {(['case', 'materials', 'protocol', 'clsi', 'results'] as const).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-2.5 text-[9px] font-bold uppercase tracking-wider transition-all ${activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-gray-400 hover:text-gray-600'}`}>
                        {tab === 'clsi' ? 'CLSI' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {activeTab === 'case' && <>
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3"><div className="flex items-center gap-2 mb-2"><div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center flex-shrink-0"><FileText className="w-3 h-3 text-white" /></div><span className="text-xs font-extrabold text-blue-800 uppercase tracking-wider">Clinical Case</span></div><p className="text-xs text-blue-900 leading-relaxed">{selectedOrg?.caseStudy || ORGANISMS[0].caseStudy}</p></div>
                    {selectedOrg && <div className="bg-white border border-gray-200 rounded-2xl p-3 space-y-2">
                        <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full flex-shrink-0" style={{ background: `${selectedOrg.color}22`, border: `2px solid ${selectedOrg.color}` }} /><div><p className="text-xs font-extrabold text-gray-800 italic">{selectedOrg.name}</p><p className="text-[10px] text-gray-500">{selectedOrg.atcc}</p></div></div>
                        <div className="bg-gray-50 rounded-xl p-2"><p className="text-[10px] font-bold text-gray-600 mb-1">Morphology</p><p className="text-[10px] text-gray-700 leading-relaxed">{selectedOrg.morphology}</p></div>
                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-2"><p className="text-[10px] font-bold text-amber-700 mb-1">Clinical Note</p><p className="text-[10px] text-amber-800 leading-relaxed">{selectedOrg.clinicalNote}</p></div>
                    </div>}
                </>}
                {activeTab === 'materials' && <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Step Checklist</p>
                    {[
                        { label: 'MHA plate poured (4 mm)', done: agarPoured, pts: 50 },
                        { label: 'Isolate selected', done: !!selectedOrg, pts: 50 },
                        { label: 'Loop flamed', done: flameUsed, pts: 15 },
                        { label: 'Plate streaked 3×', done: streaks === 3, pts: 75 },
                        { label: '≥4 disks placed', done: placedDisks.length >= 4, pts: 100 },
                        { label: 'Plate loaded & door closed', done: plateLoaded && !doorOpen, pts: 25 },
                        { label: 'Incubation complete', done: incubDone, pts: 75 },
                        { label: 'All zones measured', done: Object.keys(measuredZones).length === placedDisks.length && placedDisks.length > 0, pts: 125 },
                    ].map((item, i) => (
                        <div key={i} className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${item.done ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100'}`}>
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${item.done ? 'bg-green-500' : 'border-2 border-gray-300'}`}>{item.done && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}</div>
                            <span className={`text-xs flex-1 leading-tight ${item.done ? 'text-green-800 font-medium' : 'text-gray-500'}`}>{item.label}</span>
                            <span className={`text-[10px] font-bold ${item.done ? 'text-green-600' : 'text-gray-300'}`}>+{item.pts}</span>
                        </div>
                    ))}
                    {contaminated && <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-50 border border-red-200"><AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" /><span className="text-xs text-red-700 font-medium">Contaminated — −30 XP</span></div>}
                </div>}
                {activeTab === 'protocol' && <div className="space-y-1.5">
                    {SIM_STEPS.map((s, i) => {
                        const Icon = s.icon; const st = i < step ? 'done' : i === step ? 'active' : 'pending';
                        return (
                            <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${st === 'done' ? 'bg-green-50 border-green-200' : st === 'active' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-100'}`}>
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${st === 'done' ? 'bg-green-500' : st === 'active' ? 'bg-blue-600' : 'bg-gray-200'}`}>{st === 'done' ? <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> : <Icon className={`w-3.5 h-3.5 ${st === 'active' ? 'text-white' : 'text-gray-400'}`} />}</div>
                                <div className="flex-1 min-w-0"><p className={`text-xs font-bold ${st === 'active' ? 'text-blue-800' : st === 'done' ? 'text-green-700' : 'text-gray-400'}`}>{s.title}</p><p className={`text-[10px] leading-relaxed mt-0.5 ${st === 'active' ? 'text-blue-600' : st === 'done' ? 'text-green-600' : 'text-gray-400'}`}>{s.desc}</p></div>
                            </div>
                        );
                    })}
                </div>}
                {activeTab === 'clsi' && <div>
                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">CLSI M100 Breakpoints</p>
                    <CLSITable org={selectedOrg} placedDisks={placedDisks} measuredZones={measuredZones} calcZone={calcZone} interp={interp} />
                    <div className="mt-3 bg-blue-50 border border-blue-100 rounded-xl p-3"><p className="text-[10px] font-bold text-blue-700 mb-1">Legend</p><div className="flex gap-3">{[['S', 'Susceptible', 'green'], ['I', 'Intermediate', 'amber'], ['R', 'Resistant', 'red']].map(([k, v, c]) => (
                        <div key={k} className="flex items-center gap-1"><span className={`w-4 h-4 rounded-full bg-${c}-100 border border-${c}-300 text-[9px] font-black text-${c}-700 flex items-center justify-center`}>{k}</span><span className="text-[10px] text-gray-600">{v}</span></div>
                    ))}</div></div>
                </div>}
                {activeTab === 'results' && <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Zone Measurements</p>
                    {Object.keys(measuredZones).length > 0 ? placedDisks.map(id => {
                        const zone = measuredZones[id]; if (!zone) return null;
                        const r = interp(id, zone); const disk = DISKS.find(d => d.id === id)!;
                        const cm = { S: { bg: 'bg-green-100', text: 'text-green-700', bar: 'bg-green-500', border: 'border-green-200' }, I: { bg: 'bg-amber-100', text: 'text-amber-700', bar: 'bg-amber-500', border: 'border-amber-200' }, R: { bg: 'bg-red-100', text: 'text-red-700', bar: 'bg-red-500', border: 'border-red-200' } };
                        const c = cm[r as keyof typeof cm];
                        return (
                            <div key={id} className={`p-3 rounded-xl border ${c.border} ${c.bg}`}>
                                <div className="flex justify-between items-start mb-1.5">
                                    <div><span className="text-xs font-extrabold text-gray-800">{disk.name}</span><span className="text-[10px] text-gray-400 ml-1">{disk.shortClass}</span></div>
                                    <div className="text-right"><span className={`text-sm font-black ${c.text} font-mono`}>{zone}mm</span><span className={`ml-2 text-xs font-bold ${c.text}`}>{r === 'S' ? 'Susceptible' : r === 'R' ? 'Resistant' : 'Intermediate'}</span></div>
                                </div>
                                <div className="w-full bg-white/60 h-1.5 rounded-full overflow-hidden"><div className={`h-full rounded-full ${c.bar}`} style={{ width: `${Math.min(100, (zone / 35) * 100)}%` }} /></div>
                                <div className="flex justify-between mt-1"><span className="text-[9px] text-gray-400">R≤{disk.bpR}</span><span className="text-[9px] text-gray-400">S≥{disk.bpS}</span></div>
                            </div>
                        );
                    }) : (
                        <div className="text-center py-8"><MoveHorizontal className="w-8 h-8 text-gray-300 mx-auto mb-2" /><p className="text-xs text-gray-400">No measurements yet</p></div>
                    )}
                </div>}
            </div>
        </div>
    );

    // ── STEP TOOL PANEL ────────────────────────────────────────
    const StepToolPanel = () => {
        if (step === 0 && !agarPoured) return (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 p-4">
                <div className="flex flex-col items-center gap-2">
                    <motion.div drag dragElastic={0.08} dragConstraints={{ left: -200, right: 200, top: -180, bottom: 180 }} whileDrag={{ scale: 1.06, rotate: -12, filter: 'drop-shadow(0 12px 28px rgba(0,0,0,0.4))' }} onDragEnd={handleAgarDragEnd} onClick={handleBottleClick} className="cursor-grab touch-none">
                        <AgarBottle selected={bottleSelected} />
                    </motion.div>
                    <span className="text-[10px] font-bold text-gray-500">MHA Agar Bottle</span>
                    <span className="text-[10px] text-gray-400">{bottleSelected ? 'Now tap the petri dish →' : 'Tap to select or drag to dish'}</span>
                </div>
                <div className="hidden sm:flex flex-col items-center gap-1 text-gray-300"><ArrowRight className="w-7 h-7" /><span className="text-[10px]">pour onto</span></div>
                <div className="flex flex-col items-center gap-2">
                    <button onClick={handlePlateClick} className={`w-28 h-28 rounded-full border-4 flex items-center justify-center transition-all ${bottleSelected ? 'border-green-400 bg-green-50 shadow-lg shadow-green-200 scale-105 animate-pulse' : 'border-dashed border-gray-300 bg-gray-50'}`}>
                        {bottleSelected ? <span className="text-3xl">🧫</span> : <span className="text-xs text-gray-400 text-center leading-tight px-2">Petri dish<br />target</span>}
                    </button>
                    <span className="text-[10px] font-bold text-gray-500">{bottleSelected ? 'Tap here to pour' : 'Petri dish'}</span>
                </div>
            </div>
        );

        if (step === 1) return (
            <div className="p-4">
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-3 text-center">Culture Collection — tap to select isolate</p>
                <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto">
                    {ORGANISMS.map(org => (
                        <button key={org.id} onClick={() => { setSelectedOrg(org); addScore(50, `Isolate: ${org.short}`); }} className={`p-2 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all ${selectedOrg?.id === org.id ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-black text-white" style={{ background: org.color }}>{org.gram.includes('positive') ? 'G+' : 'G−'}</div>
                            <span className="text-[9px] font-bold text-gray-700 italic leading-tight text-center">{org.short}</span>
                            <span className="text-[8px] text-gray-400">{org.atcc}</span>
                            {selectedOrg?.id === org.id && <CheckCircle className="w-3.5 h-3.5 text-blue-600" />}
                        </button>
                    ))}
                </div>
            </div>
        );

        if (step === 2) return (
            <div className="p-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                <div className="flex flex-col items-center gap-2">
                    <button onClick={() => { setFlameUsed(v => { if (!v) { addScore(15, 'Sterile technique'); notify('Bunsen burner lit ✓', 'success'); } else notify('Burner off.', 'info'); return !v; }) }} className={`rounded-2xl border-2 p-3 transition-all ${flameUsed ? 'border-orange-400 bg-orange-50' : 'border-gray-200 bg-white hover:border-orange-300'}`}>
                        <BunsenSVG lit={flameUsed} />
                    </button>
                    <span className="text-[10px] font-bold text-gray-500">{flameUsed ? 'Lit ✓ — Aseptic' : 'Tap to light burner'}</span>
                </div>
                <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center gap-3">
                        <SwabSVG />
                        <div className="flex flex-col gap-2">
                            <span className="text-xs font-bold text-gray-700">Streak plate</span>
                            <div className="flex gap-1.5">{[1, 2, 3].map(n => <div key={n} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-black ${n <= streaks ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 text-gray-400'}`}>{n <= streaks ? '✓' : n}</div>)}</div>
                            <button onClick={doStreak} disabled={streaks >= 3} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${streaks < 3 && flameUsed ? 'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-md' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                                {streaks >= 3 ? 'Complete ✓' : !flameUsed ? 'Light burner first' : 'Streak plate'}
                            </button>
                        </div>
                    </div>
                    {streaks < 3 && <motion.div drag dragElastic={0.08} dragConstraints={{ left: -200, right: 200, top: -150, bottom: 150 }} whileDrag={{ scale: 1.08, filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.4))' }} onDragEnd={handleSwabDragEnd} className="cursor-grab touch-none hidden sm:block"><SwabSVG /><p className="text-[9px] text-gray-400 text-center mt-1">Or drag</p></motion.div>}
                </div>
            </div>
        );

        if (step === 3) return (
            <div className="p-4">
                <div className="bg-white border border-gray-200 rounded-2xl p-3 shadow-sm max-w-sm mx-auto">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center"><Pipette className="w-2.5 h-2.5 text-white" /></div><span className="text-[10px] font-extrabold text-gray-700 uppercase tracking-wider">Antibiotic Disks</span></div>
                        <span className="text-[10px] text-gray-400">{placedDisks.length}/5 placed · need ≥4</span>
                    </div>
                    <div className="grid grid-cols-5 gap-1.5 mb-3">
                        {DISKS.map(disk => {
                            const placed = placedDisks.includes(disk.id); const sel = pendingDisk === disk.id;
                            return (
                                <motion.div key={disk.id} drag={!placed} dragSnapToOrigin whileDrag={{ scale: 1.2, zIndex: 100, filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.35))' }} onDragEnd={(_, info) => handleDiskDragEnd(disk.id, _, info)} onClick={() => !placed && handleDiskSelect(disk.id)}
                                    className={`h-14 rounded-xl border-2 flex flex-col items-center justify-center gap-0.5 transition-all ${placed ? 'opacity-20 bg-gray-100 cursor-not-allowed' : sel ? 'scale-105 shadow-md cursor-pointer' : 'bg-white hover:bg-gray-50 cursor-grab touch-none'}`}
                                    style={{ borderColor: placed ? '#d1d5db' : sel ? disk.color + 'bb' : disk.color + '44' }}>
                                    <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center" style={{ borderColor: disk.color, background: `${disk.color}15` }}><span className="text-[9px] font-black" style={{ color: disk.color }}>{disk.id}</span></div>
                                    <span className="text-[7px] text-gray-500 font-medium leading-none">{disk.shortClass.split(' ')[0]}</span>
                                </motion.div>
                            );
                        })}
                    </div>
                    {pendingDisk && !placedDisks.includes(pendingDisk) && <button onClick={placePendingDisk} className="w-full py-2 rounded-xl bg-gradient-to-r from-blue-600 to-green-400 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm"><ArrowRight className="w-3.5 h-3.5" />Place {pendingDisk} on plate</button>}
                    {!pendingDisk && <p className="text-[10px] text-gray-400 text-center">Tap a disk to select → "Place on plate" or drag to dish</p>}
                </div>
            </div>
        );

        if (step === 4) return (
            <div className="p-4">
                <div className="flex flex-col sm:flex-row items-start justify-center gap-4 max-w-lg mx-auto">
                    {/* Incubator visual */}
                    <div ref={incubRef} className="flex-shrink-0 w-[160px] mx-auto" style={{ height: 190 }}>
                        <IncubatorSVG progress={incubProg} org={selectedOrg} disks={placedDisks} done={incubDone} doorOpen={doorOpen} plateLoaded={plateLoaded} />
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col gap-2.5 flex-1 min-w-[180px]">
                        <p className="text-xs font-extrabold text-gray-700 tracking-wide">Incubator Controls</p>

                        {/* Step 1: Open/close door */}
                        <button onClick={toggleDoor} disabled={incubating}
                            className={`flex items-center justify-between w-full px-4 py-3 rounded-xl border-2 font-bold text-sm transition-all ${incubating ? 'opacity-40 cursor-not-allowed border-gray-200 bg-gray-50' : 'cursor-pointer'} ${doorOpen ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-blue-400 bg-blue-50 text-blue-700'}`}>
                            <div className="flex items-center gap-2">{doorOpen ? <DoorOpen className="w-5 h-5" /> : <DoorClosed className="w-5 h-5" />}<span>{doorOpen ? 'Close Door' : 'Open Door'}</span></div>
                            <div className={`w-2.5 h-2.5 rounded-full ${doorOpen ? 'bg-amber-500' : 'bg-blue-500'}`} />
                        </button>

                        {/* Step 2: Load plate */}
                        <button onClick={handleLoadPlate} disabled={!doorOpen || plateLoaded || incubating}
                            className={`flex items-center justify-between w-full px-4 py-3 rounded-xl border-2 font-bold text-sm transition-all ${!doorOpen || plateLoaded || incubating ? 'opacity-40 cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400' : 'border-green-400 bg-green-50 text-green-700 cursor-pointer'}`}>
                            <div className="flex items-center gap-2"><span className="text-lg">🧫</span><span>{plateLoaded ? 'Plate loaded ✓' : 'Load plate into incubator'}</span></div>
                            {plateLoaded && <CheckCircle className="w-5 h-5 text-green-600" />}
                        </button>

                        {/* Close door reminder */}
                        {plateLoaded && doorOpen && !incubating && <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2"><AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" /><span className="text-[11px] text-amber-700 font-medium">Close the door before starting</span></div>}

                        {/* Step 3: Start */}
                        <button onClick={startIncubation} disabled={!plateLoaded || doorOpen || incubating || incubDone}
                            className={`flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border-2 font-bold text-sm transition-all ${!plateLoaded || doorOpen || incubating || incubDone ? 'opacity-40 cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400' : 'border-indigo-500 bg-indigo-600 text-white shadow-md cursor-pointer hover:bg-indigo-700'}`}>
                            <Play className="w-4 h-4" />{incubating ? `Incubating… ${Math.round(incubProg)}%` : incubDone ? 'Complete ✓' : 'Start Incubation (35°C / 18 h)'}
                        </button>

                        {/* Status */}
                        <div className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-[10px] text-gray-600 leading-relaxed">
                            <span className="font-bold text-gray-700">Status: </span>
                            {!plateLoaded ? '① Open door → ② Load plate' : doorOpen ? '③ Close door to seal' : incubDone ? '✓ Done — advance to measure' : '④ Start cycle when ready'}
                        </div>

                        {/* Drag hint + draggable mini plate */}
                        {!plateLoaded && !incubDone && <div className="flex flex-col items-center gap-1">
                            <p className="text-[9px] text-gray-400 text-center">Or drag the mini plate into the incubator</p>
                            <motion.div drag dragSnapToOrigin whileDrag={{ scale: 1.08, filter: 'drop-shadow(0 6px 18px rgba(0,0,0,0.35))' }} onDragEnd={handlePlateDragEnd} className="cursor-grab touch-none" style={{ width: 60, height: 60 }}>
                                <PetriDish org={selectedOrg} placedDisks={placedDisks} diskPositions={diskPositions} measuredZones={{}} streaks={streaks} agarPoured={agarPoured} incubDone={false} calcZone={calcZone} interp={interp} step={step} onZoneClick={() => { }} measuringId={null} />
                            </motion.div>
                        </div>}
                    </div>
                </div>
            </div>
        );

        if (step === 5) return (
            <div className="p-4">
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 max-w-sm mx-auto">
                    <div className="flex items-center gap-2 mb-2"><Ruler className="w-4 h-4 text-blue-600" /><span className="text-xs font-bold text-blue-800">Measurement Mode</span></div>
                    <p className="text-[11px] text-blue-700 mb-3 leading-relaxed">Tap each <strong>pulsing blue ring</strong> on the plate above, or tap the disk buttons below.</p>
                    <div className="grid grid-cols-5 gap-1.5">
                        {placedDisks.map(id => {
                            const zone = measuredZones[id]; const disk = DISKS.find(d => d.id === id)!; const measured = zone !== undefined;
                            const r = measured ? interp(id, zone) : '?';
                            return (
                                <button key={id} onClick={() => handleZoneClick(id)} disabled={measured || !incubDone}
                                    className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${measured ? 'border-green-300 bg-green-50 cursor-default' : 'border-dashed border-blue-300 bg-white hover:bg-blue-50 cursor-pointer'} ${measuringId === id ? 'scale-95 bg-blue-100' : ''}`}>
                                    <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-[9px] font-black" style={{ borderColor: disk.color, color: disk.color, background: `${disk.color}15` }}>{id}</div>
                                    {measured ? <span className={`text-[9px] font-bold ${r === 'S' ? 'text-green-700' : r === 'R' ? 'text-red-600' : 'text-amber-600'}`}>{zone}mm</span> : <span className="text-[9px] text-blue-500">tap</span>}
                                </button>
                            );
                        })}
                    </div>
                    <div className="mt-2 text-center text-[10px] text-blue-600 font-medium">{Object.keys(measuredZones).length}/{placedDisks.length} zones measured</div>
                </div>
            </div>
        );

        if (step === 6) return (
            <div className="p-4 text-center">
                <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-2xl p-4 max-w-sm mx-auto">
                    <div className="text-2xl mb-2">🎉</div>
                    <p className="text-sm font-extrabold text-gray-800 mb-1">All steps complete!</p>
                    <p className="text-xs text-gray-500 mb-3">Generate your antimicrobial susceptibility report.</p>
                    <div className="flex justify-center gap-4 mb-0">
                        <div className="text-center"><div className="text-xl font-black text-gray-800">{score}</div><div className="text-[10px] text-gray-500">XP/500</div></div>
                        <div className="text-center"><div className="text-xl font-black text-gray-800">{grade}</div><div className="text-[10px] text-gray-500">Grade</div></div>
                        <div className="text-center"><div className="text-xl font-black text-gray-800">{fmtTime(timer)}</div><div className="text-[10px] text-gray-500">Time</div></div>
                    </div>
                </div>
            </div>
        );
        return null;
    };

    // ──────────────────────────────────────────────────────────
    // RENDER
    // ──────────────────────────────────────────────────────────

    // ── TUTORIAL PHASE ────────────────────────────────────────
    if (phase === 'tutorial') {
        const slide = TUTORIAL_SLIDES[tutSlide];
        return (
            <div className="w-full overflow-hidden flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50/40" style={{ height: 'calc(100vh - 64px)', minHeight: 520 }}>
                {/* Header */}
                <div className="flex-shrink-0 border-b border-gray-200/70 bg-white/95 backdrop-blur-sm px-4 sm:px-8 py-3 pt-8 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center"><Beaker className="w-4 h-4 text-white" /></div>
                        <span className="text-sm font-extrabold text-gray-800">Disk Diffusion Tutorial</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {TUTORIAL_SLIDES.map((_, i) => <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === tutSlide ? 'w-6 bg-blue-600' : i < tutSlide ? 'w-3 bg-green-500' : 'w-3 bg-gray-200'}`} />)}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 overflow-y-auto">
                    <AnimatePresence mode="wait">
                        <motion.div key={tutSlide} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }} className="w-full max-w-2xl">
                            {/* Big icon + gradient header */}
                            <div className={`bg-gradient-to-r ${slide.color} rounded-3xl p-6 sm:p-8 text-white mb-6 shadow-xl`}>
                                <div className="text-5xl sm:text-6xl mb-4">{slide.icon}</div>
                                <h1 className="text-xl sm:text-2xl font-extrabold mb-3 leading-tight">{slide.title}</h1>
                                <div className="bg-white/20 rounded-2xl px-4 py-2.5 inline-block">
                                    <p className="text-xs sm:text-sm font-bold">{slide.highlight}</p>
                                </div>
                            </div>

                            {/* Body text */}
                            <div className="bg-white rounded-3xl border border-gray-200/70 p-5 sm:p-6 shadow-sm mb-6">
                                {slide.body.split('\n').map((line, i) => (
                                    <p key={i} className={`text-gray-700 leading-relaxed ${i > 0 ? 'mt-2' : ''} ${line.startsWith('•') ? 'ml-4 text-sm' : 'text-sm sm:text-base'}`}>{line}</p>
                                ))}
                            </div>

                            {/* Navigation */}
                            <div className="flex items-center justify-between">
                                <button onClick={() => tutSlide > 0 && setTutSlide(t => t - 1)} disabled={tutSlide === 0}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 border-gray-200 text-gray-500 font-bold text-sm disabled:opacity-30 hover:border-gray-300 transition-all">
                                    <ArrowLeft className="w-4 h-4" />Back
                                </button>
                                <span className="text-xs text-gray-400 font-medium">{tutSlide + 1} / {TUTORIAL_SLIDES.length}</span>
                                {tutSlide < TUTORIAL_SLIDES.length - 1 ? (
                                    <button onClick={() => setTutSlide(t => t + 1)} className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-green-400 text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all">
                                        Next<ChevronRight className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <button onClick={() => setPhase('quiz')} className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-green-400 text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all">
                                        Take Quiz<ChevronRight className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        );
    }

    // ── QUIZ PHASE ────────────────────────────────────────────
    if (phase === 'quiz') {
        const q = QUIZ_QUESTIONS[quizIdx];
        return (
            <div className="w-full overflow-hidden flex flex-col bg-gradient-to-br from-slate-50 via-white to-indigo-50/30" style={{ height: 'calc(100vh - 64px)', minHeight: 520 }}>
                <div className="flex-shrink-0 border-b border-gray-200/70 bg-white/95 backdrop-blur-sm px-4 sm:px-8 py-3 pt-8 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-500 flex items-center justify-center"><HelpCircle className="w-4 h-4 text-white" /></div>
                        <span className="text-sm font-extrabold text-gray-800">Knowledge Check</span>
                    </div>
                    <button onClick={() => setPhase('tutorial')} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"><ArrowLeft className="w-3 h-3" />Tutorial</button>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 overflow-y-auto">
                    {!quizDone ? (
                        <AnimatePresence mode="wait">
                            <motion.div key={quizIdx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full max-w-xl">
                                {/* Progress */}
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500" style={{ width: `${(quizIdx / QUIZ_QUESTIONS.length) * 100}%` }} /></div>
                                    <span className="text-xs font-bold text-gray-500 flex-shrink-0">Q{quizIdx + 1}/{QUIZ_QUESTIONS.length}</span>
                                </div>

                                {/* Question card */}
                                <div className="bg-white rounded-3xl border border-gray-200/70 shadow-sm p-5 sm:p-6 mb-4">
                                    <div className="flex items-start gap-3 mb-5">
                                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-500 flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-white font-black text-sm">Q</span></div>
                                        <p className="text-sm sm:text-base font-bold text-gray-800 leading-relaxed">{q.q}</p>
                                    </div>
                                    <div className="space-y-2.5">
                                        {q.opts.map((opt, i) => {
                                            const answered = quizChosen !== null;
                                            const isCorrect = i === q.correct; const isChosen = quizChosen === i;
                                            let cls = 'w-full text-left px-4 py-3 rounded-2xl border-2 text-sm font-medium transition-all ';
                                            if (!answered) cls += 'border-gray-200 bg-gray-50 hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer';
                                            else if (isCorrect) cls += 'border-green-400 bg-green-50 text-green-800';
                                            else if (isChosen) cls += 'border-red-400 bg-red-50 text-red-800';
                                            else cls += 'border-gray-100 bg-gray-50 text-gray-400';
                                            return (
                                                <button key={i} className={cls} onClick={() => handleQuizAnswer(i)} disabled={answered}>
                                                    <div className="flex items-center gap-3">
                                                        <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-black flex-shrink-0 ${answered && isCorrect ? 'border-green-500 bg-green-500 text-white' : answered && isChosen ? 'border-red-400 bg-red-400 text-white' : 'border-current'}`}>
                                                            {answered && isCorrect ? '✓' : answered && isChosen && !isCorrect ? '✗' : String.fromCharCode(65 + i)}
                                                        </span>
                                                        {opt}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {/* Explanation */}
                                    {quizChosen !== null && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`mt-4 p-3 rounded-2xl ${quizChosen === q.correct ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
                                            <p className={`text-xs leading-relaxed ${quizChosen === q.correct ? 'text-green-800' : 'text-amber-800'}`}>
                                                <span className="font-bold">{quizChosen === q.correct ? 'Correct! ' : 'Explanation: '}</span>{q.explanation}
                                            </p>
                                        </motion.div>
                                    )}
                                </div>

                                {quizChosen !== null && (
                                    <div className="flex justify-end">
                                        <button onClick={nextQuizQ} className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-500 text-white font-extrabold text-sm shadow-md">
                                            {quizIdx < QUIZ_QUESTIONS.length - 1 ? 'Next Question' : 'See Results'}<ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    ) : (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md text-center">
                            <div className="bg-white rounded-3xl border border-gray-200/70 shadow-sm p-6 sm:p-8">
                                <div className="text-5xl mb-4">{quizScore === QUIZ_QUESTIONS.length ? '🏆' : quizScore >= 3 ? '🎉' : '📚'}</div>
                                <h2 className="text-xl font-extrabold text-gray-800 mb-2">Quiz Complete!</h2>
                                <div className="text-4xl font-black mb-1" style={{ background: 'linear-gradient(135deg,#2563eb,#16a34a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{quizScore}/{QUIZ_QUESTIONS.length}</div>
                                <p className="text-sm text-gray-500 mb-6">{quizScore === QUIZ_QUESTIONS.length ? 'Perfect score — you\'re ready!' : quizScore >= 3 ? 'Good understanding — let\'s practice!' : 'Review the tutorial if needed.'}</p>
                                <div className="flex flex-col gap-2">
                                    {quizScore < QUIZ_QUESTIONS.length && (
                                        <button onClick={() => { setQuizIdx(0); setQuizChosen(null); setQuizScore(0); setQuizDone(false); }} className="px-5 py-2.5 rounded-2xl border-2 border-gray-200 font-bold text-sm text-gray-600 hover:border-gray-300 transition-all">
                                            Retake Quiz
                                        </button>
                                    )}
                                    <button onClick={startSim} className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-green-400 text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2">
                                        <Zap className="w-4 h-4" />Start Lab Simulation
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        );
    }

    // ── SIMULATION PHASE ──────────────────────────────────────
    return (
        <div className="relative w-full bg-white font-sans overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 64px)', minHeight: 540 }}>

            {/* Lab background */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1576086213369-97a306d36557?w=1400&q=80&auto=format&fit=crop" alt="" className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.09, filter: 'saturate(0.5) contrast(1.1)' }} />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-50/96 via-white/93 to-slate-50/97" />
                <div className="absolute inset-0 opacity-[0.022]" style={{ backgroundImage: 'repeating-linear-gradient(0deg,#64748b 0,#64748b 1px,transparent 1px,transparent 60px),repeating-linear-gradient(90deg,#64748b 0,#64748b 1px,transparent 1px,transparent 60px)' }} />
                <div className="absolute bottom-0 left-0 right-0 h-20">
                    <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-stone-200/55 to-transparent border-t border-stone-300/35" />
                    <div className="absolute top-6 left-0 right-0 bottom-0 bg-gradient-to-b from-stone-700/18 to-stone-800/22" />
                </div>
            </div>

            <div className="relative z-10 flex flex-1 min-h-0 overflow-hidden">
                {/* Desktop sidebar */}
                <AnimatePresence>
                    {sidebarOpen && !isMobile && (
                        <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 280, opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.22, ease: 'easeInOut' }} className="hidden md:block pt-7 flex-shrink-0 border-r border-gray-200/80 bg-white/98 backdrop-blur-sm overflow-hidden shadow-lg" style={{ height: '100%' }}>
                            <NotebookSidebar />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Mobile drawer */}
                <AnimatePresence>
                    {mobileDrawerOpen && (
                        <>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="md:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={() => setMobileDrawerOpen(false)} />
                            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'tween', duration: 0.22 }} className="md:hidden fixed inset-y-0 left-0 w-[85vw] max-w-xs z-50 bg-white shadow-2xl overflow-hidden">
                                <NotebookSidebar />
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                    {/* Header */}
                    <div className="flex-shrink-0 bg-white/95 backdrop-blur-sm border-b border-gray-200/80 px-3 sm:px-5 pt-8 pb-2 flex items-center justify-between gap-2 shadow-sm">
                        <div className="flex items-center gap-2 min-w-0">
                            <button onClick={() => isMobile ? setMobileDrawerOpen(true) : setSidebarOpen(v => !v)} className="flex-shrink-0 p-2 rounded-xl bg-gray-100 border border-gray-200 hover:bg-gray-200 transition-colors">
                                {sidebarOpen && !isMobile ? <ChevronLeft className="w-4 h-4 text-gray-600" /> : <Menu className="w-4 h-4 text-gray-600" />}
                            </button>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="flex-shrink-0 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-green-400 text-white text-[10px] font-extrabold uppercase tracking-widest">{step + 1}/7</span>
                                    <h2 className="text-sm sm:text-base font-extrabold text-gray-800 truncate">{SIM_STEPS[step].title}</h2>
                                </div>
                                <p className="text-[10px] sm:text-xs text-gray-500 truncate mt-0.5 hidden sm:block">{SIM_STEPS[step].desc}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                            {timerActive && <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-xl bg-gray-100 border border-gray-200"><Clock className="w-3.5 h-3.5 text-gray-400" /><span className="text-xs font-mono font-bold text-gray-600">{fmtTime(timer)}</span></div>}
                            <button onClick={() => { if (confirm('Reset simulation?')) resetLab(); }} className="p-2 rounded-xl bg-gray-100 border border-gray-200 hover:bg-red-50 hover:border-red-200 transition-colors group"><RotateCcw className="w-4 h-4 text-gray-500 group-hover:text-red-500" /></button>
                            <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-2xl px-3 py-1.5 shadow-sm">
                                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                <div className="text-right"><div className="text-[9px] text-gray-400 uppercase leading-none">Score</div><div className="text-sm sm:text-base font-black text-gray-800 leading-none">{score}<span className="text-xs text-gray-400 font-normal">/500</span></div></div>
                            </div>
                        </div>
                    </div>

                    {/* Lab workspace */}
                    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto overflow-x-hidden">

                        {/* Notification */}
                        <AnimatePresence>
                            {notification && (
                                <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                    className={`mx-3 mt-2 flex-shrink-0 flex items-center gap-2 px-3 py-2.5 rounded-2xl shadow-lg text-sm font-semibold border ${notification.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : notification.type === 'error' ? 'bg-red-50 text-red-800 border-red-200' : notification.type === 'warn' ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-blue-50 text-blue-800 border-blue-200'}`}>
                                    {notification.type === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : notification.type === 'error' ? <AlertCircle className="w-4 h-4 flex-shrink-0" /> : <Info className="w-4 h-4 flex-shrink-0" />}
                                    <span className="truncate text-xs sm:text-sm">{notification.msg}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {contaminated && (
                            <div className="mx-3 mt-2 flex-shrink-0 flex items-start gap-2 bg-red-50 border border-red-300 rounded-2xl p-2.5">
                                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                <div><p className="text-xs font-bold text-red-700">Contamination!</p><p className="text-[10px] text-red-600">Flame the loop BEFORE streaking. −30 XP applied.</p></div>
                            </div>
                        )}

                        {/* Petri dish */}
                        <div className="flex-shrink-0 flex justify-center items-center py-3 sm:py-4 px-4">
                            <div className="relative">
                                <div ref={plateRef} style={{ width: 'min(54vw,256px)', height: 'min(54vw,256px)' }} className="relative" onClick={handlePlateClick}>
                                    <PetriDish
                                        org={selectedOrg} placedDisks={placedDisks} diskPositions={diskPositions}
                                        measuredZones={measuredZones} streaks={streaks} agarPoured={agarPoured}
                                        incubDone={incubDone} calcZone={calcZone} interp={interp}
                                        step={step} onZoneClick={handleZoneClick} measuringId={measuringId}
                                    />
                                    {bottleSelected && !agarPoured && <div className="absolute inset-0 rounded-full border-4 border-green-400 border-dashed animate-pulse pointer-events-none" />}
                                </div>
                                {agarPoured && <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 whitespace-nowrap"><div className="w-1.5 h-1.5 rounded-full bg-green-400" /><span className="text-[10px] font-medium text-gray-500">MHA · {selectedOrg?.short || 'Uninoculated'} · 90mm</span></div>}
                            </div>
                        </div>

                        {/* Tool panel */}
                        <div className="flex-shrink-0 border-t border-gray-100 bg-white/80 backdrop-blur-sm">
                            <StepToolPanel />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex-shrink-0 bg-white/95 backdrop-blur-sm border-t border-gray-200/80 px-3 sm:px-5 py-2.5 flex items-center justify-between gap-2 shadow-sm">
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                            <span className={`px-2.5 py-1.5 rounded-2xl text-xs font-extrabold ${score >= 450 ? 'bg-green-100 text-green-700' : score >= 350 ? 'bg-blue-100 text-blue-700' : score >= 250 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>{grade}</span>
                            {flameUsed && <span className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-xl bg-orange-50 border border-orange-200 text-[10px] font-bold text-orange-700"><Flame className="w-3 h-3" />Aseptic</span>}
                            {contaminated && <span className="flex items-center gap-1 px-2 py-1 rounded-xl bg-red-50 border border-red-200 text-[10px] font-bold text-red-700"><AlertTriangle className="w-3 h-3" />Contaminated</span>}
                            {step === 5 && <span className="flex items-center gap-1 text-xs text-gray-500"><Ruler className="w-3.5 h-3.5 text-blue-500" />{Object.keys(measuredZones).length}/{placedDisks.length}</span>}
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setMobileDrawerOpen(true)} className="md:hidden p-2 rounded-xl bg-blue-50 border border-blue-200"><BookOpen className="w-4 h-4 text-blue-600" /></button>
                            <motion.button onClick={advanceStep} disabled={!canAdvance() && step !== 6} whileHover={canAdvance() ? { scale: 1.03 } : {}} whileTap={canAdvance() ? { scale: 0.97 } : {}}
                                className={`px-4 sm:px-6 py-2.5 rounded-2xl font-extrabold text-sm flex items-center gap-1.5 transition-all ${canAdvance() ? 'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-md hover:shadow-lg' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                                {step === 6 ? <><span className="hidden sm:inline">View Report</span><FileText className="w-4 h-4" /></> : <><span className="hidden sm:inline">Confirm</span><ChevronRight className="w-4 h-4" /></>}
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Report modal */}
            <AnimatePresence>
                {showReport && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
                        <motion.div initial={{ y: '100%', scale: 0.98 }} animate={{ y: 0, scale: 1 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 280, damping: 28 }} className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-2xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col">
                            <div className="bg-gradient-to-r from-blue-600 to-green-400 px-5 py-4 flex items-center justify-between flex-shrink-0">
                                <div><h2 className="text-base sm:text-lg font-extrabold text-white">Susceptibility Report</h2><p className="text-xs text-white/80 mt-0.5">PharmaWallah · CLSI M100</p></div>
                                <button onClick={() => setShowReport(false)} className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors"><X className="w-5 h-5 text-white" /></button>
                            </div>
                            <div className="overflow-y-auto flex-1 p-5 space-y-4">
                                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                                    <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-2">Clinical Case</p>
                                    <p className="text-xs text-blue-900 leading-relaxed">{selectedOrg?.caseStudy}</p>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        <span className="px-3 py-1 rounded-full bg-white border border-blue-200 text-xs font-bold text-blue-700 italic">{selectedOrg?.name}</span>
                                        <span className="px-3 py-1 rounded-full bg-white border border-blue-200 text-xs font-medium text-blue-600">{selectedOrg?.gram}</span>
                                        <span className="px-3 py-1 rounded-full bg-white border border-blue-200 text-xs font-medium text-blue-600">{selectedOrg?.atcc}</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-extrabold text-gray-800 mb-3">Susceptibility Results</p>
                                    <div className="space-y-2">
                                        {placedDisks.map(id => {
                                            const zone = measuredZones[id] || calcZone(id); const r = interp(id, zone); const disk = DISKS.find(d => d.id === id)!;
                                            const c = r === 'S' ? { bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-100 text-green-700', bar: 'bg-green-500' } : r === 'R' ? { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700', bar: 'bg-red-500' } : { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700', bar: 'bg-amber-500' };
                                            return (
                                                <div key={id} className={`${c.bg} border ${c.border} rounded-2xl p-3 flex items-center gap-3`}>
                                                    <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-xs font-black flex-shrink-0" style={{ borderColor: disk.color, color: disk.color, background: `${disk.color}15` }}>{disk.id}</div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-extrabold text-gray-800 text-sm">{disk.name}</div>
                                                        <div className="text-[10px] text-gray-500">{disk.shortClass} · S≥{disk.bpS} R≤{disk.bpR}</div>
                                                        <div className="mt-1 h-1.5 bg-white/60 rounded-full overflow-hidden"><div className={`h-full ${c.bar} rounded-full`} style={{ width: `${Math.min(100, (zone / 35) * 100)}%` }} /></div>
                                                    </div>
                                                    <div className="text-right flex-shrink-0">
                                                        <div className="font-black text-gray-800 text-base font-mono">{zone}mm</div>
                                                        <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${c.badge}`}>{r === 'S' ? 'Susceptible' : r === 'R' ? 'Resistant' : 'Intermediate'}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl p-4 flex items-center justify-between">
                                    <div><div className="text-white/70 text-xs uppercase tracking-wider">Score</div><div className="text-white font-black text-3xl">{score}<span className="text-lg opacity-60">/500</span></div></div>
                                    <div className="text-center"><div className="text-white/70 text-xs uppercase tracking-wider">Grade</div><div className="text-white font-black text-4xl">{grade}</div></div>
                                    <div className="text-right"><div className="text-white/70 text-xs uppercase tracking-wider">Time</div><div className="text-white font-bold text-xl font-mono">{fmtTime(timer)}</div></div>
                                </div>
                            </div>
                            <div className="border-t border-gray-200 p-4 flex flex-wrap justify-end gap-2 flex-shrink-0">
                                <button onClick={resetLab} className="px-4 py-2.5 rounded-2xl border-2 border-gray-200 font-bold text-sm text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all">New Sim</button>
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => generatePDF(selectedOrg, placedDisks, measuredZones, calcZone, interp, score, grade)} className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-green-400 text-white font-extrabold text-sm flex items-center gap-2 shadow-md">
                                    <Download className="w-4 h-4" />Download PDF
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}