import type { MCQBank, MCQQuestion } from "@/lib/mcq-utils";

/*
 * Which MCQ-bank questions belong to which course lesson.
 *
 * The banks in `src/app/api/mcq-data/` label questions with their own unit
 * titles ("Unit 3: Stereochemistry, Conformations, and Drug Action"), which do
 * not match the course's unit titles — and do not always match by NUMBER
 * either: in Organic Chemistry the bank's Unit 3 is stereochemistry and its
 * Unit 4 is reaction mechanisms, the reverse of the course. So the join is an
 * explicit table, checked against the lesson markdown (2026-09-13), rather than
 * "unit index + 1".
 *
 * Banks are loaded with a dynamic import so each lesson page downloads only
 * its own subject's bank (90–160 KB of source each), and only when the student
 * opens the questions.
 */

type BankSource = {
  load: () => Promise<{ default: MCQBank }>;
  /** course unit id → the bank's unit-label prefix, e.g. "Unit 3" */
  units: Record<string, string>;
};

const SOURCES: Record<string, BankSource> = {
  "pharmaceutical-biochemistry": {
    load: () => import("@/app/api/mcq-data/pharmaceutical-biochemistry"),
    units: {
      "unit1-intro-pharma-biochemistry": "Unit 1",
      "unit2-carbohydrates": "Unit 2",
      "unit3-bioenergetics": "Unit 3",
      "unit4-lipids": "Unit 4", // id says lipids; the lesson and the bank unit are both Enzymes
      "unit5-vitamins": "Unit 5", // id says vitamins; both are Metabolic Fate of Biomolecules
    },
  },
  physiology: {
    load: () => import("@/app/api/mcq-data/physiology-histology-i"),
    units: {
      "unit1-basic-cell-functions": "Unit 1",
      "unit2-muscle-physiology": "Unit 2",
      "unit3-circulation": "Unit 3",
      "unit4-the-heart": "Unit 4",
      "unit5-blood-cells": "Unit 5",
      "unit6-digestion-absorption": "Unit 6",
      "unit7-temperature-regulation": "Unit 7",
    },
  },
  "physical-pharmacy": {
    load: () => import("@/app/api/mcq-data/physical-pharmacy"),
    units: {
      "unit1-intro-pharmacy-history": "Unit 1",
      "unit2-pharmaceutical-literature": "Unit 2",
      "unit3-introductory-concepts": "Unit 3",
      "unit4-physico-chemical-principles": "Unit 4", // bank: Solutions, Solubility & Dissolution
      "unit5-ionization-buffers": "Unit 5",
      "unit6-micromeritics": "Unit 6",
    },
  },
  "pharmaceutical-organic-chemistry": {
    load: () => import("@/app/api/mcq-data/pharmaceutical-organic-chemistry"),
    units: {
      "unit1-basic-concepts": "Unit 1",
      "unit2-functional-organic-compounds": "Unit 2",
      "unit3-types-of-reactions": "Unit 4", // bank Unit 4 = Reaction Mechanisms
      "unit4-stereochemistry": "Unit 3", // bank Unit 3 = Stereochemistry
    },
  },
};

/** True when this lesson has questions to offer — decides whether the block renders at all. */
export function hasLessonQuestions(subjectSlug: string, unitId: string) {
  return Boolean(SOURCES[subjectSlug]?.units[unitId]);
}

/** Every bank question for one lesson. Empty when the lesson has none. */
export async function loadLessonQuestions(subjectSlug: string, unitId: string): Promise<MCQQuestion[]> {
  const source = SOURCES[subjectSlug];
  const prefix = source?.units[unitId];
  if (!source || !prefix) return [];
  const bank = (await source.load()).default;
  // "Unit 1:" — the colon stops "Unit 1" from also matching "Unit 10".
  return bank.questions.filter((q) => q.unit?.startsWith(`${prefix}:`));
}

/** `count` distinct questions in random order (Fisher–Yates on a copy). */
export function pickQuestions(pool: MCQQuestion[], count: number): MCQQuestion[] {
  const copy = pool.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = copy[i];
    copy[i] = copy[j];
    copy[j] = t;
  }
  return copy.slice(0, count);
}
