'use client';

import { MCQ } from '@/types/mcq';

interface MCQCardProps {
  mcq: MCQ;
  userAnswer: string | undefined;
  onAnswerSelect: (questionId: number, answerId: string) => void;
  showExplanation: boolean;
}

export default function MCQCard({
  mcq,
  userAnswer,
  onAnswerSelect,
  showExplanation
}: MCQCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow duration-300 bg-white">
      {/* Question Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
            Q{mcq.id}
          </span>
          <span className={`text-sm font-semibold px-3 py-1 rounded-full ${getDifficultyColor(mcq.difficulty)}`}>
            {mcq.difficulty}
          </span>
        </div>
      </div>

      {/* Question Text */}
      <h3 className="text-lg font-medium text-gray-800 mb-6 leading-relaxed">
        {mcq.question}
      </h3>

      {/* Options */}
      <div className="space-y-3">
        {mcq.options.map((option) => {
          const isSelected = userAnswer === option.id;
          const isCorrect = option.id === mcq.correctAnswer;
          let optionStyle = '';

          if (showExplanation) {
            if (isCorrect) {
              optionStyle = 'border-green-500 bg-green-50';
            } else if (isSelected && !isCorrect) {
              optionStyle = 'border-red-500 bg-red-50';
            }
          } else if (isSelected) {
            optionStyle = 'border-blue-500 bg-blue-50';
          }

          return (
            <button
              key={option.id}
              onClick={() => !showExplanation && onAnswerSelect(mcq.id, option.id)}
              disabled={showExplanation}
              className={`w-full text-left p-4 border-2 rounded-lg transition-all duration-200 flex items-start space-x-4 ${
                optionStyle || 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
              } ${showExplanation ? 'cursor-default' : 'cursor-pointer'}`}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border ${
                isSelected
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-gray-300 text-gray-700'
              }`}>
                <span className="font-medium">{option.id.toUpperCase()}</span>
              </div>
              
              <span className="flex-1 text-gray-700">{option.text}</span>
              
              {showExplanation && isCorrect && (
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ✓ Correct
                  </span>
                </div>
              )}
              
              {showExplanation && isSelected && !isCorrect && (
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    ✗ Incorrect
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation (shown after submission) */}
      {showExplanation && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <span className="font-medium text-blue-800">Explanation:</span>
              <p className="text-blue-700 mt-1">{mcq.explanation}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}