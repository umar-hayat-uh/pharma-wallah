'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Beaker, Thermometer, Ruler, Activity, CheckCircle, AlertTriangle,
    X, ChevronRight, RotateCcw, Download, BookOpen, Microscope,
    Flame, Droplet, AlertCircle, FileText, Menu, ChevronLeft,
    FlaskConical, Pipette, MoveHorizontal, Clock, Info, Star
} from 'lucide-react';
import jsPDF from 'jspdf';

// ============================================================
// TYPES & CONSTANTS
// ============================================================

type Organism = {
    id: string; name: string; short: string; gram: string;
    color: string; lawnColor: string; caseStudy: string;
    atcc: string; morphology: string; clinicalNote: string;
    zones: Record<string, number>;
};

type AntibioticDisk = {
    id: string; name: string; shortClass: string; color: string;
    bpS: number; bpR: number; mechanism: string; clinicalUse: string;
};

type NotifType = 'success' | 'error' | 'info' | 'warn';

const ORGANISMS: Organism[] = [
    {
        id: 'ec', name: 'Escherichia coli', short: 'E. coli', gram: 'Gram‑negative rod',
        color: '#dc2626', lawnColor: '#bbf7d0',
        atcc: 'ATCC 25922',
        morphology: 'Non‑spore‑forming, motile, facultative anaerobe',
        clinicalNote: 'Leading cause of UTI, neonatal meningitis, bacteremia. Watch for ESBL producers.',
        caseStudy: '45‑year‑old female with dysuria, frequency, and left flank pain ×3 days. Temperature 38.4°C. Urinalysis: pyuria, nitrites positive. Mid‑stream urine culture growing lactose‑fermenting colonies on MacConkey agar.',
        zones: { AMP: 12, CIP: 28, GEN: 21, TET: 16, CTX: 29 }
    },
    {
        id: 'sa', name: 'Staphylococcus aureus', short: 'S. aureus', gram: 'Gram‑positive coccus',
        color: '#d97706', lawnColor: '#fef9c3',
        atcc: 'ATCC 25923',
        morphology: 'Grape‑like clusters, beta‑hemolytic on blood agar, coagulase‑positive',
        clinicalNote: 'Leading cause of skin/soft tissue, bone, endovascular infections. Screen for MRSA.',
        caseStudy: '28‑year‑old male with painful, fluctuant skin abscess on left forearm following minor trauma. Wound aspirate: gram‑positive cocci in clusters, beta‑hemolytic, catalase‑positive, coagulase‑positive.',
        zones: { AMP: 8, CIP: 22, GEN: 19, TET: 24, CTX: 31 }
    },
    {
        id: 'pa', name: 'Pseudomonas aeruginosa', short: 'P. aeruginosa', gram: 'Gram‑negative rod',
        color: '#16a34a', lawnColor: '#d1fae5',
        atcc: 'ATCC 27853',
        morphology: 'Motile, non‑fermenter, produces pyocyanin (blue‑green pigment)',
        clinicalNote: 'Intrinsically resistant to many antibiotics. Critical pathogen in ICU, burn units, cystic fibrosis.',
        caseStudy: '67‑year‑old male with COPD, now intubated in ICU for 5 days. Fever spike 39°C. Purulent green sputum via endotracheal tube. BAL culture: oxidase‑positive, non‑fermenter with characteristic grape‑like odour and pyocyanin pigment.',
        zones: { AMP: 6, CIP: 18, GEN: 15, TET: 10, CTX: 12 }
    },
];

const DISKS: AntibioticDisk[] = [
    { id: 'AMP', name: 'Ampicillin', shortClass: 'Penicillin', color: '#2563eb', bpS: 17, bpR: 13, mechanism: 'Inhibits cell‑wall transpeptidation', clinicalUse: 'Susceptible enterococci, Listeria, non‑ESBL coliforms' },
    { id: 'CIP', name: 'Ciprofloxacin', shortClass: 'Fluoroquinolone', color: '#db2777', bpS: 21, bpR: 15, mechanism: 'Inhibits DNA gyrase and topoisomerase IV', clinicalUse: 'UTI, respiratory, GI, bone/joint infections' },
    { id: 'GEN', name: 'Gentamicin', shortClass: 'Aminoglycoside', color: '#16a34a', bpS: 15, bpR: 12, mechanism: 'Irreversible 30S ribosome binding → misreading', clinicalUse: 'Serious Gram‑negative infections, synergy with beta‑lactams' },
    { id: 'CTX', name: 'Cefotaxime', shortClass: '3rd‑gen Ceph', color: '#9333ea', bpS: 26, bpR: 22, mechanism: 'Extended‑spectrum PBP3 binding, beta‑lactamase stable', clinicalUse: 'Meningitis, septicaemia, ESBL screen by disk method' },
    { id: 'TET', name: 'Tetracycline', shortClass: 'Tetracycline', color: '#ea580c', bpS: 15, bpR: 11, mechanism: 'Reversible 30S ribosome binding → blocks tRNA', clinicalUse: 'Atypicals, Brucella, Rickettsia, acne – avoid in children <8y' },
];

const PROTOCOL_STEPS = [
    { title: 'Clinical Case & Media', short: 'Media', desc: 'Review the case. Pour Mueller‑Hinton agar to 4 mm depth.', icon: FlaskConical },
    { title: 'Select Isolate', short: 'Isolate', desc: 'Identify and select the organism matching the clinical presentation.', icon: Microscope },
    { title: 'Inoculate Plate', short: 'Inoculate', desc: 'Flame the loop, then streak plate in three 60° directions.', icon: Flame },
    { title: 'Apply Antibiotic Disks', short: 'Disks', desc: 'Drag ≥4 disks onto the plate. Maintain ≥24 mm center‑to‑center spacing.', icon: Pipette },
    { title: 'Incubate', short: 'Incubate', desc: 'Open incubator, drag plate inside, close door, then start cycle (35°C/18h).', icon: Thermometer },
    { title: 'Measure Zones', short: 'Measure', desc: 'Click a disk and drag outward – the line snaps to the true zone edge.', icon: Ruler },
    { title: 'Interpret & Report', short: 'Interpret', desc: 'Compare zone diameters to CLSI M100 breakpoints. Generate report.', icon: FileText },
];

// ============================================================
// PDF GENERATOR (PharmaWallah branded)
// ============================================================
const generatePDFReport = (
    org: Organism | null, placedDisks: string[],
    measuredZones: Record<string, number>, calcZone: (id: string) => number,
    interpret: (id: string, z: number) => string, score: number, grade: string
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
    doc.setFillColor(248, 250, 252); doc.roundedRect(15, 54, W - 30, 38, 3, 3, 'F');
    doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.text('Clinical Case:', 20, 63);
    doc.setFont('helvetica', 'normal');
    const cl = doc.splitTextToSize(org?.caseStudy || '', W - 50); doc.text(cl, 20, 70);
    doc.setFont('helvetica', 'bold'); doc.text(`Isolate: ${org?.name || ''}`, 20, 86);
    doc.setFont('helvetica', 'normal'); doc.text(`${org?.gram || ''}  ·  ${org?.atcc || ''}`, 20, 92);
    doc.setFontSize(12); doc.setFont('helvetica', 'bold'); doc.text('Susceptibility Results', 15, 108);
    doc.setFillColor(241, 245, 249); doc.rect(15, 112, W - 30, 8, 'F');
    doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(100, 116, 139);
    ['Antibiotic', 'Class', 'Zone (mm)', 'Breakpoints', 'Interpretation'].forEach((h, i) => {
        doc.text(h, [18, 65, 100, 128, 158][i], 118);
    });
    let y = 124;
    placedDisks.forEach((id, i) => {
        const d = DISKS.find(x => x.id === id)!; const z = measuredZones[id] || calcZone(id);
        const r = interpret(id, z); const rTxt = r === 'S' ? 'Susceptible' : r === 'R' ? 'Resistant' : 'Intermediate';
        if (i % 2 === 0) { doc.setFillColor(249, 250, 251); doc.rect(15, y - 5, W - 30, 9, 'F'); }
        doc.setTextColor(30, 41, 59); doc.setFont('helvetica', 'bold'); doc.text(d.name, 18, y);
        doc.setFont('helvetica', 'normal'); doc.text(d.shortClass, 65, y); doc.text(`${z}`, 104, y);
        doc.text(`S≥${d.bpS}  R≤${d.bpR}`, 128, y);
        const rc = r === 'S' ? [34, 197, 94] : r === 'R' ? [239, 68, 68] : [245, 158, 11];
        doc.setTextColor(rc[0], rc[1], rc[2]); doc.setFont('helvetica', 'bold'); doc.text(rTxt, 158, y);
        y += 9;
    });
    y += 6; doc.setFillColor(239, 246, 255); doc.roundedRect(15, y, W - 30, 28, 3, 3, 'F');
    doc.setTextColor(30, 41, 59); doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.text('Clinical Interpretation:', 20, y + 8);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5);
    const comment = org?.clinicalNote || ''; const cLines = doc.splitTextToSize(comment, W - 50); doc.text(cLines, 20, y + 15);
    doc.setFillColor(241, 245, 249); doc.rect(0, H - 22, W, 22, 'F');
    doc.setTextColor(100, 116, 139); doc.setFontSize(8);
    doc.text(`Score: ${score}/500  ·  Grade: ${grade}  ·  CLSI M100 Latest Edition`, 15, H - 13);
    doc.text("PharmaWallah – Pakistan's Leading Pharmacy eLearning Platform", W / 2, H - 6, { align: 'center' });
    doc.save(`PharmaWallah_AST_${org?.id || 'report'}_${Date.now()}.pdf`);
};

