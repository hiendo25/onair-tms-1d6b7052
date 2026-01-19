import type { SupabaseClient } from "@supabase/supabase-js";

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

const createQuestionBankQuestions = async (
  payload: CreateQuestionBankDto,
  createdBy: string,
  client?: QuestionBankClient,
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

  const createdQuestions = await questionBankRepository.createQuestionBankQuestions(questionsToCreate, client);

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

  await questionBankRepository.createQuestionBankCategories(categoryRelations, client);

  return createdQuestions;
};

const getQuestionBank = async (params?: GetQuestionBankParams, client?: QuestionBankClient) => {
  return questionBankRepository.getQuestionBank(params, client);
};

const getQuestionBankById = async (questionId: string, organizationId: string, client?: QuestionBankClient) => {
  return questionBankRepository.getQuestionBankById(questionId, organizationId, client);
};

const getQuestionBankSummary = async (
  organizationId: string,
  client?: QuestionBankClient,
): Promise<QuestionBankSummaryDto> => {
  return questionBankRepository.getQuestionBankSummary(organizationId, client);
};

const updateQuestionBankQuestion = async (
  questionId: string,
  question: UpdateQuestionBankDto["question"],
  client?: QuestionBankClient,
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
    client,
  );

  await questionBankRepository.deleteQuestionBankCategoriesByQuestionId(questionId, client);

  const categoryRelations = (question.questionCategories || []).map((categoryId) => ({
    question_id: questionId,
    category_id: categoryId,
  }));

  await questionBankRepository.createQuestionBankCategories(categoryRelations, client);
};

const deleteQuestionBankQuestion = async (questionId: string, client?: QuestionBankClient) => {
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
