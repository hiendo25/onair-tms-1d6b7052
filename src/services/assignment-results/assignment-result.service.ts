import { assignmentResultsRepository, assignmentsRepository } from "@/repository";
import type {
  CheckboxAnswer,
  FileAnswer,
  MatchingAnswer,
  OrderAnswer,
  QuestionAnswer,
  RadioAnswer,
  TextAnswer,
  TrueFalseAnswer,
} from "@/repository/assignment-results";
import {
  AssignmentAttemptSummaryDto,
  FileMetadata,
  QuestionGradeDetail,
  QuestionOption,
  SaveGradeDto,
  SubmissionDetailDto,
} from "@/types/dto/assignments";
import { Database, Json } from "@/types/supabase.types";
import { resolveTrueFalseCorrectAnswer } from "@/modules/assignment-management/utils/true-false.utils";

type QuestionType = Database["public"]["Enums"]["question_type"];
type AttemptStatus = Database["public"]["Enums"]["assignment_attempt_status"];
type AttemptSource = Database["public"]["Enums"]["assignment_attempt_source"];
type AssignmentAttemptRow = Database["public"]["Tables"]["assignments_attempts"]["Row"];

export interface QuestionAnswerInput {
  questionId: string;
  answer:
  | string
  | string[]
  | boolean
  | FileMetadata[]
  | Array<{ columnAId: string; columnBId: string }>
  | Array<{ id: string; position: number }>
  | null;
  attachments?: FileMetadata[];
}

export interface SubmitAssignmentPayload {
  assignment_config_id: string;
  employeeId: string;
  attemptId?: string;
  submissionSource?: AttemptSource;
  answers: QuestionAnswerInput[];
  allowIncomplete?: boolean;
}

export interface SubmitAssignmentResult {
  id: string;
  assignment_config_id: string;
  employeeId: string;
  submittedAt: string;
  score: number | null;
  maxScore: number;
  status: AttemptStatus;
}

interface QuestionWithAnswer {
  id: string;
  label: string;
  type: QuestionType;
  score: number;
  options?: QuestionOption[];
  attachments?: string[];
  answer: QuestionAnswer | null;
  answerAttachments?: FileMetadata[];
  earnedScore: number | null;
  feedback?: string;
}

type StoredAnswerValue =
  | string
  | string[]
  | boolean
  | FileMetadata[]
  | Array<{ columnAId: string; columnBId: string }>
  | Array<{ id: string; position: number }>
  | null;

interface StoredAnswerPayload {
  value: StoredAnswerValue;
  attachments?: FileMetadata[];
  feedback?: string;
}

const AUTO_GRADABLE_TYPES: QuestionType[] = ["radio", "checkbox", "matching", "order", "true_false"];

const isAutoGradable = (type: QuestionType) => AUTO_GRADABLE_TYPES.includes(type);

const buildAttemptTiming = (startedAt: Date, durationMinutes: number | null) => {
  if (!durationMinutes || durationMinutes <= 0) {
    return { startedAt: startedAt.toISOString(), expiresAt: null, durationSnapshot: null };
  }

  const expiresAt = new Date(startedAt.getTime() + durationMinutes * 60 * 1000).toISOString();
  return { startedAt: startedAt.toISOString(), expiresAt, durationSnapshot: durationMinutes };
};

const mapAttemptSummary = (attempt: AssignmentAttemptRow) => ({
  id: attempt.id,
  status: attempt.status,
  submittedAt: attempt.submitted_at ?? null,
  createdAt: attempt.created_at,
  startedAt: attempt.started_at ?? null,
  expiresAt: attempt.expires_at ?? null,
  durationMinutesSnapshot: attempt.duration_minutes_snapshot ?? null,
  submissionSource: attempt.submission_source ?? null,
  score: attempt.score ?? null,
  maxScore: attempt.max_score ?? null,
  attemptNumber: attempt.attempt_number,
});

