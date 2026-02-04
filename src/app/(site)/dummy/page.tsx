'use client';

import { useState, useEffect } from 'react';
import MCQCard from '@/components/Mcq/MCQCard';
import { MCQSection } from '@/types/mcq';
import mcqData from '@/content/mcqs/file.json';

export default function MCQPage() {
  const [mcqSections, setMcqSections] = useState<MCQSection[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Use the imported JSON data
    setMcqSections(mcqData.sections as MCQSection[]);
    setIsLoading(false);
  }, []);

  const handleAnswerSelect = (questionId: number, answerId: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answerId
    }));
  };

  const calculateScore = () => {
    let correctCount = 0;
    mcqSections.forEach(section => {
      section.questions.forEach(question => {
        if (userAnswers[question.id] === question.correctAnswer) {
          correctCount++;
        }
      });
    });
    return correctCount;
  };

  const handleSubmit = () => {
    const totalQuestions = mcqSections.reduce(
      (total, section) => total + section.questions.length, 
      0
    );
    const correct = calculateScore();
    setScore(correct);
    setIsSubmitted(true);
    
    // Scroll to results
    const resultsElement = document.getElementById('results');
    if (resultsElement) {
      resultsElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleReset = () => {
    setUserAnswers({});
    setIsSubmitted(false);
    setScore(null);
  };

  const getTotalQuestions = () => {
    return mcqSections.reduce((total, section) => total + section.questions.length, 0);
  };

  const getAnsweredCount = () => {
    return Object.keys(userAnswers).length;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-b from-blue-50/30 via-white to-green-50/20 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Interactive MCQ Quiz
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Test your knowledge with interactive multiple choice questions. Select your answers and check your score!
          </p>
          
          {/* Progress Bar */}
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Progress: {getAnsweredCount()} / {getTotalQuestions()} answered
              </span>
              <span className="text-sm font-medium text-gray-700">
                {Math.round((getAnsweredCount() / getTotalQuestions()) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${(getAnsweredCount() / getTotalQuestions()) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* MCQ Sections */}
        <div className="space-y-12">
          {mcqSections.map((section) => (
            <div key={section.title} className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Section Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4">
                <h2 className="text-2xl font-bold text-white">{section.title}</h2>
              </div>
              
              {/* Questions */}
              <div className="p-6 space-y-6">
                {section.questions.map((mcq) => (
                  <MCQCard
                    key={mcq.id}
                    mcq={mcq}
                    userAnswer={userAnswers[mcq.id]}
                    onAnswerSelect={handleAnswerSelect}
                    showExplanation={isSubmitted}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="mt-12 text-center">
          {!isSubmitted ? (
            <button
              onClick={handleSubmit}
              disabled={getAnsweredCount() < getTotalQuestions()}
              className={`px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 ${
                getAnsweredCount() < getTotalQuestions()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transform hover:-translate-y-1 shadow-lg'
              }`}
            >
              Check My Answers
            </button>
          ) : (
            <div className="space-y-6">
              <button
                onClick={handleReset}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-bold text-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Results Section */}
        {isSubmitted && score !== null && (
          <div id="results" className="mt-12 bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-purple-500 px-6 py-4">
              <h2 className="text-2xl font-bold text-white text-center">
                Results & Explanations
              </h2>
            </div>
            
            <div className="p-8">
              {/* Score Summary */}
              <div className="text-center mb-8">
                <div className="inline-block bg-gradient-to-r from-green-500 to-blue-500 rounded-full p-1">
                  <div className="bg-white rounded-full p-8">
                    <div className="text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                      {score}/{getTotalQuestions()}
                    </div>
                    <div className="text-gray-600 mt-2">
                      {Math.round((score / getTotalQuestions()) * 100)}% Correct
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-600">{score}</div>
                    <div className="text-green-800">Correct</div>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="text-2xl font-bold text-red-600">{getTotalQuestions() - score}</div>
                    <div className="text-red-800">Incorrect</div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600">{getTotalQuestions()}</div>
                    <div className="text-blue-800">Total</div>
                  </div>
                </div>
              </div>

              {/* Explanations */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-800 border-b pb-2">
                  Detailed Explanations
                </h3>
                
                {mcqSections.map((section) => (
                  <div key={`explanations-${section.title}`} className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-700">{section.title}</h4>
                    {section.questions.map((mcq) => {
                      const userAnswer = userAnswers[mcq.id];
                      const isCorrect = userAnswer === mcq.correctAnswer;
                      
                      return (
                        <div
                          key={`explanation-${mcq.id}`}
                          className={`border rounded-lg p-4 ${
                            isCorrect
                              ? 'border-green-200 bg-green-50'
                              : 'border-red-200 bg-red-50'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-semibold text-gray-800">
                              Q{mcq.id}: {mcq.question}
                            </span>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                isCorrect
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {isCorrect ? 'Correct' : 'Incorrect'}
                            </span>
                          </div>
                          
                          <div className="mt-3 space-y-2">
                            <div className="text-sm">
                              <span className="font-medium text-gray-700">Your answer: </span>
                              <span className={isCorrect ? 'text-green-700' : 'text-red-700'}>
                                {userAnswer ? `${userAnswer}) ${mcq.options.find(o => o.id === userAnswer)?.text}` : 'Not answered'}
                              </span>
                            </div>
                            
                            <div className="text-sm">
                              <span className="font-medium text-gray-700">Correct answer: </span>
                              <span className="text-green-700 font-semibold">
                                {mcq.correctAnswer}) {mcq.options.find(o => o.id === mcq.correctAnswer)?.text}
                              </span>
                            </div>
                            
                            <div className="mt-3 p-3 bg-white border border-gray-200 rounded-lg">
                              <span className="font-medium text-blue-700">Explanation: </span>
                              <span className="text-gray-700">{mcq.explanation}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>All questions are interactive. Select your answers before checking results.</p>
          <p className="mt-1">Green indicates correct answers, red indicates incorrect answers.</p>
        </div>
      </div>
    </section>
  );
}