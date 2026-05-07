import type { QuestionType } from "@/modules/assignment-management/constants/question.constants";
import type { QuestionAnswer } from "@/modules/assignment-management/types/assignment-submission.types";
import type { MatchingMapping } from "@/types/dto/assignments/create-assignment.dto";

const DRAFT_STORAGE_PREFIX = "assignment_submission_draft";
const DRAFT_VERSION = 1;

interface PersistedAnswer {
  questionId: string;
  questionType: QuestionType;
  textAnswer?: string;
  radioAnswer?: string;
  checkboxAnswers?: string[];
  matchingMappings?: MatchingMapping[];
  orderedItems?: Array<{ id: string; position: number }>;
  trueFalseAnswer?: boolean;
}

interface AssignmentSubmissionDraft {
  version: number;
  updatedAt: number;
  answers: PersistedAnswer[];
}

const buildAssignmentSubmissionDraftKey = (
  assignmentId?: string,
  employeeId?: string,
  attemptId?: string,
) => {
  if (!assignmentId || !employeeId || !attemptId) {
    return "";
  }
  return `${DRAFT_STORAGE_PREFIX}:${assignmentId}:${employeeId}:${attemptId}`;
};

const toPersistedAnswers = (answers: QuestionAnswer[]): PersistedAnswer[] => {
  return answers.map((answer) => ({
    questionId: answer.questionId,
    questionType: answer.questionType,
    textAnswer: answer.textAnswer,
    radioAnswer: answer.radioAnswer,
    checkboxAnswers: answer.checkboxAnswers,
    matchingMappings: answer.matchingMappings,
    orderedItems: answer.orderedItems,
    trueFalseAnswer: answer.trueFalseAnswer,
  }));
};

const mergeDraftAnswers = (initialAnswers: QuestionAnswer[], draftAnswers: PersistedAnswer[]) => {
  if (!draftAnswers || draftAnswers.length === 0) {
    return initialAnswers;
  }

  const draftMap = new Map(draftAnswers.map((answer) => [answer.questionId, answer]));

  return initialAnswers.map((answer) => {
    const draftAnswer = draftMap.get(answer.questionId);
    if (!draftAnswer || draftAnswer.questionType !== answer.questionType) {
      return answer;
    }

    return {
      ...answer,
      textAnswer: draftAnswer.textAnswer ?? answer.textAnswer,
      radioAnswer: draftAnswer.radioAnswer ?? answer.radioAnswer,
      checkboxAnswers: draftAnswer.checkboxAnswers ?? answer.checkboxAnswers,
      matchingMappings: draftAnswer.matchingMappings ?? answer.matchingMappings,
      orderedItems: draftAnswer.orderedItems ?? answer.orderedItems,
      trueFalseAnswer: draftAnswer.trueFalseAnswer ?? answer.trueFalseAnswer,
    };
  });
};

const loadAssignmentSubmissionDraft = (key: string): AssignmentSubmissionDraft | null => {
  if (!key) {
    return null;
  }

  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as AssignmentSubmissionDraft;
    if (!parsed || parsed.version !== DRAFT_VERSION || !Array.isArray(parsed.answers)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

const saveAssignmentSubmissionDraft = (key: string, answers: QuestionAnswer[]) => {
  if (!key) {
    return;
  }

  const payload: AssignmentSubmissionDraft = {
    version: DRAFT_VERSION,
    updatedAt: Date.now(),
    answers: toPersistedAnswers(answers),
  };

  try {
    localStorage.setItem(key, JSON.stringify(payload));
  } catch {
    // ignore localStorage errors
  }
};

const clearAssignmentSubmissionDraft = (key: string) => {
  if (!key) {
    return;
  }

  try {
    localStorage.removeItem(key);
  } catch {
    // ignore localStorage errors
  }
};

export {
  buildAssignmentSubmissionDraftKey,
  clearAssignmentSubmissionDraft,
  loadAssignmentSubmissionDraft,
  mergeDraftAnswers,
  saveAssignmentSubmissionDraft,
};
export type { PersistedAnswer, AssignmentSubmissionDraft };
