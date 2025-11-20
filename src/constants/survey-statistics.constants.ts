import { QuestionAnswer, Question, QuestionType } from "@/types/survey.types";
import { MOCK_SURVEYS } from "./survey.constants";

// Helper function to generate multiple responses
function generateResponses(count: number, generator: (index: number) => QuestionAnswer[]): QuestionAnswer[][] {
  return Array.from({ length: count }, (_, i) => generator(i));
}

/**
 * Generate mock answer for a rating question
 * Distribution: mostly 3-5 stars (realistic positive skew)
 */
function generateRatingAnswer(responseIndex: number): number {
  const ratingDistribution = [
    1, 1, 1, // 3 responses with 1 star (2.4%)
    2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, // 12 responses with 2 stars (9.4%)
    3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, // 28 responses with 3 stars (22.0%)
    4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, // 56 responses with 4 stars (44.1%)
    5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, // 28 responses with 5 stars (22.0%)
  ];
  return ratingDistribution[responseIndex % ratingDistribution.length];
}

/**
 * Generate mock answer for a checkbox question
 * Returns multiple selections (percentages can exceed 100%)
 */
function generateCheckboxAnswer(responseIndex: number, options: string[]): string[] {
  if (!options || options.length === 0) return [];

  // Different combination patterns
  const patterns = [
    [0], // First option only
    [0, 1], // First two options
    [0, 2], // First and third
    [1], // Second option only
    [1, 2], // Second and third
    [2], // Third option only
    [3], // Fourth option only (if exists)
    [4], // Fifth option only (if exists)
    [0, 1, 2], // First three options
    [0, 3], // First and fourth (if exists)
    [1, 3], // Second and fourth (if exists)
    [2, 4], // Third and fifth (if exists)
  ];

  const pattern = patterns[responseIndex % patterns.length];
  return pattern
    .filter(index => index < options.length)
    .map(index => options[index]);
}

/**
 * Generate mock answer for radio/select question
 * Returns single selection from options
 */
function generateRadioOrSelectAnswer(responseIndex: number, options: string[]): string {
  if (!options || options.length === 0) return "";
  return options[responseIndex % options.length];
}

/**
 * Generate mock answer for text question
 * Returns realistic Vietnamese text responses
 */
function generateTextAnswer(responseIndex: number, isRequired: boolean): string {
  // For optional questions, only ~67% response rate
  if (!isRequired && responseIndex >= 85) {
    return "";
  }

  const textAnswers = [
    "Nên tăng thêm các hoạt động team building để gắn kết nhân viên",
    "Cải thiện trang thiết bị văn phòng, đặc biệt là máy tính và ghế ngồi",
    "Tổ chức thêm các khóa đào tạo kỹ năng mềm",
    "Linh hoạt hơn về giờ làm việc",
    "Tăng cường giao tiếp giữa các phòng ban",
    "Nâng cấp hệ thống máy tính và phần mềm",
    "Tạo không gian làm việc thoải mái hơn",
    "Tăng cường phúc lợi cho nhân viên",
    "Cần có chính sách đãi ngộ tốt hơn",
    "Môi trường làm việc cần được cải thiện",
  ];

  return textAnswers[responseIndex % textAnswers.length];
}

/**
 * Generate mock answer for a single question based on its type
 */
function generateAnswerForQuestion(question: Question, responseIndex: number): QuestionAnswer | null {
  const baseAnswer = {
    questionId: question.id,
    questionType: question.type,
  };

  switch (question.type) {
    case "rating":
      return {
        ...baseAnswer,
        ratingAnswer: generateRatingAnswer(responseIndex),
      };

    case "checkbox":
      return {
        ...baseAnswer,
        checkboxAnswers: generateCheckboxAnswer(responseIndex, question.options || []),
      };

    case "radio":
      return {
        ...baseAnswer,
        radioAnswer: generateRadioOrSelectAnswer(responseIndex, question.options || []),
      };

    case "select":
      return {
        ...baseAnswer,
        selectAnswer: generateRadioOrSelectAnswer(responseIndex, question.options || []),
      };

    case "text":
      const textAnswer = generateTextAnswer(responseIndex, question.is_required);
      // Only include text answer if it's not empty
      if (textAnswer) {
        return {
          ...baseAnswer,
          textAnswer,
        };
      }
      return null;

    default:
      return null;
  }
}

/**
 * Generate mock responses for a specific survey
 */
function generateResponsesForSurvey(surveyId: string): QuestionAnswer[][] {
  const survey = MOCK_SURVEYS.find(s => s.id === surveyId);

  if (!survey) {
    return [];
  }

  // Generate 127 responses for all surveys (consistent number for demonstration)
  return generateResponses(127, (responseIndex) => {
    const answers: QuestionAnswer[] = [];

    // Generate answer for each question in the survey
    for (const question of survey.questions) {
      const answer = generateAnswerForQuestion(question, responseIndex);
      if (answer) {
        answers.push(answer);
      }
    }

    return answers;
  });
}

/**
 * Mock survey responses object.
 * Dynamically generates responses based on each survey's actual questions.
 * This ensures the mock data always matches the survey structure.
 */
export const MOCK_SURVEY_RESPONSES: Record<string, QuestionAnswer[][]> = new Proxy(
  {},
  {
    get: (target, surveyId: string) => {
      return generateResponsesForSurvey(surveyId);
    },
  }
);