const normalizeStoredAnswer = (answer: Json | null): StoredAnswerPayload => {
  if (answer === null || answer === undefined) {
    return { value: null };
  }

  if (Array.isArray(answer)) {
    return { value: answer as StoredAnswerValue };
  }

  if (typeof answer === "object") {
    const payload = answer as Record<string, Json | undefined>;
    if ("value" in payload) {
      return {
        value: (payload.value ?? null) as StoredAnswerValue,
        attachments: payload.attachments as FileMetadata[] | undefined,
        feedback: payload.feedback as string | undefined,
      };
    }
    return { value: answer as StoredAnswerValue };
  }

  return { value: answer as StoredAnswerValue };
};

const buildStoredAnswerPayload = (
  value: StoredAnswerValue,
  attachments?: FileMetadata[],
  feedback?: string,
): StoredAnswerPayload => {
  const payload: StoredAnswerPayload = { value };

  if (attachments && attachments.length > 0) {
    payload.attachments = attachments;
  }
  if (feedback) {
    payload.feedback = feedback;
  }

  return payload;
};

const buildQuestionAnswer = (type: QuestionType, storedAnswer: StoredAnswerPayload) => {
  const { value } = storedAnswer;
  const answer: QuestionGradeDetail["answer"] = {};

  if (value === null || value === undefined) {
    return answer;
  }

  if (type === "file") {
    answer.files = value as FileMetadata[];
  } else if (type === "text") {
    answer.text = value as string;
  } else if (type === "radio") {
    answer.selectedOptionId = value as string;
  } else if (type === "checkbox") {
    answer.selectedOptionIds = value as string[];
  } else if (type === "matching") {
    answer.mappings = value as Array<{ columnAId: string; columnBId: string }>;
  } else if (type === "order") {
    answer.orderedItems = value as Array<{ id: string; position: number }>;
  } else if (type === "true_false") {
    answer.trueFalseAnswer = value as boolean;
  }

  return answer;
};

function gradeRadioQuestion(answer: RadioAnswer, options: QuestionOption[], questionScore: number): number {
  const correctOption = options.find((opt) => opt.correct);
  if (!correctOption) return 0;

  return answer.selectedOptionId === correctOption.id ? questionScore : 0;
}

function gradeCheckboxQuestion(answer: CheckboxAnswer, options: QuestionOption[], questionScore: number): number {
  const correctOptionIds = options.filter((opt) => opt.correct).map((opt) => opt.id);
  const selectedIds = answer.selectedOptionIds;

  const allCorrectSelected = correctOptionIds.every((id) => selectedIds.includes(id));
  const noIncorrectSelected = selectedIds.every((id) => correctOptionIds.includes(id));

  return allCorrectSelected && noIncorrectSelected ? questionScore : 0;
}

function gradeMatchingQuestion(
  answer: MatchingAnswer,
  correctMappings: Array<{ columnAId: string; columnBId: string }>,
  questionScore: number,
): number {
  const studentMappings = answer.mappings;

  if (studentMappings.length !== correctMappings.length) {
    return 0;
  }

  const allCorrect = correctMappings.every((correctMapping) => {
    return studentMappings.some(
      (studentMapping) =>
        studentMapping.columnAId === correctMapping.columnAId &&
        studentMapping.columnBId === correctMapping.columnBId,
    );
  });

  return allCorrect ? questionScore : 0;
}

function gradeOrderQuestion(
  answer: OrderAnswer,
  correctItems: Array<{ id: string; correctOrder: number }>,
  questionScore: number,
): number {
  const studentItems = answer.orderedItems;

  if (studentItems.length !== correctItems.length) {
    return 0;
  }

  const allCorrect = correctItems.every((correctItem) => {
    const studentItem = studentItems.find((item) => item.id === correctItem.id);
    return studentItem && studentItem.position === correctItem.correctOrder;
  });

  return allCorrect ? questionScore : 0;
}

function gradeTrueFalseQuestion(answer: TrueFalseAnswer, correctAnswer: boolean, questionScore: number): number {
  return answer.answer === correctAnswer ? questionScore : 0;
}

function convertAnswerToTypedFormat(
  questionType: QuestionType,
  answer: StoredAnswerValue,
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

    case "matching":
      return { mappings: answer as Array<{ columnAId: string; columnBId: string }> } as MatchingAnswer;

    case "order":
      return { orderedItems: answer as Array<{ id: string; position: number }> } as OrderAnswer;

    case "true_false":
      return { answer: answer as boolean } as TrueFalseAnswer;

    default:
      throw new Error(`Unsupported question type: ${questionType}`);
  }
}

