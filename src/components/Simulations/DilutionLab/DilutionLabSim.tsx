'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import {
    CheckCircle, AlertTriangle, X, ChevronRight, RotateCcw,
    Download, BookOpen, AlertCircle, FileText,
    Menu, ChevronLeft, FlaskConical, Pipette, MoveHorizontal,
    Clock, Info, Star, ArrowRight,
    Droplets, Award, Beaker,
    HelpCircle, Zap, ArrowLeft, Calculator,
} from 'lucide-react';
import jsPDF from 'jspdf';

// ────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────
type Phase = 'tutorial' | 'quiz' | 'sim';
type NotifType = 'success' | 'error' | 'info' | 'warn';

interface Compound {
    id: string;
    name: string;
    formula: string;
    color: string;
    stockConcentration: number;   // mol/L
    stockVolume: number;          // mL available
    unit: string;
    description: string;
    desiredOptions: number[];
}

// ────────────────────────────────────────────────────────────
// DATA
// ────────────────────────────────────────────────────────────
const COMPOUNDS: Compound[] = [
    {
        id: 'nacl', name: 'Sodium Chloride', formula: 'NaCl', color: '#2563eb',
        stockConcentration: 2.0, stockVolume: 500, unit: 'M',
        description: 'Common salt, used in saline IV fluids.',
        desiredOptions: [0.5, 0.1, 0.05],
    },
    {
        id: 'naoh', name: 'Sodium Hydroxide', formula: 'NaOH', color: '#16a34a',
        stockConcentration: 1.0, stockVolume: 250, unit: 'M',
        description: 'Strong base, used for pH adjustment and titrations.',
        desiredOptions: [0.2, 0.1, 0.05],
    },
    {
        id: 'hcl', name: 'Hydrochloric Acid', formula: 'HCl', color: '#dc2626',
        stockConcentration: 12.0, stockVolume: 250, unit: 'M',
        description: 'Concentrated strong acid, highly corrosive.',
        desiredOptions: [1.0, 0.5, 0.1],
    },
    {
        id: 'glucose', name: 'D-Glucose', formula: 'C₆H₁₂O₆', color: '#ea580c',
        stockConcentration: 1.0, stockVolume: 500, unit: 'M',
        description: 'Simple sugar, used in culture media.',
        desiredOptions: [0.2, 0.1, 0.05],
    },
    {
        id: 'acetic', name: 'Acetic Acid', formula: 'CH₃COOH', color: '#7c3aed',
        stockConcentration: 17.4, stockVolume: 100, unit: 'M',
        description: 'Glacial acetic acid, weak organic acid.',
        desiredOptions: [1.0, 0.5, 0.1],
    },
    {
        id: 'kmno4', name: 'Potassium Permanganate', formula: 'KMnO₄', color: '#7c3aed',
        stockConcentration: 0.2, stockVolume: 200, unit: 'M',
        description: 'Deep purple oxidising agent.',
        desiredOptions: [0.02, 0.01, 0.005],
    },
];

const SIM_STEPS = [
    { title: 'Select Compound & Task', desc: 'Choose a chemical and the desired final concentration.', icon: FlaskConical },
    { title: 'Gather Equipment', desc: 'Identify the required glassware.', icon: Beaker },
    { title: 'Calculate Required Volume', desc: 'Use C₁V₁ = C₂V₂ to find the volume of stock needed.', icon: Calculator },
    { title: 'Pipette the Stock', desc: 'Drag the pipette to the stock bottle and draw the required volume.', icon: Pipette },
    { title: 'Transfer to Volumetric Flask', desc: 'Drag the pipette to the flask and dispense the stock.', icon: ArrowRight },
    { title: 'Top Up with Solvent', desc: 'Drag the wash bottle to the flask to add distilled water until the meniscus reaches the mark.', icon: Droplets },
    { title: 'Mix & Verify', desc: 'Stopper the flask, invert to mix, and check your final concentration.', icon: CheckCircle },
];

const TUTORIAL_SLIDES = [
    { icon: '🧪', color: 'from-blue-600 to-cyan-500', title: 'Why Do We Dilute?', body: 'In laboratories, we often need lower concentrations from a stock solution. Dilution adds solvent to reduce the concentration of the solute while keeping the amount of solute constant.', highlight: 'Dilution reduces concentration, not moles.' },
    { icon: '📐', color: 'from-purple-600 to-pink-500', title: 'The Dilution Equation', body: 'C₁V₁ = C₂V₂\nC₁: stock concentration\nV₁: volume of stock to take\nC₂: desired final concentration\nV₂: desired final volume', highlight: 'C₁V₁ = C₂V₂ is your best friend.' },
    { icon: '⚗️', color: 'from-green-600 to-emerald-500', title: 'Volumetric Glassware', body: 'Always use a volumetric flask for precise dilutions. The calibration mark ensures the exact total volume. A pipette is used to measure the stock solution accurately.', highlight: 'Pipette + Volumetric Flask = Accuracy.' },
    { icon: '💧', color: 'from-amber-500 to-orange-500', title: 'Proper Technique', body: '1. Pipette the calculated stock.\n2. Dispense into the flask.\n3. Add solvent until the meniscus touches the mark.\n4. Stopper and invert to mix.\n• Never overshoot the mark!', highlight: 'Read the meniscus at eye level.' },
];