// ============================================================
// HYPER‑REALISTIC PETRI DISH SVG
// ============================================================
function PetriDishSVG({
    org, placedDisks, diskPositions, measuredZones,
    streaks, agarPoured, incubationDone, calcZone, interpret,
    step, onDiskMouseDown, measuringDiskId, measureDistance
}: {
    org: Organism | null; placedDisks: string[]; diskPositions: Record<string, { x: number; y: number }>;
    measuredZones: Record<string, number>; streaks: number; agarPoured: boolean; incubationDone: boolean;
    calcZone: (id: string) => number; interpret: (id: string, z: number) => string; step: number;
    onDiskMouseDown: (id: string, e: React.MouseEvent) => void;
    measuringDiskId: string | null; measureDistance: number;
}) {
    const lawnAlpha = streaks === 0 ? 0 : streaks === 1 ? 0.18 : streaks === 2 ? 0.38 : incubationDone ? 0.82 : 0.55;
    const n = placedDisks.length;
    return (
        <svg viewBox="0 0 200 200" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <radialGradient id="rimGrad" cx="42%" cy="35%" r="60%">
                    <stop offset="0%" stopColor="#f8fafc" />
                    <stop offset="55%" stopColor="#e2e8f0" />
                    <stop offset="100%" stopColor="#94a3b8" />
                </radialGradient>
                <radialGradient id="agarGrad" cx="40%" cy="38%" r="62%">
                    <stop offset="0%" stopColor={agarPoured ? '#fefce8' : '#f8fafc'} />
                    <stop offset="50%" stopColor={agarPoured ? '#fef9c3' : '#f1f5f9'} />
                    <stop offset="100%" stopColor={agarPoured ? '#fde68a' : '#e2e8f0'} />
                </radialGradient>
                <radialGradient id="lawnGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor={org?.lawnColor || '#86efac'} stopOpacity="0.9" />
                    <stop offset="100%" stopColor={org?.color || '#16a34a'} stopOpacity="0.6" />
                </radialGradient>
                <radialGradient id="zoneGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#fefce8" stopOpacity="0.95" />
                    <stop offset="70%" stopColor="#fef9c3" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#fefce8" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="glare1" x1="20%" y1="15%" x2="55%" y2="45%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.65)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </linearGradient>
                <linearGradient id="glareRim" x1="15%" y1="10%" x2="50%" y2="40%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.5)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </linearGradient>
                <radialGradient id="diskGrad" cx="35%" cy="30%" r="60%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#f1f5f9" />
                </radialGradient>
                <filter id="plateShadow" x="-8%" y="-8%" width="116%" height="116%">
                    <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#0f172a" floodOpacity="0.22" />
                </filter>
                <filter id="diskShadow" x="-30%" y="-30%" width="160%" height="160%">
                    <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#0f172a" floodOpacity="0.3" />
                </filter>
                <filter id="zoneShadow" x="-5%" y="-5%" width="110%" height="110%">
                    <feDropShadow dx="0" dy="1" stdDeviation="3" floodColor="#0f172a" floodOpacity="0.08" />
                </filter>
                <clipPath id="plateClip"><circle cx="100" cy="100" r="88" /></clipPath>
                <clipPath id="innerClip"><circle cx="100" cy="100" r="82" /></clipPath>
            </defs>

            <circle cx="100" cy="100" r="96" fill="url(#rimGrad)" stroke="#94a3b8" strokeWidth="1.5" filter="url(#plateShadow)" />
            <circle cx="100" cy="100" r="88" fill="url(#agarGrad)" />

            {agarPoured && <>
                <circle cx="100" cy="100" r="88" fill="none" stroke="rgba(180,160,80,0.08)" strokeWidth="1" />
                <circle cx="100" cy="100" r="70" fill="none" stroke="rgba(180,160,80,0.06)" strokeWidth="0.8" />
                <circle cx="100" cy="100" r="50" fill="none" stroke="rgba(180,160,80,0.05)" strokeWidth="0.7" />
            </>}

            {agarPoured && org && lawnAlpha > 0 && (
                <>
                    <circle cx="100" cy="100" r="88" fill="url(#lawnGrad)" fillOpacity={lawnAlpha} clipPath="url(#innerClip)" />
                    {streaks >= 1 && <path d="M30,90 Q60,72 100,85 Q140,98 170,80" stroke={org.color} strokeWidth="2" fill="none" strokeOpacity="0.25" clipPath="url(#innerClip)" strokeLinecap="round" />}
                    {streaks >= 2 && <path d="M35,115 Q70,130 100,118 Q135,106 165,122" stroke={org.color} strokeWidth="2" fill="none" strokeOpacity="0.25" clipPath="url(#innerClip)" strokeLinecap="round" />}
                    {streaks >= 3 && <>
                        <path d="M50,75 Q80,55 100,70 Q122,87 150,68" stroke={org.color} strokeWidth="2" fill="none" strokeOpacity="0.2" clipPath="url(#innerClip)" strokeLinecap="round" />
                        <path d="M50,130 Q80,148 100,135 Q122,122 155,140" stroke={org.color} strokeWidth="2" fill="none" strokeOpacity="0.2" clipPath="url(#innerClip)" strokeLinecap="round" />
                        {Array.from({ length: 40 }, (_, i) => {
                            const a = i * 17; const r = 15 + Math.random() * 68;
                            return <circle key={i} cx={100 + r * Math.cos(a)} cy={100 + r * Math.sin(a)} r={0.8 + Math.random() * 1.2} fill={org.color} fillOpacity={0.35 * lawnAlpha} />
                        })}
                    </>}
                </>
            )}

            {incubationDone && placedDisks.map((diskId, idx) => {
                const disk = DISKS.find(d => d.id === diskId)!;
                const zone = calcZone(diskId);
                const pos = diskPositions[diskId] || defPos(idx, n);
                const px = 100 + pos.x * 1.8, py = 100 + pos.y * 1.8;
                const rPx = zone * 1.65;
                const measured = diskId in measuredZones;
                const interp = interpret(diskId, zone);
                const interpCol = interp === 'S' ? '#16a34a' : interp === 'R' ? '#dc2626' : '#d97706';
                if (rPx < 8) return null;
                return (
                    <g key={diskId + '-zone'} filter="url(#zoneShadow)">
                        <circle cx={px} cy={py} r={rPx} fill="#fefce8" fillOpacity="0.88" clipPath="url(#innerClip)" />
                        <circle cx={px} cy={py} r={rPx} fill="none"
                            stroke={measured ? interpCol : 'rgba(148,163,184,0.5)'}
                            strokeWidth={measured ? 1.5 : 0.8}
                            strokeDasharray={measured ? "4,3" : "3,3"}
                        />
                        <circle cx={px} cy={py} r={rPx - 2} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
                        {measured && <>
                            <line x1={px - rPx} y1={py} x2={px + rPx} y2={py} stroke={interpCol} strokeWidth="1" strokeDasharray="3,2" opacity="0.8" />
                            <line x1={px - rPx} y1={py - 5} x2={px - rPx} y2={py + 5} stroke={interpCol} strokeWidth="1.5" />
                            <line x1={px + rPx} y1={py - 5} x2={px + rPx} y2={py + 5} stroke={interpCol} strokeWidth="1.5" />
                        </>}
                    </g>
                );
            })}

            {placedDisks.map((diskId, idx) => {
                const disk = DISKS.find(d => d.id === diskId)!;
                const zone = calcZone(diskId);
                const pos = diskPositions[diskId] || defPos(idx, n);
                const px = 100 + pos.x * 1.8, py = 100 + pos.y * 1.8;
                const measured = diskId in measuredZones;
                const interp = interpret(diskId, zone);
                const interpCol = interp === 'S' ? '#16a34a' : interp === 'R' ? '#dc2626' : '#d97706';

                return (
                    <g key={diskId + '-disk'} filter="url(#diskShadow)">
                        {step === 5 && incubationDone && !measured && (
                            <g>
                                <circle
                                    cx={px} cy={py} r="24"
                                    fill="rgba(59,130,246,0.08)"
                                    stroke="rgba(59,130,246,0.5)"
                                    strokeWidth="1.5"
                                    strokeDasharray="4,3"
                                    style={{ cursor: 'crosshair', animation: 'pulse-ring 1.5s ease-in-out infinite' }}
                                    onMouseDown={(e) => onDiskMouseDown(diskId, e)}
                                    className="hover:fill-blue-100/30 transition-colors"
                                />
                                <text x={px} y={py - 28} fontSize="4" textAnchor="middle" fill="#3b82f6" fontWeight="600">Drag →</text>
                            </g>
                        )}

                        {measuringDiskId === diskId && (
                            <g>
                                <line x1={px} y1={py} x2={px + measureDistance * 1.8} y2={py} stroke="#3b82f6" strokeWidth="2" strokeDasharray="5,3" />
                                <circle cx={px + measureDistance * 1.8} cy={py} r="3" fill="#3b82f6" />
                                <rect x={px + measureDistance * 0.9 - 15} y={py - 15} width="30" height="12" rx="4" fill="#1e40af" opacity="0.9" />
                                <text x={px + measureDistance * 0.9} y={py - 6} fontSize="5" textAnchor="middle" fill="white" fontWeight="700">{measureDistance}mm</text>
                            </g>
                        )}

                        <circle cx={px} cy={py} r="11" fill="url(#diskGrad)" stroke={disk.color} strokeWidth="2.5" />
                        <circle cx={px} cy={py} r="7" fill={disk.color} fillOpacity="0.12" />
                        <circle cx={px} cy={py} r="3" fill={disk.color} fillOpacity="0.3" />
                        <text x={px} y={py + 1.5} fontSize="5.5" textAnchor="middle" dominantBaseline="middle" fill={disk.color} fontWeight="900" fontFamily="system-ui,sans-serif">{diskId}</text>
                        <circle cx={px - 3} cy={py - 3} r="3" fill="rgba(255,255,255,0.5)" />

                        {measured && incubationDone && <>
                            <rect x={px - 12} y={py + 13} width="24" height="8" rx="4" fill={interpCol} />
                            <text x={px} y={py + 17.5} fontSize="4.5" textAnchor="middle" dominantBaseline="middle" fill="white" fontWeight="800" fontFamily="system-ui,sans-serif">{zone}mm·{interp}</text>
                        </>}
                    </g>
                );
            })}

            {!agarPoured && <text x="100" y="105" fontSize="10" textAnchor="middle" fill="#94a3b8" fontFamily="system-ui,sans-serif">Empty Petri Dish</text>}

            <circle cx="100" cy="100" r="88" fill="url(#glare1)" clipPath="url(#innerClip)" />
            <circle cx="100" cy="100" r="95" fill="url(#glareRim)" clipPath="url(#plateClip)" />
            <circle cx="100" cy="100" r="88" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="4" />
        </svg>
    );
}