const extractAnswerValue = (questionType: QuestionType, answer: QuestionAnswer | null): StoredAnswerValue => {
  if (!answer) {
    return null;
  }

  switch (questionType) {
    case "file":
      return (answer as FileAnswer).files;
    case "text":
      return (answer as TextAnswer).text;
    case "radio":
      return (answer as RadioAnswer).selectedOptionId;
    case "checkbox":
      return (answer as CheckboxAnswer).selectedOptionIds;
    case "matching":
      return (answer as MatchingAnswer).mappings;
    case "order":
      return (answer as OrderAnswer).orderedItems;
    case "true_false":
      return (answer as TrueFalseAnswer).answer;
    default:
      return null;
  }
};

export async function startAssignmentAttempt(
  assignment_config_id: string,
  employeeId: string,
): Promise<AssignmentAttemptSummaryDto["latestAttempt"]> {
  const assignment = await assignmentsRepository.getAssignmentConfigById(assignment_config_id);
  const now = new Date();

  if (assignment.available_from) {
    const startTime = new Date(assignment.available_from);
    if (now.getTime() < startTime.getTime()) {
      throw new Error("Bài kiểm tra chưa đến thời gian làm bài.");
    }
  }

  if (assignment.available_to) {
    const endTime = new Date(assignment.available_to);
    if (now.getTime() > endTime.getTime()) {
      throw new Error("Bài kiểm tra đã hết thời gian làm bài.");
    }
  }

  const activeAttempt = await assignmentResultsRepository.getActiveAssignmentAttempt(assignment_config_id, employeeId);
  if (activeAttempt) {
    return mapAttemptSummary(activeAttempt);
  }

  const latestAttempt = await assignmentResultsRepository.getLatestAssignmentAttempt(assignment_config_id, employeeId);
  const attemptLimit = assignment.attempt_limit ?? null;
  const attemptsUsed = latestAttempt?.attempt_number ?? 0;

  if (attemptLimit !== null && attemptsUsed >= attemptLimit) {
    throw new Error("Bạn đã hết số lần làm bài.");
  }

  const attemptNumber = latestAttempt ? latestAttempt.attempt_number + 1 : 1;
  const timing = buildAttemptTiming(now, assignment.attempt_duration_minutes ?? null);

  const attempt = await assignmentResultsRepository.createAssignmentAttempt({
    assignment_config_id: assignment_config_id,
    employee_id: employeeId,
    attempt_number: attemptNumber,
    status: "in_progress",
    submitted_at: null,
    score: null,
    max_score: null,
    started_at: timing.startedAt,
    expires_at: timing.expiresAt,
    duration_minutes_snapshot: timing.durationSnapshot,
  });

  return mapAttemptSummary(attempt);
}

