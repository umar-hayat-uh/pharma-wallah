'use client';

// ============================================================
//  PharmaWallah — Antibiotic Susceptibility Simulation
//  Kirby-Bauer Disk Diffusion  |  Next.js + Tailwind CSS
//  Professional Lab Simulation with Gamification
// ============================================================

import React, {
    useState, useEffect, useRef, useCallback, useMemo
} from 'react';
import { useTracker } from '@/hooks/useTracker';
import {
    ANTIBIOTICS, ORGANISMS, SIM_STEPS, QUIZ_QUESTIONS,
    interpretZone, getScoreLabel,
    type Antibiotic, type Organism, type InterpretResult,
} from './diskDiffusionData';

// ─── Types ───────────────────────────────────────────────────

interface SimState {
    currentStep: number;
    completedSteps: Set<number>;
    selectedOrganism: Organism | null;
    selectedDiskIds: string[];
    measuredZones: Record<string, number>;
    incubationProgress: number;    // 0-100
    incubationDone: boolean;
    quizAnswers: Record<string, number | null>;
    quizScore: number;
    xp: number;
    badges: string[];
    timeStarted: number;
    timeCompleted: number | null;
}

interface QuizState {
    currentIdx: number;
    answered: number | null;
    showExplanation: boolean;
    score: number;
    total: number;
}

const TOTAL_XP = 500;
const STEP_XP = [0, 30, 40, 60, 80, 80, 100, 80, 30]; // per step

// ─── Helper: SVG Petri Dish Renderer ─────────────────────────

function usePetriCanvas(
    canvasRef: React.RefObject<HTMLCanvasElement>,
    organism: Organism | null,
    selectedDiskIds: string[],
    measuredZones: Record<string, number>,
    showZones: boolean,
    showMeasurements: boolean,
    incubProgress: number,
) {
    const drawPlate = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const W = canvas.width, H = canvas.height;
        const CX = W / 2, CY = H / 2;
        const PLATE_R = W * 0.46;
        const DISK_R = 10;

        ctx.clearRect(0, 0, W, H);

        // Outer petri dish rim
        ctx.save();
        ctx.beginPath();
        ctx.arc(CX, CY, PLATE_R + 6, 0, Math.PI * 2);
        ctx.strokeStyle = '#9CA3AF';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();

        // Agar base
        ctx.save();
        ctx.beginPath();
        ctx.arc(CX, CY, PLATE_R, 0, Math.PI * 2);
        const baseColor = organism
            ? organism.agarColor
            : '#F5F5DC';
        ctx.fillStyle = baseColor;
        ctx.fill();
        ctx.restore();

        // Bacterial lawn (fades in with incubation)
        if (organism && incubProgress > 10) {
            const opacity = Math.min(1, (incubProgress - 10) / 30);
            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.beginPath();
            ctx.arc(CX, CY, PLATE_R - 2, 0, Math.PI * 2);
            ctx.fillStyle = organism.agarColor;
            ctx.fill();
            // Subtle lawn texture
            ctx.globalAlpha = opacity * 0.3;
            for (let i = 0; i < 200; i++) {
                const angle = Math.random() * Math.PI * 2;
                const r = Math.random() * (PLATE_R - 12);
                const x = CX + r * Math.cos(angle);
                const y = CY + r * Math.sin(angle);
                ctx.fillStyle = organism.color;
                ctx.beginPath();
                ctx.arc(x, y, 1.2, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }

        const positions = getDiskPositions(selectedDiskIds.length, CX, CY, PLATE_R);

        // Inhibition zones (shown after incubation)
        if (showZones && incubProgress >= 100) {
            selectedDiskIds.forEach((id, i) => {
                const [px, py] = positions[i];
                const zone = measuredZones[id] ?? (organism?.zones[id] ?? 0);
                const pixelR = zone * 2.5;
                if (zone < 7) return;
                const ab = ANTIBIOTICS.find(a => a.id === id);
                if (!ab) return;

                ctx.save();
                // Zone of inhibition (clear zone)
                const grad = ctx.createRadialGradient(px, py, DISK_R, px, py, pixelR);
                grad.addColorStop(0, 'rgba(255,255,255,0.95)');
                grad.addColorStop(0.6, 'rgba(255,255,255,0.7)');
                grad.addColorStop(1, 'rgba(255,255,255,0.05)');
                ctx.beginPath();
                ctx.arc(px, py, pixelR, 0, Math.PI * 2);
                ctx.fillStyle = grad;
                ctx.fill();

                // Zone border dashed
                ctx.beginPath();
                ctx.arc(px, py, pixelR, 0, Math.PI * 2);
                ctx.strokeStyle = ab.color + '80';
                ctx.lineWidth = 1.5;
                ctx.setLineDash([4, 4]);
                ctx.stroke();
                ctx.restore();

                // Measurement line
                if (showMeasurements) {
                    ctx.save();
                    ctx.beginPath();
                    ctx.moveTo(px - pixelR, py);
                    ctx.lineTo(px + pixelR, py);
                    ctx.strokeStyle = ab.color;
                    ctx.lineWidth = 1.5;
                    ctx.setLineDash([3, 3]);
                    ctx.stroke();

                    // tick marks
                    [-1, 1].forEach(side => {
                        ctx.beginPath();
                        ctx.moveTo(px + side * pixelR, py - 5);
                        ctx.lineTo(px + side * pixelR, py + 5);
                        ctx.lineWidth = 2;
                        ctx.setLineDash([]);
                        ctx.stroke();
                    });

                    // label
                    ctx.setLineDash([]);
                    ctx.fillStyle = ab.color;
                    ctx.font = 'bold 11px system-ui';
                    ctx.textAlign = 'center';
                    ctx.fillText(`${zone}mm`, px, py - pixelR - 6);
                    ctx.restore();
                }
            });
        }


        // Antibiotic disks
        if (selectedDiskIds.length > 0) {
            selectedDiskIds.forEach((id, i) => {
                const [px, py] = positions[i];
                const ab = ANTIBIOTICS.find(a => a.id === id);
                if (!ab) return;

                ctx.save();
                // Disk shadow
                ctx.shadowColor = 'rgba(0,0,0,0.2)';
                ctx.shadowBlur = 4;
                ctx.shadowOffsetY = 1;

                // Disk body
                ctx.beginPath();
                ctx.arc(px, py, DISK_R, 0, Math.PI * 2);
                ctx.fillStyle = '#FFFFFF';
                ctx.fill();

                ctx.shadowBlur = 0;
                ctx.shadowOffsetY = 0;

                // Disk border
                ctx.beginPath();
                ctx.arc(px, py, DISK_R, 0, Math.PI * 2);
                ctx.strokeStyle = ab.color;
                ctx.lineWidth = 2.5;
                ctx.stroke();

                // Disk label
                ctx.fillStyle = ab.color;
                ctx.font = 'bold 8px system-ui';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(id, px, py);
                ctx.restore();
            });
        }

        // Interpretation badges overlay
        if (showZones && incubProgress >= 100 && showMeasurements) {
            selectedDiskIds.forEach((id, i) => {
                const [px, py] = positions[i];
                const zone = measuredZones[id] ?? (organism?.zones[id] ?? 0);
                const result = interpretZone(id, zone);
                const [bgColor, textColor] = result === 'S'
                    ? ['#10B981', '#fff']
                    : result === 'I'
                        ? ['#F59E0B', '#fff']
                        : ['#EF4444', '#fff'];

                ctx.save();
                const bx = px, by = py + 18;
                ctx.beginPath();
                ctx.roundRect(bx - 12, by - 8, 24, 16, 4);
                ctx.fillStyle = bgColor;
                ctx.fill();
                ctx.fillStyle = textColor;
                ctx.font = 'bold 10px system-ui';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(result, bx, by);
                ctx.restore();
            });
        }

    }, [canvasRef, organism, selectedDiskIds, measuredZones, showZones, showMeasurements, incubProgress]);

    useEffect(() => {
        drawPlate();
    }, [drawPlate]);
}