const QUIZ_QUESTIONS = [
    { q: 'What does the dilution equation C₁V₁ = C₂V₂ represent?', opts: ['Conservation of mass', 'Constant moles of solute', 'Ideal gas law', 'Beer-Lambert law'], correct: 1, explanation: 'The moles of solute remain the same: moles = C × V.' },
    { q: 'Which piece of glassware provides the most precise final volume?', opts: ['Beaker', 'Graduated cylinder', 'Volumetric flask', 'Erlenmeyer flask'], correct: 2, explanation: 'Volumetric flasks are calibrated to contain a specific volume with high accuracy.' },
    { q: 'What is the correct order of steps?', opts: ['Pipette → Top up → Transfer → Mix', 'Pipette → Transfer → Top up → Mix', 'Transfer → Pipette → Top up → Mix', 'Mix → Pipette → Transfer → Top up'], correct: 1, explanation: 'First pipette the stock, then transfer it to the flask, then add solvent to the mark, and finally mix.' },
    { q: 'Why should you avoid adding too much solvent past the calibration mark?', opts: ['It changes the concentration unpredictably', 'It wastes solvent', 'It causes the flask to overflow', 'It breaks the glass'], correct: 0, explanation: 'Once you overshoot the mark, the final volume is no longer known exactly, making the concentration inaccurate.' },
];

// ────────────────────────────────────────────────────────────
// ANIMATED LABWARE SVG COMPONENTS
// ────────────────────────────────────────────────────────────
function VolumetricFlaskSVG({ fillLevel, solutionColor, hasStopper }: {
    fillLevel: number;
    solutionColor: string;
    hasStopper: boolean;
}) {
    const maxY = 170; // bottom of liquid area
    const minY = 32;  // calibration mark Y
    const liquidHeight = maxY - minY;
    const currentY = maxY - liquidHeight * Math.min(fillLevel, 1);
    const bulge = Math.min(fillLevel, 1) * 3;



    return (
        <svg viewBox="0 0 120 220" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#e5e7eb" />
                    <stop offset="50%" stopColor="#f8fafc" />
                    <stop offset="100%" stopColor="#d1d5db" />
                </linearGradient>
                <clipPath id="flaskClip">
                    <path d="M42,20 L42,155 Q42,200 60,200 Q78,200 78,155 L78,20 Z" />
                </clipPath>
            </defs>

            {/* Flask body */}
            <path d="M42,20 L42,155 Q42,200 60,200 Q78,200 78,155 L78,20 Z" fill="url(#glassGrad)" stroke="#9ca3af" strokeWidth="1.5" />
            <rect x="44" y="16" width="32" height="40" fill="none" stroke="#9ca3af" strokeWidth="1.5" />
            {/* Calibration mark */}
            <line x1="44" y1={minY} x2="76" y2={minY} stroke="#3b82f6" strokeWidth="2" strokeDasharray="4,2" />
            <text x="80" y={minY + 4} fontSize="6" fill="#3b82f6" fontWeight="bold">100 mL</text>

            {/* Liquid with CSS transitions */}
            <g clipPath="url(#flaskClip)">
                <rect
                    x="42"
                    y={currentY}
                    width="36"
                    height={maxY - currentY}
                    fill={solutionColor}
                    opacity="0.85"
                    style={{ transition: 'y 0.4s ease, height 0.4s ease' }}
                />
                <ellipse
                    cx="60"
                    cy={currentY + bulge}
                    rx="18"
                    ry="3"
                    fill="rgba(255,255,255,0.35)"
                    style={{ transition: 'cy 0.4s ease' }}
                />
            </g>

            {/* Stopper */}
            {hasStopper && (
                <g>
                    <rect x="56" y="0" width="8" height="16" rx="2" fill="#f87171" stroke="#dc2626" strokeWidth="1" />
                    <ellipse cx="60" cy="0" rx="10" ry="3" fill="#f87171" stroke="#dc2626" strokeWidth="1" />
                </g>
            )}

            {/* Glass highlight */}
            <path d="M45,25 L45,150" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
        </svg>
    );
}

function GraduatedPipetteSVG({ volume, maxVolume, liquidColor }: {
    volume: number;
    maxVolume: number;
    liquidColor: string;
}) {
    const level = Math.min(volume / maxVolume, 1);
    const maxLiquidHeight = 140; // px
    const liquidHeight = level * maxLiquidHeight;
    const y = 170 - liquidHeight; // bottom is 170, liquid goes up

    return (
        <svg viewBox="0 0 60 200" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="pipGlass" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#d1d5db" />
                    <stop offset="50%" stopColor="#f8fafc" />
                    <stop offset="100%" stopColor="#9ca3af" />
                </linearGradient>
            </defs>
            {/* Bulb */}
            <ellipse cx="30" cy="15" rx="18" ry="12" fill="#cbd5e1" stroke="#9ca3af" strokeWidth="1.5" />
            <rect x="24" y="24" width="12" height="8" fill="#9ca3af" />
            {/* Tube */}
            <rect x="27" y="30" width="6" height="140" fill="url(#pipGlass)" stroke="#9ca3af" strokeWidth="1" />
            {/* Liquid column with transition */}
            <rect
                x="27.5"
                y={y}
                width="5"
                height={liquidHeight}
                fill={liquidColor}
                opacity="0.9"
                style={{ transition: 'y 0.4s ease, height 0.4s ease' }}
            />
            {/* Gradations */}
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => {
                const gy = 170 - (i / 10) * 140;
                return (
                    <line key={i} x1="33" y1={gy} x2="40" y2={gy} stroke="#6b7280" strokeWidth={i % 5 === 0 ? 1.5 : 0.5} />
                );
            })}
            {/* Plunger */}
            <rect x="25" y="170" width="10" height="20" rx="2" fill="#d1d5db" stroke="#9ca3af" strokeWidth="1" />
            <circle cx="30" cy="185" r="6" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1" />
            {/* Tip */}
            <polygon points="27,170 30,185 33,170" fill="#9ca3af" />
        </svg>
    );
}

