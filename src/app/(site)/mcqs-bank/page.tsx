'use client';

import { useState } from 'react';
import MCQCard from '@/components/Mcq/MCQCard';
import toxicData from '@/content/mcqs/toxic-organisms.json';
import { MCQ } from '@/types/mcq';

// Define the structure of our JSON (optional but good for type safety)
interface Section {
  title: string;
  questions: MCQ[];
}

interface ToxicData {
  sections: Section[];
}

export default function ToxicOrganismsPage() {
  const data = toxicData as ToxicData;

  // Store selected answers for all questions (key = question id, value = answer id)
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});

  // Store which sections have been submitted (results visible)
  const [submittedSections, setSubmittedSections] = useState<Set<string>>(new Set());

  const handleAnswerSelect = (questionId: number, answerId: string) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: answerId }));
  };

  const handleCheckSection = (sectionTitle: string) => {
    setSubmittedSections(prev => new Set(prev).add(sectionTitle));
  };

  const handleResetSection = (sectionTitle: string) => {
    // Remove section from submitted set to hide results
    setSubmittedSections(prev => {
      const newSet = new Set(prev);
      newSet.delete(sectionTitle);
      return newSet;
    });
    // Optionally: clear answers for this section? Uncomment the following if desired.
    // const sectionQuestions = data.sections.find(s => s.title === sectionTitle)?.questions || [];
    // const updatedAnswers = { ...userAnswers };
    // sectionQuestions.forEach(q => delete updatedAnswers[q.id]);
    // setUserAnswers(updatedAnswers);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-green-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-4 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
          Toxic Organisms & Natural Toxins
        </h1>
        <p className="text-center text-gray-600 mb-12">
          Test your knowledge on poisonous plants, venomous animals, and their toxins.
          Questions are grouped by difficulty. Select your answers and click <strong>Check Answers</strong> to see results.
        </p>

        {data.sections.map((section) => {
          const showResults = submittedSections.has(section.title);

          return (
            <div key={section.title} className="mb-12 last:mb-0">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold bg-white/60 backdrop-blur-sm px-6 py-2 rounded-full inline-block border border-white/60 shadow-sm">
                  {section.title}
                </h2>
                <div className="space-x-3">
                  {!showResults ? (
                    <button
                      onClick={() => handleCheckSection(section.title)}
                      className="px-5 py-2 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-full font-medium hover:shadow-lg transition-all"
                    >
                      Check Answers
                    </button>
                  ) : (
                    <button
                      onClick={() => handleResetSection(section.title)}
                      className="px-5 py-2 bg-gray-200 text-gray-700 rounded-full font-medium hover:bg-gray-300 transition-all"
                    >
                      Reset Section
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                {section.questions.map((q) => {
                  const userAnswer = userAnswers[q.id];
                  const isCorrect = userAnswer === q.correctAnswer;

                  return (
                    <MCQCard
                      key={q.id}
                      mcq={q}
                      userAnswer={userAnswer}
                      onAnswerSelect={handleAnswerSelect}
                      showExplanation={showResults}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}