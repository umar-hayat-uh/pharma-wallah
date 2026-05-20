"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Beaker,
  TestTube,
  FlaskConical,
  Droplet,
  Calculator,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  AlertCircle,
  BookOpen,
  GraduationCap,
  Play,
  Pause,
} from "lucide-react";
import jsPDF from "jspdf";

// ============================================================================
// TYPES
// ============================================================================

type Phase = "tutorial" | "quiz" | "simulation";

interface Problem {
  analyte: string;
  analyteFormula: string;
  analyteVolume: number;
  titrant: string;
  titrantFormula: string;
  titrantConc: number;
  analyteConc: number;
  indicator: string;
  colorStart: string;
  colorEnd: string;
  endpointColor: string;
}

interface Notification {
  message: string;
  type: "success" | "error" | "info";
}

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
}

// ============================================================================
// PROBLEM PRESETS
// ============================================================================

const PROBLEMS: Problem[] = [
  {
    analyte: "Hydrochloric Acid",
    analyteFormula: "HCl",
    analyteVolume: 25,
    titrant: "Sodium Hydroxide",
    titrantFormula: "NaOH",
    titrantConc: 0.1,
    analyteConc: 0.12,
    indicator: "Phenolphthalein",
    colorStart: "#ffffff",
    colorEnd: "#ff69b4",
    endpointColor: "#ffb6d9",
  },
  {
    analyte: "Acetic Acid",
    analyteFormula: "CH₃COOH",
    analyteVolume: 20,
    titrant: "Sodium Hydroxide",
    titrantFormula: "NaOH",
    titrantConc: 0.05,
    analyteConc: 0.04,
    indicator: "Phenolphthalein",
    colorStart: "#ffffff",
    colorEnd: "#ff69b4",
    endpointColor: "#ffb6d9",
  },
  {
    analyte: "Nitric Acid",
    analyteFormula: "HNO₃",
    analyteVolume: 20,
    titrant: "Sodium Hydroxide",
    titrantFormula: "NaOH",
    titrantConc: 0.2,
    analyteConc: 0.15,
    indicator: "Phenolphthalein",
    colorStart: "#ffffff",
    colorEnd: "#ff69b4",
    endpointColor: "#ffb6d9",
  },
  {
    analyte: "Hydrochloric Acid",
    analyteFormula: "HCl",
    analyteVolume: 30,
    titrant: "Potassium Hydroxide",
    titrantFormula: "KOH",
    titrantConc: 0.05,
    analyteConc: 0.03,
    indicator: "Methyl Orange",
    colorStart: "#ff6b6b",
    colorEnd: "#ffd43b",
    endpointColor: "#ffec99",
  },
];

// ============================================================================
// TUTORIAL SLIDES
// ============================================================================

const TUTORIAL_SLIDES = [
  {
    title: "What is Acid-Base Titration?",
    content:
      "Titration is a quantitative analytical technique used to determine the concentration of an unknown acid or base solution by reacting it with a solution of known concentration (standard solution).",
    emoji: "🧪",
    gradient: "from-blue-500 to-cyan-400",
  },
  {
    title: "The Titration Process",
    content:
      "A burette delivers the titrant (known concentration) dropwise into a flask containing the analyte (unknown concentration) and an indicator. The indicator changes color at the endpoint, signaling complete neutralization.",
    emoji: "💧",
    gradient: "from-green-500 to-teal-400",
  },
  {
    title: "The Neutralization Equation",
    content:
      "For acid-base reactions: C₁V₁ = C₂V₂, where C₁ and V₁ are the concentration and volume of the acid, and C₂ and V₂ are the concentration and volume of the base. This relationship allows us to calculate unknown concentrations.",
    emoji: "📐",
    gradient: "from-purple-500 to-pink-400",
  },
  {
    title: "Indicators and Endpoints",
    content:
      "Chemical indicators like phenolphthalein (colorless → pink) or methyl orange (red → yellow) change color at specific pH ranges. The endpoint is when the indicator changes color, indicating neutralization is complete.",
    emoji: "🎨",
    gradient: "from-orange-500 to-red-400",
  },
];

