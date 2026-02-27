'use client';

import { CheckCircle, XCircle } from 'lucide-react';

interface Option {
  id: string;
  text: string;
}

interface MCQ {
  id: number;
  question: string;
  options: Option[];
  correctAnswer: string;
  explanation: string;
  reference?: string; // optional reference field
}

interface MCQCardProps {
  mcq: MCQ;
  userAnswer?: string;
  onAnswerSelect: (questionId: number, answerId: string) => void;
  showResults: boolean;
  isCorrect: boolean;
}

export default function MCQCard({
  mcq,
  userAnswer,
  onAnswerSelect,
  showResults,
  isCorrect,
}: MCQCardProps) {
  const handleSelect = (answerId: string) => {
    if (!showResults) {
      onAnswerSelect(mcq.id, answerId);
    }
  };

  const getOptionClass = (optionId: string) => {
    if (!showResults) {
      // Before submission: just indicate selected
      return userAnswer === optionId
        ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white border-transparent'
        : 'bg-white/70 backdrop-blur-sm border border-white/50 hover:bg-white/90 text-gray-800';
    } else {
      // After submission: show correct/incorrect
      const isThisCorrect = optionId === mcq.correctAnswer;
      const isThisSelected = userAnswer === optionId;

      if (isThisCorrect) {
        return 'bg-green-100 border-green-300 text-green-800 border-2';
      }
      if (isThisSelected && !isCorrect) {
        return 'bg-red-100 border-red-300 text-red-800 border-2';
      }
      return 'bg-white/50 border border-white/30 text-gray-500';
    }
  };

  return (
    <div className="bg-white/30 backdrop-blur-sm rounded-xl border border-white/50 p-6 shadow-md hover:shadow-lg transition-all duration-300">
      {/* Question header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          <span className="mr-2 text-blue-600">Q{mcq.id}.</span>
          {mcq.question}
        </h3>
        {showResults && (
          <div className="flex-shrink-0">
            {isCorrect ? (
              <CheckCircle className="w-6 h-6 text-green-500" />
            ) : (
              <XCircle className="w-6 h-6 text-red-500" />
            )}
          </div>
        )}
      </div>

      {/* Options */}
      <div className="space-y-3">
        {mcq.options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleSelect(option.id)}
            disabled={showResults}
            className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-3 ${getOptionClass(
              option.id
            )}`}
          >
            <span className="font-medium w-6">{option.id})</span>
            <span className="flex-1">{option.text}</span>
          </button>
        ))}
      </div>

      {/* Reference (optional, shown even before submission as a hint) */}
      {mcq.reference && !showResults && (
        <div className="mt-3 text-xs text-gray-400 italic border-t border-white/20 pt-3">
          Reference: {mcq.reference}
        </div>
      )}
    </div>
  );
}