export async function submitAssignment(payload: SubmitAssignmentPayload): Promise<SubmitAssignmentResult> {
  const { assignment_config_id, employeeId, answers, allowIncomplete, attemptId, submissionSource } = payload;

  const latestAttempt = await assignmentResultsRepository.getLatestAssignmentAttempt(assignment_config_id, employeeId);
  const attemptById = attemptId
    ? await assignmentResultsRepository.getAssignmentAttemptById(attemptId)
    : null;
  const activeAttempt =
    attemptById ?? (await assignmentResultsRepository.getActiveAssignmentAttempt(assignment_config_id, employeeId));

  if (answers.length === 0) {
    throw new Error("Vui lòng trả lời ít nhất một câu hỏi.");
  }

  const assignment = await assignmentsRepository.getAssignmentConfigById(assignment_config_id);
  const now = new Date();

  if (assignment.available_from) {
    const startTime = new Date(assignment.available_from);
    if (now.getTime() < startTime.getTime()) {
      throw new Error("Bài kiểm tra chưa đến thời gian làm bài.");
    }
  }

  if (assignment.available_to) {
    const endTime = new Date(assignment.available_to);
    if (now.getTime() > endTime.getTime()) {
      throw new Error("Bài kiểm tra đã hết thời gian làm bài.");
    }
  }

  const attemptLimit = assignment.attempt_limit ?? null;
  const attemptsUsed = latestAttempt?.attempt_number ?? 0;

  if (!activeAttempt && attemptLimit !== null && attemptsUsed >= attemptLimit) {
    throw new Error("Bạn đã hết số lần làm bài.");
  }

  if (activeAttempt) {
    if (activeAttempt.assignment_config_id !== assignment_config_id || activeAttempt.employee_id !== employeeId) {
      throw new Error("Attempt không hợp lệ.");
    }

    if (activeAttempt.status !== "in_progress") {
      throw new Error("Bài kiểm tra đã được nộp trước đó.");
    }
  }

  const answerMap = new Map(answers.map((answer) => [answer.questionId, answer]));
  const shouldAllowIncomplete = Boolean(allowIncomplete);
  const isAnswerMissing = (questionType: QuestionType, answer: QuestionAnswerInput["answer"] | undefined) => {
    if (answer === undefined || answer === null) {
      return true;
    }

    switch (questionType) {
      case "file":
        return !Array.isArray(answer) || answer.length === 0;
      case "text":
      case "radio":
        return typeof answer !== "string" || answer.trim() === "";
      case "checkbox":
        return !Array.isArray(answer) || answer.length === 0;
      case "matching":
      case "order":
        return !Array.isArray(answer) || answer.length === 0;
      case "true_false":
        return typeof answer !== "boolean";
      default:
        return false;
    }
  };

  const questionsWithAnswers: QuestionWithAnswer[] = assignment.questions.map((question) => {
    const answerInput = answerMap.get(question.id);
    if (!answerInput || isAnswerMissing(question.type, answerInput.answer)) {
      if (!shouldAllowIncomplete) {
        throw new Error(`Thiếu câu trả lời cho câu hỏi: ${question.label}`);
      }

      return {
        id: question.id,
        label: question.label,
        type: question.type,
        score: question.score,
        options: question.options,
        attachments: question.attachments || undefined,
        answer: null,
        answerAttachments: answerInput?.attachments,
        earnedScore: isAutoGradable(question.type) ? 0 : null,
      };
    }

    const typedAnswer = convertAnswerToTypedFormat(question.type, answerInput.answer);
    let earnedScore: number | null = null;

    if (question.type === "radio" && question.options) {
      earnedScore = gradeRadioQuestion(typedAnswer as RadioAnswer, question.options, question.score);
    } else if (question.type === "checkbox" && question.options) {
      earnedScore = gradeCheckboxQuestion(typedAnswer as CheckboxAnswer, question.options, question.score);
    } else if (question.type === "matching" && question.options) {
      const correctMappings = (question.options as any).correctMappings || [];
      earnedScore = gradeMatchingQuestion(typedAnswer as MatchingAnswer, correctMappings, question.score);
    } else if (question.type === "order" && question.options) {
      const orderItems = (question.options as any).orderItems || [];
      earnedScore = gradeOrderQuestion(typedAnswer as OrderAnswer, orderItems, question.score);
    } else if (question.type === "true_false" && question.options) {
      const correctAnswer = resolveTrueFalseCorrectAnswer(question.options);
      earnedScore = gradeTrueFalseQuestion(typedAnswer as TrueFalseAnswer, correctAnswer, question.score);
    }

    return {
      id: question.id,
      label: question.label,
      type: question.type,
      score: question.score,
      options: question.options,
      attachments: question.attachments || undefined,
      answer: typedAnswer,
      answerAttachments: answerInput.attachments,
      earnedScore,
    };
  });

  const maxScore = questionsWithAnswers.reduce((sum, question) => sum + question.score, 0);
  const allAutoGradable = questionsWithAnswers.every((question) => isAutoGradable(question.type));

  let totalScore: number | null = null;
  let status: AttemptStatus = "submitted";

  if (allAutoGradable) {
    totalScore = questionsWithAnswers.reduce((sum, question) => sum + (question.earnedScore ?? 0), 0);
    status = "graded";
  }

  const attemptNumber = activeAttempt ? activeAttempt.attempt_number : latestAttempt ? latestAttempt.attempt_number + 1 : 1;
  const submittedAt = now.toISOString();
  const finalSubmissionSource: AttemptSource = submissionSource ?? "manual";
  let currentAttempt = activeAttempt ?? null;
  let createdAttemptId: string | null = null;

  try {
    if (!currentAttempt) {
      const timing = buildAttemptTiming(now, assignment.attempt_duration_minutes ?? null);
      currentAttempt = await assignmentResultsRepository.createAssignmentAttempt({
        assignment_config_id: assignment_config_id,
        employee_id: employeeId,
        attempt_number: attemptNumber,
        status: "in_progress",
        submitted_at: null,
        score: null,
        max_score: maxScore,
        started_at: timing.startedAt,
        expires_at: timing.expiresAt,
        duration_minutes_snapshot: timing.durationSnapshot,
      });
      createdAttemptId = currentAttempt.id;
    }

    const resultRows = questionsWithAnswers.map((question) => {
      const answerValue = extractAnswerValue(question.type, question.answer);
      const payload = buildStoredAnswerPayload(answerValue, question.answerAttachments);
      const score = question.earnedScore;
      const isCorrect = score === null ? null : score === question.score;

      return {
        attempt_id: currentAttempt!.id,
        question_id: question.id,
        answer: payload as Json,
        score,
        is_correct: isCorrect,
      };
    });

    await assignmentResultsRepository.createAssignmentResults(resultRows);

    await assignmentResultsRepository.updateAssignmentAttempt(currentAttempt.id, {
      status,
      submitted_at: submittedAt,
      score: totalScore,
      max_score: maxScore,
      submission_source: finalSubmissionSource,
    });

    return {
      id: currentAttempt.id,
      assignment_config_id: assignment_config_id,
      employeeId,
      submittedAt,
      score: totalScore,
      maxScore,
      status,
    };
  } catch (error) {
    if (createdAttemptId) {
      await assignmentResultsRepository.deleteAssignmentResultsByAttemptId(createdAttemptId);
      await assignmentResultsRepository.deleteAssignmentAttemptById(createdAttemptId);
    }

    throw error;
  }
}

