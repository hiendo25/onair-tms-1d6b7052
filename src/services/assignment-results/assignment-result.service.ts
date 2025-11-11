import { assignmentResultsRepository, assignmentsRepository } from "@/repository";
import type {
  SubmissionData,
  QuestionWithAnswer,
  FileAnswer,
  TextAnswer,
  RadioAnswer,
  CheckboxAnswer,
  QuestionAnswer,
} from "@/repository/assignment-results";
import { Database } from "@/types/supabase.types";
import { QuestionOption, AssignmentDto, SubmissionDetailDto, QuestionGradeDetail, SaveGradeDto, FileMetadata } from "@/types/dto/assignments";

type QuestionType = Database["public"]["Enums"]["question_type"];
type AssignmentResultStatus = Database["public"]["Enums"]["assignment_result_status"];

export interface QuestionAnswerInput {
  questionId: string;
  questionLabel: string;
  questionType: QuestionType;
  options?: QuestionOption[];
  answer: string | string[] | FileMetadata[];
  attachments?: FileMetadata[];
}

export interface SubmitAssignmentPayload {
  assignmentId: string;
  employeeId: string;
  answers: QuestionAnswerInput[];
}

export interface SubmitAssignmentResult {
  id: string;
  assignmentId: string;
  employeeId: string;
  submittedAt: string;
  score: number | null;
  maxScore: number;
  status: AssignmentResultStatus;
}

function gradeRadioQuestion(
  answer: RadioAnswer,
  options: QuestionOption[],
  questionScore: number
): number {
  const correctOption = options.find(opt => opt.correct);
  if (!correctOption) return 0;

  return answer.selectedOptionId === correctOption.id ? questionScore : 0;
}

function gradeCheckboxQuestion(
  answer: CheckboxAnswer,
  options: QuestionOption[],
  questionScore: number
): number {
  const correctOptionIds = options.filter(opt => opt.correct).map(opt => opt.id);
  const selectedIds = answer.selectedOptionIds;

  const allCorrectSelected = correctOptionIds.every(id => selectedIds.includes(id));
  const noIncorrectSelected = selectedIds.every(id => correctOptionIds.includes(id));

  return (allCorrectSelected && noIncorrectSelected) ? questionScore : 0;
}

function convertAnswerToTypedFormat(
  questionType: QuestionType,
  answer: string | string[] | FileMetadata[]
): QuestionAnswer {
  switch (questionType) {
    case "file":
      if (Array.isArray(answer) && answer.length > 0 && typeof answer[0] === "object") {
        return { files: answer as FileMetadata[] } as FileAnswer;
      }
      throw new Error("Invalid file answer format");

    case "text":
      return { text: answer as string } as TextAnswer;

    case "radio":
      return { selectedOptionId: answer as string } as RadioAnswer;

    case "checkbox":
      return { selectedOptionIds: answer as string[] } as CheckboxAnswer;

    default:
      throw new Error(`Unsupported question type: ${questionType}`);
  }
}

export async function submitAssignment(
  payload: SubmitAssignmentPayload
): Promise<SubmitAssignmentResult> {
  const { assignmentId, employeeId, answers } = payload;

  const existingResult = await assignmentResultsRepository.getAssignmentResult(
    assignmentId,
    employeeId
  );

  if (existingResult) {
    throw new Error("Bài kiểm tra đã được nộp trước đó. Không thể nộp lại.");
  }

  if (answers.length === 0) {
    throw new Error("Vui lòng trả lời ít nhất một câu hỏi.");
  }

  try {
    const assignment: AssignmentDto = await assignmentsRepository.getAssignmentById(assignmentId);

    const answerMap = new Map(
      answers.map(a => [a.questionId, a])
    );

    const questionsWithAnswers: QuestionWithAnswer[] = assignment.questions.map(question => {
      const answerInput = answerMap.get(question.id);

      if (!answerInput) {
        throw new Error(`Thiếu câu trả lời cho câu hỏi: ${question.label}`);
      }

      const typedAnswer = convertAnswerToTypedFormat(question.type, answerInput.answer);

      let earnedScore: number | null = null;

      if (question.type === "radio" && question.options) {
        earnedScore = gradeRadioQuestion(
          typedAnswer as RadioAnswer,
          question.options,
          question.score
        );
      } else if (question.type === "checkbox" && question.options) {
        earnedScore = gradeCheckboxQuestion(
          typedAnswer as CheckboxAnswer,
          question.options,
          question.score
        );
      }

      return {
        id: question.id,
        label: question.label,
        type: question.type,
        score: question.score,
        options: question.options,
        attachments: question.attachments || undefined,
        created_at: question.created_at,
        updated_at: question.updated_at,
        answer: typedAnswer,
        answerAttachments: answerInput.attachments,
        earnedScore,
      };
    });

    const maxScore = questionsWithAnswers.reduce((sum, q) => sum + q.score, 0);

    const allAutoGradable = questionsWithAnswers.every(
      q => q.type === "radio" || q.type === "checkbox"
    );

    let totalScore: number | null = null;
    let status: AssignmentResultStatus = "submitted";

    if (allAutoGradable) {
      totalScore = questionsWithAnswers.reduce(
        (sum, q) => sum + (q.earnedScore ?? 0),
        0
      );
      status = "graded";
    }

    const submissionData: SubmissionData = {
      assignment: {
        id: assignment.id,
        name: assignment.name,
        description: assignment.description,
        created_by: assignment.created_by,
        created_at: assignment.created_at,
        updated_at: assignment.updated_at,
      },
      questions: questionsWithAnswers,
    };

    const result = await assignmentResultsRepository.createAssignmentResult({
      assignment_id: assignmentId,
      employee_id: employeeId,
      submissionData,
      score: totalScore,
      max_score: maxScore,
      status,
    });

    return {
      id: result.id,
      assignmentId: result.assignment_id,
      employeeId: result.employee_id,
      submittedAt: result.created_at,
      score: totalScore,
      maxScore,
      status,
    };
  } catch (error) {
    console.error("Failed to create assignment result:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Không thể lưu bài nộp. Vui lòng thử lại.");
  }
}