function StockBottleSVG({ compound }: { compound: Compound }) {
    return (
        <svg viewBox="0 0 80 110" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id={`stockGlass-${compound.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#d1d5db" />
                    <stop offset="50%" stopColor="#f8fafc" />
                    <stop offset="100%" stopColor="#9ca3af" />
                </linearGradient>
            </defs>
            <rect x="20" y="30" width="40" height="70" rx="10" fill={`url(#stockGlass-${compound.id})`} stroke="#9ca3af" strokeWidth="1.5" />
            <rect x="25" y="40" width="30" height="55" rx="6" fill={compound.color} opacity="0.7" />
            <rect x="30" y="10" width="20" height="20" rx="4" fill="#cbd5e1" stroke="#9ca3af" strokeWidth="1.5" />
            <text x="40" y="65" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">{compound.formula}</text>
            <text x="40" y="85" textAnchor="middle" fontSize="6" fill="white">{compound.stockConcentration} M</text>
        </svg>
    );
}

function WashBottleSVG() {
    return (
        <svg viewBox="0 0 80 120" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="washGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#bfdbfe" />
                    <stop offset="50%" stopColor="#e0f2fe" />
                    <stop offset="100%" stopColor="#7dd3fc" />
                </linearGradient>
            </defs>
            <rect x="20" y="30" width="40" height="70" rx="15" fill="url(#washGrad)" stroke="#38bdf8" strokeWidth="1.5" />
            <rect x="30" y="15" width="20" height="20" rx="5" fill="#bae6fd" stroke="#38bdf8" strokeWidth="1.5" />
            <rect x="32" y="12" width="16" height="8" rx="3" fill="#0ea5e9" />
            <path d="M40,12 L40,0" stroke="#0ea5e9" strokeWidth="3" />
            <circle cx="40" cy="-2" r="3" fill="#0ea5e9" />
            <rect x="25" y="45" width="30" height="20" rx="3" fill="white" opacity="0.8" />
            <text x="40" y="58" fontSize="5" textAnchor="middle" fill="#0369a1" fontWeight="bold">dH₂O</text>
        </svg>
    );
}

// ────────────────────────────────────────────────────────────
// PDF REPORT GENERATOR
// ────────────────────────────────────────────────────────────
const generateReportPDF = (
    compound: Compound | null,
    finalConcentration: number,
    finalVolume: number,
    stockVolumeUsed: number,
    score: number,
    grade: string,
    timer: number,
) => {
    const doc = new jsPDF();
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    doc.setFillColor(37, 99, 235); doc.rect(0, 0, W, 32, 'F');
    doc.setFillColor(22, 163, 74); doc.rect(0, 29, W, 4, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(20); doc.setFont('helvetica', 'bold');
    doc.text('PharmaWallah', 15, 16);
    doc.setFontSize(9); doc.setFont('helvetica', 'normal');
    doc.text('Chemistry Lab — Dilution Preparation Report', 15, 26);
    doc.text(new Date().toLocaleString('en-PK'), W - 15, 16, { align: 'right' });
    doc.setTextColor(30, 41, 59); doc.setFontSize(14); doc.setFont('helvetica', 'bold');
    doc.text('Dilution Lab Report', 15, 48);
    doc.setFillColor(248, 250, 252); doc.roundedRect(15, 54, W - 30, 50, 3, 3, 'F');
    doc.setFontSize(9);
    doc.text(`Compound: ${compound?.name || 'N/A'} (${compound?.formula || ''})`, 20, 63);
    doc.text(`Stock concentration: ${compound?.stockConcentration} M`, 20, 72);
    doc.text(`Desired concentration: ${finalConcentration} M`, 20, 81);
    doc.text(`Final volume: ${finalVolume} mL`, 20, 90);
    doc.text(`Volume of stock used: ${stockVolumeUsed.toFixed(2)} mL`, 20, 99);
    doc.setFontSize(12); doc.setFont('helvetica', 'bold');
    doc.text('Verification', 15, 115);
    const computedConc = (stockVolumeUsed * (compound?.stockConcentration || 0)) / finalVolume;
    doc.setFontSize(8); doc.setFont('helvetica', 'normal');
    doc.text(`Calculated final concentration = (C₁V₁)/V₂ = ${computedConc.toFixed(3)} M`, 18, 126);
    const diff = Math.abs(computedConc - finalConcentration);
    doc.setFont('helvetica', 'bold');
    doc.text(diff < 0.001 ? '✓ Concentration verified — dilution is accurate!' : `✗ Concentration mismatch — expected ${finalConcentration} M, got ${computedConc.toFixed(3)} M`, 18, 132);
    doc.setFillColor(239, 246, 255); doc.roundedRect(15, 140, W - 30, 20, 3, 3, 'F');
    doc.setFontSize(9); doc.setTextColor(30, 41, 59);
    doc.text(`Score: ${score}/500  ·  Grade: ${grade}`, 20, 150);
    doc.setFillColor(241, 245, 249); doc.rect(0, H - 22, W, 22, 'F');
    doc.setTextColor(100, 116, 139); doc.setFontSize(8);
    doc.text(`Time: ${String(Math.floor(timer / 60)).padStart(2, '0')}:${String(timer % 60).padStart(2, '0')}`, 15, H - 13);
    doc.text("PharmaWallah – Pakistan's Leading Pharmacy eLearning Platform", W / 2, H - 6, { align: 'center' });
    doc.save(`PharmaWallah_DilutionLab_${compound?.id || 'report'}_${Date.now()}.pdf`);
};

// ────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ────────────────────────────────────────────────────────────
export default function PharmaWallahDilutionLab() {
    // Phase state
    const [phase, setPhase] = useState<Phase>('tutorial');
    const [tutSlide, setTutSlide] = useState(0);
    const [quizIdx, setQuizIdx] = useState(0);
    const [quizChosen, setQuizChosen] = useState<number | null>(null);
    const [quizScore, setQuizScore] = useState(0);
    const [quizDone, setQuizDone] = useState(false);

    // Sim state
    const [step, setStep] = useState(0);
    const [score, setScore] = useState(0);
    const [notification, setNotification] = useState<{ msg: string; type: NotifType } | null>(null);
    const [timer, setTimer] = useState(0);
    const [timerActive, setTimerActive] = useState(false);

    const [selectedCompound, setSelectedCompound] = useState<Compound | null>(null);
    const [finalVolume, setFinalVolume] = useState(100);
    const [desiredConc, setDesiredConc] = useState<number | null>(null);
    const [calculatedStockVol, setCalculatedStockVol] = useState<number | null>(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [pipetteVolume, setPipetteVolume] = useState(0);
    const [flaskFillLevel, setFlaskFillLevel] = useState(0);
    const [toppedUp, setToppedUp] = useState(false);
    const [mixed, setMixed] = useState(false);
    const [showReport, setShowReport] = useState(false);
    const [stockDrawn, setStockDrawn] = useState(false);

    // UI
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'task' | 'materials' | 'protocol' | 'results'>('task');
    const [isMobile, setIsMobile] = useState(false);

    const stockBottleRef = useRef<HTMLDivElement>(null);
    const flaskRef = useRef<HTMLDivElement>(null);

    const [isFilling, setIsFilling] = useState(false);
    const fillIntervalRef = useRef<NodeJS.Timeout | null>(null);


    // Continuous fill while wash bottle is over the flask
    useEffect(() => {
        if (!isFilling || toppedUp) return;
        const interval = setInterval(() => {
            setFlaskFillLevel((prev) => {
                const next = Math.min(1, prev + 0.02);
                if (next >= 1) {
                    setToppedUp(true);
                    addScore(75, 'Meniscus reached the mark');
                    notify('Perfect! The meniscus is exactly at the calibration mark.', 'success');
                    return 1;
                }
                return next;
            });
        }, 100);
        return () => clearInterval(interval);
    }, [isFilling, toppedUp]);

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

    // Timer
    useEffect(() => {
        if (!timerActive) return;
        const id = setInterval(() => setTimer(t => t + 1), 1000);
        return () => clearInterval(id);
    }, [timerActive]);
    useEffect(() => { if (step === 0 && selectedCompound) setTimerActive(true); }, [step, selectedCompound]);

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

    const expectedStockVol = desiredConc && selectedCompound
        ? (desiredConc * finalVolume) / selectedCompound.stockConcentration
        : 0;

    const canAdvance = (): boolean => {
        switch (step) {
            case 0: return selectedCompound !== null && desiredConc !== null;
            case 1: return true;
            case 2: return calculatedStockVol !== null;
            case 3: return stockDrawn && pipetteVolume > 0;
            case 4: return flaskFillLevel > 0;
            case 5: return toppedUp;
            case 6: return mixed;
            default: return true;
        }
    };

    const advanceStep = () => {
        if (!canAdvance()) { notify('Complete the current step first.', 'error'); return; }
        if (step === 6) { setShowReport(true); return; }
        setStep(p => p + 1);
    };

    const resetLab = () => {
        setStep(0); setScore(0); setTimer(0); setTimerActive(false);
        setSelectedCompound(null); setDesiredConc(null);
        setUserAnswer(''); setCalculatedStockVol(null);
        setPipetteVolume(0); setFlaskFillLevel(0);
        setToppedUp(false); setMixed(false); setStockDrawn(false);
        setShowReport(false);
        notify('Lab reset.', 'info');
    };

    const grade = score >= 450 ? 'A+' : score >= 400 ? 'A' : score >= 350 ? 'B' : score >= 250 ? 'C' : 'F';
    const fmtTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

    // ── DRAG HANDLERS ──────────────────────────────────────
    // ── DRAG HANDLERS ──────────────────────────────────────
    const handlePipetteDragEndForStock = (info: PanInfo) => {
        if (step !== 3 || stockDrawn || calculatedStockVol === null) return;
        const bottleRect = stockBottleRef.current?.getBoundingClientRect();
        if (!bottleRect) return;
        if (
            info.point.x > bottleRect.left && info.point.x < bottleRect.right &&
            info.point.y > bottleRect.top && info.point.y < bottleRect.bottom
        ) {
            setStockDrawn(true);
            setPipetteVolume(calculatedStockVol);
            addScore(50, 'Stock drawn into pipette');
            notify('Pipette filled with stock solution!', 'success');
        }
    };

    const handlePipetteDragEndForTransfer = (info: PanInfo) => {
        if (step !== 4 || flaskFillLevel > 0) return;
        const flaskEl = flaskRef.current?.getBoundingClientRect();
        if (!flaskEl) return;
        if (
            info.point.x > flaskEl.left && info.point.x < flaskEl.right &&
            info.point.y > flaskEl.top && info.point.y < flaskEl.bottom
        ) {
            setFlaskFillLevel(pipetteVolume / finalVolume);
            setPipetteVolume(0);   // ← empties the pipette after dispensing
            addScore(50, 'Stock transferred to flask');
            notify('Stock dispensed into volumetric flask.', 'success');
        }
    };

    // Wash bottle – start/stop continuous fill
    const handleWashBottleDrag = (_: unknown, info: PanInfo) => {
        if (step !== 5 || toppedUp) return;
        const flaskEl = flaskRef.current?.getBoundingClientRect();
        if (!flaskEl) return;
        const overFlask =
            info.point.x > flaskEl.left && info.point.x < flaskEl.right &&
            info.point.y > flaskEl.top && info.point.y < flaskEl.bottom;
        setIsFilling(overFlask);
    };

    const handleWashBottleDragEnd = () => {
        setIsFilling(false);
    };

    // ── QUIZ LOGIC ─────────────────────────────────────────
    const handleQuizAnswer = (optIdx: number) => {
        if (quizChosen !== null) return;
        setQuizChosen(optIdx);
        if (QUIZ_QUESTIONS[quizIdx].correct === optIdx) setQuizScore(s => s + 1);
    };
    const nextQuizQ = () => {
        if (quizIdx < QUIZ_QUESTIONS.length - 1) {
            setQuizIdx(q => q + 1); setQuizChosen(null);
        } else {
            setQuizDone(true);
        }
    };
    const startSim = () => setPhase('sim');

    // ── NOTEBOOK SIDEBAR ──────────────────────────────────
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
                {(['task', 'materials', 'protocol', 'results'] as const).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-2.5 text-[9px] font-bold uppercase tracking-wider transition-all ${activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-gray-400 hover:text-gray-600'}`}>
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {activeTab === 'task' && selectedCompound && (
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3">
                        <p className="text-xs font-extrabold text-blue-800 uppercase mb-2">Dilution Task</p>
                        <p className="text-[10px] text-blue-900 leading-relaxed">
                            Prepare {finalVolume} mL of {desiredConc ?? '?'} M <strong>{selectedCompound.name}</strong> from a stock solution of {selectedCompound.stockConcentration} M.
                        </p>
                    </div>
                )}
                {activeTab === 'materials' && (
                    <div className="space-y-2">
                        <p className="text-xs font-bold text-gray-700 uppercase">Required Equipment</p>
                        <ul className="text-[10px] text-gray-600 space-y-1">
                            <li>• Volumetric flask ({finalVolume} mL)</li>
                            <li>• Graduated pipette (25 mL)</li>
                            <li>• Pipette pump</li>
                            <li>• Wash bottle with distilled water</li>
                            <li>• Stock solution: {selectedCompound?.name ?? '—'}</li>
                            <li>• Stopper</li>
                        </ul>
                    </div>
                )}
                {activeTab === 'protocol' && (
                    <div className="space-y-1">
                        {SIM_STEPS.map((s, i) => {
                            const Icon = s.icon;
                            const status = i < step ? 'done' : i === step ? 'active' : 'pending';
                            return (
                                <div key={i} className={`flex items-start gap-2 p-2 rounded-xl border ${status === 'done' ? 'bg-green-50 border-green-200' : status === 'active' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-100'}`}>
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${status === 'done' ? 'bg-green-500' : status === 'active' ? 'bg-blue-600' : 'bg-gray-200'}`}>
                                        {status === 'done' ? <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> : <Icon className={`w-3 h-3 ${status === 'active' ? 'text-white' : 'text-gray-400'}`} />}
                                    </div>
                                    <p className={`text-[10px] font-bold ${status === 'active' ? 'text-blue-800' : status === 'done' ? 'text-green-700' : 'text-gray-400'}`}>{s.title}</p>
                                </div>
                            );
                        })}
                    </div>
                )}
                {activeTab === 'results' && (
                    <div className="text-center py-8">
                        {showReport ? (
                            <div className="space-y-2">
                                <p className="text-xs font-bold text-green-700">Final Solution Prepared</p>
                                <p className="text-[10px] text-gray-600">{selectedCompound?.name} {desiredConc} M</p>
                                <p className="text-[10px] text-gray-500">Accuracy: Excellent</p>
                            </div>
                        ) : (
                            <p className="text-xs text-gray-400">Complete the lab to see results</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );

    // ── STEP TOOL PANEL ───────────────────────────────────
    const StepToolPanel = () => {
        // Step 0: select compound & desired concentration
        if (step === 0) return (
            <div className="p-4 max-w-2xl mx-auto">
                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3 text-center">Compound Selection</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                    {COMPOUNDS.map(compound => (
                        <button key={compound.id} onClick={() => { setSelectedCompound(compound); setDesiredConc(null); addScore(25, `Selected ${compound.name}`); }}
                            className={`p-3 rounded-xl border-2 flex flex-col items-center transition-all ${selectedCompound?.id === compound.id ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                            <span className="text-lg font-black" style={{ color: compound.color }}>{compound.formula}</span>
                            <span className="text-[10px] font-bold text-gray-700 mt-1">{compound.name}</span>
                            <span className="text-[9px] text-gray-500">{compound.stockConcentration} M stock</span>
                        </button>
                    ))}
                </div>
                {selectedCompound && (
                    <>
                        <p className="text-xs font-bold text-gray-700 mb-2">Select Desired Final Concentration (M)</p>
                        <div className="flex gap-2 justify-center flex-wrap">
                            {selectedCompound.desiredOptions.map(conc => (
                                <button key={conc} onClick={() => { setDesiredConc(conc); addScore(25, `Target: ${conc} M`); notify(`Desired concentration: ${conc} M`, 'success'); }}
                                    className={`px-4 py-2 rounded-xl border-2 text-sm font-bold transition-all ${desiredConc === conc ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                                    {conc} M
                                </button>
                            ))}
                        </div>
                        {desiredConc && <p className="text-[10px] text-center mt-3 text-green-700">Target: {desiredConc} M in {finalVolume} mL</p>}
                    </>
                )}
            </div>
        );

        // Step 1: equipment check
        if (step === 1) return (
            <div className="p-4 text-center">
                <div className="bg-white border border-gray-200 rounded-2xl p-4 max-w-md mx-auto">
                    <p className="text-sm font-extrabold text-gray-800 mb-2">Equipment Check</p>
                    <p className="text-xs text-gray-600 mb-3">Make sure you have:</p>
                    <div className="flex justify-center gap-6 flex-wrap">
                        <div className="flex flex-col items-center w-24 h-32"><VolumetricFlaskSVG fillLevel={0} solutionColor="transparent" hasStopper={true} /><span className="text-[10px] mt-1">Vol. Flask</span></div>
                        <div className="flex flex-col items-center w-12 h-32"><GraduatedPipetteSVG volume={0} maxVolume={25} liquidColor="#a5f3fc" /><span className="text-[10px] mt-1">Pipette</span></div>
                        <div className="flex flex-col items-center w-16 h-32"><WashBottleSVG /><span className="text-[10px] mt-1">Wash Bottle</span></div>
                    </div>
                </div>
            </div>
        );

        // Step 2: calculation with up/down buttons
        if (step === 2) {
            const increment = 0.1; // mL step size
            const currentVal = parseFloat(userAnswer) || 0;

            return (
                <div className="p-4 max-w-md mx-auto">
                    <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                        <p className="text-sm font-extrabold mb-2">Calculate Required Stock Volume</p>
                        <p className="text-xs text-gray-600 mb-2">
                            C₁ = {selectedCompound?.stockConcentration} M &nbsp;|&nbsp;
                            C₂ = {desiredConc} M &nbsp;|&nbsp;
                            V₂ = {finalVolume} mL
                        </p>
                        <p className="text-xs font-bold text-gray-800">V₁ = ? mL</p>

                        {/* Plus/Minus control */}
                        <div className="flex items-center gap-3 mt-3 justify-center">
                            <button
                                onClick={() => setUserAnswer(prev => (parseFloat(prev || '0') - increment).toFixed(1))}
                                disabled={calculatedStockVol !== null}
                                className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xl font-bold disabled:opacity-40"
                            >
                                −
                            </button>
                            <div className="text-2xl font-black w-20 text-center tabular-nums">
                                {currentVal.toFixed(1)}
                            </div>
                            <button
                                onClick={() => setUserAnswer(prev => (parseFloat(prev || '0') + increment).toFixed(1))}
                                disabled={calculatedStockVol !== null}
                                className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xl font-bold disabled:opacity-40"
                            >
                                +
                            </button>
                        </div>

                        <button
                            onClick={() => {
                                const user = parseFloat(userAnswer);
                                if (isNaN(user)) { notify('Set a volume first.', 'error'); return; }
                                const expected = expectedStockVol;
                                if (Math.abs(user - expected) <= 0.1) {
                                    setCalculatedStockVol(user);
                                    addScore(50, 'Correct calculation!');
                                    notify(`Correct! You need ${user.toFixed(1)} mL of stock.`, 'success');
                                } else {
                                    deductScore(20, 'Incorrect calculation.');
                                    notify(`Expected ${expected.toFixed(2)} mL, you entered ${user.toFixed(1)} mL.`, 'error');
                                }
                            }}
                            disabled={calculatedStockVol !== null}
                            className="w-full mt-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-green-400 text-white font-bold text-sm shadow-sm disabled:opacity-50"
                        >
                            {calculatedStockVol !== null ? '✓ Correct' : 'Check'}
                        </button>

                        {calculatedStockVol !== null && (
                            <p className="text-xs text-green-700 mt-2 font-bold">
                                Correct: {calculatedStockVol.toFixed(2)} mL
                            </p>
                        )}
                    </div>
                </div>
            );
        }

        // Step 3: pipette stock (drag pipette to stock bottle)
        // Step 3: Pipette the stock
        if (step === 3) return (
            <div className="flex flex-col items-center gap-6 pt-4">
                <p className="text-sm font-bold text-gray-700">
                    Drag the pipette to the stock bottle to draw {calculatedStockVol?.toFixed(2)} mL
                </p>
                <div className="flex gap-8 items-end">
                    <div ref={stockBottleRef} className="w-24 h-32">
                        {selectedCompound && <StockBottleSVG compound={selectedCompound} />}
                    </div>
                    <motion.div
                        drag
                        dragElastic={0.1}
                        onDragEnd={(_, info) => handlePipetteDragEndForStock(info)}
                        className="cursor-grab active:cursor-grabbing"
                        style={{ width: 60, height: 200, touchAction: 'none' }}
                    >
                        <GraduatedPipetteSVG
                            volume={stockDrawn ? pipetteVolume : 0}
                            maxVolume={25}
                            liquidColor={selectedCompound?.color || '#d1d5db'}
                        />
                    </motion.div>
                </div>
                {stockDrawn && (
                    <p className="text-xs text-green-700 font-bold mt-1">{pipetteVolume.toFixed(2)} mL drawn</p>
                )}
                {!stockDrawn && <p className="text-xs text-gray-400">Drag the pipette onto the stock bottle</p>}
            </div>
        );

        // Step 4: transfer to flask (drag pipette to flask)
        // Step 4: Transfer to flask
        if (step === 4) return (
            <div className="flex flex-col items-center gap-6 pt-4">
                <p className="text-sm font-bold text-gray-700">
                    Drag the pipette to the volumetric flask to dispense the stock.
                </p>
                <div className="flex gap-8 items-end">
                    <div ref={flaskRef} className="w-32 h-48">
                        <VolumetricFlaskSVG
                            fillLevel={flaskFillLevel}
                            solutionColor={selectedCompound?.color || '#000'}
                            hasStopper={false}
                        />
                    </div>
                    <motion.div
                        drag
                        dragElastic={0.1}
                        onDragEnd={(_, info) => handlePipetteDragEndForTransfer(info)}
                        className="cursor-grab active:cursor-grabbing"
                        style={{ width: 60, height: 200, touchAction: 'none' }}
                    >
                        <GraduatedPipetteSVG
                            volume={flaskFillLevel > 0 ? 0 : pipetteVolume}
                            maxVolume={25}
                            liquidColor={selectedCompound?.color || '#000'}
                        />
                    </motion.div>
                </div>
                {flaskFillLevel > 0 && <p className="text-xs text-green-700 font-bold">Stock dispensed!</p>}
                {flaskFillLevel === 0 && <p className="text-xs text-gray-400">Drag the pipette onto the flask</p>}
            </div>
        );
        // Step 5: top up (drag wash bottle to flask)
        // Step 5: Top up
        if (step === 5) return (
            <div className="flex flex-col items-center gap-6 pt-4">
                <p className="text-sm font-bold text-gray-700">
                    Drag the wash bottle over the flask and hold to add water.
                </p>
                <div className="flex gap-8 items-end">
                    <div ref={flaskRef} className="w-32 h-48">
                        <VolumetricFlaskSVG
                            fillLevel={flaskFillLevel}
                            solutionColor={selectedCompound?.color || '#000'}
                            hasStopper={false}
                        />
                    </div>
                    <motion.div
                        drag
                        dragElastic={0.1}
                        onDrag={handleWashBottleDrag}
                        onDragEnd={handleWashBottleDragEnd}
                        className="cursor-grab active:cursor-grabbing"
                        style={{ width: 80, height: 120, touchAction: 'none' }}
                    >
                        <WashBottleSVG />
                    </motion.div>
                </div>
                {toppedUp ? (
                    <p className="text-sm font-bold text-green-600">✓ Meniscus at the calibration mark!</p>
                ) : (
                    <p className="text-xs text-gray-500">
                        {isFilling ? 'Adding water…' : 'Hold the bottle over the flask'}
                        <br />Fill: {(flaskFillLevel * 100).toFixed(0)}%
                    </p>
                )}
            </div>
        );

        // Step 6: mix & verify
        if (step === 6) return (
            <div className="flex flex-col items-center gap-4 p-4">
                <div className="w-32 h-48"><VolumetricFlaskSVG fillLevel={flaskFillLevel} solutionColor={selectedCompound?.color || '#000'} hasStopper={mixed} /></div>
                {!mixed ? (
                    <button
                        onClick={() => { setMixed(true); addScore(50, 'Solution mixed'); notify('Solution homogeneous!', 'success'); }}
                        className="mt-4 px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-green-400 text-white font-extrabold text-sm shadow-md"
                    >
                        Stopper & Invert to Mix
                    </button>
                ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                        <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <p className="text-sm font-extrabold text-green-800">Solution Ready!</p>
                        <p className="text-xs text-green-700">{desiredConc} M {selectedCompound?.name} in {finalVolume} mL</p>
                    </motion.div>
                )}
            </div>
        );

        return null;
    };

    // ──────────────────────────────────────────────────────────
    // RENDER PHASES
    // ──────────────────────────────────────────────────────────
    if (phase === 'tutorial') {
        const slide = TUTORIAL_SLIDES[tutSlide];
        return (
            <div className="w-full overflow-hidden flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50/40" style={{ height: 'calc(100vh - 64px)', minHeight: 520 }}>
                <div className="flex-shrink-0 border-b border-gray-200/70 bg-white/95 backdrop-blur-sm px-4 sm:px-8 py-3 pt-8 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center"><Beaker className="w-4 h-4 text-white" /></div>
                        <span className="text-sm font-extrabold text-gray-800">Dilution Lab Tutorial</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {TUTORIAL_SLIDES.map((_, i) => <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === tutSlide ? 'w-6 bg-blue-600' : i < tutSlide ? 'w-3 bg-green-500' : 'w-3 bg-gray-200'}`} />)}
                    </div>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 overflow-y-auto">
                    <AnimatePresence mode="wait">
                        <motion.div key={tutSlide} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }} className="w-full max-w-2xl">
                            <div className={`bg-gradient-to-r ${slide.color} rounded-3xl p-6 sm:p-8 text-white mb-6 shadow-xl`}>
                                <div className="text-5xl sm:text-6xl mb-4">{slide.icon}</div>
                                <h1 className="text-xl sm:text-2xl font-extrabold mb-3 leading-tight">{slide.title}</h1>
                                <div className="bg-white/20 rounded-2xl px-4 py-2.5 inline-block">
                                    <p className="text-xs sm:text-sm font-bold">{slide.highlight}</p>
                                </div>
                            </div>
                            <div className="bg-white rounded-3xl border border-gray-200/70 p-5 sm:p-6 shadow-sm mb-6">
                                {slide.body.split('\n').map((line, i) => (
                                    <p key={i} className={`text-gray-700 leading-relaxed ${i > 0 ? 'mt-2' : ''} ${line.startsWith('1') || line.startsWith('•') ? 'ml-4 text-sm' : 'text-sm sm:text-base'}`}>{line}</p>
                                ))}
                            </div>
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
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500" style={{ width: `${(quizIdx / QUIZ_QUESTIONS.length) * 100}%` }} /></div>
                                    <span className="text-xs font-bold text-gray-500 flex-shrink-0">Q{quizIdx + 1}/{QUIZ_QUESTIONS.length}</span>
                                </div>
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
                                <p className="text-sm text-gray-500 mb-6">{quizScore === QUIZ_QUESTIONS.length ? 'Perfect score — you\'re ready!' : 'Good understanding — let\'s practice!'}</p>
                                <div className="flex flex-col gap-2">
                                    {quizScore < QUIZ_QUESTIONS.length && (
                                        <button onClick={() => { setQuizIdx(0); setQuizChosen(null); setQuizScore(0); setQuizDone(false); }} className="px-5 py-2.5 rounded-2xl border-2 border-gray-200 font-bold text-sm text-gray-600 hover:border-gray-300 transition-all">
                                            Retake Quiz
                                        </button>
                                    )}
                                    <button onClick={startSim} className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-green-400 text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2">
                                        <Zap className="w-4 h-4" />Start Dilution Lab
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        );
    }

    // ── SIMULATION PHASE ──────────────────────────────────
    // ── SIMULATION PHASE ──────────────────────────────────
    return (
        <div className="relative w-full bg-white font-sans overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 64px)', minHeight: 540 }}>
            {/* Lab bench background */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1532187863486-af7b0fa2b074?w=1400&q=80&auto=format&fit=crop"
                    alt="lab bench"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ opacity: 0.08, filter: 'saturate(0.5)' }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-50/95 via-white/90 to-slate-100/95" />
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-stone-400/30 to-stone-600/20 border-t border-stone-300/50" />
            </div>

            <div className="relative z-10 flex flex-1 min-h-0 overflow-hidden">
                {/* Desktop sidebar */}
                <AnimatePresence>
                    {sidebarOpen && !isMobile && (
                        <motion.div
                            initial={{ width: 0, opacity: 0 }} animate={{ width: 280, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
                            transition={{ duration: 0.22, ease: 'easeInOut' }}
                            className="hidden md:block pt-7 flex-shrink-0 border-r border-gray-200/80 bg-white/98 backdrop-blur-sm overflow-hidden shadow-lg"
                            style={{ height: '100%' }}
                        >
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

                <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
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

                    {/* Workspace */}
                    <div
                        className="flex-1 flex flex-col min-h-0 overflow-y-auto overflow-x-hidden relative"
                        style={{
                            overscrollBehavior: 'contain',
                            WebkitOverflowScrolling: 'touch',
                        }}
                    >
                        {/* Floating notification (doesn't affect layout) */}
                        <AnimatePresence>
                            {notification && (
                                <motion.div
                                    initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                    className={`absolute top-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-2.5 rounded-2xl shadow-lg text-sm font-semibold border w-fit max-w-[90%] whitespace-nowrap ${notification.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' :
                                        notification.type === 'error' ? 'bg-red-50 text-red-800 border-red-200' :
                                            notification.type === 'warn' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                                                'bg-blue-50 text-blue-800 border-blue-200'
                                        }`}
                                >
                                    {notification.type === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> :
                                        notification.type === 'error' ? <AlertCircle className="w-4 h-4 flex-shrink-0" /> :
                                            <Info className="w-4 h-4 flex-shrink-0" />}
                                    <span className="truncate text-xs sm:text-sm">{notification.msg}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex-1 flex flex-col items-center justify-center pt-4 px-4 pb-0 mb-0">
                            <StepToolPanel />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex-shrink-0 bg-white/95 backdrop-blur-sm border-t border-gray-200/80 px-3 sm:px-5 py-2.5 flex items-center justify-between gap-2 shadow-sm">
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                            <span className={`px-2.5 py-1.5 rounded-2xl text-xs font-extrabold ${score >= 450 ? 'bg-green-100 text-green-700' : score >= 350 ? 'bg-blue-100 text-blue-700' : score >= 250 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>{grade}</span>
                            {step === 5 && toppedUp && <span className="flex items-center gap-1 text-xs text-green-700"><CheckCircle className="w-3 h-3" />Mark reached</span>}
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setMobileDrawerOpen(true)} className="md:hidden p-2 rounded-xl bg-blue-50 border border-blue-200"><BookOpen className="w-4 h-4 text-blue-600" /></button>
                            <motion.button
                                onClick={advanceStep}
                                disabled={!canAdvance() && step !== 6}
                                whileHover={canAdvance() ? { scale: 1.03 } : {}}
                                whileTap={canAdvance() ? { scale: 0.97 } : {}}
                                className={`px-4 sm:px-6 py-2.5 rounded-2xl font-extrabold text-sm flex items-center gap-1.5 transition-all ${canAdvance() ? 'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-md hover:shadow-lg' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                            >
                                {step === 6 ? <><span className="hidden sm:inline">Finish</span><FileText className="w-4 h-4" /></> : <><span className="hidden sm:inline">Confirm</span><ChevronRight className="w-4 h-4" /></>}
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
                                <div><h2 className="text-base sm:text-lg font-extrabold text-white">Dilution Lab Report</h2><p className="text-xs text-white/80 mt-0.5">PharmaWallah</p></div>
                                <button onClick={() => setShowReport(false)} className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors"><X className="w-5 h-5 text-white" /></button>
                            </div>
                            <div className="overflow-y-auto flex-1 p-5 space-y-4">
                                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                                    <p className="text-[10px] font-bold text-blue-700 uppercase mb-2">Preparation Summary</p>
                                    <p className="text-xs text-blue-900 leading-relaxed">{selectedCompound?.name} ({selectedCompound?.formula})</p>
                                    <p className="text-xs text-blue-700">Stock: {selectedCompound?.stockConcentration} M → Target: {desiredConc} M in {finalVolume} mL</p>
                                </div>
                                <div className="bg-white border border-gray-200 rounded-2xl p-4">
                                    <p className="text-sm font-extrabold text-gray-800 mb-2">Calculated & Used</p>
                                    <div className="text-xs space-y-1">
                                        <p>C₁V₁ = C₂V₂ → V₁ = {calculatedStockVol?.toFixed(2)} mL</p>
                                        <p>Pipette volume set: {pipetteVolume} mL</p>
                                        <p>Flask filled to mark: {toppedUp ? 'Yes' : 'No'}</p>
                                        <p>Mixed: {mixed ? 'Yes' : 'No'}</p>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl p-4 flex items-center justify-between">
                                    <div><div className="text-white/70 text-xs uppercase">Score</div><div className="text-white font-black text-3xl">{score}<span className="text-lg opacity-60">/500</span></div></div>
                                    <div><div className="text-white/70 text-xs uppercase">Grade</div><div className="text-white font-black text-4xl">{grade}</div></div>
                                    <div><div className="text-white/70 text-xs uppercase">Time</div><div className="text-white font-bold text-xl font-mono">{fmtTime(timer)}</div></div>
                                </div>
                            </div>
                            <div className="border-t border-gray-200 p-4 flex flex-wrap justify-end gap-2 flex-shrink-0">
                                <button onClick={resetLab} className="px-4 py-2.5 rounded-2xl border-2 border-gray-200 font-bold text-sm text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all">New Lab</button>
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => generateReportPDF(selectedCompound, desiredConc!, finalVolume, pipetteVolume, score, grade, timer)} className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-green-400 text-white font-extrabold text-sm flex items-center gap-2 shadow-md">
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