export async function getSubmissionStatus(
  assignmentId: string,
  employeeId: string,
): Promise<AssignmentAttemptSummaryDto> {
  const [assignment, latestAttempt] = await Promise.all([
    assignmentsRepository.getAssignmentConfigById(assignmentId),
    assignmentResultsRepository.getLatestAssignmentAttempt(assignmentId, employeeId),
  ]);

  const attemptsUsed = latestAttempt?.attempt_number ?? 0;
  const attemptLimit = assignment.attempt_limit ?? null;
  const attemptsRemaining =
    attemptLimit === null ? null : Math.max(attemptLimit - attemptsUsed, 0);

  return {
    attemptsUsed,
    attemptsRemaining,
    attemptLimit,
    availableFrom: assignment.available_from ?? null,
    availableTo: assignment.available_to ?? null,
    attemptDurationMinutes: assignment.attempt_duration_minutes ?? null,
    latestAttempt: latestAttempt ? mapAttemptSummary(latestAttempt) : null,
  };
}

export async function getSubmissionDetail(assignmentId: string, employeeId: string): Promise<SubmissionDetailDto> {
  const attemptWithEmployee = await assignmentResultsRepository.getAssignmentAttemptWithEmployee(
    assignmentId,
    employeeId,
  );

  if (!attemptWithEmployee) {
    throw new Error("Không tìm thấy bài nộp của học viên");
  }

  if (!attemptWithEmployee.employee || !attemptWithEmployee.employee.profiles) {
    throw new Error("Không tìm thấy thông tin học viên");
  }

  const assignment = await assignmentsRepository.getAssignmentConfigById(assignmentId);
  const results = await assignmentResultsRepository.getAssignmentResultsByAttemptId(attemptWithEmployee.id);
  const resultsMap = new Map(results.map((result) => [result.question_id, result]));

  const questions: QuestionGradeDetail[] = assignment.questions.map((question) => {
    const result = resultsMap.get(question.id) ?? null;
    const storedAnswer = normalizeStoredAnswer(result?.answer ?? null);
    const isAutoGraded = isAutoGradable(question.type);

    return {
      id: question.id,
      label: question.label,
      type: question.type,
      maxScore: question.score,
      options: question.options,
      attachments: question.attachments,
      answer: buildQuestionAnswer(question.type, storedAnswer),
      answerAttachments: storedAnswer.attachments,
      earnedScore: result?.score ?? null,
      isAutoGraded,
      feedback: storedAnswer.feedback,
    };
  });

  const maxScore = attemptWithEmployee.max_score ?? questions.reduce((sum, question) => sum + question.maxScore, 0);

  return {
    resultId: attemptWithEmployee.id,
    assignmentId: assignment.id,
    assignmentName: assignment.name,
    assignmentDescription: assignment.description,
    employeeId: attemptWithEmployee.employee_id,
    employeeCode: attemptWithEmployee.employee.employee_code,
    fullName: attemptWithEmployee.employee.profiles.full_name,
    email: attemptWithEmployee.employee.profiles.email,
    avatar: attemptWithEmployee.employee.profiles.avatar,
    submittedAt: attemptWithEmployee.submitted_at ?? attemptWithEmployee.created_at,
    status: attemptWithEmployee.status,
    totalScore: attemptWithEmployee.score,
    maxScore,
    questions,
    feedback: attemptWithEmployee.feedback,
  };
}

