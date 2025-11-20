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
 * Returns realistic Vietnamese text responses relevant to LMS training context
 */
function generateTextAnswer(responseIndex: number, isRequired: boolean, surveyId?: string): string {
  // For optional questions, only ~67% response rate
  if (!isRequired && responseIndex >= 85) {
    return "";
  }

  // Different text responses based on survey context
  const textAnswersBySurvey: Record<string, string[]> = {
    // Survey 1: Course improvement suggestions
    "1": [
      "Nên bổ sung thêm các bài tập thực hành để áp dụng kiến thức vào dự án thực tế",
      "Tăng thời lượng Q&A với giảng viên, hiện tại chưa đủ để giải đáp hết thắc mắc",
      "Cập nhật nội dung khóa học theo xu hướng công nghệ mới nhất",
      "Cung cấp thêm tài liệu tham khảo bằng tiếng Việt cho người mới bắt đầu",
      "Tổ chức thêm các buổi workshop thực hành nhóm để học viên trao đổi kinh nghiệm",
      "Chia nhỏ video bài giảng thành các phần ngắn hơn để dễ theo dõi",
      "Bổ sung case study từ các doanh nghiệp Việt Nam",
      "Tạo diễn đàn riêng cho từng khóa học để học viên tương tác nhiều hơn",
      "Cải thiện chất lượng âm thanh và hình ảnh của video bài giảng",
      "Thêm phụ đề tiếng Việt cho các video bài giảng bằng tiếng Anh",
    ],
    // Survey 2: Training needs and career goals
    "2": [
      "Tôi muốn học Python và Machine Learning để chuyển sang vị trí Data Analyst",
      "Cần khóa học về Leadership và People Management để chuẩn bị cho vị trí quản lý",
      "Muốn nâng cao kỹ năng thiết kế khóa học trực tuyến và sử dụng công cụ authoring",
      "Cần học Agile/Scrum để áp dụng vào quản lý dự án phát triển sản phẩm",
      "Muốn phát triển kỹ năng public speaking và presentation cho công việc đào tạo",
      "Cần học về Digital Marketing và SEO để hỗ trợ công việc marketing khóa học",
      "Muốn nâng cao tiếng Anh chuyên ngành để đọc tài liệu và giao tiếp với đối tác nước ngoài",
      "Cần khóa học về UI/UX Design để thiết kế giao diện học tập thân thiện hơn",
      "Muốn học về Data Analytics để phân tích hiệu quả học tập của học viên",
      "Cần đào tạo về Customer Success để nâng cao trải nghiệm học viên",
    ],
    // Survey 3: Skill gaps
    "3": [
      "Cần cải thiện kỹ năng quản lý thời gian và ưu tiên công việc",
      "Thiếu kiến thức về công nghệ AI/ML để áp dụng vào giảng dạy",
      "Cần nâng cao kỹ năng thiết kế bài giảng tương tác và hấp dẫn",
      "Chưa thành thạo các công cụ đánh giá học viên trực tuyến",
      "Cần học thêm về phương pháp giảng dạy cho người lớn (Andragogy)",
      "Thiếu kỹ năng phân tích dữ liệu để đo lường hiệu quả đào tạo",
    ],
    // Survey 4: LMS platform feedback
    "4": [
      "Đôi khi video bị lag khi xem trên mobile, cần tối ưu hóa",
      "Giao diện tìm kiếm khóa học chưa trực quan, khó tìm khóa học phù hợp",
      "Muốn có tính năng tải video để xem offline khi không có mạng",
      "Cần thêm tính năng ghi chú trực tiếp trên video bài giảng",
      "Hệ thống thông báo quá nhiều, cần tùy chỉnh được loại thông báo nhận",
      "Muốn có app mobile để học mọi lúc mọi nơi thuận tiện hơn",
    ],
    // Survey 5: Training program planning
    "5": [
      "Đề xuất khóa học 'Lập trình Python cho người mới bắt đầu' - 8 tuần",
      "Muốn tham gia workshop 'Thiết kế khóa học trực tuyến hiệu quả' - 2 ngày",
      "Cần khóa 'Kỹ năng lãnh đạo cho quản lý cấp trung' - 3 tháng",
      "Đề xuất 'Chứng chỉ Scrum Master' - 1 tháng",
      "Muốn học 'Data Analytics với Power BI' - 6 tuần",
      "Cần khóa 'Kỹ năng giao tiếp và thuyết trình' - 4 tuần",
      "Đề xuất 'Digital Marketing Foundation' - 2 tháng",
      "Muốn tham gia 'AI và Machine Learning cơ bản' - 3 tháng",
      "Cần khóa 'Quản lý dự án với MS Project' - 1 tháng",
      "Đề xuất 'UX/UI Design cho người không chuyên' - 8 tuần",
    ],
  };

  // Default responses if survey not found
  const defaultAnswers = [
    "Nên tổ chức thêm các khóa học về kỹ năng mềm cho toàn bộ nhân viên",
    "Cần đầu tư nhiều hơn vào đào tạo công nghệ mới cho đội ngũ kỹ thuật",
    "Muốn có thêm khóa học về quản lý và lãnh đạo cho cấp quản lý",
    "Đề xuất xây dựng lộ trình học tập rõ ràng cho từng vị trí",
    "Cần có chính sách hỗ trợ chi phí học tập cho nhân viên",
  ];

  const answers = textAnswersBySurvey[surveyId || ""] || defaultAnswers;
  return answers[responseIndex % answers.length];
}

/**
 * Generate mock answer for a single question based on its type
 */
function generateAnswerForQuestion(question: Question, responseIndex: number, surveyId?: string): QuestionAnswer | null {
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
      const textAnswer = generateTextAnswer(responseIndex, question.is_required, surveyId);
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
      const answer = generateAnswerForQuestion(question, responseIndex, surveyId);
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

