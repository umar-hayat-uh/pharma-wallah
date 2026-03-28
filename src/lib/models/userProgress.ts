// lib/models/userProgress.ts
// MongoDB Mongoose model — one document per Clerk userId

import mongoose, { Schema, Document, Model } from "mongoose";

// ─── Sub-schemas ──────────────────────────────────────────────────────────────

export interface IUnitProgress {
  unitId:       string;
  unitTitle:    string;
  subject:      string;     // e.g. "Pharmaceutical Biochemistry"
  semester:     string;     // e.g. "Semester 1"
  completed:    boolean;
  lastVisited:  Date;
  readCount:    number;     // how many times opened
  timeSpentMin: number;     // cumulative minutes spent
}

export interface IFlashcardProgress {
  category:     string;     // "moa" | "classification" | etc.
  cardsReviewed: number;
  cardsCorrect:  number;
  lastPracticed: Date;
  streakDays:    number;
}

export interface IQuizAttempt {
  quizId:     string;
  subject:    string;
  score:      number;       // 0–100
  total:      number;       // total questions
  timeTakenMin: number;
  attemptedAt:  Date;
}

export interface ISpottingProgress {
  category:    string;      // "histology" | "pathology" | "powder-microscopy"
  lessonId:    string;
  completed:   boolean;
  lastVisited: Date;
}

export interface IActivity {
  type:        "unit_read" | "flashcard" | "quiz" | "spotting" | "drug_search" | "book_view";
  label:       string;
  href?:       string;
  timestamp:   Date;
}

// ─── Main document interface ──────────────────────────────────────────────────

export interface IUserProgress extends Document {
  clerkUserId:       string;
  email:             string;
  displayName:       string;
  avatarUrl?:        string;
  joinedAt:          Date;
  lastActiveAt:      Date;
  totalTimeSpentMin: number;
  currentStreak:     number;    // days
  longestStreak:     number;
  units:             IUnitProgress[];
  flashcards:        IFlashcardProgress[];
  quizAttempts:      IQuizAttempt[];
  spotting:          ISpottingProgress[];
  recentActivity:    IActivity[];   // last 20 actions
  bookmarkedDrugs:   string[];
  booksViewed:       string[];
}

// ─── Schemas ──────────────────────────────────────────────────────────────────

const UnitProgressSchema = new Schema<IUnitProgress>({
  unitId:       { type: String, required: true },
  unitTitle:    { type: String, required: true },
  subject:      { type: String, required: true },
  semester:     { type: String, required: true },
  completed:    { type: Boolean, default: false },
  lastVisited:  { type: Date, default: Date.now },
  readCount:    { type: Number, default: 1 },
  timeSpentMin: { type: Number, default: 0 },
}, { _id: false });

const FlashcardProgressSchema = new Schema<IFlashcardProgress>({
  category:      { type: String, required: true },
  cardsReviewed: { type: Number, default: 0 },
  cardsCorrect:  { type: Number, default: 0 },
  lastPracticed: { type: Date, default: Date.now },
  streakDays:    { type: Number, default: 0 },
}, { _id: false });

const QuizAttemptSchema = new Schema<IQuizAttempt>({
  quizId:       { type: String, required: true },
  subject:      { type: String, required: true },
  score:        { type: Number, required: true },
  total:        { type: Number, required: true },
  timeTakenMin: { type: Number, default: 0 },
  attemptedAt:  { type: Date, default: Date.now },
}, { _id: false });

const SpottingProgressSchema = new Schema<ISpottingProgress>({
  category:    { type: String, required: true },
  lessonId:    { type: String, required: true },
  completed:   { type: Boolean, default: false },
  lastVisited: { type: Date, default: Date.now },
}, { _id: false });

const ActivitySchema = new Schema<IActivity>({
  type:      { type: String, required: true },
  label:     { type: String, required: true },
  href:      { type: String },
  timestamp: { type: Date, default: Date.now },
}, { _id: false });

const UserProgressSchema = new Schema<IUserProgress>(
  {
    clerkUserId:       { type: String, required: true, unique: true, index: true },
    email:             { type: String, required: true },
    displayName:       { type: String, required: true },
    avatarUrl:         { type: String },
    joinedAt:          { type: Date, default: Date.now },
    lastActiveAt:      { type: Date, default: Date.now },
    totalTimeSpentMin: { type: Number, default: 0 },
    currentStreak:     { type: Number, default: 0 },
    longestStreak:     { type: Number, default: 0 },
    units:             [UnitProgressSchema],
    flashcards:        [FlashcardProgressSchema],
    quizAttempts:      [QuizAttemptSchema],
    spotting:          [SpottingProgressSchema],
    recentActivity:    { type: [ActivitySchema], default: [] },
    bookmarkedDrugs:   [String],
    booksViewed:       [String],
  },
  { timestamps: true }
);

const UserProgress: Model<IUserProgress> =
  mongoose.models.UserProgress ||
  mongoose.model<IUserProgress>("UserProgress", UserProgressSchema);

export default UserProgress;