// ============================================================================
// QUIZ QUESTIONS
// ============================================================================

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question: "What is the purpose of an indicator in acid-base titration?",
    options: [
      "To speed up the reaction",
      "To signal when neutralization is complete",
      "To increase the concentration of the analyte",
      "To make the solution taste better",
    ],
    correct: 1,
  },
  {
    question: "In the equation C₁V₁ = C₂V₂, what does C₁ represent?",
    options: [
      "The volume of the base",
      "The concentration of the first solution",
      "The color of the indicator",
      "The temperature of the solution",
    ],
    correct: 1,
  },
  {
    question: "What color does phenolphthalein turn in a basic solution?",
    options: ["Blue", "Yellow", "Pink", "Green"],
    correct: 2,
  },
  {
    question:
      "What is the endpoint of a titration?",
    options: [
      "When the burette is empty",
      "When the indicator changes color permanently",
      "When the flask is full",
      "When 10 minutes have passed",
    ],
    correct: 1,
  },
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function interpolateColor(
  color1: string,
  color2: string,
  factor: number
): string {
  const hex1 = color1.replace("#", "");
  const hex2 = color2.replace("#", "");

  const r1 = parseInt(hex1.substring(0, 2), 16);
  const g1 = parseInt(hex1.substring(2, 4), 16);
  const b1 = parseInt(hex1.substring(4, 6), 16);

  const r2 = parseInt(hex2.substring(0, 2), 16);
  const g2 = parseInt(hex2.substring(2, 4), 16);
  const b2 = parseInt(hex2.substring(4, 6), 16);

  const r = Math.round(r1 + (r2 - r1) * factor);
  const g = Math.round(g1 + (g2 - g1) * factor);
  const b = Math.round(b1 + (b2 - b1) * factor);

  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function generatePDF(
  problem: Problem,
  titrantVolume: number,
  userFinalConc: number,
  overshoot: boolean
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header with gradient effect (simulated)
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, pageWidth, 40, "F");
  doc.setFillColor(74, 222, 128);
  doc.rect(pageWidth / 2, 0, pageWidth / 2, 40, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("PharmaWallah", pageWidth / 2, 20, { align: "center" });
  doc.setFontSize(12);
  doc.text("Titration Lab Report", pageWidth / 2, 30, { align: "center" });

  // Date
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 55);

  // Problem Details
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Problem Details", 20, 70);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Analyte: ${problem.analyte} (${problem.analyteFormula})`, 20, 80);
  doc.text(`Analyte Volume: ${problem.analyteVolume} mL`, 20, 90);
  doc.text(`Titrant: ${problem.titrant} (${problem.titrantFormula})`, 20, 100);
  doc.text(`Titrant Concentration: ${problem.titrantConc} M`, 20, 110);
  doc.text(`Indicator: ${problem.indicator}`, 20, 120);

  // Results
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Results", 20, 140);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Volume of Titrant Used: ${titrantVolume.toFixed(2)} mL`, 20, 150);
  doc.text(`Calculated Concentration: ${userFinalConc.toFixed(4)} M`, 20, 160);
  doc.text(`True Concentration: ${problem.analyteConc.toFixed(4)} M`, 20, 170);

  const error =
    Math.abs(userFinalConc - problem.analyteConc) / problem.analyteConc * 100;
  doc.text(`Error: ${error.toFixed(2)}%`, 20, 180);

  if (overshoot) {
    doc.setTextColor(220, 38, 38);
    doc.text("⚠ Warning: Endpoint overshoot detected", 20, 190);
  }

  // Formula
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Calculation", 20, 210);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Using: C₁V₁ = C₂V₂", 20, 220);
  doc.text(
    `C₁ = (C₂ × V₂) / V₁ = (${problem.titrantConc} × ${titrantVolume.toFixed(2)}) / ${problem.analyteVolume}`,
    20,
    230
  );
  doc.text(`C₁ = ${userFinalConc.toFixed(4)} M`, 20, 240);

  // Footer
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(
    "This report was generated by PharmaWallah Titration Lab Simulator.",
    pageWidth / 2,
    280,
    { align: "center" }
  );

  doc.save("titration-report.pdf");
}

// ============================================================================
// SVG COMPONENTS
// ============================================================================

interface BuretteProps {
  fillPercent: number;
  tapOpen: boolean;
}

