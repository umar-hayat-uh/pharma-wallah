'use client';

import { useState, useEffect } from 'react';
import MCQCard from '@/components/Mcq/MCQCard';
import { MCQSection } from '@/types/mcq';
import mcqData from '@/content/mcqs/toxic-organisms.json';
// Import background icons
import {
  Pill,
  FlaskConical,
  Beaker,
  Microscope,
  Atom,
  Dna,
  HeartPulse,
  Leaf,
  Syringe,
  TestTube,
  Tablet,
  ClipboardList,
  Stethoscope,
  Bandage,
  Droplet,
  Eye,
  Bone,
  Brain,
  Heart,
  Activity,
  AlertCircle,
  Scissors,
  Thermometer,
  Wind,
  Droplets,
  FlaskRound,
  Scale,
  Calculator,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface BgIconItem {
  Icon: LucideIcon;
  color: string;
}

// Background icons (same as other pages)
const iconList: BgIconItem[] = [
  { Icon: Pill, color: "text-blue-800/10" },
  { Icon: FlaskConical, color: "text-green-800/10" },
  { Icon: Beaker, color: "text-purple-800/10" },
  { Icon: Microscope, color: "text-amber-800/10" },
  { Icon: Atom, color: "text-blue-800/10" },
  { Icon: Dna, color: "text-green-800/10" },
  { Icon: HeartPulse, color: "text-purple-800/10" },
  { Icon: Leaf, color: "text-amber-800/10" },
  { Icon: Syringe, color: "text-blue-800/10" },
  { Icon: TestTube, color: "text-green-800/10" },
  { Icon: Tablet, color: "text-purple-800/10" },
  { Icon: ClipboardList, color: "text-amber-800/10" },
  { Icon: Stethoscope, color: "text-blue-800/10" },
  { Icon: Bandage, color: "text-green-800/10" },
  { Icon: Droplet, color: "text-purple-800/10" },
  { Icon: Eye, color: "text-amber-800/10" },
  { Icon: Bone, color: "text-blue-800/10" },
  { Icon: Brain, color: "text-green-800/10" },
  { Icon: Heart, color: "text-purple-800/10" },
  { Icon: Activity, color: "text-amber-800/10" },
  { Icon: AlertCircle, color: "text-blue-800/10" },
  { Icon: Scissors, color: "text-green-800/10" },
  { Icon: Thermometer, color: "text-purple-800/10" },
  { Icon: Wind, color: "text-amber-800/10" },
  { Icon: Droplets, color: "text-green-800/10" },
  { Icon: FlaskRound, color: "text-purple-800/10" },
  { Icon: Scale, color: "text-blue-800/10" },
  { Icon: Calculator, color: "text-green-800/10" },
];

const bgIcons: BgIconItem[] = [];
for (let i = 0; i < 40; i++) {
  const item = iconList[i % iconList.length];
  bgIcons.push({
    Icon: item.Icon,
    color:
      i % 4 === 0
        ? "text-blue-800/10"
        : i % 4 === 1
          ? "text-green-800/10"
          : i % 4 === 2
            ? "text-purple-800/10"
            : "text-amber-800/10",
  });
}

export default function MCQPage() {
  const [mcqSections, setMcqSections] = useState<MCQSection[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setMcqSections(mcqData.sections as MCQSection[]);
    setIsLoading(false);
  }, []);

  const handleAnswerSelect = (questionId: number, answerId: string) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: answerId }));
  };

  const calculateScore = () => {
    let correct = 0;
    mcqSections.forEach(section => {
      section.questions.forEach(q => {
        if (userAnswers[q.id] === q.correctAnswer) correct++;
      });
    });
    return correct;
  };

  const handleSubmit = () => {
    const correct = calculateScore();
    setScore(correct);
    setIsSubmitted(true);
    const resultsEl = document.getElementById('results');
    if (resultsEl) resultsEl.scrollIntoView({ behavior: 'smooth' });
  };

  const handleReset = () => {
    setUserAnswers({});
    setIsSubmitted(false);
    setScore(null);
  };

  const getTotalQuestions = () =>
    mcqSections.reduce((total, section) => total + section.questions.length, 0);

  const getAnsweredCount = () => Object.keys(userAnswers).length;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-b from-blue-50/30 via-white to-green-50/20 relative overflow-x-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
      </div>

      {/* Floating background icons */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="relative w-full h-full">
          {bgIcons.map(({ Icon, color }, index) => {
            const left = `${(index * 13) % 90 + 5}%`;
            const top = `${(index * 19) % 90 + 5}%`;
            const size = 30 + (index * 7) % 90;
            const rotate = (index * 23) % 360;
            return (
              <Icon
                key={index}
                size={size}
                className={`absolute ${color}`}
                style={{ left, top, transform: `rotate(${rotate}deg)` }}
              />
            );
          })}
        </div>
      </div>

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 py-8 z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-4">
            Interactive MCQ Quiz
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Test your knowledge with interactive multiple choice questions.
          </p>

          {/* Progress bar (glass style) */}
          <div className="mt-8 max-w-2xl mx-auto bg-white/30 backdrop-blur-sm rounded-full p-1 border border-white/50">
            <div className="flex justify-between text-sm font-medium text-gray-700 px-3 pb-1">
              <span>Progress: {getAnsweredCount()} / {getTotalQuestions()}</span>
              <span>{Math.round((getAnsweredCount() / getTotalQuestions()) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200/50 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-green-400 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${(getAnsweredCount() / getTotalQuestions()) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* MCQ Sections */}
        <div className="space-y-12">
          {mcqSections.map((section) => (
            <div key={section.title} className="bg-white/40 backdrop-blur-md rounded-3xl border border-white/50 shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-green-500 px-6 py-4">
                <h2 className="text-2xl font-bold text-white">{section.title}</h2>
              </div>
              <div className="p-6 space-y-6">
                {section.questions.map((mcq) => (
                  <MCQCard
                    key={mcq.id}
                    mcq={mcq}
                    userAnswer={userAnswers[mcq.id]}
                    onAnswerSelect={handleAnswerSelect}
                    showExplanation={false}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Submit / Reset Button */}
        <div className="mt-12 text-center">
          {!isSubmitted ? (
            <button
              onClick={handleSubmit}
              disabled={getAnsweredCount() < getTotalQuestions()}
              className={`px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 ${getAnsweredCount() < getTotalQuestions()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-green-500 text-white hover:shadow-xl hover:scale-105'
                }`}
            >
              Check My Answers
            </button>
          ) : (
            <button
              onClick={handleReset}
              className="px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-green-500 text-white font-bold text-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              Try Again
            </button>
          )}
        </div>

        {/* Results Section */}
        {isSubmitted && score !== null && (
          <div id="results" className="mt-12 bg-white/40 backdrop-blur-md rounded-3xl border border-white/50 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-purple-500 px-6 py-4">
              <h2 className="text-2xl font-bold text-white text-center">Your Results</h2>
            </div>

            <div className="p-8">
              {/* Score Summary (glass report card) */}
              <div className="text-center mb-8">
                <div className="inline-block p-1 bg-gradient-to-r from-blue-500 to-green-400 rounded-full">
                  <div className="bg-white/80 backdrop-blur-sm rounded-full px-12 py-8">
                    <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                      {score}/{getTotalQuestions()}
                    </div>
                    <div className="text-gray-600 mt-2 text-lg">
                      {Math.round((score / getTotalQuestions()) * 100)}% Correct
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
                  <div className="bg-green-50/70 backdrop-blur-sm border border-green-200 rounded-2xl p-4">
                    <div className="text-2xl font-bold text-green-600">{score}</div>
                    <div className="text-green-800">Correct</div>
                  </div>
                  <div className="bg-red-50/70 backdrop-blur-sm border border-red-200 rounded-2xl p-4">
                    <div className="text-2xl font-bold text-red-600">{getTotalQuestions() - score}</div>
                    <div className="text-red-800">Incorrect</div>
                  </div>
                  <div className="bg-blue-50/70 backdrop-blur-sm border border-blue-200 rounded-2xl p-4">
                    <div className="text-2xl font-bold text-blue-600">{getTotalQuestions()}</div>
                    <div className="text-blue-800">Total</div>
                  </div>
                </div>
              </div>

              {/* Explanations for wrong answers only */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-800 border-b border-white/30 pb-2">
                  Review Incorrect Answers
                </h3>

                {mcqSections.map((section) => {
                  const wrongQuestions = section.questions.filter(
                    q => userAnswers[q.id] !== q.correctAnswer
                  );
                  if (wrongQuestions.length === 0) return null;
                  return (
                    <div key={`wrong-${section.title}`} className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-700">{section.title}</h4>
                      {wrongQuestions.map((mcq) => {
                        const userAnswer = userAnswers[mcq.id];
                        return (
                          <div
                            key={mcq.id}
                            className="border border-red-200 bg-red-50/70 backdrop-blur-sm rounded-xl p-5"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-semibold text-gray-800">
                                Q{mcq.id}: {mcq.question}
                              </span>
                              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
                                Incorrect
                              </span>
                            </div>

                            <div className="mt-3 space-y-2">
                              <div className="text-sm">
                                <span className="font-medium text-gray-700">Your answer: </span>
                                <span className="text-red-700">
                                  {userAnswer
                                    ? `${userAnswer}) ${mcq.options.find(o => o.id === userAnswer)?.text}`
                                    : 'Not answered'}
                                </span>
                              </div>

                              <div className="text-sm">
                                <span className="font-medium text-gray-700">Correct answer: </span>
                                <span className="text-green-700 font-semibold">
                                  {mcq.correctAnswer} {mcq.options.find(o => o.id === mcq.correctAnswer)?.text}
                                </span>
                              </div>

                              <div className="mt-3 p-3 bg-white/80 backdrop-blur-sm border border-white/50 rounded-lg">
                                <span className="font-medium text-blue-700">Explanation: </span>
                                <span className="text-gray-700">{mcq.explanation}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}

                {getTotalQuestions() - score === 0 && (
                  <p className="text-center text-green-600 font-semibold py-4">
                    Perfect score! No incorrect answers to review.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer note */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>All questions are interactive. Green indicates correct, red indicates incorrect.</p>
        </div>
      </div>
    </section>
  );
}