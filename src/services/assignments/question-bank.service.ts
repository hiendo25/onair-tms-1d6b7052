import type { SupabaseClient } from "@supabase/supabase-js";

import { DomainError } from "@/lib/errors/DomainError";
import { questionBankRepository } from "@/repository";
import type {
  CreateQuestionBankDto,
  GetQuestionBankParams,
  QuestionBankSummaryDto,
  UpdateQuestionBankDto,
} from "@/types/dto/question-bank";
import type { Database } from "@/types/supabase.types";

import { buildQuestionOptions } from "./question-options";

type QuestionBankClient = SupabaseClient<Database>;

const QUESTION_ASSIGNED_ERROR_MESSAGE = "Câu hỏi đã được gán vào bài kiểm tra, không thể xóa";
const QUESTION_ASSIGNED_ERROR_CODE = "QUESTION_ASSIGNED_IN_ASSIGNMENT";
const QUESTION_ASSIGNED_ERROR_STATUS = 422;

const createQuestionBankQuestions = async (
  payload: CreateQuestionBankDto,
  createdBy: string,
) => {
  if (!payload.questions || payload.questions.length === 0) {
    return [];
  }

  const questionsToCreate = payload.questions.map((question) => {
    return {
      type: question.type,
      label: question.label,
      score: question.score,
      options: buildQuestionOptions(question),
      attachments: question.attachments || null,
      difficulty: question.difficulty ?? null,
      created_by: createdBy,
    };
  });

  const createdQuestions = await questionBankRepository.createQuestionBankQuestions(questionsToCreate);

  const categoryRelations = payload.questions.flatMap((question, index) => {
    const questionId = createdQuestions[index]?.id;
    if (!questionId || !question.questionCategories?.length) {
      return [];
    }
    return question.questionCategories.map((categoryId) => ({
      question_id: questionId,
      category_id: categoryId,
    }));
  });

  await questionBankRepository.createQuestionBankCategories(categoryRelations);

  return createdQuestions;
};

const ensureQuestionNotAssignedToAssignment = async (questionId: string, client?: QuestionBankClient) => {
  const assignedCount = await questionBankRepository.getAssignmentQuestionCountByQuestionId(questionId, client);

  if (assignedCount > 0) {
    throw new DomainError(
      QUESTION_ASSIGNED_ERROR_MESSAGE,
      QUESTION_ASSIGNED_ERROR_CODE,
      QUESTION_ASSIGNED_ERROR_STATUS,
    );
  }
};

const getQuestionBank = async (params?: GetQuestionBankParams) => {
  return questionBankRepository.getQuestionBank(params);
};

const getQuestionBankById = async (questionId: string, organizationId: string) => {
  return questionBankRepository.getQuestionBankById(questionId, organizationId);
};

const getQuestionBankSummary = async (
  organizationId: string,
): Promise<QuestionBankSummaryDto> => {
  return questionBankRepository.getQuestionBankSummary(organizationId);
};

const updateQuestionBankQuestion = async (
  questionId: string,
  question: UpdateQuestionBankDto["question"],
) => {
  await questionBankRepository.updateQuestionBankQuestion(
    questionId,
    {
      type: question.type,
      label: question.label,
      score: question.score,
      options: buildQuestionOptions(question),
      attachments: question.attachments || null,
      difficulty: question.difficulty ?? null,
      updated_at: new Date().toISOString(),
    },
  );

  await questionBankRepository.deleteQuestionBankCategoriesByQuestionId(questionId);

  const categoryRelations = (question.questionCategories || []).map((categoryId) => ({
    question_id: questionId,
    category_id: categoryId,
  }));

  await questionBankRepository.createQuestionBankCategories(categoryRelations);
};

const deleteQuestionBankQuestion = async (questionId: string, client?: QuestionBankClient) => {
  await ensureQuestionNotAssignedToAssignment(questionId, client);
  await questionBankRepository.deleteQuestionBankCategoriesByQuestionId(questionId, client);
  await questionBankRepository.deleteQuestionBankQuestion(questionId, client);
};

export {
  createQuestionBankQuestions,
  deleteQuestionBankQuestion,
  getQuestionBank,
  getQuestionBankById,
  getQuestionBankSummary,
  updateQuestionBankQuestion,
};