const BuretteSVG: React.FC<BuretteProps> = ({ fillPercent, tapOpen }) => {
  const liquidHeight = 460 * fillPercent;
  const liquidY = 30 + (460 - liquidHeight);

  return (
    <svg
      viewBox="0 0 200 600"
      className="w-full h-auto max-w-[120px] sm:max-w-[160px]"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="liquidGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#29b6f6" stopOpacity="0.6" />
          <stop offset="50%" stopColor="#0288d1" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#29b6f6" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id="glassSheen" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="10%" stopColor="#ffffff" stopOpacity="0.1" />
          <stop offset="90%" stopColor="#ffffff" stopOpacity="0.0" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient
          id="stopcockGrad"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#78909c" />
          <stop offset="50%" stopColor="#455a64" />
          <stop offset="100%" stopColor="#37474f" />
        </linearGradient>
      </defs>
      <g transform="translate(0, 10)">
        {/* Tube */}
        <rect
          x="85"
          y="30"
          width="30"
          height="460"
          rx="3"
          fill="#e0f7fa"
          stroke="#37474f"
          strokeWidth="3"
        />
        {/* Dynamic liquid */}
        <rect
          x="88"
          y={liquidY}
          width="24"
          height={liquidHeight}
          fill="url(#liquidGrad)"
        />
        {/* Meniscus */}
        <path
          d={`M 88 ${liquidY} C 94 ${liquidY + 8}, 106 ${liquidY + 8}, 112 ${liquidY}`}
          fill="#0288d1"
          opacity="0.8"
        />
        {/* Glass highlight */}
        <rect
          x="88"
          y="30"
          width="6"
          height="460"
          fill="url(#glassSheen)"
        />
        {/* Graduation marks */}
        <g stroke="#37474f" strokeWidth="2.5">
          <line x1="78" y1="100" x2="85" y2="100" />
          <line x1="78" y1="180" x2="85" y2="180" />
          <line x1="78" y1="260" x2="85" y2="260" />
          <line x1="78" y1="340" x2="85" y2="340" />
          <line x1="78" y1="420" x2="85" y2="420" />
          <line x1="78" y1="480" x2="85" y2="480" />
        </g>
        {/* Minor ticks */}
        <g stroke="#37474f" strokeWidth="1.5">
          {[116, 132, 148, 164, 196, 212, 228, 244, 276, 292, 308, 324, 356, 372, 388, 404, 436, 452, 468].map(
            (y) => (
              <line key={y} x1="80" y1={y} x2="85" y2={y} />
            )
          )}
        </g>
        {/* Labels */}
        <text
          x="70"
          y="105"
          fontSize="12"
          fill="#37474f"
          fontFamily="Arial"
          fontWeight="bold"
        >
          0
        </text>
        <text
          x="65"
          y="185"
          fontSize="12"
          fill="#37474f"
          fontFamily="Arial"
          fontWeight="bold"
        >
          10
        </text>
        <text
          x="65"
          y="265"
          fontSize="12"
          fill="#37474f"
          fontFamily="Arial"
          fontWeight="bold"
        >
          20
        </text>
        <text
          x="65"
          y="345"
          fontSize="12"
          fill="#37474f"
          fontFamily="Arial"
          fontWeight="bold"
        >
          30
        </text>
        <text
          x="65"
          y="425"
          fontSize="12"
          fill="#37474f"
          fontFamily="Arial"
          fontWeight="bold"
        >
          40
        </text>
        <text
          x="65"
          y="485"
          fontSize="12"
          fill="#37474f"
          fontFamily="Arial"
          fontWeight="bold"
        >
          50
        </text>
        {/* Funnel top */}
        <path
          d="M 75 30 L 125 30 L 115 10 L 85 10 Z"
          fill="#e0f7fa"
          stroke="#37474f"
          strokeWidth="3"
        />
        {/* Stopcock body */}
        <rect
          x="95"
          y="490"
          width="10"
          height="20"
          fill="#b0bec5"
          stroke="#37474f"
          strokeWidth="2"
        />
        <polygon
          points="80,510 120,510 115,530 85,530"
          fill="url(#stopcockGrad)"
          stroke="#37474f"
          strokeWidth="2"
        />
        {/* Rotating handle */}
        <g transform={`rotate(${tapOpen ? 45 : 25}, 100, 520)`}>
          <rect
            x="92"
            y="500"
            width="16"
            height="40"
            rx="4"
            fill="#cfd8dc"
            stroke="#37474f"
            strokeWidth="2"
          />
          <circle cx="100" cy="520" r="6" fill="#90a4ae" />
        </g>
        {/* Tip & droplet */}
        <path
          d="M 97 530 L 97 555 L 103 555 L 103 530"
          fill="#e0f7fa"
          stroke="#37474f"
          strokeWidth="2"
        />
        {tapOpen && (
          <path
            d="M 97 555 C 97 562, 103 562, 103 555 Z"
            fill="#29b6f6"
            opacity="0.8"
          >
            <animate
              attributeName="opacity"
              values="0.8;0.2;0.8"
              dur="0.5s"
              repeatCount="indefinite"
            />
          </path>
        )}
      </g>
    </svg>
  );
};

interface VolumetricFlaskProps {
  fillLevel: number;
  color: string;
}

const VolumetricFlaskSVG: React.FC<VolumetricFlaskProps> = ({
  fillLevel,
  color,
}) => {
  const flaskHeight = 300;
  const liquidHeight = flaskHeight * fillLevel * 0.6;
  const liquidY = flaskHeight - liquidHeight - 20;

  return (
    <svg
      viewBox="0 0 200 350"
      className="w-full h-auto max-w-[130px] sm:max-w-[180px]"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="flaskGlass" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#e3f2fd" stopOpacity="0.4" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#e3f2fd" stopOpacity="0.4" />
        </linearGradient>
      </defs>

      {/* Flask body */}
      <path
        d="M 85 20 L 85 100 L 50 200 Q 40 250 40 280 Q 40 310 60 320 L 140 320 Q 160 310 160 280 Q 160 250 150 200 L 115 100 L 115 20 Z"
        fill="url(#flaskGlass)"
        stroke="#37474f"
        strokeWidth="3"
      />

      {/* Liquid */}
      {fillLevel > 0 && (
        <path
          d={`M ${50 + (fillLevel * 50)} ${liquidY} Q ${45 + (fillLevel * 50)} ${liquidY + liquidHeight * 0.4} ${45 + (fillLevel * 50)} ${liquidY + liquidHeight * 0.7} Q ${45 + (fillLevel * 50)} ${liquidY + liquidHeight} ${60 + (fillLevel * 40)} ${liquidY + liquidHeight + 10} L ${140 - (fillLevel * 40)} ${liquidY + liquidHeight + 10} Q ${155 - (fillLevel * 50)} ${liquidY + liquidHeight} ${155 - (fillLevel * 50)} ${liquidY + liquidHeight * 0.7} Q ${155 - (fillLevel * 50)} ${liquidY + liquidHeight * 0.4} ${150 - (fillLevel * 50)} ${liquidY} Z`}
          fill={color}
          opacity="0.7"
        />
      )}

      {/* Calibration mark */}
      <line
        x1="50"
        y1="200"
        x2="70"
        y2="200"
        stroke="#37474f"
        strokeWidth="2.5"
      />
      <line
        x1="130"
        y1="200"
        x2="150"
        y2="200"
        stroke="#37474f"
        strokeWidth="2.5"
      />

      {/* Neck */}
      <rect
        x="85"
        y="10"
        width="30"
        height="15"
        rx="2"
        fill="#e3f2fd"
        stroke="#37474f"
        strokeWidth="3"
      />

      {/* Glass highlight */}
      <path
        d="M 90 30 L 90 110 L 55 210 Q 50 240 50 270"
        fill="none"
        stroke="#ffffff"
        strokeWidth="4"
        opacity="0.5"
      />
    </svg>
  );
};

