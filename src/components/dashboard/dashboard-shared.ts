// src/components/dashboard/dashboard-shared.ts
import {
  BookOpen, Microscope, Layers, Activity, FileText,
  Sparkles, BookMarked, GraduationCap, HelpCircle,
  type LucideIcon,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────
export type TabType = "feed" | "quizzes" | "profile" | "settings";
export type PageType = "dashboard" | "guide" | "support";
export type ToastVariant = "success" | "info" | "achievement";
export type ToastItem = { id: number; title: string; description?: string; variant: ToastVariant };
export type Achievement = { name: string; icon: LucideIcon; unlocked: boolean };
export type NotificationItem = { id: string; icon: LucideIcon; text: string; tone: string };
export type SubjectLink = { key: string; label: string; icon: LucideIcon; href: string };
export type SemesterGroup = { label: string; subjects: SubjectLink[] };
export type QuickLink = { label: string; href: string; icon: LucideIcon; group: string };

// ── Static course data ──────────────────────────────────────────────────
export const SEMESTERS: Record<string, SemesterGroup> = {
  "sem-1": {
    label: "Semester 1",
    subjects: [
      { key: "pharmaceutical-biochemistry", label: "Pharmaceutical Biochemistry", icon: BookOpen, href: "/courses/sem-1/pharmaceutical-biochemistry" },
      { key: "pharmaceutical-organic-chemistry", label: "Pharmaceutical Organic Chemistry", icon: Microscope, href: "/courses/sem-1/pharmaceutical-organic-chemistry" },
      { key: "physical-pharmacy", label: "Physical Pharmacy", icon: Layers, href: "/courses/sem-1/physical-pharmacy" },
      { key: "physiology-histology-1", label: "Physiology / Histology 1", icon: Activity, href: "/courses/sem-1/physiology-histology-1" },
    ],
  },
  "sem-6": {
    label: "Semester 6",
    subjects: [
      { key: "industrial-pharmacy", label: "Industrial Pharmacy", icon: Layers, href: "/courses/sem-6/industrial-pharmacy" },
      { key: "natural-toxins", label: "Natural Toxins", icon: Microscope, href: "/courses/sem-6/natural-toxins" },
      { key: "pharmaceutical-analysis", label: "Pharmaceutical Analysis", icon: FileText, href: "/courses/sem-6/pharmaceutical-analysis" },
    ],
  },
  "sem-7": {
    label: "Semester 7",
    subjects: [
      { key: "advanced-pharmacognosy", label: "Advanced Pharmacognosy", icon: Layers, href: "/courses/sem-7/advanced-pharmacognosy" },
      { key: "hospital-pharmacy", label: "Hospital Pharmacy", icon: Activity, href: "/courses/sem-7/hospital-pharmacy" },
      { key: "industrial-pharmacy-2", label: "Industrial Pharmacy 2", icon: Layers, href: "/courses/sem-7/industrial-pharmacy-2" },
      { key: "pharmaceutical-technology", label: "Pharmaceutical Technology", icon: Microscope, href: "/courses/sem-7/pharmaceutical-technology" },
      { key: "systemic-pharmacology-3", label: "Systemic Pharmacology 3", icon: BookOpen, href: "/courses/sem-7/systemic-pharmacology-3" },
    ],
  },
};

export const QUICK_LINKS: QuickLink[] = [
  { label: "MCQ Bank", href: "/mcqs-bank", icon: FileText, group: "Practice" },
  { label: "Flashcards", href: "/flash-cards", icon: Layers, group: "Practice" },
  { label: "Spotting Centre", href: "/spotting", icon: Microscope, group: "Practice" },
  { label: "Drug Encyclopedia", href: "/encyclopedia", icon: BookOpen, group: "Reference" },
  { label: "Book Library", href: "/books-library", icon: BookMarked, group: "Reference" },
  { label: "Prescription Reader", href: "/prescription-reader", icon: FileText, group: "Tools" },
  { label: "Lab Simulations", href: "/simulations", icon: Microscope, group: "Simulations" },
  { label: "Calculation Tools", href: "/calculation-tools", icon: Activity, group: "Tools" },
  { label: "Molecule Viewer", href: "/molecule-viewer", icon: Sparkles, group: "Tools" },
  { label: "Pharmacy Counter", href: "/pharmacy-counter", icon: GraduationCap, group: "Simulations" },
  { label: "Antibiogram Simulator", href: "/antibiogram-simulator", icon: Microscope, group: "Simulations" },
  { label: "RxSentinel (Pharmacovigilance)", href: "/pharmacovigilance", icon: Activity, group: "Simulations" },
  { label: "Compounding Lab", href: "/compounding-lab", icon: Layers, group: "Simulations" },
  { label: "Adverse Reaction Sleuth", href: "/adverse-reaction-sleuth", icon: HelpCircle, group: "Simulations" },
];

// ── Helpers ──────────────────────────────────────────────────────────────
export function timeAgo(dateString: string) {
  if (!dateString) return "Just now";
  const date = new Date(dateString);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export function getActivityMeta(type: string) {
  switch (type) {
    case "unit": return { icon: BookOpen, color: "#4f46e5", bg: "rgba(79,70,229,0.08)", label: "Study Unit" };
    case "flashcard": return { icon: Layers, color: "#059669", bg: "rgba(5,150,105,0.08)", label: "Flashcards" };
    case "quiz": return { icon: FileText, color: "#4338ca", bg: "rgba(67,56,202,0.08)", label: "Quiz" };
    case "spotting": return { icon: Microscope, color: "#b45309", bg: "rgba(180,83,9,0.08)", label: "Lab Practice" };
    case "time_spent": return { icon: Activity, color: "#0891b2", bg: "rgba(8,145,178,0.08)", label: "Study Time" };
    default: return { icon: Activity, color: "#475569", bg: "rgba(71,85,105,0.08)", label: "Activity" };
  }
}

export function getGreeting() {
  const h = new Date().getHours();
  if (h < 5) return "Burning the midnight oil";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Working late";
}

export const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};
export const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};