"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, BookOpen, Award } from "lucide-react";

// --- SLIDE DATA (you can extend this array) ---
const slides = [
  {
    id: "papilloma",
    title: "Papilloma",
    imageUrl: "/images/spotting/papilloma.jpeg",
    imageCredit: "Placeholder image from picsum.photos",
    options: ["Papilloma", "Fibroma", "Adenoma", "Polyp"],
    correctOptionIndex: 0,
    definition:
      "A benign tumor derived from epithelium with finger-like projections. Often caused by HPV.",
    lessonDetailed:
      "Papillomas are benign neoplasms that arise from epithelial surfaces. They are characterized by papillary (finger-like) growth patterns. Common sites include skin, oral cavity, and larynx. They are often caused by human papillomavirus (HPV). Treatment is usually local excision, and recurrence is rare if completely removed.",
  },
  {
    id: "adenoma",
    title: "Adenoma",
    imageUrl: "/images/spotting/adenoma.jpeg",
    imageCredit: "Placeholder image from picsum.photos",
    options: ["Adenoma", "Carcinoma", "Fibroma", "Lipoma"],
    correctOptionIndex: 0,
    definition:
      "Benign neoplasm of glandular epithelial tissue, may secrete hormones or become malignant.",
    lessonDetailed:
      "Adenomas are benign tumors that originate from glandular epithelium. They can occur in organs such as the colon (tubular adenoma), thyroid (follicular adenoma), and pituitary. Some adenomas produce hormones leading to clinical syndromes. They have potential for malignant transformation (e.g., colonic adenoma → adenocarcinoma).",
  },
  {
    id: "chondroma",
    title: "Chondroma",
    imageUrl: "/images/spotting/chondroma.jpeg",
    imageCredit: "Placeholder image from picsum.photos",
    options: ["Chondroma", "Osteoma", "Chondrosarcoma", "Fibroma"],
    correctOptionIndex: 0,
    definition:
      "Benign cartilaginous tumor composed of mature hyaline cartilage.",
    lessonDetailed:
      "Chondromas are benign tumors that form cartilage. They most commonly occur in the small bones of the hands and feet (enchondroma) or on the surface of bones (periosteal chondroma). They are usually asymptomatic but may cause pain or pathologic fracture. Malignant transformation to chondrosarcoma is rare but possible.",
  },
  {
    id: "fibroma",
    title: "Fibroma",
    imageUrl: "/images/spotting/fibroma.jpeg",
    imageCredit: "Placeholder image from picsum.photos",
    options: ["Fibroma", "Myxoma", "Lipoma", "Leiomyoma"],
    correctOptionIndex: 0,
    definition:
      "Benign neoplasm of fibroblasts, producing collagen and connective tissue.",
    lessonDetailed:
      "Fibromas are benign tumors arising from fibrous tissue. They can occur anywhere in the body, including skin (dermatofibroma), oral cavity (irritation fibroma), and ovary (fibroma). They are slow-growing and usually well-circumscribed. Treatment is excision if symptomatic.",
  },
  {
    id: "leiomyoma",
    title: "Leiomyoma",
    imageUrl: "/images/spotting/leiomyoma.jpeg",
    imageCredit: "Placeholder image from picsum.photos",
    options: ["Leiomyoma", "Leiomyosarcoma", "Fibroid", "Rhabdomyoma"],
    correctOptionIndex: 0,
    definition:
      "Benign neoplasm of smooth muscle cells, often uterine (fibroids).",
    lessonDetailed:
      "Leiomyomas are benign tumors originating from smooth muscle. The most common site is the uterus (uterine fibroids), but they can also occur in the skin (piloleiomyoma) and gastrointestinal tract. They are estrogen-sensitive and may cause symptoms like menorrhagia or pelvic pain. Malignant transformation is extremely rare.",
  },
];

// Matching function (same as before)
function calculateMatch(userText: string, definition: string): number {
  const normalize = (s: string): string[] =>
    s
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter(
        (w) =>
          w.length > 2 &&
          !["the", "and", "for", "with", "that", "this", "are", "was"].includes(w)
      );

  const userTokens = new Set(normalize(userText));
  const defTokens = new Set(normalize(definition));

  if (defTokens.size === 0) return 0;

  const intersection = new Set(
    Array.from(userTokens).filter((x) => defTokens.has(x))
  );

  return Math.round((intersection.size / defTokens.size) * 100);
}