function getDiskPositions(n: number, CX: number, CY: number, R: number): [number, number][] {
    if (n === 0) return [];
    const positions: [number, number][] = [];
    const innerR = R * 0.52;
    for (let i = 0; i < n; i++) {
        const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
        positions.push([
            CX + innerR * Math.cos(angle),
            CY + innerR * Math.sin(angle),
        ]);
    }
    return positions;
}

// ─── Sub-components ──────────────────────────────────────────

function XPBar({ xp, total }: { xp: number; total: number }) {
    const pct = Math.min(100, (xp / total) * 100);
    return (
        <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-blue-600 min-w-[60px]">{xp} / {total} XP</span>
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-blue-500 to-green-400 rounded-full transition-all duration-700"
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className="text-xs text-gray-400">{Math.round(pct)}%</span>
        </div>
    );
}

function StepBadge({ n, active, done, label, onClick }: {
    n: number; active: boolean; done: boolean; label: string; onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={`relative flex flex-col items-center gap-1 cursor-pointer group transition-all duration-200 ${!done && !active ? 'opacity-40 cursor-not-allowed' : ''}`}
            disabled={!done && !active}
        >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-200
        ${active
                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200 scale-110'
                    : done
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'bg-gray-100 border-gray-300 text-gray-400'
                }`}>
                {done && !active ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                ) : n + 1}
            </div>
            <span className={`text-[10px] font-medium text-center leading-tight max-w-[52px] hidden sm:block
        ${active ? 'text-blue-600' : done ? 'text-green-600' : 'text-gray-400'}`}>
                {label}
            </span>
            {active && (
                <div className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            )}
        </button>
    );
}

function ResultBadge({ result }: { result: InterpretResult }) {
    const config = {
        S: { label: 'Susceptible', bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
        I: { label: 'Intermediate', bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300' },
        R: { label: 'Resistant', bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
    };
    const c = config[result];
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${c.bg} ${c.text} ${c.border}`}>
            {result} — {c.label}
        </span>
    );
}

// ─── Main Component ──────────────────────────────────────────

