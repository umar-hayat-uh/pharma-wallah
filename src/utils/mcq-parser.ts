import { MCQ, MCQSection } from '@/types/mcq';

export function parseMCQsFromMarkdown(markdown: string): MCQSection[] {
  const sections: MCQSection[] = [];
  const lines = markdown.split('\n');
  
  let currentSection: MCQSection | null = null;
  let currentQuestion: Partial<MCQ> | null = null;
  let collectingOptions = false;
  let questionCounter = 1;
  
  // First, parse answers from the "Answers & Explanations" section
  const answersSectionIndex = lines.findIndex(line => 
    line.includes('Answers & Explanations') || line.includes('## **Answers')
  );
  
  const answersMap = new Map<number, { correctAnswer: string; explanation: string }>();
  
  if (answersSectionIndex !== -1) {
    for (let i = answersSectionIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line === '') continue;
      
      // Match pattern like: "1. **b) ...** – Explanation text"
      const answerMatch = line.match(/^(\d+)\.\s*\*\*([a-d])\)\s*(.*?)\*\*\s*[-–]\s*(.*)$/);
      if (answerMatch) {
        const [, questionNum, answer, , explanation] = answerMatch;
        answersMap.set(parseInt(questionNum), {
          correctAnswer: answer.toLowerCase(),
          explanation: explanation.trim()
        });
      }
    }
  }
  
  // Reset to parse questions
  for (let i = 0; i < (answersSectionIndex !== -1 ? answersSectionIndex : lines.length); i++) {
    const line = lines[i].trim();
    
    // Detect section headers
    const sectionMatch = line.match(/^#+\s*\*\*(\w+)\s*\(.*?\)\*\*/);
    if (sectionMatch) {
      if (currentSection && currentQuestion) {
        // Save previous question
        if (currentQuestion.id && currentQuestion.question && currentQuestion.options) {
          const answerData = answersMap.get(currentQuestion.id);
          if (answerData) {
            currentQuestion.correctAnswer = answerData.correctAnswer;
            currentQuestion.explanation = answerData.explanation;
          }
          currentSection.questions.push(currentQuestion as MCQ);
        }
        currentQuestion = null;
      }
      
      if (currentSection) {
        sections.push(currentSection);
      }
      
      currentSection = {
        title: `${sectionMatch[1]} Questions`,
        questions: []
      };
      continue;
    }
    
    // Detect new question
    const questionMatch = line.match(/^(\d+)\.\s*\*\*(.*?)\*\*/);
    if (questionMatch) {
      if (currentSection && currentQuestion) {
        // Save previous question
        if (currentQuestion.id && currentQuestion.question && currentQuestion.options) {
          const answerData = answersMap.get(currentQuestion.id);
          if (answerData) {
            currentQuestion.correctAnswer = answerData.correctAnswer;
            currentQuestion.explanation = answerData.explanation;
          }
          currentSection.questions.push(currentQuestion as MCQ);
        }
      }
      
      currentQuestion = {
        id: questionCounter++,
        question: questionMatch[2].trim(),
        options: [],
        difficulty: currentSection?.title.includes('Easy') ? 'Easy' : 
                  currentSection?.title.includes('Medium') ? 'Medium' : 'Hard'
      };
      collectingOptions = false;
      continue;
    }
    
    // Detect start of options (line starts with a) b) c) d))
    if (line.match(/^[a-d]\)\s/)) {
      collectingOptions = true;
    }
    
    // Collect options
    if (collectingOptions && currentQuestion) {
      const optionMatch = line.match(/^([a-d])\)\s*(.*)/);
      if (optionMatch) {
        if (!currentQuestion.options) {
          currentQuestion.options = [];
        }
        currentQuestion.options.push({
          id: optionMatch[1].toLowerCase(),
          text: optionMatch[2].trim()
        });
      } else if (line === '') {
        // Empty line might indicate end of options, but in markdown options are separated by lines
        // So we keep collecting until next question or section
      }
    }
  }
  
  // Don't forget the last question
  if (currentSection && currentQuestion) {
    if (currentQuestion.id && currentQuestion.question && currentQuestion.options) {
      const answerData = answersMap.get(currentQuestion.id);
      if (answerData) {
        currentQuestion.correctAnswer = answerData.correctAnswer;
        currentQuestion.explanation = answerData.explanation;
      }
      currentSection.questions.push(currentQuestion as MCQ);
    }
    sections.push(currentSection);
  }
  
  return sections;
}