// Type for a single answer
interface SlideAnswer {
  selectedOption: number | null;
  points: string;
  submitted: boolean;
  matchScore: number;
}

export default function SpottingTestPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<SlideAnswer[]>(
    slides.map(() => ({
      selectedOption: null,
      points: "",
      submitted: false,
      matchScore: 0,
    }))
  );
  const [testCompleted, setTestCompleted] = useState(false);

  const currentSlide = slides[currentIndex];
  const currentAnswer = answers[currentIndex];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentAnswer.selectedOption === null || currentAnswer.points.trim() === "") {
      alert("Please select an option and write your points.");
      return;
    }
    const score = calculateMatch(currentAnswer.points, currentSlide.definition);
    setAnswers((prev) =>
      prev.map((ans, idx) =>
        idx === currentIndex
          ? { ...ans, submitted: true, matchScore: score }
          : ans
      )
    );
  };

  const handleReset = () => {
    setAnswers((prev) =>
      prev.map((ans, idx) =>
        idx === currentIndex
          ? { selectedOption: null, points: "", submitted: false, matchScore: 0 }
          : ans
      )
    );
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSeeResults = () => {
    setTestCompleted(true);
  };

  // Check if all slides have been submitted
  const allSubmitted = answers.every((ans) => ans.submitted);

  // If test completed, show summary
  if (testCompleted) {
    const totalMatch = answers.reduce((acc, ans) => acc + ans.matchScore, 0);
    const avgMatch = (totalMatch / answers.length).toFixed(1);

    return (
      <main className="min-h-screen bg-white">
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-green-500 text-white">
          <div className="absolute inset-0 bg-black/10" />
          <div className="container mx-auto px-6 py-12 max-w-6xl relative z-10">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Test Completed
            </h1>
            <p className="text-lg text-blue-50 mt-2">
              Your combined results are shown below.
            </p>
          </div>
        </section>

        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-6 max-w-4xl">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Summary</h2>
              <p className="text-lg mb-6">
                Average Match Score: <span className="font-bold text-blue-600">{avgMatch}%</span>
              </p>
              <div className="space-y-4">
                {slides.map((slide, idx) => {
                  const ans = answers[idx];
                  const isCorrect = ans.selectedOption === slide.correctOptionIndex;
                  return (
                    <div key={slide.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">{slide.title}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            isCorrect
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {isCorrect ? "Correct" : "Incorrect"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Your choice: {slide.options[ans.selectedOption!]} | Match: {ans.matchScore}%
                      </p>
                      <Link
                        href={`/spotting/${slide.id}`}
                        className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                      >
                        View full lesson →
                      </Link>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 flex justify-center">
                <Link
                  href="/spotting"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-green-500 text-white font-semibold rounded-lg hover:shadow-lg"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Back to Slides
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  // Main test UI
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-green-500 text-white">
        <div className="absolute inset-0 bg-black/10" />
        <div className="container mx-auto px-6 py-12 max-w-6xl relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/spotting"
                className="inline-flex items-center text-sm text-white/80 hover:text-white mb-2"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to Slides
              </Link>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                Spotting Test
              </h1>
              <p className="text-lg text-blue-50 mt-2 max-w-2xl">
                Slide {currentIndex + 1} of {slides.length}
              </p>
            </div>
            <div className="hidden md:block bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <span className="text-sm font-medium">ID: {currentSlide.id}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left column: slide image and options */}
            <div className="space-y-6">
              {/* Image card */}
              <motion.div
                key={currentSlide.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100"
              >
                <div className="relative h-80 w-full bg-gray-100">
                  <Image
                    src={currentSlide.imageUrl}
                    alt="Histopathology slide"
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 600px"
                  />
                </div>
                <div className="p-3 text-xs text-gray-500 border-t">
                  Image: {currentSlide.imageCredit}
                </div>
              </motion.div>

              {/* Options form (disabled after submission) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
              >
                <h3 className="font-semibold text-gray-900 mb-3">
                  What is this slide?
                </h3>
                <div className="space-y-2">
                  {currentSlide.options.map((option, idx) => (
                    <label
                      key={idx}
                      className={`flex items-center p-3 rounded-lg border transition-all cursor-pointer ${
                        currentAnswer.selectedOption === idx
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300"
                      } ${
                        currentAnswer.submitted ? "opacity-50 pointer-events-none" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="slideOption"
                        value={idx}
                        checked={currentAnswer.selectedOption === idx}
                        onChange={() =>
                          !currentAnswer.submitted &&
                          setAnswers((prev) =>
                            prev.map((ans, i) =>
                              i === currentIndex ? { ...ans, selectedOption: idx } : ans
                            )
                          )
                        }
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        disabled={currentAnswer.submitted}
                      />
                      <span className="ml-3 text-gray-800">{option}</span>
                    </label>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right column: points input and results */}
            <div className="space-y-6">
              {/* Points input (disabled after submission) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
              >
                <h3 className="font-semibold text-gray-900 mb-2">
                  Your points of recognition
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Write the key features that helped you identify this slide.
                </p>
                <textarea
                  value={currentAnswer.points}
                  onChange={(e) =>
                    !currentAnswer.submitted &&
                    setAnswers((prev) =>
                      prev.map((ans, i) =>
                        i === currentIndex ? { ...ans, points: e.target.value } : ans
                      )
                    )
                  }
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., finger-like projections, epithelial origin, basaloid cells..."
                  disabled={currentAnswer.submitted}
                />
                {!currentAnswer.submitted ? (
                  <button
                    onClick={handleSubmit}
                    className="mt-4 w-full bg-gradient-to-r from-blue-600 to-green-500 text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-all hover:scale-[1.02]"
                  >
                    Submit Answer
                  </button>
                ) : (
                  <button
                    onClick={handleReset}
                    className="mt-4 w-full bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-lg hover:bg-gray-300 transition-all"
                  >
                    Try Again
                  </button>
                )}
              </motion.div>

              {/* Results (shown after submit) */}
              {currentAnswer.submitted && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* Match rating */}
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Award className="w-5 h-5 text-yellow-500" />
                        Match Score
                      </h3>
                      <span className="text-2xl font-bold text-blue-600">
                        {currentAnswer.matchScore}%
                      </span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-green-500"
                        style={{ width: `${currentAnswer.matchScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Definition & user points */}
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Our Definition
                    </h3>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                      {currentSlide.definition}
                    </p>
                    <h3 className="font-semibold text-gray-900 mt-4 mb-3">
                      Your Points
                    </h3>
                    <p className="text-gray-700 bg-blue-50 p-3 rounded-lg border border-blue-100">
                      {currentAnswer.points}
                    </p>
                    <div className="mt-4 text-sm">
                      <span className="font-medium">Your choice: </span>
                      <span
                        className={
                          currentSlide.options[currentAnswer.selectedOption!] ===
                          currentSlide.title
                            ? "text-green-600 font-semibold"
                            : "text-red-600"
                        }
                      >
                        {currentSlide.options[currentAnswer.selectedOption!]}
                      </span>
                      {currentSlide.options[currentAnswer.selectedOption!] !==
                        currentSlide.title && (
                        <span className="ml-2 text-gray-600">
                          (Correct: {currentSlide.title})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Detailed lesson (collapsible or just a link) */}
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <details className="group">
                      <summary className="flex items-center justify-between cursor-pointer list-none">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-green-600" />
                          Detailed Lesson
                        </h3>
                        <ChevronRight className="w-5 h-5 text-gray-500 group-open:rotate-90 transition-transform" />
                      </summary>
                      <p className="text-gray-700 mt-3">{currentSlide.lessonDetailed}</p>
                      <Link
                        href={`/spotting/${currentSlide.id}`}
                        className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                      >
                        Open full lesson page →
                      </Link>
                    </details>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between mt-12 pt-6 border-t border-gray-200">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                currentIndex === 0
                  ? "border-gray-200 text-gray-300 cursor-not-allowed"
                  : "border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>

            {currentIndex === slides.length - 1 ? (
              <button
                onClick={handleSeeResults}
                disabled={!allSubmitted}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold ${
                  allSubmitted
                    ? "bg-gradient-to-r from-blue-600 to-green-500 text-white hover:shadow-lg"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                See Results
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!answers[currentIndex].submitted}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                  answers[currentIndex].submitted
                    ? "border-gray-300 text-gray-700 hover:bg-gray-100"
                    : "border-gray-200 text-gray-300 cursor-not-allowed"
                }`}
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}