export default function DiskDiffusionSim() {
    const { trackActivity, trackQuiz } = useTracker();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const incubTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const [sim, setSim] = useState<SimState>({
        currentStep: 0,
        completedSteps: new Set(),
        selectedOrganism: null,
        selectedDiskIds: ['AMP', 'CIP', 'GEN'],
        measuredZones: {},
        incubationProgress: 0,
        incubationDone: false,
        quizAnswers: {},
        quizScore: 0,
        xp: 0,
        badges: [],
        timeStarted: Date.now(),
        timeCompleted: null,
    });

    const [quiz, setQuiz] = useState<QuizState>({
        currentIdx: 0,
        answered: null,
        showExplanation: false,
        score: 0,
        total: QUIZ_QUESTIONS.length,
    });

    const [activeTab, setActiveTab] = useState<'lab' | 'theory' | 'quiz'>('lab');
    const [showTip, setShowTip] = useState(true);
    const [reportDownloading, setReportDownloading] = useState(false);

    // Canvas rendering
    const showZones = sim.incubationDone || sim.currentStep >= 6;
    const showMeasurements = sim.currentStep >= 6;

    usePetriCanvas(
        canvasRef,
        sim.selectedOrganism,
        sim.selectedDiskIds,
        sim.measuredZones,
        showZones,
        showMeasurements,
        sim.incubationProgress,
    );

    // Derived
    const currentStepData = SIM_STEPS[sim.currentStep];
    const canProceed = useMemo(() => {
        switch (sim.currentStep) {
            case 0: return true;
            case 1: return !!sim.selectedOrganism;
            case 2: return !!sim.selectedOrganism;
            case 3: return !!sim.selectedOrganism;
            case 4: return sim.selectedDiskIds.length >= 2;
            case 5: return sim.incubationDone;
            case 6: return Object.keys(sim.measuredZones).length >= sim.selectedDiskIds.length;
            case 7: return true;
            case 8: return true;
            default: return false;
        }
    }, [sim]);

    function earnXP(amount: number, badge?: string) {
        setSim(prev => ({
            ...prev,
            xp: Math.min(TOTAL_XP, prev.xp + amount),
            badges: badge && !prev.badges.includes(badge)
                ? [...prev.badges, badge]
                : prev.badges,
        }));
    }

    function completeStep(stepIdx: number) {
        const xpAmount = STEP_XP[stepIdx] || 20;

        setSim(prev => {
            const next = new Set(prev.completedSteps);
            next.add(stepIdx);
            const nextStep = Math.min(SIM_STEPS.length - 1, stepIdx + 1);

            return {
                ...prev,
                completedSteps: next,
                currentStep: nextStep,
                xp: Math.min(TOTAL_XP, prev.xp + xpAmount),
                timeCompleted: nextStep === SIM_STEPS.length - 1 ? Date.now() : prev.timeCompleted,
            };
        });

        trackActivity({
            type: "unit_read", // 🔁 you can make this dynamic per step later
            label: `Completed step ${stepIdx + 1}`,
        });
    }
    function startIncubation() {
        if (incubTimerRef.current) return;
        let p = 0;
        incubTimerRef.current = setInterval(() => {
            p = Math.min(100, p + 1.5);
            setSim(prev => ({
                ...prev,
                incubationProgress: p,
                incubationDone: p >= 100,
            }));
            if (p >= 100) {
                clearInterval(incubTimerRef.current!);
                incubTimerRef.current = null;
                earnXP(20, 'Incubation Expert');
            }
        }, 60);
    }

    function toggleDisk(id: string) {
        setSim(prev => {
            const has = prev.selectedDiskIds.includes(id);
            if (has && prev.selectedDiskIds.length <= 2) return prev;
            if (!has && prev.selectedDiskIds.length >= 7) return prev;
            return {
                ...prev,
                selectedDiskIds: has
                    ? prev.selectedDiskIds.filter(d => d !== id)
                    : [...prev.selectedDiskIds, id],
            };
        });
    }

    function setMeasuredZone(diskId: string, value: number) {
        setSim(prev => ({
            ...prev,
            measuredZones: { ...prev.measuredZones, [diskId]: value },
        }));
    }

    function answerQuiz(optionIdx: number) {
        const q = QUIZ_QUESTIONS[quiz.currentIdx];
        const isCorrect = optionIdx === q.correctIndex;
        if (isCorrect) earnXP(15);
        setQuiz(prev => ({
            ...prev,
            answered: optionIdx,
            showExplanation: true,
            score: isCorrect ? prev.score + 1 : prev.score,
        }));
    }

    function nextQuestion() {
        const nextIdx = quiz.currentIdx + 1;
        if (nextIdx >= QUIZ_QUESTIONS.length) {
            const pct = (quiz.score / QUIZ_QUESTIONS.length) * 100;
            trackQuiz({ quizId: 'disk-diffusion-quiz', subject: 'disk-diffusion', score: quiz.score, total: QUIZ_QUESTIONS.length, timeTakenMin: 0 });
            setSim(prev => ({ ...prev, quizScore: quiz.score }));
        }
        setQuiz(prev => ({
            ...prev,
            currentIdx: nextIdx,
            answered: null,
            showExplanation: false,
        }));
    }

    async function downloadReport() {
        if (!sim.selectedOrganism) return;
        setReportDownloading(true);
        try {
            const { jsPDF } = await import('jspdf');
            const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const W = 210, margin = 18;

            // Header
            doc.setFillColor(37, 99, 235);
            doc.rect(0, 0, W, 28, 'F');
            doc.setFillColor(16, 185, 129);
            doc.rect(W - 40, 0, 40, 28, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('PharmaWallah Laboratory Report', margin, 12);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.text('Antibiotic Susceptibility Test — Kirby-Bauer Disk Diffusion', margin, 20);
            doc.text(`Generated: ${new Date().toLocaleDateString('en-PK')}`, W - 55, 12);

            // Patient & organism info
            doc.setTextColor(30, 30, 30);
            doc.setFillColor(248, 250, 252);
            doc.rect(margin, 35, W - margin * 2, 30, 'F');
            doc.setDrawColor(226, 232, 240);
            doc.rect(margin, 35, W - margin * 2, 30, 'S');

            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text('Test Information', margin + 4, 43);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.text(`Organism: ${sim.selectedOrganism.name}`, margin + 4, 51);
            doc.text(`Gram Stain: ${sim.selectedOrganism.gramStain === 'positive' ? 'Gram-Positive' : 'Gram-Negative'}`, margin + 4, 57);
            doc.text(`Method: Kirby-Bauer Disk Diffusion (CLSI Guidelines)`, margin + 90, 51);
            doc.text(`Medium: Mueller-Hinton Agar (pH 7.2–7.4, 4mm depth)`, margin + 90, 57);
            doc.text(`Incubation: 35–37°C, 16–18 hours`, margin + 90, 63);

            // Results table
            const tableTop = 74;
            doc.setFillColor(37, 99, 235);
            doc.rect(margin, tableTop, W - margin * 2, 8, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text('Antibiotic', margin + 3, tableTop + 5.5);
            doc.text('Class', margin + 42, tableTop + 5.5);
            doc.text('Conc.', margin + 85, tableTop + 5.5);
            doc.text('Zone (mm)', margin + 108, tableTop + 5.5);
            doc.text('Breakpoint S/R', margin + 132, tableTop + 5.5);
            doc.text('Result', margin + 160, tableTop + 5.5);

            let rowY = tableTop + 8;
            sim.selectedDiskIds.forEach((id, i) => {
                const ab = ANTIBIOTICS.find(a => a.id === id)!;
                const zone = sim.measuredZones[id] ?? (sim.selectedOrganism!.zones[id] ?? 0);
                const result = interpretZone(id, zone);

                const bg = i % 2 === 0 ? [255, 255, 255] : [249, 250, 251];
                doc.setFillColor(bg[0], bg[1], bg[2]);
                doc.rect(margin, rowY, W - margin * 2, 8, 'F');
                doc.setDrawColor(226, 232, 240);
                doc.line(margin, rowY + 8, W - margin, rowY + 8);

                doc.setTextColor(30, 30, 30);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(8.5);
                doc.text(ab.name, margin + 3, rowY + 5.5);
                doc.setFont('helvetica', 'normal');
                doc.text(ab.class, margin + 42, rowY + 5.5);
                doc.text(ab.concentration, margin + 85, rowY + 5.5);
                doc.text(zone > 0 ? `${zone} mm` : 'No zone', margin + 110, rowY + 5.5);
                doc.text(`S≥${ab.breakpoints.susceptible} / R≤${ab.breakpoints.resistant}`, margin + 132, rowY + 5.5);

                const [rc, rg, rb] = result === 'S' ? [16, 185, 129] : result === 'I' ? [245, 158, 11] : [239, 68, 68];
                doc.setFillColor(rc, rg, rb);
                doc.roundedRect(margin + 158, rowY + 1.5, 22, 5.5, 1, 1, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(8);
                doc.text(result === 'S' ? 'SUSCEPT.' : result === 'I' ? 'INTERMED.' : 'RESISTANT', margin + 159, rowY + 5.5);

                rowY += 8;
            });

            // Clinical significance
            rowY += 8;
            doc.setTextColor(30, 30, 30);
            doc.setFillColor(239, 246, 255);
            doc.rect(margin, rowY, W - margin * 2, 20, 'F');
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text('Clinical Significance:', margin + 4, rowY + 7);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8.5);
            const lines = doc.splitTextToSize(sim.selectedOrganism.clinicalSignificance, W - margin * 2 - 8);
            doc.text(lines, margin + 4, rowY + 13);

            // XP score
            rowY += 28;
            doc.setFillColor(249, 250, 251);
            doc.rect(margin, rowY, W - margin * 2, 16, 'F');
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text(`Simulation Score: ${sim.xp} / ${TOTAL_XP} XP`, margin + 4, rowY + 6);
            doc.setFont('helvetica', 'normal');
            const { label } = getScoreLabel((sim.xp / TOTAL_XP) * 100);
            doc.text(`Grade: ${label}`, margin + 4, rowY + 12);

            // Footer
            doc.setFillColor(249, 250, 251);
            doc.rect(0, 280, W, 17, 'F');
            doc.setDrawColor(226, 232, 240);
            doc.line(0, 280, W, 280);
            doc.setFontSize(7.5);
            doc.setTextColor(107, 114, 128);
            doc.text('PharmaWallah — Pharmacy eLearning Platform | pharmawallah.pk', margin, 288);
            doc.text('This report is generated for educational purposes only. CLSI M100 breakpoints applied.', margin, 293);

            doc.save(`DiskDiffusion_${sim.selectedOrganism.id}_${Date.now()}.pdf`);
            earnXP(30, 'Report Generator');
        } catch (e) {
            console.error('PDF generation failed:', e);
        }
        setReportDownloading(false);
    }

    // ─── Step renderers ─────────────────────────────────────────

    function renderStep() {
        switch (sim.currentStep) {
            case 0: return <StepIntro />;
            case 1: return <StepSelectOrganism />;
            case 2: return <StepPrepMedia />;
            case 3: return <StepInoculate />;
            case 4: return <StepPlaceDisks />;
            case 5: return <StepIncubate />;
            case 6: return <StepMeasure />;
            case 7: return <StepInterpret />;
            case 8: return <StepReport />;
            default: return null;
        }
    }

    // ─── Step 0: Intro ──────────────────────────────────────────

    function StepIntro() {
        return (
            <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-600 to-green-500 rounded-2xl p-5 text-white">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold mb-1">Kirby-Bauer Disk Diffusion</h2>
                            <p className="text-white/85 text-sm leading-relaxed">
                                Perform the standard CLSI antibiotic susceptibility test — used daily in clinical microbiology labs worldwide.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    {[
                        { icon: '🧫', label: '9 Steps', sub: 'Lab protocol' },
                        { icon: '🦠', label: '6 Organisms', sub: 'ATCC strains' },
                        { icon: '💊', label: '7 Antibiotics', sub: 'CLSI breakpoints' },
                    ].map(c => (
                        <div key={c.label} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                            <div className="text-2xl mb-1">{c.icon}</div>
                            <div className="text-sm font-bold text-gray-800">{c.label}</div>
                            <div className="text-xs text-gray-500">{c.sub}</div>
                        </div>
                    ))}
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">Learning Objectives</p>
                    <ul className="space-y-1.5">
                        {[
                            'Prepare and inoculate Mueller-Hinton agar',
                            'Place antibiotic disks following CLSI spacing guidelines',
                            'Measure zones of inhibition accurately',
                            'Interpret S/I/R using CLSI M100 breakpoints',
                            'Generate a professional lab susceptibility report',
                        ].map(obj => (
                            <li key={obj} className="flex items-start gap-2 text-sm text-blue-800">
                                <svg className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                                {obj}
                            </li>
                        ))}
                    </ul>
                </div>

                <button
                    onClick={() => completeStep(0)}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-green-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity text-sm"
                >
                    Begin Simulation →
                </button>
            </div>
        );
    }

    // ─── Step 1: Select Organism ────────────────────────────────

    function StepSelectOrganism() {
        return (
            <div className="space-y-3">
                <p className="text-sm text-gray-600">Select the bacterial isolate to test against antibiotics.</p>
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                    {ORGANISMS.map(org => (
                        <button
                            key={org.id}
                            onClick={() => {
                                setSim(prev => ({ ...prev, selectedOrganism: org, measuredZones: {} }));
                            }}
                            className={`w-full text-left p-3 rounded-xl border-2 transition-all duration-200 ${sim.selectedOrganism?.id === org.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/30'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                                    style={{ backgroundColor: org.color }}
                                >
                                    {org.gramStain === 'positive' ? 'G+' : 'G−'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-bold text-sm text-gray-900 italic">{org.name}</span>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${org.gramStain === 'positive'
                                            ? 'bg-purple-100 text-purple-700'
                                            : 'bg-red-100 text-red-700'
                                            }`}>
                                            {org.gramStain === 'positive' ? 'Gram +' : 'Gram −'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 truncate">{org.morphology}</p>
                                </div>
                                {sim.selectedOrganism?.id === org.id && (
                                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
                {sim.selectedOrganism && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                        <p className="text-xs font-bold text-amber-700 mb-1">Clinical Significance</p>
                        <p className="text-xs text-amber-800 leading-relaxed">{sim.selectedOrganism.clinicalSignificance}</p>
                    </div>
                )}
                <button
                    disabled={!sim.selectedOrganism}
                    onClick={() => completeStep(1)}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-green-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {sim.selectedOrganism ? `Confirm — ${sim.selectedOrganism.shortName} →` : 'Select an organism first'}
                </button>
            </div>
        );
    }

    // ─── Step 2: Prepare Media ──────────────────────────────────

    function StepPrepMedia() {
        const [checked, setChecked] = useState<string[]>([]);
        const checklist = [
            { id: 'weigh', label: 'Weigh Mueller-Hinton agar powder (38g/L)' },
            { id: 'dissolve', label: 'Dissolve in distilled water, autoclave 121°C / 15 min' },
            { id: 'cool', label: 'Cool to 50°C, pour 25–30 mL per plate' },
            { id: 'depth', label: 'Check agar depth — must be exactly 4 mm' },
            { id: 'ph', label: 'Verify pH 7.2–7.4 at room temperature' },
            { id: 'dry', label: 'Allow to solidify, store at 4°C until use' },
        ];
        const allDone = checked.length === checklist.length;
        return (
            <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                    <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-1">Medium used</p>
                    <p className="text-sm font-bold text-green-900">Mueller-Hinton Agar (MHA)</p>
                    <p className="text-xs text-green-700 mt-1">CLSI-recommended for disk diffusion. Low in sulfonamide antagonists. Standard cation content (Ca²⁺, Mg²⁺).</p>
                </div>
                <p className="text-sm font-medium text-gray-700">Check off each preparation step:</p>
                <div className="space-y-2">
                    {checklist.map(item => (
                        <label key={item.id} className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                            <input
                                type="checkbox"
                                checked={checked.includes(item.id)}
                                onChange={() => setChecked(prev =>
                                    prev.includes(item.id) ? prev.filter(x => x !== item.id) : [...prev, item.id]
                                )}
                                className="mt-0.5 w-4 h-4 rounded accent-blue-600"
                            />
                            <span className={`text-sm transition-colors ${checked.includes(item.id) ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                                {item.label}
                            </span>
                        </label>
                    ))}
                </div>
                <button
                    disabled={!allDone}
                    onClick={() => completeStep(2)}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-green-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {allDone ? 'Media prepared ✓ Continue →' : `Complete all steps (${checked.length}/${checklist.length})`}
                </button>
            </div>
        );
    }

    // ─── Step 3: Inoculate ──────────────────────────────────────

    function StepInoculate() {
        const [turbidity, setTurbidity] = useState(0);
        const [swipes, setSwipes] = useState(0);
        const mcfMatch = turbidity >= 45 && turbidity <= 55;
        const swipeDone = swipes >= 3;
        return (
            <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                    <p className="text-xs font-bold text-blue-700 mb-1">Target: 0.5 McFarland standard</p>
                    <p className="text-xs text-gray-600">≈ 1.5 × 10⁸ CFU/mL — match your suspension to this turbidity</p>
                </div>

                <div>
                    <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700">Suspension turbidity</label>
                        <span className={`text-sm font-bold ${mcfMatch ? 'text-green-600' : 'text-gray-500'}`}>
                            {turbidity < 30 ? 'Too light' : turbidity > 65 ? 'Too dense' : mcfMatch ? '0.5 McFarland ✓' : 'Adjust…'}
                        </span>
                    </div>
                    <input
                        type="range" min="0" max="100" value={turbidity}
                        onChange={e => setTurbidity(+e.target.value)}
                        className="w-full accent-blue-600"
                    />
                    <div className="mt-2 h-8 rounded-lg border border-gray-200 overflow-hidden">
                        <div className="h-full transition-all duration-300" style={{
                            background: `rgba(${Math.round(turbidity * 1.5)}, ${Math.round(180 - turbidity)}, 100, ${0.1 + turbidity / 200})`,
                            width: '100%',
                        }} />
                    </div>
                </div>

                <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Swab direction passes: {swipes}/3</p>
                    <div className="grid grid-cols-3 gap-2">
                        {['0°', '60°', '120°'].map((angle, i) => (
                            <button
                                key={angle}
                                onClick={() => setSwipes(prev => Math.min(3, prev + 1))}
                                disabled={swipes > i}
                                className={`py-3 rounded-xl text-sm font-bold border-2 transition-all duration-200 ${swipes > i
                                    ? 'border-green-500 bg-green-50 text-green-700'
                                    : 'border-gray-300 bg-white text-gray-500 hover:border-blue-400'
                                    }`}
                            >
                                {swipes > i ? '✓' : angle} pass
                            </button>
                        ))}
                    </div>
                </div>

                {!mcfMatch && (
                    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
                        ⚠ Turbidity doesn't match 0.5 McFarland. Adjust the suspension before inoculating.
                    </p>
                )}

                <button
                    disabled={!mcfMatch || !swipeDone}
                    onClick={() => completeStep(3)}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-green-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {mcfMatch && swipeDone ? 'Inoculation complete ✓ →' : 'Match turbidity & complete 3 swipe passes'}
                </button>
            </div>
        );
    }

    // ─── Step 4: Place Disks ─────────────────────────────────────

    function StepPlaceDisks() {
        return (
            <div className="space-y-3">
                <p className="text-sm text-gray-600">Select 2–7 antibiotic disks to place on the plate.</p>
                <div className="space-y-2">
                    {ANTIBIOTICS.map(ab => {
                        const selected = sim.selectedDiskIds.includes(ab.id);
                        return (
                            <button
                                key={ab.id}
                                onClick={() => toggleDisk(ab.id)}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 text-left ${selected
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 bg-white hover:border-gray-300'
                                    }`}
                            >
                                <div
                                    className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0"
                                    style={{ borderColor: ab.color, color: ab.color, backgroundColor: ab.diskColor }}
                                >
                                    {ab.id.slice(0, 3)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-sm text-gray-900">{ab.name}</div>
                                    <div className="text-xs text-gray-500">{ab.class} · {ab.concentration}</div>
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${selected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                                    {selected && (
                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-xl p-3">
                    <svg className="w-4 h-4 flex-shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Selected: {sim.selectedDiskIds.length} disks. Spaces disks ≥24mm apart automatically.
                </div>
                <button
                    disabled={sim.selectedDiskIds.length < 2}
                    onClick={() => completeStep(4)}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-green-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {sim.selectedDiskIds.length >= 2 ? `Place ${sim.selectedDiskIds.length} disks →` : 'Select at least 2 disks'}
                </button>
            </div>
        );
    }

    // ─── Step 5: Incubate ────────────────────────────────────────

    function StepIncubate() {
        const pct = sim.incubationProgress;
        const hours = ((pct / 100) * 18).toFixed(1);
        return (
            <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-bold text-amber-800">Incubator Settings</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                        {[
                            { label: 'Temperature', value: '35–37°C' },
                            { label: 'Duration', value: '16–18 h' },
                            { label: 'Position', value: 'Inverted' },
                        ].map(s => (
                            <div key={s.label} className="bg-white rounded-lg p-2">
                                <div className="text-xs font-bold text-amber-700">{s.value}</div>
                                <div className="text-[10px] text-gray-500">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Incubation progress</span>
                        <span className="text-sm font-bold text-blue-600">{hours}h / 18h</span>
                    </div>
                    <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-green-500 rounded-full transition-all duration-300"
                            style={{ width: `${pct}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>0h</span>
                        <span>8h</span>
                        <span>18h ✓</span>
                    </div>
                </div>

                {sim.incubationDone ? (
                    <div className="bg-green-50 border border-green-300 rounded-xl p-4 text-center">
                        <div className="text-2xl mb-1">✓</div>
                        <p className="font-bold text-green-700">Incubation Complete!</p>
                        <p className="text-xs text-green-600 mt-1">Zones of inhibition are visible. Proceed to measurement.</p>
                    </div>
                ) : (
                    <button
                        onClick={startIncubation}
                        disabled={sim.incubationProgress > 0}
                        className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity text-sm disabled:opacity-60"
                    >
                        {sim.incubationProgress > 0 ? `Incubating… ${Math.round(pct)}%` : 'Start Incubation →'}
                    </button>
                )}

                {sim.incubationDone && (
                    <button
                        onClick={() => completeStep(5)}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-green-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity text-sm"
                    >
                        Read the plate →
                    </button>
                )}
            </div>
        );
    }

    // ─── Step 6: Measure Zones ───────────────────────────────────

    function StepMeasure() {
        const allMeasured = sim.selectedDiskIds.every(id => sim.measuredZones[id] !== undefined);
        return (
            <div className="space-y-3">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                    <p className="text-xs text-blue-700">
                        Measure zone diameters <strong>including the 6mm disk</strong>. Read from back of plate under reflected light.
                    </p>
                </div>
                <div className="space-y-3">
                    {sim.selectedDiskIds.map(id => {
                        const ab = ANTIBIOTICS.find(a => a.id === id)!;
                        const actual = sim.selectedOrganism?.zones[id] ?? 0;
                        const val = sim.measuredZones[id] ?? actual;
                        return (
                            <div key={id} className="bg-white border border-gray-200 rounded-xl p-3">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold"
                                            style={{ borderColor: ab.color, color: ab.color }}>
                                            {id.slice(0, 2)}
                                        </div>
                                        <span className="text-sm font-bold text-gray-800">{ab.name}</span>
                                    </div>
                                    <span className="text-base font-bold" style={{ color: ab.color }}>{val}mm</span>
                                </div>
                                <input
                                    type="range" min="6" max="45" step="1" value={val}
                                    onChange={e => setMeasuredZone(id, +e.target.value)}
                                    className="w-full"
                                    style={{ accentColor: ab.color }}
                                />
                                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                                    <span>6mm (no zone)</span>
                                    <span>45mm (very sensitive)</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <button
                    disabled={!allMeasured}
                    onClick={() => completeStep(6)}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-green-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity text-sm disabled:opacity-40"
                >
                    Record measurements →
                </button>
            </div>
        );
    }

    // ─── Step 7: Interpret ───────────────────────────────────────

    function StepInterpret() {
        return (
            <div className="space-y-3">
                <div className="flex gap-2 text-xs">
                    {(['S', 'I', 'R'] as const).map(r => (
                        <div key={r} className={`flex-1 text-center py-2 rounded-xl font-bold ${r === 'S' ? 'bg-green-100 text-green-700' : r === 'I' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                            {r === 'S' ? 'Susceptible' : r === 'I' ? 'Intermediate' : 'Resistant'}
                        </div>
                    ))}
                </div>
                <div className="space-y-2">
                    {sim.selectedDiskIds.map(id => {
                        const ab = ANTIBIOTICS.find(a => a.id === id)!;
                        const zone = sim.measuredZones[id] ?? (sim.selectedOrganism?.zones[id] ?? 0);
                        const result = interpretZone(id, zone);
                        return (
                            <div key={id} className="bg-white border border-gray-200 rounded-xl p-3">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold"
                                            style={{ borderColor: ab.color, color: ab.color }}>
                                            {id.slice(0, 2)}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-gray-900">{ab.name}</div>
                                            <div className="text-xs text-gray-500">{zone}mm · S≥{ab.breakpoints.susceptible} R≤{ab.breakpoints.resistant}</div>
                                        </div>
                                    </div>
                                    <ResultBadge result={result} />
                                </div>
                                <p className="text-xs text-gray-500 mt-2 leading-relaxed">{ab.clinicalNote}</p>
                            </div>
                        );
                    })}
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                    <p className="text-xs font-bold text-gray-700 mb-1">Summary for {sim.selectedOrganism?.shortName}</p>
                    <div className="flex gap-3 text-sm">
                        {(['S', 'I', 'R'] as const).map(r => {
                            const count = sim.selectedDiskIds.filter(id => {
                                const z = sim.measuredZones[id] ?? (sim.selectedOrganism?.zones[id] ?? 0);
                                return interpretZone(id, z) === r;
                            }).length;
                            return (
                                <div key={r} className="flex items-center gap-1.5">
                                    <span className={`w-2 h-2 rounded-full ${r === 'S' ? 'bg-green-500' : r === 'I' ? 'bg-amber-500' : 'bg-red-500'}`} />
                                    <span className="font-bold">{count}</span>
                                    <span className="text-gray-500">{r === 'S' ? 'Susceptible' : r === 'I' ? 'Intermediate' : 'Resistant'}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <button
                    onClick={() => completeStep(7)}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-green-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity text-sm"
                >
                    Generate report →
                </button>
            </div>
        );
    }

    // ─── Step 8: Report ──────────────────────────────────────────

    function StepReport() {
        const pct = Math.round((sim.xp / TOTAL_XP) * 100);
        const { label, color } = getScoreLabel(pct);
        const duration = sim.timeCompleted
            ? Math.round((sim.timeCompleted - sim.timeStarted) / 60000)
            : Math.round((Date.now() - sim.timeStarted) / 60000);

        return (
            <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-600 to-green-500 rounded-2xl p-5 text-white text-center">
                    <div className="text-4xl font-black mb-1">{sim.xp}<span className="text-xl font-normal opacity-75"> / {TOTAL_XP} XP</span></div>
                    <div className="text-sm font-bold opacity-90">{label}</div>
                    <div className="mt-3 h-2.5 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                    {[
                        { label: 'Time taken', value: `${duration}m` },
                        { label: 'Steps done', value: `${sim.completedSteps.size} / ${SIM_STEPS.length}` },
                        { label: 'Disks tested', value: sim.selectedDiskIds.length.toString() },
                    ].map(s => (
                        <div key={s.label} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                            <div className="text-base font-bold text-gray-900">{s.value}</div>
                            <div className="text-[11px] text-gray-500">{s.label}</div>
                        </div>
                    ))}
                </div>

                {sim.badges.length > 0 && (
                    <div>
                        <p className="text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Badges earned</p>
                        <div className="flex flex-wrap gap-2">
                            {sim.badges.map(badge => (
                                <span key={badge} className="bg-gradient-to-r from-blue-500 to-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                    🏆 {badge}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                <button
                    onClick={downloadReport}
                    disabled={reportDownloading || !sim.selectedOrganism}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-green-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity text-sm disabled:opacity-50"
                >
                    {reportDownloading ? (
                        <>
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Generating PDF…
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Download Lab Report (PDF)
                        </>
                    )}
                </button>

                <button
                    onClick={() => {
                        if (incubTimerRef.current) clearInterval(incubTimerRef.current);
                        setSim({
                            currentStep: 0,
                            completedSteps: new Set(),
                            selectedOrganism: null,
                            selectedDiskIds: ['AMP', 'CIP', 'GEN'],
                            measuredZones: {},
                            incubationProgress: 0,
                            incubationDone: false,
                            quizAnswers: {},
                            quizScore: 0,
                            xp: 0,
                            badges: [],
                            timeStarted: Date.now(),
                            timeCompleted: null,
                        });
                        setQuiz({ currentIdx: 0, answered: null, showExplanation: false, score: 0, total: QUIZ_QUESTIONS.length });
                    }}
                    className="w-full py-3 border-2 border-gray-200 text-gray-600 font-bold rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all text-sm"
                >
                    Restart simulation
                </button>
            </div>
        );
    }

    // ─── Quiz Panel ──────────────────────────────────────────────

    function QuizPanel() {
        const allDone = quiz.currentIdx >= QUIZ_QUESTIONS.length;
        if (allDone) {
            const pct = Math.round((quiz.score / QUIZ_QUESTIONS.length) * 100);
            return (
                <div className="space-y-4">
                    <div className="bg-gradient-to-r from-blue-600 to-green-500 rounded-2xl p-6 text-white text-center">
                        <div className="text-5xl font-black">{quiz.score}<span className="text-2xl opacity-70">/{QUIZ_QUESTIONS.length}</span></div>
                        <div className="text-sm mt-1 opacity-80">{getScoreLabel(pct).label}</div>
                    </div>
                    <button
                        onClick={() => setQuiz({ currentIdx: 0, answered: null, showExplanation: false, score: 0, total: QUIZ_QUESTIONS.length })}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-green-500 text-white font-bold rounded-xl text-sm"
                    >
                        Retake quiz
                    </button>
                </div>
            );
        }

        const q = QUIZ_QUESTIONS[quiz.currentIdx];
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Question {quiz.currentIdx + 1} / {QUIZ_QUESTIONS.length}
                    </span>
                    <span className="text-xs font-bold text-blue-600">{quiz.score} correct</span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 to-green-400 rounded-full transition-all duration-300"
                        style={{ width: `${(quiz.currentIdx / QUIZ_QUESTIONS.length) * 100}%` }}
                    />
                </div>
                <p className="text-sm font-bold text-gray-900 leading-relaxed">{q.question}</p>
                <div className="space-y-2">
                    {q.options.map((opt, i) => {
                        const isAnswered = quiz.answered !== null;
                        const isSelected = quiz.answered === i;
                        const isCorrect = i === q.correctIndex;
                        let cls = 'w-full text-left p-3.5 rounded-xl border-2 text-sm transition-all duration-200 ';
                        if (!isAnswered) {
                            cls += 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 cursor-pointer';
                        } else if (isCorrect) {
                            cls += 'border-green-500 bg-green-50 text-green-800 font-medium';
                        } else if (isSelected && !isCorrect) {
                            cls += 'border-red-400 bg-red-50 text-red-800';
                        } else {
                            cls += 'border-gray-100 bg-gray-50 text-gray-400';
                        }
                        return (
                            <button key={i} className={cls} onClick={() => !isAnswered && answerQuiz(i)}>
                                <div className="flex items-start gap-2.5">
                                    <span className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5
                    ${isAnswered && isCorrect ? 'border-green-500 bg-green-500 text-white' : isAnswered && isSelected ? 'border-red-400 bg-red-400 text-white' : 'border-gray-300 text-gray-500'}`}>
                                        {isAnswered && isCorrect ? '✓' : isAnswered && isSelected && !isCorrect ? '✗' : String.fromCharCode(65 + i)}
                                    </span>
                                    {opt}
                                </div>
                            </button>
                        );
                    })}
                </div>
                {quiz.showExplanation && (
                    <div className={`p-3.5 rounded-xl border text-sm leading-relaxed ${quiz.answered === q.correctIndex ? 'bg-green-50 border-green-200 text-green-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                        <span className="font-bold block mb-1">{quiz.answered === q.correctIndex ? '✓ Correct!' : '✗ Incorrect'}</span>
                        {q.explanation}
                    </div>
                )}
                {quiz.showExplanation && (
                    <button
                        onClick={nextQuestion}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-green-500 text-white font-bold rounded-xl text-sm"
                    >
                        {quiz.currentIdx + 1 < QUIZ_QUESTIONS.length ? 'Next question →' : 'See results →'}
                    </button>
                )}
            </div>
        );
    }

    // ─── Theory Panel ────────────────────────────────────────────

    function TheoryPanel() {
        const [expanded, setExpanded] = useState<string | null>('principle');
        const sections = [
            {
                id: 'principle', title: 'Principle', content:
                    'The Kirby-Bauer disk diffusion test is based on diffusion of antibiotic from a paper disk impregnated with a known concentration of drug into the agar medium. As the antibiotic diffuses outward, its concentration decreases. At the point where the concentration falls below the MIC for that organism, bacterial growth resumes — forming a visible zone of inhibition.',
            },
            {
                id: 'media', title: 'Mueller-Hinton Agar', content:
                    'MHA is the CLSI-recommended medium. It contains beef extract, casein hydrolysate, and starch. Low in thymidine and thymine (avoids false resistance to sulfonamides/trimethoprim). Calcium and magnesium levels are standardized (affects aminoglycoside and tetracycline results).',
            },
            {
                id: 'clsi', title: 'CLSI Breakpoints', content:
                    'Clinical breakpoints are defined by the Clinical and Laboratory Standards Institute (CLSI) in document M100. They define zone diameter thresholds for S (susceptible), I (intermediate), and R (resistant) categories. Breakpoints are organism-specific and drug-specific.',
            },
            {
                id: 'factors', title: 'Factors Affecting Results', content:
                    'Agar depth (must be 4mm) · Inoculum density (0.5 McFarland) · Disk potency and storage conditions · Incubation temperature and duration · pH of medium · Presence of inhibitors (blood, mucus in clinical samples)',
            },
        ];
        return (
            <div className="space-y-2">
                {sections.map(s => (
                    <div key={s.id} className="border border-gray-200 rounded-xl overflow-hidden">
                        <button
                            className="w-full flex items-center justify-between p-3.5 text-left hover:bg-gray-50 transition-colors"
                            onClick={() => setExpanded(expanded === s.id ? null : s.id)}
                        >
                            <span className="text-sm font-bold text-gray-900">{s.title}</span>
                            <svg
                                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${expanded === s.id ? 'rotate-180' : ''}`}
                                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {expanded === s.id && (
                            <div className="px-3.5 pb-3.5 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                                {s.content}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    }

    // ─── Render ──────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="max-w-5xl mx-auto px-4 pt-[2.75rem] pb-5">
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-green-500 rounded-lg flex items-center justify-center">
                                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                    </svg>
                                </div>
                                <h1 className="text-base font-extrabold text-gray-900">Disk Diffusion Simulation</h1>
                                <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Kirby-Bauer</span>
                            </div>
                            <p className="text-xs text-gray-500 ml-8">Antibiotic Susceptibility Testing · CLSI M100</p>
                        </div>
                        {sim.currentStep > 0 && (
                            <div className="text-right">
                                <div className="text-xs font-bold text-gray-500">Step {sim.currentStep + 1} / {SIM_STEPS.length}</div>
                                <div className="text-xs text-blue-600 font-medium">{currentStepData.title}</div>
                            </div>
                        )}
                    </div>
                    <XPBar xp={sim.xp} total={TOTAL_XP} />
                </div>
            </div>

            {/* Step progress */}
            <div className="bg-white border-b border-gray-100 px-4 py-3">
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-start gap-1 sm:gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        {SIM_STEPS.map((step, i) => (
                            <React.Fragment key={step.id}>
                                <StepBadge
                                    n={i}
                                    label={step.shortTitle}
                                    active={sim.currentStep === i}
                                    done={sim.completedSteps.has(i)}
                                    onClick={() => {
                                        if (sim.completedSteps.has(i) || sim.currentStep === i) {
                                            setSim(prev => ({ ...prev, currentStep: i }));
                                        }
                                    }}
                                />
                                {i < SIM_STEPS.length - 1 && (
                                    <div className={`flex-1 h-0.5 mt-4 rounded-full min-w-[8px] transition-colors ${sim.completedSteps.has(i) ? 'bg-green-400' : 'bg-gray-200'}`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="max-w-5xl mx-auto px-4 pt-25 pb-5">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">

                    {/* Left: controls */}
                    <div className="space-y-4">
                        {/* Lab tip */}
                        {showTip && currentStepData.labTip && (
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex gap-2">
                                <svg className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-blue-700 mb-0.5">Lab Tip</p>
                                    <p className="text-xs text-blue-800 leading-relaxed">{currentStepData.labTip}</p>
                                </div>
                                <button onClick={() => setShowTip(false)} className="text-blue-400 hover:text-blue-600 flex-shrink-0">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        )}

                        {/* Tab bar */}
                        <div className="flex bg-gray-100 rounded-xl p-1">
                            {(['lab', 'theory', 'quiz'] as const).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-all duration-200 ${activeTab === tab
                                        ? 'bg-white text-blue-700 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {tab === 'lab' ? '🧪 Lab' : tab === 'theory' ? '📖 Theory' : '❓ Quiz'}
                                </button>
                            ))}
                        </div>

                        {/* Tab content */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                            {activeTab === 'lab' && renderStep()}
                            {activeTab === 'theory' && <TheoryPanel />}
                            {activeTab === 'quiz' && <QuizPanel />}
                        </div>
                    </div>

                    {/* Right: petri dish */}
                    <div className="space-y-4">
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-gray-900">Petri Dish View</h3>
                                {sim.selectedOrganism && (
                                    <span className="text-xs font-medium italic text-gray-500">
                                        {sim.selectedOrganism.shortName}
                                    </span>
                                )}
                            </div>
                            <canvas
                                ref={canvasRef}
                                width={320}
                                height={320}
                                className="w-full max-w-[320px] mx-auto block"
                                style={{ imageRendering: 'crisp-edges' }}
                            />
                            {sim.selectedOrganism && (
                                <div className="mt-3 flex flex-wrap gap-1.5 justify-center">
                                    {sim.selectedDiskIds.map(id => {
                                        const ab = ANTIBIOTICS.find(a => a.id === id);
                                        if (!ab) return null;
                                        return (
                                            <span key={id} className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                                                style={{ background: ab.diskColor, color: ab.color }}>
                                                <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: ab.color }} />
                                                {id} — {ab.name}
                                            </span>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Breakpoint reference card */}
                        {sim.currentStep >= 6 && (
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                                <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">CLSI Breakpoints Reference</p>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs">
                                        <thead>
                                            <tr className="text-gray-400">
                                                <th className="text-left pb-2 font-medium">Antibiotic</th>
                                                <th className="text-center pb-2 font-medium">S ≥</th>
                                                <th className="text-center pb-2 font-medium">R ≤</th>
                                                <th className="text-center pb-2 font-medium">Result</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {sim.selectedDiskIds.map(id => {
                                                const ab = ANTIBIOTICS.find(a => a.id === id)!;
                                                const zone = sim.measuredZones[id] ?? (sim.selectedOrganism?.zones[id] ?? 0);
                                                const result = interpretZone(id, zone);
                                                return (
                                                    <tr key={id}>
                                                        <td className="py-1.5 font-bold" style={{ color: ab.color }}>{ab.shortName}</td>
                                                        <td className="py-1.5 text-center text-green-700 font-medium">{ab.breakpoints.susceptible}</td>
                                                        <td className="py-1.5 text-center text-red-600 font-medium">{ab.breakpoints.resistant}</td>
                                                        <td className="py-1.5 text-center"><ResultBadge result={result} /></td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}