function defPos(idx: number, n: number): { x: number; y: number } {
    const a = (idx / n) * Math.PI * 2 - Math.PI / 4;
    return { x: 28 * Math.cos(a), y: 28 * Math.sin(a) };
}

// ============================================================
// REALISTIC INCUBATOR SVG WITH DOOR AND PLATE INSERTION
// ============================================================
function IncubatorSVG({ 
  progress, org, disks, done, doorOpen, plateInside, onToggleDoor 
}: { 
  progress: number; org: Organism | null; disks: string[]; done: boolean; 
  doorOpen: boolean; plateInside: boolean; onToggleDoor: () => void;
}) {
  return (
    <svg viewBox="0 0 200 240" width="200" height="240" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="inc-body" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e7e5e4" /><stop offset="100%" stopColor="#d6d3d1" />
        </linearGradient>
        <linearGradient id="inc-door-frame" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#78716c" /><stop offset="100%" stopColor="#57534e" />
        </linearGradient>
        <linearGradient id="inc-glass" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.4" /><stop offset="100%" stopColor="#bae6fd" stopOpacity="0.15" />
        </linearGradient>
        <linearGradient id="inc-prog" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2563eb" /><stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
        <filter id="inc-shadow">
          <feDropShadow dx="2" dy="4" stdDeviation="4" floodColor="#0f172a" floodOpacity="0.25" />
        </filter>
        <clipPath id="doorClip">
          <rect x="15" y="40" width="170" height="140" rx="8" />
        </clipPath>
      </defs>

      {/* Main body */}
      <rect x="5" y="5" width="190" height="230" rx="12" fill="url(#inc-body)" stroke="#a8a29e" strokeWidth="1.5" filter="url(#inc-shadow)" />
      
      {/* Top branding */}
      <rect x="5" y="5" width="190" height="28" rx="12" fill="#44403c" />
      <rect x="5" y="20" width="190" height="13" fill="#44403c" />
      <text x="100" y="22" fontSize="9" textAnchor="middle" fill="#a8a29e" fontFamily="system-ui,sans-serif" fontWeight="700" letterSpacing="2">PHARMAWALLAH</text>
      <text x="100" y="33" fontSize="5" textAnchor="middle" fill="#78716c" fontFamily="monospace">INCUBATOR 35°C · 24h</text>

      {/* Door frame */}
      <rect x="15" y="40" width="170" height="140" rx="8" fill="url(#inc-door-frame)" stroke="#44403c" strokeWidth="1.5" />
      
      {/* Interior (visible when door open) */}
      <g clipPath="url(#doorClip)">
        <rect x="20" y="45" width="160" height="130" rx="6" fill="#1c1917" />
        <rect x="22" y="47" width="156" height="126" rx="4" fill="#292524" />
        
        {/* Interior shelf */}
        <rect x="25" y="120" width="150" height="6" rx="2" fill="#44403c" />
        <rect x="25" y="126" width="150" height="2" fill="#57534e" />
        <rect x="25" y="118" width="150" height="2" fill="#78716c" />
        
        {/* Interior warm glow when incubating */}
        {(progress > 0 || done) && (
          <rect x="22" y="47" width="156" height="126" rx="4" fill="#f59e0b" fillOpacity={0.05 + (progress / 100) * 0.08} />
        )}

        {/* Petri dish inside (only when plateInside true) */}
        {plateInside && (
          <g transform="translate(100, 108)">
            <ellipse cx="0" cy="0" rx="38" ry="14" fill="#fef9c3" stroke="#d1d5db" strokeWidth="1.2" />
            <ellipse cx="0" cy="-3" rx="36" ry="12" fill={org?.lawnColor || '#86efac'} fillOpacity={done ? 0.75 : 0.35} />
            {disks.slice(0, 5).map((id, i) => {
              const d = DISKS.find(x => x.id === id)!;
              const a = (i / disks.length) * Math.PI * 2;
              const px = 16 * Math.cos(a), py = 6 * Math.sin(a) - 2;
              return (
                <g key={id}>
                  <circle cx={px} cy={py} r="4.5" fill="white" stroke={d.color} strokeWidth="1.5" />
                  <text x={px} y={py + 1} fontSize="2.5" textAnchor="middle" fill={d.color} fontWeight="900">{id}</text>
                </g>
              );
            })}
            {/* Plate label */}
            <text x="0" y="18" fontSize="3.5" textAnchor="middle" fill="#78716c" fontFamily="monospace">{org?.short || '---'}</text>
          </g>
        )}

        {/* No plate message */}
        {!plateInside && (
          <text x="100" y="115" fontSize="6" textAnchor="middle" fill="#78716c" fontFamily="system-ui,sans-serif">No plate</text>
        )}
      </g>

      {/* Glass door (animated open/close) */}
      <motion.g
        animate={{ x: doorOpen ? -80 : 0, rotate: doorOpen ? -15 : 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        style={{ transformOrigin: '15px 110px' }}
      >
        <rect x="15" y="40" width="170" height="140" rx="8" fill="url(#inc-glass)" stroke="#94a3b8" strokeWidth="1" />
        {/* Door handle */}
        <rect x="170" y="90" width="10" height="40" rx="3" fill="#94a3b8" stroke="#64748b" strokeWidth="1" />
        <rect x="172" y="95" width="6" height="30" rx="2" fill="#cbd5e1" />
        {/* Glass reflection */}
        <rect x="25" y="50" width="40" height="60" rx="4" fill="white" opacity="0.1" />
        <line x1="30" y1="55" x2="60" y2="100" stroke="white" strokeWidth="0.5" opacity="0.15" />
      </motion.g>

      {/* Door click area */}
      <rect x="15" y="40" width="40" height="140" rx="8" fill="transparent" className="cursor-pointer" onClick={onToggleDoor} />

      {/* Bottom control panel */}
      <rect x="5" y="185" width="190" height="50" rx="0" fill="#1c1917" />
      <rect x="5" y="225" width="190" height="10" rx="0" fill="#1c1917" />
      
      {/* Digital display */}
      <rect x="12" y="192" width="100" height="28" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1" />
      <text x="62" y="202" fontSize="7" textAnchor="middle" fill="#4ade80" fontFamily="monospace">TEMP: 35.0°C</text>
      <text x="62" y="214" fontSize="7" textAnchor="middle" fill={done ? '#4ade80' : '#fbbf24'} fontFamily="monospace">
        {done ? 'COMPLETE ✓' : progress > 0 ? `${Math.round(progress)}% · ${Math.round(progress * 0.18)}h` : 'STANDBY'}
      </text>
      
      {/* LED indicators */}
      {[['PWR', '#4ade80'], ['HEAT', progress > 0 ? '#f97316' : '#374151'], ['DONE', done ? '#4ade80' : '#374151']].map(([lbl, col], i) => (
        <g key={lbl as string}>
          <circle cx={120 + i * 22} cy="200" r="4" fill={col as string} />
          <text x={120 + i * 22} y="212" fontSize="4" textAnchor="middle" fill="#6b7280" fontFamily="system-ui,sans-serif">{lbl}</text>
        </g>
      ))}
      
      {/* Progress bar */}
      <rect x="12" y="224" width="176" height="6" rx="3" fill="#374151" />
      <rect x="12" y="224" width={176 * (progress / 100)} height="6" rx="3" fill="url(#inc-prog)" />
    </svg>
  );
}

// ============================================================
// OTHER EQUIPMENT SVGs
// ============================================================
function BunsenBurnerSVG({ lit }: { lit: boolean }) {
    return (
        <svg viewBox="0 0 80 130" width="80" height="130" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="bb-body" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#78716c" /><stop offset="50%" stopColor="#a8a29e" /><stop offset="100%" stopColor="#78716c" />
                </linearGradient>
                <linearGradient id="bb-base" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#57534e" /><stop offset="50%" stopColor="#78716c" /><stop offset="100%" stopColor="#57534e" />
                </linearGradient>
                {lit && <filter id="flame-glow"><feGaussianBlur stdDeviation="4" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>}
            </defs>
            {lit && <>
                <ellipse cx="40" cy="18" rx="10" ry="16" fill="#f97316" fillOpacity="0.9" filter="url(#flame-glow)" />
                <ellipse cx="40" cy="22" rx="7" ry="12" fill="#fbbf24" fillOpacity="0.95" />
                <ellipse cx="40" cy="26" rx="4" ry="8" fill="#fef3c7" />
                <ellipse cx="40" cy="30" rx="2" ry="4" fill="#ffffff" />
                <ellipse cx="40" cy="18" rx="10" ry="16" fill="none" stroke="#fed7aa" strokeWidth="1" opacity="0.6" />
            </>}
            <rect x="30" y="34" width="20" height="62" rx="4" fill="url(#bb-body)" />
            <rect x="31" y="35" width="5" height="60" rx="2" fill="rgba(255,255,255,0.18)" />
            <rect x="28" y="56" width="24" height="10" rx="3" fill="#57534e" />
            <rect x="29" y="57" width="5" height="8" rx="2" fill="rgba(255,255,255,0.15)" />
            <circle cx="56" cy="76" r="6" fill="#78716c" stroke="#57534e" strokeWidth="1" />
            <line x1="52" y1="76" x2="60" y2="76" stroke="#a8a29e" strokeWidth="1.5" />
            <rect x="35" y="96" width="10" height="8" rx="2" fill="#57534e" />
            <rect x="15" y="104" width="50" height="18" rx="5" fill="url(#bb-base)" />
            <rect x="16" y="105" width="12" height="16" rx="3" fill="rgba(255,255,255,0.1)" />
            <path d="M40,122 Q20,126 10,124" stroke="#78716c" strokeWidth="5" fill="none" strokeLinecap="round" />
        </svg>
    );
}

function AgarBottleSVG() {
    return (
        <svg viewBox="0 0 70 160" width="70" height="160" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="agar-glass" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#d1d5db" /><stop offset="40%" stopColor="#f3f4f6" /><stop offset="100%" stopColor="#9ca3af" />
                </linearGradient>
                <linearGradient id="agar-liquid" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#d9f99d" /><stop offset="100%" stopColor="#a3e635" />
                </linearGradient>
                <linearGradient id="agar-highlight" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.7)" /><stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </linearGradient>
            </defs>
            <rect x="24" y="0" width="22" height="24" rx="5" fill="#374151" />
            <rect x="25" y="1" width="7" height="22" rx="3" fill="rgba(255,255,255,0.15)" />
            <rect x="22" y="22" width="26" height="14" rx="4" fill="#6b7280" />
            <rect x="23" y="23" width="7" height="12" rx="2" fill="rgba(255,255,255,0.2)" />
            <rect x="8" y="34" width="54" height="118" rx="12" fill="url(#agar-glass)" stroke="#9ca3af" strokeWidth="1.5" />
            <rect x="12" y="44" width="46" height="100" rx="8" fill="url(#agar-liquid)" fillOpacity="0.85" />
            <line x1="12" y1="44" x2="58" y2="44" stroke="#84cc16" strokeWidth="1.5" />
            <circle cx="24" cy="90" r="4" fill="rgba(255,255,255,0.4)" />
            <circle cx="42" cy="110" r="2.5" fill="rgba(255,255,255,0.35)" />
            <circle cx="34" cy="130" r="3" fill="rgba(255,255,255,0.3)" />
            <rect x="12" y="60" width="46" height="58" rx="5" fill="white" fillOpacity="0.9" />
            <rect x="13" y="61" width="44" height="56" rx="4" fill="#f0fdf4" stroke="#86efac" strokeWidth="0.8" />
            <text x="35" y="76" fontSize="9" textAnchor="middle" fill="#15803d" fontWeight="900" fontFamily="system-ui,sans-serif">MHA</text>
            <line x1="16" y1="80" x2="54" y2="80" stroke="#86efac" strokeWidth="0.8" />
            <text x="35" y="88" fontSize="5.5" textAnchor="middle" fill="#166534" fontFamily="system-ui,sans-serif">Mueller-Hinton</text>
            <text x="35" y="96" fontSize="5" textAnchor="middle" fill="#15803d" fontFamily="system-ui,sans-serif">Agar · 500 mL</text>
            <text x="35" y="103" fontSize="4.5" textAnchor="middle" fill="#4ade80" fontFamily="system-ui,sans-serif">pH 7.2–7.4</text>
            <text x="35" y="110" fontSize="4" textAnchor="middle" fill="#86efac" fontFamily="system-ui,sans-serif">Lot: PW-2025</text>
            <rect x="10" y="36" width="10" height="110" rx="6" fill="url(#agar-highlight)" opacity="0.7" />
        </svg>
    );
}

function SwabSVG() {
    return (
        <svg viewBox="0 0 26 150" width="26" height="150" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="swab-stick" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#d6d3d1" /><stop offset="50%" stopColor="#e7e5e4" /><stop offset="100%" stopColor="#a8a29e" />
                </linearGradient>
                <radialGradient id="swab-cotton" cx="40%" cy="35%" r="55%">
                    <stop offset="0%" stopColor="#fffbeb" /><stop offset="70%" stopColor="#fef3c7" /><stop offset="100%" stopColor="#fde68a" />
                </radialGradient>
            </defs>
            <rect x="11" y="0" width="4" height="115" rx="2" fill="url(#swab-stick)" />
            <rect x="12" y="2" width="1.5" height="112" rx="1" fill="rgba(255,255,255,0.4)" />
            <ellipse cx="13" cy="128" rx="11" ry="20" fill="url(#swab-cotton)" stroke="#f59e0b" strokeWidth="0.8" />
            <line x1="4" y1="118" x2="8" y2="122" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="22" y1="119" x2="18" y2="123" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="3" y1="128" x2="7" y2="130" stroke="rgba(255,255,255,0.6)" strokeWidth="1" strokeLinecap="round" />
            <line x1="23" y1="129" x2="19" y2="131" stroke="rgba(255,255,255,0.6)" strokeWidth="1" strokeLinecap="round" />
            <line x1="5" y1="138" x2="8" y2="135" stroke="rgba(255,255,255,0.55)" strokeWidth="1" strokeLinecap="round" />
            <line x1="21" y1="137" x2="18" y2="135" stroke="rgba(255,255,255,0.55)" strokeWidth="1" strokeLinecap="round" />
            <ellipse cx="13" cy="124" rx="6" ry="9" fill="rgba(255,255,255,0.22)" />
        </svg>
    );
}

// ============================================================
// CLSI BREAKPOINTS TABLE COMPONENT
// ============================================================
function CLSITable({ org, placedDisks, measuredZones, calcZone, interpret }: {
    org: Organism | null; placedDisks: string[]; measuredZones: Record<string, number>;
    calcZone: (id: string) => number; interpret: (id: string, z: number) => string;
}) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-xs">
                <thead>
                    <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-2 font-semibold text-gray-500 uppercase tracking-wider text-[10px]">Drug</th>
                        <th className="text-center py-2 px-1 font-semibold text-gray-500 uppercase tracking-wider text-[10px]">S ≥</th>
                        <th className="text-center py-2 px-1 font-semibold text-gray-500 uppercase tracking-wider text-[10px]">R ≤</th>
                        <th className="text-center py-2 px-1 font-semibold text-gray-500 uppercase tracking-wider text-[10px]">Zone</th>
                        <th className="text-center py-2 px-1 font-semibold text-gray-500 uppercase tracking-wider text-[10px]">Result</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {placedDisks.map(id => {
                        const disk = DISKS.find(d => d.id === id)!;
                        const zone = measuredZones[id] || (org ? calcZone(id) : 0);
                        const r = zone > 0 ? interpret(id, zone) : '—';
                        const col = r === 'S' ? 'text-green-700 bg-green-50' : r === 'R' ? 'text-red-700 bg-red-50' : r === 'I' ? 'text-amber-700 bg-amber-50' : 'text-gray-400';
                        return (
                            <tr key={id} className="hover:bg-gray-50 transition-colors">
                                <td className="py-2 px-2">
                                    <div className="font-bold text-gray-800">{disk.name}</div>
                                    <div className="text-gray-400 text-[10px]">{disk.shortClass}</div>
                                </td>
                                <td className="text-center py-2 px-1 font-mono text-green-700 font-semibold">{disk.bpS}</td>
                                <td className="text-center py-2 px-1 font-mono text-red-600 font-semibold">{disk.bpR}</td>
                                <td className="text-center py-2 px-1 font-mono font-bold text-gray-800">{zone > 0 ? zone : '—'}</td>
                                <td className="text-center py-2 px-1">
                                    {r !== '—' && (
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${col}`}>{r}</span>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                    {placedDisks.length === 0 && (
                        <tr><td colSpan={5} className="text-center py-4 text-gray-400 text-xs">Place disks to see results</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function PharmaWallahKirbyBauer() {
    const [step, setStep] = useState(0);
    const [score, setScore] = useState(0);
    const [notification, setNotification] = useState<{ msg: string; type: NotifType } | null>(null);
    const [timer, setTimer] = useState(0);
    const [timerActive, setTimerActive] = useState(false);

    const [agarPoured, setAgarPoured] = useState(false);
    const [selectedOrg, setSelectedOrg] = useState<Organism | null>(null);
    const [flameUsed, setFlameUsed] = useState(false);
    const [streaks, setStreaks] = useState(0);
    const [contaminated, setContaminated] = useState(false);

    const [placedDisks, setPlacedDisks] = useState<string[]>([]);
    const [diskPositions, setDiskPositions] = useState<Record<string, { x: number; y: number }>>({});
    
    // Incubator state
    const [incubatorDoorOpen, setIncubatorDoorOpen] = useState(false);
    const [plateInIncubator, setPlateInIncubator] = useState(false);
    const [incubating, setIncubating] = useState(false);
    const [incubationProgress, setIncubationProgress] = useState(0);
    const [incubationDone, setIncubationDone] = useState(false);
    
    const [measuredZones, setMeasuredZones] = useState<Record<string, number>>({});
    const [measuringDiskId, setMeasuringDiskId] = useState<string | null>(null);
    const [measureDistance, setMeasureDistance] = useState<number>(0);
    const [showReport, setShowReport] = useState(false);

    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'case' | 'materials' | 'protocol' | 'clsi' | 'results'>('case');
    const [isMobile, setIsMobile] = useState(false);

    const plateRef = useRef<HTMLDivElement>(null);
    const incubatorRef = useRef<HTMLDivElement>(null);

    // Responsive detection
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

    // Client‑only style injection (fixes hydration error)
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse-ring {
                0%, 100% { opacity: 0.6; stroke-width: 1.5; }
                50% { opacity: 1; stroke-width: 2.5; }
            }
            circle[style*="pulse-ring"] {
                animation: pulse-ring 1.5s ease-in-out infinite;
            }
        `;
        document.head.appendChild(style);
        return () => { document.head.removeChild(style); };
    }, []);

    // Lab timer
    useEffect(() => {
        if (!timerActive) return;
        const id = setInterval(() => setTimer(t => t + 1), 1000);
        return () => clearInterval(id);
    }, [timerActive]);

    useEffect(() => { if (step === 0 && agarPoured) setTimerActive(true); }, [step, agarPoured]);

    const notify = (msg: string, type: NotifType = 'info') => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 3200);
    };

    const addScore = (pts: number, reason?: string) => {
        setScore(p => Math.min(500, p + pts));
        if (reason) notify(`${reason} (+${pts} XP)`, 'success');
    };

    const deductScore = (pts: number, reason: string) => {
        setScore(p => Math.max(0, p - pts));
        notify(`${reason} (−${pts} XP)`, 'error');
    };

    const calcZone = (id: string): number => {
        if (!selectedOrg) return 0;
        let base = selectedOrg.zones[id] || 0;
        if (base === 0) return 0;
        if (contaminated) base -= 2;
        if (!flameUsed) base -= 1;
        if (streaks < 3) base -= 1;
        const pos = diskPositions[id];
        if (pos && Math.sqrt(pos.x ** 2 + pos.y ** 2) > 35) base -= 1;
        return Math.max(6, Math.round(base));
    };

    const interpret = (id: string, zone: number): string => {
        const d = DISKS.find(x => x.id === id);
        if (!d) return 'R';
        if (zone >= d.bpS) return 'S';
        if (zone <= d.bpR) return 'R';
        return 'I';
    };

    const canAdvance = (): boolean => {
        switch (step) {
            case 0: return agarPoured;
            case 1: return selectedOrg !== null;
            case 2: return streaks === 3 && flameUsed && !contaminated;
            case 3: return placedDisks.length >= 4;
            case 4: return incubationDone;
            case 5: return Object.keys(measuredZones).length === placedDisks.length;
            default: return true;
        }
    };

    const advanceStep = () => {
        if (!canAdvance()) { notify('Complete the current step to proceed.', 'error'); return; }
        if (step === 6) { setShowReport(true); return; }
        setStep(p => p + 1);
    };

    const isValidPlacement = (x: number, y: number, excludeId?: string): boolean => {
        if (Math.sqrt(x * x + y * y) > 38) { notify('Disk too close to plate edge (min 15 mm from edge).', 'error'); return false; }
        for (const [id, pos] of Object.entries(diskPositions)) {
            if (id === excludeId) continue;
            if (Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2) < 18) { notify(`Too close to ${id} — maintain ≥24 mm spacing.`, 'error'); return false; }
        }
        return true;
    };

    // Simplified measurement handlers
    const handleDiskMouseDown = (diskId: string, e: React.MouseEvent) => {
        if (step !== 5 || !incubationDone || measuringDiskId) return;
        e.preventDefault();
        setMeasuringDiskId(diskId);
        setMeasureDistance(0);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!measuringDiskId || !plateRef.current) return;
        const rect = plateRef.current.getBoundingClientRect();
        const diskPos = diskPositions[measuringDiskId] || defPos(placedDisks.indexOf(measuringDiskId), placedDisks.length);
        const center = {
            x: rect.left + rect.width / 2 + (diskPos.x * 1.8 / 100) * rect.width,
            y: rect.top + rect.height / 2 + (diskPos.y * 1.8 / 100) * rect.height
        };
        const dx = e.clientX - center.x;
        const dy = e.clientY - center.y;
        const distancePx = Math.sqrt(dx * dx + dy * dy);
        const distanceMm = Math.round((distancePx / (rect.width / 2)) * 45);
        const trueZone = calcZone(measuringDiskId);
        const clamped = Math.min(trueZone + 2, Math.max(trueZone - 2, distanceMm));
        setMeasureDistance(clamped);
    };

    const handleMouseUp = () => {
        if (!measuringDiskId) return;
        const trueZone = calcZone(measuringDiskId);
        const measuredMm = measureDistance;
        if (Math.abs(measuredMm - trueZone) <= 3) {
            setMeasuredZones(prev => ({ ...prev, [measuringDiskId]: measuredMm }));
            addScore(25, `Measured ${measuringDiskId}: ${measuredMm} mm`);
            notify(`Zone recorded: ${measuredMm} mm`, 'success');
        } else {
            notify(`Measurement ${measuredMm} mm is inaccurate. Expected ~${trueZone} mm.`, 'error');
        }
        setMeasuringDiskId(null);
        setMeasureDistance(0);
    };

    // Plate insertion into incubator
    const handlePlateDragToIncubator = (info: PanInfo) => {
        if (step !== 4 || plateInIncubator) return;
        const rect = incubatorRef.current?.getBoundingClientRect();
        if (rect && info.point.x > rect.left && info.point.x < rect.right && info.point.y > rect.top && info.point.y < rect.bottom) {
            if (!incubatorDoorOpen) {
                notify('Open the incubator door first!', 'warn');
                return;
            }
            setPlateInIncubator(true);
            addScore(25, 'Plate placed in incubator');
            notify('Plate loaded into incubator. Close door and start cycle.', 'success');
        }
    };

    const startIncubation = () => {
        if (!plateInIncubator) { notify('Load plate into incubator first.', 'error'); return; }
        if (incubatorDoorOpen) { notify('Close the incubator door before starting.', 'warn'); return; }
        setIncubating(true);
        notify('Incubation started. 35°C / 18 hours.', 'info');
        const iv = setInterval(() => {
            setIncubationProgress(p => {
                if (p >= 100) {
                    clearInterval(iv);
                    setIncubating(false);
                    setIncubationDone(true);
                    addScore(75, 'Incubation complete');
                    notify('Incubation complete! Zones of inhibition visible.', 'success');
                    return 100;
                }
                return p + 2;
            });
        }, 40);
    };

    const resetLab = () => {
        setStep(0); setScore(0); setTimer(0); setTimerActive(false);
        setAgarPoured(false); setSelectedOrg(null); setFlameUsed(false);
        setStreaks(0); setContaminated(false); setPlacedDisks([]); setDiskPositions({});
        setIncubatorDoorOpen(false); setPlateInIncubator(false);
        setIncubating(false); setIncubationProgress(0); setIncubationDone(false);
        setMeasuredZones({}); setShowReport(false);
        setMeasuringDiskId(null); setMeasureDistance(0);
        notify('Lab reset. Begin the protocol.', 'info');
    };

    const grade = score >= 450 ? 'A+' : score >= 400 ? 'A' : score >= 350 ? 'B' : score >= 250 ? 'C' : 'F';
    const fmtTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

    const NotebookSidebar = () => (
        <div className="h-full flex flex-col bg-white overflow-hidden">
            <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-green-400 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-white" />
                    <span className="text-xs font-extrabold text-white uppercase tracking-widest">Lab Notebook</span>
                </div>
                {timerActive && (
                    <div className="flex items-center gap-1 bg-white/20 rounded-full px-2 py-0.5">
                        <Clock className="w-3 h-3 text-white" />
                        <span className="text-xs font-mono text-white font-bold">{fmtTime(timer)}</span>
                    </div>
                )}
            </div>

            <div className="px-4 py-2 border-b border-gray-100 flex-shrink-0">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500 font-medium">Progress</span>
                    <span className="text-xs font-black text-gray-800">{score}<span className="text-gray-400 font-normal">/500 XP</span></span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-blue-600 to-green-400"
                        animate={{ width: `${(score / 500) * 100}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                </div>
                <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-gray-400">Grade: <span className="font-bold text-gray-700">{grade}</span></span>
                    <span className="text-[10px] text-gray-400">Step {step + 1}/7</span>
                </div>
            </div>

            <div className="flex border-b border-gray-100 flex-shrink-0 bg-gray-50/50">
                {(['case', 'materials', 'protocol', 'clsi', 'results'] as const).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-2.5 text-[9px] font-bold uppercase tracking-wider transition-all ${activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-gray-400 hover:text-gray-600'}`}>
                        {tab === 'clsi' ? 'CLSI' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {activeTab === 'case' && (
                    <>
                        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center flex-shrink-0">
                                    <FileText className="w-3 h-3 text-white" />
                                </div>
                                <span className="text-xs font-extrabold text-blue-800 uppercase tracking-wider">Clinical Case</span>
                            </div>
                            <p className="text-xs text-blue-900 leading-relaxed">{selectedOrg?.caseStudy || ORGANISMS[0].caseStudy}</p>
                        </div>
                        {selectedOrg && (
                            <div className="bg-white border border-gray-200 rounded-2xl p-3 space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full flex-shrink-0" style={{ background: `${selectedOrg.color}22`, border: `2px solid ${selectedOrg.color}` }} />
                                    <div>
                                        <p className="text-xs font-extrabold text-gray-800 italic">{selectedOrg.name}</p>
                                        <p className="text-[10px] text-gray-500">{selectedOrg.atcc}</p>
                                    </div>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-2">
                                    <p className="text-[10px] font-bold text-gray-600 mb-1">Morphology</p>
                                    <p className="text-[10px] text-gray-700 leading-relaxed">{selectedOrg.morphology}</p>
                                </div>
                                <div className="bg-amber-50 border border-amber-100 rounded-xl p-2">
                                    <p className="text-[10px] font-bold text-amber-700 mb-1">Clinical Note</p>
                                    <p className="text-[10px] text-amber-800 leading-relaxed">{selectedOrg.clinicalNote}</p>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'materials' && (
                    <div className="space-y-2">
                        <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Step Checklist</p>
                        {[
                            { label: 'MHA plate poured (4 mm depth)', done: agarPoured, pts: 50 },
                            { label: 'Organism isolate selected', done: !!selectedOrg, pts: 50 },
                            { label: 'Inoculation loop flamed', done: flameUsed, pts: 15 },
                            { label: 'Plate streaked 3× (60° each)', done: streaks === 3, pts: 75 },
                            { label: 'Antibiotic disks placed (≥4)', done: placedDisks.length >= 4, pts: 100 },
                            { label: 'Plate in incubator, door closed', done: plateInIncubator && !incubatorDoorOpen, pts: 25 },
                            { label: 'Incubation cycle complete', done: incubationDone, pts: 75 },
                            { label: 'All zones measured (mm)', done: Object.keys(measuredZones).length === placedDisks.length && placedDisks.length > 0, pts: 125 },
                        ].map((item, i) => (
                            <div key={i} className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${item.done ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100'}`}>
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${item.done ? 'bg-green-500' : 'border-2 border-gray-300'}`}>
                                    {item.done && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                                </div>
                                <span className={`text-xs flex-1 leading-tight ${item.done ? 'text-green-800 font-medium' : 'text-gray-500'}`}>{item.label}</span>
                                <span className={`text-[10px] font-bold ${item.done ? 'text-green-600' : 'text-gray-300'}`}>+{item.pts}</span>
                            </div>
                        ))}
                        {contaminated && (
                            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-50 border border-red-200">
                                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                                <span className="text-xs text-red-700 font-medium">Plate contaminated — deducted 30 XP</span>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'protocol' && (
                    <div className="space-y-1.5">
                        {PROTOCOL_STEPS.map((s, i) => {
                            const Icon = s.icon;
                            const status = i < step ? 'done' : i === step ? 'active' : 'pending';
                            return (
                                <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${status === 'done' ? 'bg-green-50 border-green-200' : status === 'active' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-100'}`}>
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${status === 'done' ? 'bg-green-500' : status === 'active' ? 'bg-blue-600' : 'bg-gray-200'}`}>
                                        {status === 'done' ? <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> : <Icon className={`w-3.5 h-3.5 ${status === 'active' ? 'text-white' : 'text-gray-400'}`} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-xs font-bold ${status === 'active' ? 'text-blue-800' : status === 'done' ? 'text-green-700' : 'text-gray-400'}`}>{s.title}</p>
                                        <p className={`text-[10px] leading-relaxed mt-0.5 ${status === 'active' ? 'text-blue-600' : status === 'done' ? 'text-green-600' : 'text-gray-400'}`}>{s.desc}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {activeTab === 'clsi' && (
                    <div>
                        <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">CLSI M100 Breakpoints</p>
                        <CLSITable org={selectedOrg} placedDisks={placedDisks} measuredZones={measuredZones} calcZone={calcZone} interpret={interpret} />
                        <div className="mt-3 bg-blue-50 border border-blue-100 rounded-xl p-3">
                            <p className="text-[10px] font-bold text-blue-700 mb-1">Legend</p>
                            <div className="flex gap-3">
                                {[['S', 'Susceptible', 'green'], ['I', 'Intermediate', 'amber'], ['R', 'Resistant', 'red']].map(([k, v, c]) => (
                                    <div key={k} className="flex items-center gap-1">
                                        <span className={`w-4 h-4 rounded-full bg-${c}-100 border border-${c}-300 text-[9px] font-black text-${c}-700 flex items-center justify-center`}>{k}</span>
                                        <span className="text-[10px] text-gray-600">{v}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'results' && (
                    <div className="space-y-2">
                        <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Zone Measurements</p>
                        {Object.keys(measuredZones).length > 0 ? placedDisks.map(id => {
                            const zone = measuredZones[id]; if (!zone) return null;
                            const r = interpret(id, zone);
                            const disk = DISKS.find(d => d.id === id)!;
                            const colMap = { S: { bg: 'bg-green-100', text: 'text-green-700', bar: 'bg-green-500', border: 'border-green-200' }, I: { bg: 'bg-amber-100', text: 'text-amber-700', bar: 'bg-amber-500', border: 'border-amber-200' }, R: { bg: 'bg-red-100', text: 'text-red-700', bar: 'bg-red-500', border: 'border-red-200' } };
                            const c = colMap[r as keyof typeof colMap];
                            return (
                                <div key={id} className={`p-3 rounded-xl border ${c.border} ${c.bg}`}>
                                    <div className="flex justify-between items-start mb-1.5">
                                        <div>
                                            <span className="text-xs font-extrabold text-gray-800">{disk.name}</span>
                                            <span className="text-[10px] text-gray-400 ml-1">{disk.shortClass}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-sm font-black ${c.text} font-mono`}>{zone}mm</span>
                                            <span className={`ml-2 text-xs font-bold ${c.text}`}>{r === 'S' ? 'Susceptible' : r === 'R' ? 'Resistant' : 'Intermediate'}</span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-white/60 h-1.5 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${c.bar}`} style={{ width: `${Math.min(100, (zone / 35) * 100)}%` }} />
                                    </div>
                                    <div className="flex justify-between mt-1">
                                        <span className="text-[9px] text-gray-400">R≤{disk.bpR}</span>
                                        <span className="text-[9px] text-gray-400">I</span>
                                        <span className="text-[9px] text-gray-400">S≥{disk.bpS}</span>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="text-center py-8">
                                <MoveHorizontal className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                <p className="text-xs text-gray-400">No measurements yet</p>
                                <p className="text-[10px] text-gray-300">Complete steps 4–5 to see results</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="relative w-full bg-white font-sans overflow-hidden flex flex-col pt-11" style={{ height: 'calc(100vh - 64px)', minHeight: 500 }}>
            {/* Background */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1576086213369-97a306d36557?w=1400&q=80&auto=format&fit=crop"
                    alt="laboratory background"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ opacity: 0.13, filter: 'saturate(0.6) contrast(1.1)' }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-50/95 via-white/90 to-slate-50/98" />
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: 'repeating-linear-gradient(0deg,#64748b 0,#64748b 1px,transparent 1px,transparent 60px),repeating-linear-gradient(90deg,#64748b 0,#64748b 1px,transparent 1px,transparent 60px)' }} />
                <div className="absolute top-0 left-0 right-0 h-14 bg-gradient-to-b from-slate-200/80 to-transparent border-b border-slate-200/40" />
                <div className="absolute bottom-0 left-0 right-0 h-28">
                    <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-stone-200/70 to-stone-100/50 border-t-2 border-stone-300/50" />
                    <div className="absolute top-8 left-0 right-0 bottom-0 bg-gradient-to-b from-stone-700/25 to-stone-800/30" />
                    <div className="absolute top-8 left-0 right-0 bottom-0 opacity-10"
                        style={{ backgroundImage: 'repeating-linear-gradient(90deg,#78716c 0,#78716c 1px,transparent 1px,transparent 8px)' }} />
                </div>
                <div className="absolute top-1 left-6 flex items-end gap-3 opacity-30">
                    <div className="w-8 h-10 bg-blue-200 rounded-t-full border border-blue-300" />
                    <div className="w-6 h-14 bg-green-200 rounded-t-full border border-green-300" />
                    <div className="w-8 h-8 bg-amber-200 rounded border border-amber-300" />
                    <div className="w-5 h-12 bg-purple-200 rounded-t-lg border border-purple-300" />
                </div>
                <div className="absolute top-1 right-6 flex items-end gap-3 opacity-30">
                    <div className="w-7 h-11 bg-cyan-200 rounded-t-full border border-cyan-300" />
                    <div className="w-10 h-8 bg-red-100 rounded border border-red-200" />
                    <div className="w-6 h-13 bg-indigo-200 rounded-t-lg border border-indigo-300" />
                </div>
            </div>

            {/* Main layout */}
            <div className="relative z-10 flex flex-1 min-h-0 overflow-hidden">
                <AnimatePresence>
                    {sidebarOpen && !isMobile && (
                        <motion.div
                            initial={{ width: 0, opacity: 0 }} animate={{ width: 288, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                            className="hidden md:block flex-shrink-0 border-r border-gray-200/80 bg-white/98 backdrop-blur-sm overflow-hidden shadow-lg"
                            style={{ height: '100%' }}
                        >
                            <NotebookSidebar />
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {mobileDrawerOpen && (
                        <>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="md:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={() => setMobileDrawerOpen(false)} />
                            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'tween', duration: 0.25 }} className="md:hidden fixed inset-y-0 left-0 w-80 max-w-[90vw] z-50 bg-white shadow-2xl overflow-hidden">
                                <NotebookSidebar />
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    <div className="flex-shrink-0 bg-white/95 backdrop-blur-sm border-b border-gray-200/80 px-3 sm:px-5 py-2.5 flex items-center justify-between gap-2 shadow-sm">
                        <div className="flex items-center gap-2 min-w-0">
                            <button
                                onClick={() => isMobile ? setMobileDrawerOpen(true) : setSidebarOpen(v => !v)}
                                className="flex-shrink-0 p-2 rounded-xl bg-gray-100 border border-gray-200 hover:bg-gray-200 transition-colors"
                            >
                                {sidebarOpen && !isMobile ? <ChevronLeft className="w-4 h-4 text-gray-600" /> : <Menu className="w-4 h-4 text-gray-600" />}
                            </button>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="flex-shrink-0 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-green-400 text-white text-[10px] font-extrabold uppercase tracking-widest">
                                        {step + 1}/7
                                    </span>
                                    <h2 className="text-sm sm:text-base font-extrabold text-gray-800 truncate">{PROTOCOL_STEPS[step].title}</h2>
                                </div>
                                <p className="text-[10px] sm:text-xs text-gray-500 truncate mt-0.5">{PROTOCOL_STEPS[step].desc}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            {timerActive && (
                                <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gray-100 border border-gray-200">
                                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                                    <span className="text-xs font-mono font-bold text-gray-600">{fmtTime(timer)}</span>
                                </div>
                            )}
                            <button onClick={resetLab} className="p-2 rounded-xl bg-gray-100 border border-gray-200 hover:bg-red-50 hover:border-red-200 transition-colors group">
                                <RotateCcw className="w-4 h-4 text-gray-500 group-hover:text-red-500" />
                            </button>
                            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-2xl px-3 py-1.5 shadow-sm">
                                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                <div className="text-right">
                                    <div className="text-[10px] text-gray-400 uppercase leading-none">Score</div>
                                    <div className="text-base font-black text-gray-800 leading-none">{score}<span className="text-xs text-gray-400 font-normal">/500</span></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 relative overflow-hidden min-h-0" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={() => { if (measuringDiskId) { setMeasuringDiskId(null); setMeasureDistance(0); } }}>
                        <AnimatePresence>
                            {notification && (
                                <motion.div
                                    initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                                    className={`absolute top-3 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 max-w-xs text-sm font-semibold border ${notification.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : notification.type === 'error' ? 'bg-red-50 text-red-800 border-red-200' : notification.type === 'warn' ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-blue-50 text-blue-800 border-blue-200'}`}
                                >
                                    {notification.type === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : notification.type === 'error' ? <AlertCircle className="w-4 h-4 flex-shrink-0" /> : <Info className="w-4 h-4 flex-shrink-0" />}
                                    <span className="truncate">{notification.msg}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {(step === 2) && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="absolute bottom-16 sm:bottom-20 left-3 sm:left-6 z-30 cursor-pointer"
                                onClick={() => setFlameUsed(v => { if (!v) { addScore(15, 'Sterile technique applied'); notify('Bunsen burner lit — aseptic conditions.', 'success'); } else notify('Burner extinguished.', 'info'); return !v; })}>
                                <BunsenBurnerSVG lit={flameUsed} />
                                <div className={`text-center text-[10px] font-bold mt-1 ${flameUsed ? 'text-orange-600' : 'text-gray-400'}`}>{flameUsed ? 'Lit ✓' : 'Click'}</div>
                            </motion.div>
                        )}

                        {step === 2 && streaks < 3 && selectedOrg && (
                            <motion.div
                                drag dragElastic={0}
                                whileDrag={{ scale: 1.08, filter: 'drop-shadow(0 12px 28px rgba(0,0,0,0.45))' }}
                                onDragEnd={(_, info) => {
                                    const rect = plateRef.current?.getBoundingClientRect();
                                    if (!rect) return;
                                    const plateCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
                                    if (Math.hypot(info.point.x - plateCenter.x, info.point.y - plateCenter.y) < 120) {
                                        if (!flameUsed) { setContaminated(true); deductScore(30, 'Contamination! Flame the loop first'); }
                                        else if (streaks < 3) {
                                            setStreaks(s => { const nxt = s + 1; addScore(25, `Streak pass ${nxt}/3`); if (nxt === 3) notify('Confluent bacterial lawn established.', 'success'); return nxt; });
                                        }
                                    } else notify('Drag the swab directly over the agar surface.', 'error');
                                }}
                                className="absolute right-[10%] sm:right-[16%] top-[20%] z-30 cursor-grab touch-none"
                            >
                                <SwabSVG />
                                <div className="text-center text-[10px] font-bold text-amber-600 mt-1">{streaks}/3 passes</div>
                            </motion.div>
                        )}

                        <AnimatePresence>
                            {step === 0 && !agarPoured && (
                                <motion.div
                                    drag dragConstraints={{ left: -300, right: 300, top: -200, bottom: 200 }} dragElastic={0.1}
                                    whileDrag={{ scale: 1.05, rotate: -15, filter: 'drop-shadow(0 12px 32px rgba(0,0,0,0.4))' }}
                                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                                    onDragEnd={(_, info) => {
                                        const rect = plateRef.current?.getBoundingClientRect();
                                        if (rect && Math.hypot(info.point.x - (rect.left + rect.width / 2), info.point.y - (rect.top + rect.height / 2)) < 110) {
                                            setAgarPoured(true); addScore(50, 'Mueller-Hinton agar poured'); notify('MHA poured to 4 mm depth. pH 7.2–7.4 confirmed.', 'success');
                                        } else notify('Tilt bottle directly over the petri dish.', 'error');
                                    }}
                                    className="absolute left-[5%] sm:left-[8%] top-[15%] sm:top-[20%] z-30 cursor-grab touch-none"
                                >
                                    <AgarBottleSVG />
                                    <p className="text-center text-[10px] font-bold text-green-700 mt-1">Drag → dish</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {step === 1 && (
                            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="absolute right-2 sm:right-6 top-[12%] flex flex-col gap-2 z-30 max-h-[75%] overflow-y-auto pr-1">
                                <div className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest px-1 mb-1">Culture Collection</div>
                                {ORGANISMS.map(org => (
                                    <motion.button key={org.id} onClick={() => { setSelectedOrg(org); addScore(50, `Isolate: ${org.short}`); }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                        className={`w-40 sm:w-52 bg-white/95 backdrop-blur-sm border-2 rounded-2xl p-3 text-left transition-all shadow-md ${selectedOrg?.id === org.id ? 'border-blue-500 shadow-blue-200' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-black text-white" style={{ background: org.color }}>{org.gram.includes('positive') ? 'G+' : 'G−'}</div>
                                            <div className="min-w-0"><div className="text-xs font-extrabold text-gray-800 italic leading-tight truncate">{org.short}</div><div className="text-[9px] text-gray-400 font-medium uppercase truncate">{org.atcc}</div></div>
                                        </div>
                                        {selectedOrg?.id === org.id && <div className="mt-2 flex items-center gap-1"><CheckCircle className="w-3 h-3 text-blue-600" /><span className="text-[10px] font-bold text-blue-600">Selected</span></div>}
                                    </motion.button>
                                ))}
                            </motion.div>
                        )}

                        {step === 3 && placedDisks.length < 5 && selectedOrg && (
                            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="absolute right-2 sm:right-6 top-[10%] z-30">
                                <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl p-3 shadow-xl w-44 sm:w-52">
                                    <div className="flex items-center gap-1.5 mb-3"><div className="w-4 h-4 rounded bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center"><Pipette className="w-2.5 h-2.5 text-white" /></div><span className="text-[10px] font-extrabold text-gray-700 uppercase tracking-wider">Antibiotic Disks</span></div>
                                    <div className="grid grid-cols-3 gap-1.5">
                                        {DISKS.map(disk => {
                                            const placed = placedDisks.includes(disk.id);
                                            return (
                                                <motion.div key={disk.id} drag={!placed} dragSnapToOrigin
                                                    whileDrag={{ scale: 1.15, zIndex: 100, filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.35))' }}
                                                    onDragEnd={(_, info) => {
                                                        if (placed) return;
                                                        const rect = plateRef.current?.getBoundingClientRect();
                                                        if (rect && Math.hypot(info.point.x - (rect.left + rect.width / 2), info.point.y - (rect.top + rect.height / 2)) < 100) {
                                                            const relX = (info.point.x - (rect.left + rect.width / 2)) / (rect.width / 2) * 45;
                                                            const relY = (info.point.y - (rect.top + rect.height / 2)) / (rect.height / 2) * 45;
                                                            if (isValidPlacement(relX, relY, disk.id)) {
                                                                setDiskPositions(p => ({ ...p, [disk.id]: { x: relX, y: relY } }));
                                                                setPlacedDisks(p => [...p, disk.id]);
                                                                addScore(25, `${disk.id} placed`);
                                                            }
                                                        } else notify(`Drop ${disk.id} onto the agar plate.`, 'error');
                                                    }}
                                                    className={`h-14 rounded-xl border-2 flex flex-col items-center justify-center gap-0.5 select-none ${placed ? 'opacity-25 bg-gray-100 cursor-not-allowed' : 'bg-white hover:bg-gray-50 cursor-grab touch-none shadow-sm'}`}
                                                    style={{ borderColor: disk.color }}
                                                >
                                                    <div className="w-7 h-7 rounded-full border-2 flex items-center justify-center" style={{ borderColor: disk.color, background: `${disk.color}15` }}><span className="text-[8px] font-black" style={{ color: disk.color }}>{disk.id}</span></div>
                                                    <span className="text-[8px] text-gray-500 font-medium leading-none">{disk.shortClass.split(' ')[0]}</span>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                    <p className="text-[9px] text-gray-400 text-center mt-2">{placedDisks.length}/5 placed · need ≥4</p>
                                </div>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="absolute right-3 sm:right-8 top-[8%] sm:top-[10%] z-30">
                                <div ref={incubatorRef}>
                                    <IncubatorSVG 
                                        progress={incubationProgress} 
                                        org={selectedOrg} 
                                        disks={placedDisks} 
                                        done={incubationDone} 
                                        doorOpen={incubatorDoorOpen}
                                        plateInside={plateInIncubator}
                                        onToggleDoor={() => setIncubatorDoorOpen(v => !v)}
                                    />
                                </div>
                                
                                {/* Plate drag target hint */}
                                {!plateInIncubator && !incubationDone && (
                                    <motion.div
                                        drag={step === 4 && !plateInIncubator}
                                        dragSnapToOrigin
                                        onDragEnd={(_, info) => handlePlateDragToIncubator(info)}
                                        className="absolute left-1/2 -translate-x-1/2 -bottom-8 cursor-grab touch-none"
                                    >
                                        <div className="text-center text-[10px] font-bold text-blue-600 bg-white/90 px-3 py-1 rounded-full border border-blue-200 shadow-sm">
                                            Drag plate here
                                        </div>
                                    </motion.div>
                                )}
                                
                                {/* Start incubation button */}
                                {plateInIncubator && !incubating && !incubationDone && !incubatorDoorOpen && (
                                    <button
                                        onClick={startIncubation}
                                        className="absolute left-1/2 -translate-x-1/2 -bottom-8 px-4 py-1.5 bg-gradient-to-r from-blue-600 to-green-400 text-white text-xs font-bold rounded-full shadow-md"
                                    >
                                        Start Incubation
                                    </button>
                                )}
                                
                                <p className="text-center text-[10px] text-gray-500 font-medium mt-12">
                                    {!plateInIncubator ? 'Load plate →' : incubatorDoorOpen ? 'Close door' : !incubationDone ? 'Ready to start' : 'Complete'}
                                </p>
                            </motion.div>
                        )}

                        {step === 5 && incubationDone && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="absolute left-3 sm:left-6 bottom-24 sm:bottom-28 z-30">
                                <div className="bg-white border border-gray-200 rounded-2xl p-3 shadow-lg flex items-center gap-3">
                                    <Ruler className="w-5 h-5 text-blue-600" />
                                    <div>
                                        <p className="text-xs font-bold text-gray-800">Measurement Mode</p>
                                        <p className="text-[10px] text-gray-500">Click a disk and drag outward – the line snaps to the true zone edge.</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        <div ref={plateRef} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20" style={{ width: 'min(50vw,260px)', height: 'min(50vw,260px)' }}>
                            <PetriDishSVG
                                org={selectedOrg} placedDisks={placedDisks} diskPositions={diskPositions}
                                measuredZones={measuredZones} streaks={streaks} agarPoured={agarPoured}
                                incubationDone={incubationDone} calcZone={calcZone} interpret={interpret}
                                step={step} onDiskMouseDown={handleDiskMouseDown}
                                measuringDiskId={measuringDiskId} measureDistance={measureDistance}
                            />
                            {agarPoured && (
                                <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 flex items-center gap-1.5 whitespace-nowrap">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                                    <span className="text-[10px] font-medium text-gray-500">MHA · {selectedOrg?.short || 'Uninoculated'} · 90mm</span>
                                </div>
                            )}
                        </div>

                        {contaminated && (
                            <div className="absolute top-16 right-4 sm:right-8 z-30 bg-red-50 border border-red-300 rounded-2xl p-3 flex items-start gap-2 max-w-[200px] shadow-lg">
                                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                <div><p className="text-xs font-bold text-red-700">Contaminated!</p><p className="text-[10px] text-red-600 mt-0.5">Flame the loop before streaking. −30 XP</p></div>
                            </div>
                        )}

                        {step === 5 && incubationDone && Object.keys(measuredZones).length < placedDisks.length && (
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-white/90 backdrop-blur-sm border border-blue-200 rounded-2xl px-4 py-2 flex items-center gap-2 shadow-md whitespace-nowrap">
                                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                <span className="text-xs font-semibold text-blue-700">{Object.keys(measuredZones).length}/{placedDisks.length} zones measured — click a ring to measure</span>
                            </div>
                        )}
                    </div>

                    <div className="flex-shrink-0 bg-white/95 backdrop-blur-sm border-t border-gray-200/80 px-3 sm:px-5 py-3 flex items-center justify-between gap-3 shadow-sm">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-3 py-1.5 rounded-2xl text-xs font-extrabold ${score >= 450 ? 'bg-green-100 text-green-700' : score >= 350 ? 'bg-blue-100 text-blue-700' : score >= 250 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>{grade}</span>
                            {flameUsed && <span className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-orange-50 border border-orange-200 text-[10px] font-bold text-orange-700"><Flame className="w-3 h-3" />Aseptic</span>}
                            {contaminated && <span className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-red-50 border border-red-200 text-[10px] font-bold text-red-700"><AlertTriangle className="w-3 h-3" />Contaminated</span>}
                            {step === 5 && <span className="flex items-center gap-1 text-xs text-gray-500"><Ruler className="w-3.5 h-3.5 text-blue-500" />{Object.keys(measuredZones).length}/{placedDisks.length} measured</span>}
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setMobileDrawerOpen(true)} className="md:hidden p-2 rounded-xl bg-blue-50 border border-blue-200"><BookOpen className="w-4 h-4 text-blue-600" /></button>
                            <motion.button
                                onClick={advanceStep} disabled={!canAdvance() && step !== 6}
                                whileHover={canAdvance() ? { scale: 1.03 } : {}} whileTap={canAdvance() ? { scale: 0.97 } : {}}
                                className={`px-5 sm:px-7 py-2.5 rounded-2xl font-extrabold text-sm flex items-center gap-2 transition-all shadow-md ${canAdvance() ? 'bg-gradient-to-r from-blue-600 to-green-400 text-white hover:shadow-lg' : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'}`}
                            >
                                {step === 6 ? <>View Report <FileText className="w-4 h-4" /></> : <>Confirm &amp; Proceed <ChevronRight className="w-4 h-4" /></>}
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {showReport && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6">
                        <motion.div initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }} className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                            <div className="bg-gradient-to-r from-blue-600 to-green-400 px-6 py-4 flex items-center justify-between flex-shrink-0">
                                <div><h2 className="text-lg font-extrabold text-white">Antimicrobial Susceptibility Report</h2><p className="text-xs text-white/80 mt-0.5">PharmaWallah Clinical Microbiology · CLSI M100</p></div>
                                <button onClick={() => setShowReport(false)} className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors"><X className="w-5 h-5 text-white" /></button>
                            </div>
                            <div className="overflow-y-auto flex-1 p-6 space-y-5">
                                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                                    <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">Clinical Case</p>
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
                                            const zone = measuredZones[id] || calcZone(id);
                                            const r = interpret(id, zone);
                                            const disk = DISKS.find(d => d.id === id)!;
                                            const c = r === 'S' ? { bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-100 text-green-700', bar: 'bg-green-500' } : r === 'R' ? { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700', bar: 'bg-red-500' } : { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700', bar: 'bg-amber-500' };
                                            return (
                                                <div key={id} className={`${c.bg} border ${c.border} rounded-2xl p-3 sm:p-4 flex items-center gap-3`}>
                                                    <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-xs font-black flex-shrink-0" style={{ borderColor: disk.color, color: disk.color, background: `${disk.color}15` }}>{disk.id}</div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-extrabold text-gray-800 text-sm">{disk.name}</div>
                                                        <div className="text-[10px] text-gray-500">{disk.shortClass} · S≥{disk.bpS} I({disk.bpR + 1}–{disk.bpS - 1}) R≤{disk.bpR}</div>
                                                        <div className="mt-1 h-1.5 bg-white/60 rounded-full overflow-hidden w-full"><div className={`h-full ${c.bar} rounded-full`} style={{ width: `${Math.min(100, (zone / 35) * 100)}%` }} /></div>
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
                                    <div><div className="text-white/70 text-xs font-medium uppercase tracking-wider">Final Score</div><div className="text-white font-black text-3xl">{score}<span className="text-lg opacity-60">/500</span></div></div>
                                    <div className="text-right"><div className="text-white/70 text-xs font-medium uppercase tracking-wider">Grade</div><div className="text-white font-black text-4xl">{grade}</div></div>
                                    <div className="text-right"><div className="text-white/70 text-xs font-medium uppercase tracking-wider">Time</div><div className="text-white font-bold text-xl font-mono">{fmtTime(timer)}</div></div>
                                </div>
                            </div>
                            <div className="border-t border-gray-200 p-4 flex flex-wrap justify-end gap-3 flex-shrink-0">
                                <button onClick={resetLab} className="px-4 py-2.5 rounded-2xl border-2 border-gray-200 font-bold text-sm text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all">New Simulation</button>
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => generatePDFReport(selectedOrg, placedDisks, measuredZones, calcZone, interpret, score, grade)} className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-green-400 text-white font-extrabold text-sm flex items-center gap-2 shadow-md">
                                    <Download className="w-4 h-4" />Download PDF Report
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}