export async function getSubmissionStatus(
  assignmentId: string,
  employeeId: string
) {
  const result = await assignmentResultsRepository.getAssignmentResult(
    assignmentId,
    employeeId
  );

  if (!result) {
    return null;
  }

  let submissionData: SubmissionData | null = null;

  try {
    const data = result.data as any;

    if (data && typeof data === 'object' && 'assignment' in data && 'questions' in data) {
      submissionData = data as SubmissionData;
    }
  } catch (error) {
    console.error("Failed to parse submission data:", error);
  }

  return {
    id: result.id,
    assignmentId: result.assignment_id,
    employeeId: result.employee_id,
    submittedAt: result.created_at,
    score: result.score,
    maxScore: result.max_score,
    status: result.status,
    submissionData,
  };
}

export async function getSubmissionDetail(
  assignmentId: string,
  employeeId: string
): Promise<SubmissionDetailDto> {
  const resultWithEmployee = await assignmentResultsRepository.getAssignmentResultWithEmployee(
    assignmentId,
    employeeId
  );

  if (!resultWithEmployee) {
    throw new Error("Không tìm thấy bài nộp của học viên");
  }

  if (!resultWithEmployee.employee || !resultWithEmployee.employee.profiles) {
    throw new Error("Không tìm thấy thông tin học viên");
  }

  const submissionData = resultWithEmployee.data as SubmissionData;

  const questions: QuestionGradeDetail[] = submissionData.questions.map((q) => {
    const isAutoGraded = q.type === "radio" || q.type === "checkbox";

    const answer: QuestionGradeDetail["answer"] = {};

    if (q.type === "file") {
      answer.files = (q.answer as FileAnswer).files;
    } else if (q.type === "text") {
      answer.text = (q.answer as TextAnswer).text;
    } else if (q.type === "radio") {
      answer.selectedOptionId = (q.answer as RadioAnswer).selectedOptionId;
    } else if (q.type === "checkbox") {
      answer.selectedOptionIds = (q.answer as CheckboxAnswer).selectedOptionIds;
    }

    return {
      id: q.id,
      label: q.label,
      type: q.type,
      maxScore: q.score,
      options: q.options,
      attachments: q.attachments,
      answer,
      answerAttachments: q.answerAttachments,
      earnedScore: q.earnedScore,
      isAutoGraded,
      feedback: q.feedback,
    };
  });

  return {
    resultId: resultWithEmployee.id,
    assignmentId: submissionData.assignment.id,
    assignmentName: submissionData.assignment.name,
    assignmentDescription: submissionData.assignment.description,
    employeeId: resultWithEmployee.employee_id,
    employeeCode: resultWithEmployee.employee.employee_code,
    fullName: resultWithEmployee.employee.profiles.full_name,
    email: resultWithEmployee.employee.profiles.email,
    avatar: resultWithEmployee.employee.profiles.avatar,
    submittedAt: resultWithEmployee.created_at,
    status: resultWithEmployee.status,
    totalScore: resultWithEmployee.score,
    maxScore: resultWithEmployee.max_score || 0,
    questions,
    feedback: resultWithEmployee.feedback,
  };
}

export async function saveGrade(payload: SaveGradeDto): Promise<{ totalScore: number; maxScore: number }> {
  const { assignmentId, employeeId, questionGrades, overallFeedback } = payload;

  const resultWithEmployee = await assignmentResultsRepository.getAssignmentResultWithEmployee(
    assignmentId,
    employeeId
  );

  if (!resultWithEmployee) {
    throw new Error("Không tìm thấy bài nộp của học viên");
  }

  const submissionData = resultWithEmployee.data as SubmissionData;

  const gradeMap = new Map(questionGrades.map((g) => [g.questionId, { score: g.score, feedback: g.feedback }]));

  const updatedQuestions = submissionData.questions.map((q) => {
    if (q.type === "radio" || q.type === "checkbox") {
      return q;
    }

    const gradeData = gradeMap.get(q.id);
    if (!gradeData || gradeData.score === undefined) {
      throw new Error(`Thiếu điểm cho câu hỏi: ${q.label}`);
    }

    if (gradeData.score < 0 || gradeData.score > q.score) {
      throw new Error(`Điểm không hợp lệ cho câu hỏi "${q.label}". Điểm phải từ 0 đến ${q.score}`);
    }

    return {
      ...q,
      earnedScore: gradeData.score,
      feedback: gradeData.feedback,
    };
  });

  const totalScore = updatedQuestions.reduce((sum, q) => sum + (q.earnedScore ?? 0), 0);
  const maxScore = updatedQuestions.reduce((sum, q) => sum + q.score, 0);

  const updatedSubmissionData: SubmissionData = {
    ...submissionData,
    questions: updatedQuestions,
  };

  await assignmentResultsRepository.updateAssignmentResult(resultWithEmployee.id, {
    submissionData: updatedSubmissionData,
    score: totalScore,
    status: "graded",
    feedback: overallFeedback || null,
  });

  return { totalScore, maxScore };
}
