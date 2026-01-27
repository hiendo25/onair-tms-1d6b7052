import type { SupabaseClient } from "@supabase/supabase-js";

import { assignmentBankRepository } from "@/repository";
import type { CreateAssignmentBankDto, GetAssignmentBanksParams, UpdateAssignmentBankDto } from "@/types/dto/assignment-bank";
import type { Database } from "@/types/supabase.types";

type AssignmentBankClient = SupabaseClient<Database>;

const createAssignmentBank = async (
  payload: CreateAssignmentBankDto,
  createdBy: string,
  client?: AssignmentBankClient,
) => {
  let assignmentId: string | null = null;

  try {
    const assignment = await assignmentBankRepository.createAssignmentBank(
      {
        name: payload.name,
        description: payload.description,
        duration_minutes: payload.durationMinutes,
        pass_score: payload.passScore,
        shuffle_questions: payload.shuffleQuestions,
        shuffle_answers: payload.shuffleAnswers,
        created_by: createdBy,
        organization_id: payload.organizationId,
        status: "published",
      },
      client,
    );

    assignmentId = assignment.id;

    const questionRows = payload.questions.map((question) => ({
      assignment_bank_id: assignmentId!,
      question_id: question.questionId,
      order_index: question.orderIndex,
      score_override: question.scoreOverride ?? null,
    }));

    await assignmentBankRepository.createAssignmentBankQuestions(questionRows, client);

    if (payload.categoryIds?.length) {
      const categoryRows = payload.categoryIds.map((categoryId) => ({
        assignment_bank_id: assignmentId!,
        category_id: categoryId,
      }));

      await assignmentBankRepository.createAssignmentBankCategories(categoryRows, client);
    }

    return assignment;
  } catch (error) {
    if (assignmentId) {
      await assignmentBankRepository.deleteAssignmentBankQuestionsByAssignmentId(assignmentId);
      await assignmentBankRepository.deleteAssignmentBankCategoriesByAssignmentId(assignmentId, client);
      await assignmentBankRepository.deleteAssignmentBankById(assignmentId, client);
    }

    throw error;
  }
};

const updateAssignmentBank = async (
  assignmentId: string,
  payload: UpdateAssignmentBankDto["assignment"],
  client?: AssignmentBankClient,
) => {
  await assignmentBankRepository.updateAssignmentBankById(
    assignmentId,
    {
      name: payload.name,
      description: payload.description,
      duration_minutes: payload.durationMinutes,
      pass_score: payload.passScore,
      shuffle_questions: payload.shuffleQuestions,
      shuffle_answers: payload.shuffleAnswers,
      updated_at: new Date().toISOString(),
    },
    client,
  );

  await assignmentBankRepository.deleteAssignmentBankQuestionsByAssignmentId(assignmentId);
  await assignmentBankRepository.deleteAssignmentBankCategoriesByAssignmentId(assignmentId, client);

  const questionRows = payload.questions.map((question) => ({
    assignment_bank_id: assignmentId,
    question_id: question.questionId,
    order_index: question.orderIndex,
    score_override: question.scoreOverride ?? null,
  }));

  await assignmentBankRepository.createAssignmentBankQuestions(questionRows, client);

  if (payload.categoryIds?.length) {
    const categoryRows = payload.categoryIds.map((categoryId) => ({
      assignment_bank_id: assignmentId,
      category_id: categoryId,
    }));

    await assignmentBankRepository.createAssignmentBankCategories(categoryRows, client);
  }
};

const deleteAssignmentBank = async (assignmentId: string) => {
  // await assignmentBankRepository.deleteAssignmentBankQuestionsByAssignmentId(assignmentId);
  // await assignmentBankRepository.deleteAssignmentBankCategoriesByAssignmentId(assignmentId);
  await assignmentBankRepository.deleteAssignmentBankById(assignmentId);
};

const getAssignmentBanks = async (params?: GetAssignmentBanksParams, client?: AssignmentBankClient) => {
  return assignmentBankRepository.getAssignmentBanks(params, client);
};

const getAssignmentBankById = async (assignmentId: string, organizationId?: string, client?: AssignmentBankClient) => {
  return assignmentBankRepository.getAssignmentBankById(assignmentId, organizationId, client);
};

export { createAssignmentBank, deleteAssignmentBank, getAssignmentBankById, getAssignmentBanks, updateAssignmentBank };