export async function saveGrade(payload: SaveGradeDto): Promise<{ totalScore: number; maxScore: number }> {
  const { assignmentId, employeeId, questionGrades, overallFeedback } = payload;

  const attemptWithEmployee = await assignmentResultsRepository.getAssignmentAttemptWithEmployee(
    assignmentId,
    employeeId,
  );

  if (!attemptWithEmployee) {
    throw new Error("Không tìm thấy bài nộp của học viên");
  }

  const assignment = await assignmentsRepository.getAssignmentConfigById(assignmentId);
  const results = await assignmentResultsRepository.getAssignmentResultsByAttemptId(attemptWithEmployee.id);
  const resultsMap = new Map(results.map((result) => [result.question_id, result]));
  const gradeMap = new Map(questionGrades.map((grade) => [grade.questionId, grade]));

  for (const question of assignment.questions) {
    if (isAutoGradable(question.type)) {
      continue;
    }

    const gradeData = gradeMap.get(question.id);
    if (!gradeData || gradeData.score === undefined) {
      throw new Error(`Thiếu điểm cho câu hỏi: ${question.label}`);
    }

    if (gradeData.score < 0 || gradeData.score > question.score) {
      throw new Error(`Điểm không hợp lệ cho câu hỏi "${question.label}". Điểm phải từ 0 đến ${question.score}`);
    }

    const result = resultsMap.get(question.id);
    if (!result) {
      throw new Error(`Không tìm thấy câu trả lời cho câu hỏi: ${question.label}`);
    }

    const storedAnswer = normalizeStoredAnswer(result.answer);
    const updatedAnswer = buildStoredAnswerPayload(
      storedAnswer.value,
      storedAnswer.attachments,
      gradeData.feedback ?? storedAnswer.feedback,
    );

    await assignmentResultsRepository.updateAssignmentResult(attemptWithEmployee.id, question.id, {
      score: gradeData.score,
      is_correct: gradeData.score === question.score,
      answer: updatedAnswer as Json,
    });

    resultsMap.set(question.id, {
      ...result,
      score: gradeData.score,
      answer: updatedAnswer as Json,
    });
  }

  const maxScore = assignment.questions.reduce((sum, question) => sum + question.score, 0);
  const totalScore = assignment.questions.reduce((sum, question) => {
    const result = resultsMap.get(question.id);
    return sum + (result?.score ?? 0);
  }, 0);

  await assignmentResultsRepository.updateAssignmentAttempt(attemptWithEmployee.id, {
    score: totalScore,
    max_score: maxScore,
    status: "graded",
    feedback: overallFeedback ?? null,
  });

  return { totalScore, maxScore };
}