const IndicatorBottleSVG: React.FC = () => {
  return (
    <svg
      viewBox="0 0 100 150"
      className="w-full h-auto max-w-[60px] sm:max-w-[80px]"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="bottleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>
      {/* Bottle body */}
      <rect
        x="25"
        y="40"
        width="50"
        height="90"
        rx="5"
        fill="url(#bottleGrad)"
        stroke="#1e293b"
        strokeWidth="2"
      />
      {/* Cap */}
      <rect
        x="35"
        y="25"
        width="30"
        height="20"
        rx="3"
        fill="#334155"
        stroke="#1e293b"
        strokeWidth="2"
      />
      {/* Label */}
      <rect x="30" y="60" width="40" height="25" rx="2" fill="#f8fafc" />
      <text
        x="50"
        y="75"
        fontSize="10"
        fill="#1e293b"
        fontFamily="Arial"
        fontWeight="bold"
        textAnchor="middle"
      >
        IND
      </text>
      {/* Liquid shine */}
      <rect
        x="28"
        y="45"
        width="8"
        height="80"
        fill="#ffffff"
        opacity="0.3"
      />
    </svg>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function TitrationLab() {
  // Phase management
  const [phase, setPhase] = useState<Phase>("tutorial");

  // Tutorial
  const [tutorialSlide, setTutorialSlide] = useState(0);

  // Quiz
  const [quizQuestion, setQuizQuestion] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerFeedback, setAnswerFeedback] = useState<boolean | null>(null);

  // Simulation
  const [step, setStep] = useState(1);
  const [problem, setProblem] = useState<Problem>(
    PROBLEMS[Math.floor(Math.random() * PROBLEMS.length)]
  );

  // Step 1 - Preparation
  const [indicatorAdded, setIndicatorAdded] = useState(false);
  const [buretteFilled, setBuretteFilled] = useState(false);
  const [flaskFilled, setFlaskFilled] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isHoveringFlask, setIsHoveringFlask] = useState(false);
  const flaskRef = useRef<HTMLDivElement>(null);

  // Step 2 - Titration
  const [titrantVolume, setTitrantVolume] = useState(0);
  const [isTitrating, setIsTitrating] = useState(false);
  const [endpointReached, setEndpointReached] = useState(false);
  const [overshoot, setOvershoot] = useState(false);

  // Step 3 - Calculate
  const [userCalcVolume, setUserCalcVolume] = useState("");
  const [calculatedOk, setCalculatedOk] = useState(false);
  const [userFinalConc, setUserFinalConc] = useState(0);

  // Notification
  const [notification, setNotification] = useState<Notification | null>(null);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Titration interval
  useEffect(() => {
    if (isTitrating && !endpointReached) {
      const interval = setInterval(() => {
        setTitrantVolume((prev) => {
          const newVolume = prev + 0.1;
          const expectedVolume =
            (problem.analyteConc * problem.analyteVolume) / problem.titrantConc;

          if (newVolume >= expectedVolume && !endpointReached) {
            setEndpointReached(true);
            setIsTitrating(false);

            if (newVolume > expectedVolume + 0.5) {
              setOvershoot(true);
              showNotification(
                "Overshoot detected! You added too much titrant.",
                "error"
              );
            } else {
              showNotification("Endpoint reached!", "success");
            }
          }

          return Math.min(newVolume, 50);
        });
      }, 30);

      return () => clearInterval(interval);
    }
  }, [isTitrating, endpointReached, problem]);

  // Auto-dismiss notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const showNotification = (
    message: string,
    type: "success" | "error" | "info"
  ) => {
    setNotification({ message, type });
  };

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (flaskRef.current) {
      const rect = flaskRef.current.getBoundingClientRect();
      const x = e.clientX;
      const y = e.clientY;

      if (
        x >= rect.left &&
        x <= rect.right &&
        y >= rect.top &&
        y <= rect.bottom
      ) {
        setIsHoveringFlask(true);
      } else {
        setIsHoveringFlask(false);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (isHoveringFlask && !indicatorAdded) {
      setIndicatorAdded(true);
      setIsHoveringFlask(false);
      showNotification("Indicator added successfully!", "success");
    }
  };

  const handleTitrateStart = () => {
    if (!endpointReached) {
      setIsTitrating(true);
    }
  };

  const handleTitrateStop = () => {
    setIsTitrating(false);
  };

  const handleCalculate = () => {
    const userConc = parseFloat(userCalcVolume);
    if (isNaN(userConc)) {
      showNotification("Please enter a valid number", "error");
      return;
    }

    const expectedConc =
      (problem.titrantConc * titrantVolume) / problem.analyteVolume;
    const tolerance = 0.001;

    if (Math.abs(userConc - expectedConc) <= tolerance) {
      setCalculatedOk(true);
      setUserFinalConc(userConc);
      showNotification("Correct! Well done!", "success");
    } else {
      showNotification(
        `Incorrect. Expected ${expectedConc.toFixed(4)} M. Try again!`,
        "error"
      );
    }
  };

  const resetSimulation = () => {
    const newProblem = PROBLEMS[Math.floor(Math.random() * PROBLEMS.length)];
    setProblem(newProblem);
    setStep(1);
    setIndicatorAdded(false);
    setBuretteFilled(false);
    setFlaskFilled(false);
    setTitrantVolume(0);
    setIsTitrating(false);
    setEndpointReached(false);
    setOvershoot(false);
    setUserCalcVolume("");
    setCalculatedOk(false);
    setUserFinalConc(0);
    setNotification(null);
  };

  const handleQuizAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    const correct = answerIndex === QUIZ_QUESTIONS[quizQuestion].correct;
    setAnswerFeedback(correct);

    setTimeout(() => {
      const newAnswers = [...quizAnswers, answerIndex];
      setQuizAnswers(newAnswers);

      if (quizQuestion < QUIZ_QUESTIONS.length - 1) {
        setQuizQuestion(quizQuestion + 1);
        setSelectedAnswer(null);
        setAnswerFeedback(null);
      } else {
        // Calculate score
        const score = newAnswers.filter(
          (ans, idx) => ans === QUIZ_QUESTIONS[idx].correct
        ).length;
        setQuizScore(score);
      }
    }, 1500);
  };

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const buretteFillPercent = 1 - titrantVolume / 50;
  const expectedVolume =
    (problem.analyteConc * problem.analyteVolume) / problem.titrantConc;
  const titrationProgress = Math.min(titrantVolume / expectedVolume, 1);

  let flaskColor = problem.colorStart;
  if (endpointReached) {
    flaskColor = problem.endpointColor;
  } else if (titrantVolume > 0) {
    flaskColor = interpolateColor(
      problem.colorStart,
      problem.colorEnd,
      titrationProgress
    );
  }

  const flaskFillLevel = flaskFilled ? 0.25 + titrationProgress * 0.5 : 0;

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-4 sm:py-8 px-2 sm:px-4 pt-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4 sm:mb-8"
        >
          <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-green-400 bg-clip-text text-transparent mb-1 sm:mb-2">
            PharmaWallah
          </h1>
          <p className="text-lg sm:text-xl text-gray-700 font-semibold">
            Interactive Acid-Base Titration Lab
          </p>
        </motion.div>

        {/* Notification */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-2 right-2 sm:top-4 sm:right-4 z-50 max-w-[90vw] sm:max-w-md"
            >
              <div
                className={`px-4 sm:px-6 py-3 sm:py-4 rounded-2xl shadow-lg flex items-center gap-2 sm:gap-3 text-sm sm:text-base ${notification.type === "success"
                    ? "bg-green-500 text-white"
                    : notification.type === "error"
                      ? "bg-red-500 text-white"
                      : "bg-blue-500 text-white"
                  }`}
              >
                {notification.type === "success" && <Check size={20} className="sm:w-6 sm:h-6 flex-shrink-0" />}
                {notification.type === "error" && <X size={20} className="sm:w-6 sm:h-6 flex-shrink-0" />}
                {notification.type === "info" && <AlertCircle size={20} className="sm:w-6 sm:h-6 flex-shrink-0" />}
                <span className="font-bold">{notification.message}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PHASE: TUTORIAL */}
        {phase === "tutorial" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div
                className={`bg-gradient-to-r ${TUTORIAL_SLIDES[tutorialSlide].gradient} p-4 sm:p-8  text-white`}
              >
                <div className="flex items-center justify-center gap-2 sm:gap-4 mb-2 sm:mb-4">
                  <span className="text-3xl sm:text-6xl">
                    {TUTORIAL_SLIDES[tutorialSlide].emoji}
                  </span>
                  <BookOpen size={24} className="sm:w-12 sm:h-12" />
                </div>
                <h2 className="text-xl sm:text-3xl font-bold text-center mb-2 sm:mb-4">
                  {TUTORIAL_SLIDES[tutorialSlide].title}
                </h2>
                <p className="text-sm sm:text-lg text-center leading-relaxed">
                  {TUTORIAL_SLIDES[tutorialSlide].content}
                </p>
              </div>

              <div className="p-4 sm:p-6 flex items-center justify-between gap-2">
                <button
                  onClick={() => setTutorialSlide(Math.max(0, tutorialSlide - 1))}
                  disabled={tutorialSlide === 0}
                  className="px-3 sm:px-6 py-2 sm:py-3  rounded-2xl font-bold text-sm sm:text-base bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1 sm:gap-2"
                >
                  <ChevronLeft size={16} className="sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Previous</span>
                </button>

                <div className="flex gap-1 sm:gap-2">
                  {TUTORIAL_SLIDES.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${idx === tutorialSlide ? "bg-blue-600" : "bg-gray-300"
                        }`}
                    />
                  ))}
                </div>

                {tutorialSlide < TUTORIAL_SLIDES.length - 1 ? (
                  <button
                    onClick={() => setTutorialSlide(tutorialSlide + 1)}
                    className="px-3 sm:px-6 py-2 sm:py-3 rounded-2xl font-bold text-sm sm:text-base bg-gradient-to-r from-blue-600 to-green-400 text-white hover:shadow-lg transition-all flex items-center gap-1 sm:gap-2"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight size={16} className="sm:w-5 sm:h-5" />
                  </button>
                ) : (
                  <button
                    onClick={() => setPhase("quiz")}
                    className="px-3 sm:px-8 py-2 sm:py-3 rounded-2xl font-bold text-sm sm:text-base bg-gradient-to-r from-blue-600 to-green-400 text-white hover:shadow-lg transition-all flex items-center gap-1 sm:gap-2"
                  >
                    <span className="hidden sm:inline">Take Quiz</span>
                    <GraduationCap size={16} className="sm:w-5 sm:h-5" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* PHASE: QUIZ */}
        {phase === "quiz" && quizScore === null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-8 pt-8">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-2xl font-bold text-gray-800">
                  Question {quizQuestion + 1} of {QUIZ_QUESTIONS.length}
                </h2>
                <GraduationCap className="text-blue-600 w-5 h-5 sm:w-8 sm:h-8" />
              </div>

              <p className="text-base sm:text-xl text-gray-700 mb-4 sm:mb-6">
                {QUIZ_QUESTIONS[quizQuestion].question}
              </p>

              <div className="space-y-2 sm:space-y-3">
                {QUIZ_QUESTIONS[quizQuestion].options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuizAnswer(idx)}
                    disabled={selectedAnswer !== null}
                    className={`w-full p-3 sm:p-4 rounded-2xl text-left font-bold text-sm sm:text-base transition-all ${selectedAnswer === idx
                        ? answerFeedback
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                      } disabled:cursor-not-allowed`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option}</span>
                      {selectedAnswer === idx && (
                        <span>
                          {answerFeedback ? (
                            <Check size={20} className="sm:w-6 sm:h-6" />
                          ) : (
                            <X size={20} className="sm:w-6 sm:h-6" />
                          )}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* QUIZ RESULTS */}
        {phase === "quiz" && quizScore !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 pt-8 text-center">
              <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">
                {quizScore === QUIZ_QUESTIONS.length
                  ? "🎉"
                  : quizScore >= 3
                    ? "👍"
                    : "📚"}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">
                Quiz Complete!
              </h2>
              <p className="text-xl sm:text-2xl text-gray-700 mb-1 sm:mb-2">
                Your Score: {quizScore} / {QUIZ_QUESTIONS.length}
              </p>
              <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8">
                {quizScore === QUIZ_QUESTIONS.length
                  ? "Perfect score! You're ready for the lab!"
                  : quizScore >= 3
                    ? "Great job! Let's move to the simulation."
                    : "Good effort! Practice makes perfect."}
              </p>
              <button
                onClick={() => setPhase("simulation")}
                className="px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-sm sm:text-base bg-gradient-to-r from-blue-600 to-green-400 text-white hover:shadow-lg transition-all flex items-center gap-2 mx-auto"
              >
                Start Titration Lab
                <FlaskConical size={20} className="sm:w-6 sm:h-6" />
              </button>
            </div>
          </motion.div>
        )}

        {/* PHASE: SIMULATION */}
        {phase === "simulation" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-6xl mx-auto"
          >
            {/* Progress Steps */}
            <div className="flex justify-center gap-1 sm:gap-4 mb-6 sm:mb-8 flex-wrap">
              {[
                { num: 1, label: "Prepare" },
                { num: 2, label: "Titrate" },
                { num: 3, label: "Calculate" },
                { num: 4, label: "Report" },
              ].map((s) => (
                <div
                  key={s.num}
                  className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-2xl text-xs sm:text-sm ${step === s.num
                      ? "bg-gradient-to-r from-blue-600 to-green-400 text-white"
                      : step > s.num
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                >
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs sm:text-sm">
                    {step > s.num ? <Check size={14} className="sm:w-5 sm:h-5" /> : s.num}
                  </div>
                  <span className="font-bold hidden sm:inline">{s.label}</span>
                </div>
              ))}
            </div>

            {/* Step 1: Preparation */}
            {step === 1 && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">
                  Preparation
                </h2>

                {/* Problem Description */}
                <div className="bg-blue-50 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
                  <h3 className="text-lg sm:text-xl font-bold text-blue-900 mb-2 sm:mb-3">
                    Your Problem:
                  </h3>
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                    Determine the concentration of{" "}
                    <strong>{problem.analyte}</strong> ({problem.analyteFormula}
                    ) in a {problem.analyteVolume} mL sample using{" "}
                    <strong>{problem.titrant}</strong> (
                    {problem.titrantFormula}) with a concentration of{" "}
                    <strong>{problem.titrantConc} M</strong>. Use{" "}
                    <strong>{problem.indicator}</strong> as the indicator.
                  </p>
                </div>

                {/* Tasks */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                  {/* Task 1: Add Indicator */}
                  <div className="bg-gray-50 rounded-2xl p-4 sm:p-6">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <Droplet
                        size={20}
                        className={`sm:w-6 sm:h-6 ${indicatorAdded ? "text-green-500" : "text-gray-400"}`}
                      />
                      <h4 className="font-bold text-sm sm:text-base text-gray-800">
                        1. Add Indicator
                      </h4>
                    </div>
                    <div
                      draggable
                      onDragStart={handleDragStart}
                      className="cursor-move hover:scale-105 transition-transform flex justify-center"
                    >
                      <IndicatorBottleSVG />
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mt-2 text-center">
                      Drag the indicator bottle to the flask
                    </p>
                    {indicatorAdded && (
                      <div className="mt-2 text-green-600 font-bold flex items-center gap-2 justify-center text-sm">
                        <Check size={16} className="sm:w-5 sm:h-5" />
                        Added!
                      </div>
                    )}
                  </div>

                  {/* Task 2: Fill Burette */}
                  <div className="bg-gray-50 rounded-2xl p-4 sm:p-6">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <TestTube
                        size={20}
                        className={`sm:w-6 sm:h-6 ${buretteFilled ? "text-green-500" : "text-gray-400"}`}
                      />
                      <h4 className="font-bold text-sm sm:text-base text-gray-800">
                        2. Fill Burette
                      </h4>
                    </div>
                    <button
                      onClick={() => {
                        setBuretteFilled(true);
                        showNotification("Burette filled with titrant!", "success");
                      }}
                      disabled={buretteFilled}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl font-bold text-sm sm:text-base bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
                    >
                      {buretteFilled ? "Filled ✓" : "Fill Burette"}
                    </button>
                  </div>

                  {/* Task 3: Add Analyte */}
                  <div className="bg-gray-50 rounded-2xl p-4 sm:p-6">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <FlaskConical
                        size={20}
                        className={`${flaskFilled ? "text-green-500" : "text-gray-400"} sm:w-6 sm:h-6`}
                      />
                      <h4 className="font-bold text-sm sm:text-base text-gray-800">
                        3. Add Analyte
                      </h4>
                    </div>
                    <button
                      onClick={() => {
                        setFlaskFilled(true);
                        showNotification("Analyte added to flask!", "success");
                      }}
                      disabled={flaskFilled}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl font-bold text-sm sm:text-base bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
                    >
                      {flaskFilled ? "Added ✓" : "Add Analyte"}
                    </button>
                  </div>
                </div>

                {/* Flask Drop Zone */}
                <div
                  ref={flaskRef}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className={`flex justify-center p-4 sm:p-8 rounded-2xl border-4 border-dashed transition-all ${isHoveringFlask
                      ? "border-green-500 bg-green-50"
                      : "border-gray-300 bg-gray-50"
                    }`}
                >
                  <VolumetricFlaskSVG
                    fillLevel={flaskFilled ? 0.25 : 0}
                    color="#ffffff"
                  />
                </div>

                {/* Next Button */}
                <div className="mt-6 sm:mt-8 text-center">
                  <button
                    onClick={() => setStep(2)}
                    disabled={!indicatorAdded || !buretteFilled || !flaskFilled}
                    className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-sm sm:text-base bg-gradient-to-r from-blue-600 to-green-400 text-white hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Next: Start Titration
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Titrate */}
            {step === 2 && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">
                  Titration in Progress
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 items-start">
                  {/* Burette */}
                  <div className="flex flex-col items-center order-1">
                    <h3 className="text-base sm:text-lg font-bold text-gray-700 mb-3 sm:mb-4">
                      Burette
                    </h3>
                    <BuretteSVG
                      fillPercent={buretteFillPercent}
                      tapOpen={isTitrating}
                    />
                    <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-600 text-center">
                      Volume dispensed:{" "}
                      <strong>{titrantVolume.toFixed(2)} mL</strong>
                    </p>
                  </div>

                  {/* Flask */}
                  <div className="flex flex-col items-center order-2">
                    <h3 className="text-base sm:text-lg font-bold text-gray-700 mb-3 sm:mb-4">
                      Flask
                    </h3>
                    <VolumetricFlaskSVG
                      fillLevel={flaskFillLevel}
                      color={flaskColor}
                    />
                    {endpointReached && (
                      <div className="mt-3 sm:mt-4 text-green-600 font-bold flex items-center gap-2 text-sm sm:text-base">
                        <Check size={20} className="sm:w-6 sm:h-6" />
                        Endpoint Reached!
                      </div>
                    )}
                  </div>

                  {/* Controls */}
                  <div className="flex flex-col items-center justify-center gap-4 sm:gap-6 order-3">
                    <h3 className="text-base sm:text-lg font-bold text-gray-700">
                      Controls
                    </h3>
                    <button
                      onMouseDown={handleTitrateStart}
                      onMouseUp={handleTitrateStop}
                      onMouseLeave={handleTitrateStop}
                      onTouchStart={handleTitrateStart}
                      onTouchEnd={handleTitrateStop}
                      disabled={endpointReached}
                      className="w-full px-6 sm:px-8 py-4 sm:py-6 rounded-2xl font-bold text-sm sm:text-base bg-gradient-to-r from-blue-600 to-green-400 text-white hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex flex-col items-center gap-2"
                    >
                      {isTitrating ? (
                        <>
                          <Pause size={24} className="sm:w-8 sm:h-8" />
                          <span>Release to Stop</span>
                        </>
                      ) : endpointReached ? (
                        <>
                          <Check size={24} className="sm:w-8 sm:h-8" />
                          <span>Complete</span>
                        </>
                      ) : (
                        <>
                          <Play size={24} className="sm:w-8 sm:h-8" />
                          <span>Hold to Add Titrant</span>
                        </>
                      )}
                    </button>

                    {endpointReached && (
                      <button
                        onClick={() => setStep(3)}
                        className="w-full px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl font-bold text-sm sm:text-base bg-green-500 text-white hover:bg-green-600 transition-all"
                      >
                        Next: Calculate
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Calculate */}
            {step === 3 && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">
                  Calculate Concentration
                </h2>

                <div className="max-w-2xl mx-auto">
                  <div className="bg-blue-50 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
                    <h3 className="text-lg sm:text-xl font-bold text-blue-900 mb-3 sm:mb-4">
                      Given Data:
                    </h3>
                    <ul className="space-y-1.5 sm:space-y-2 text-sm sm:text-base text-gray-700">
                      <li>
                        • Volume of titrant used:{" "}
                        <strong>{titrantVolume.toFixed(2)} mL</strong>
                      </li>
                      <li>
                        • Concentration of titrant:{" "}
                        <strong>{problem.titrantConc} M</strong>
                      </li>
                      <li>
                        • Volume of analyte:{" "}
                        <strong>{problem.analyteVolume} mL</strong>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
                    <h3 className="text-lg sm:text-xl font-bold text-purple-900 mb-3 sm:mb-4">
                      Formula:
                    </h3>
                    <p className="text-xl sm:text-2xl font-bold text-center text-gray-800 mb-1 sm:mb-2">
                      C₁V₁ = C₂V₂
                    </p>
                    <p className="text-sm sm:text-base text-gray-700 text-center">
                      C₁ = (C₂ × V₂) / V₁
                    </p>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <label className="block">
                      <span className="text-sm sm:text-base text-gray-700 font-bold mb-1.5 sm:mb-2 block">
                        Enter the concentration of {problem.analyte} (in M):
                      </span>
                      <input
                        type="number"
                        step="0.0001"
                        value={userCalcVolume}
                        onChange={(e) => setUserCalcVolume(e.target.value)}
                        disabled={calculatedOk}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl border-2 border-gray-300 focus:border-blue-500 focus:outline-none text-base sm:text-lg disabled:bg-gray-100"
                        placeholder="0.0000"
                      />
                    </label>

                    {!calculatedOk && (
                      <button
                        onClick={handleCalculate}
                        className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-2xl font-bold text-sm sm:text-base bg-gradient-to-r from-blue-600 to-green-400 text-white hover:shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        <Calculator size={20} className="sm:w-6 sm:h-6" />
                        Check Answer
                      </button>
                    )}

                    {calculatedOk && (
                      <button
                        onClick={() => setStep(4)}
                        className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-2xl font-bold text-sm sm:text-base bg-green-500 text-white hover:bg-green-600 transition-all"
                      >
                        View Report
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Report */}
            {step === 4 && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">
                  Titration Report
                </h2>

                <div className="overflow-x-auto mb-6 sm:mb-8 -mx-4 sm:mx-0">
                  <table className="w-full min-w-[300px]">
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-600 to-green-400 text-white">
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-bold text-xs sm:text-sm rounded-tl-2xl">
                          Parameter
                        </th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-bold text-xs sm:text-sm rounded-tr-2xl">
                          Value
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-xs sm:text-sm">
                      <tr className="border-b border-gray-200">
                        <td className="px-3 sm:px-6 py-2 sm:py-3 font-bold text-gray-700">
                          Analyte
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-3 text-gray-600">
                          {problem.analyte} ({problem.analyteFormula})
                        </td>
                      </tr>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <td className="px-3 sm:px-6 py-2 sm:py-3 font-bold text-gray-700">
                          Analyte Volume
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-3 text-gray-600">
                          {problem.analyteVolume} mL
                        </td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="px-3 sm:px-6 py-2 sm:py-3 font-bold text-gray-700">
                          Titrant
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-3 text-gray-600">
                          {problem.titrant} ({problem.titrantFormula})
                        </td>
                      </tr>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <td className="px-3 sm:px-6 py-2 sm:py-3 font-bold text-gray-700">
                          Titrant Concentration
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-3 text-gray-600">
                          {problem.titrantConc} M
                        </td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="px-3 sm:px-6 py-2 sm:py-3 font-bold text-gray-700">
                          Indicator
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-3 text-gray-600">
                          {problem.indicator}
                        </td>
                      </tr>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <td className="px-3 sm:px-6 py-2 sm:py-3 font-bold text-gray-700">
                          Volume of Titrant Used
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-3 text-gray-600">
                          {titrantVolume.toFixed(2)} mL
                        </td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="px-3 sm:px-6 py-2 sm:py-3 font-bold text-gray-700">
                          Calculated Concentration
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-3 text-gray-600">
                          {userFinalConc.toFixed(4)} M
                        </td>
                      </tr>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <td className="px-3 sm:px-6 py-2 sm:py-3 font-bold text-gray-700">
                          True Concentration
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-3 text-gray-600">
                          {problem.analyteConc.toFixed(4)} M
                        </td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="px-3 sm:px-6 py-2 sm:py-3 font-bold text-gray-700">
                          Error
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-3 text-gray-600">
                          {(
                            (Math.abs(userFinalConc - problem.analyteConc) /
                              problem.analyteConc) *
                            100
                          ).toFixed(2)}
                          %
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {overshoot && (
                  <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                    <AlertCircle className="text-red-600 w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                    <p className="text-red-800 font-bold text-sm sm:text-base">
                      Warning: Endpoint overshoot was detected during titration.
                    </p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <button
                    onClick={() =>
                      generatePDF(problem, titrantVolume, userFinalConc, overshoot)
                    }
                    className="w-full sm:w-auto px-4 sm:px-6 py-3 sm:py-4 rounded-2xl font-bold text-sm sm:text-base bg-blue-600 text-white hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Download size={20} className="sm:w-6 sm:h-6" />
                    Download PDF
                  </button>
                  <button
                    onClick={resetSimulation}
                    className="w-full sm:w-auto px-4 sm:px-6 py-3 sm:py-4 rounded-2xl font-bold text-sm sm:text-base bg-gradient-to-r from-blue-600 to-green-400 text-white hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={20} className="sm:w-6 sm:h-6" />
                    New Problem
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}