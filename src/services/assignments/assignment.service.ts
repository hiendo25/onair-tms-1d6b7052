import { assignmentBankRepository, assignmentResultsRepository, assignmentsRepository, questionBankRepository } from "@/repository";
import type { MyAssignmentRpcRow } from "@/repository/assignments-config";
import { createSVClient } from "@/services";
import type {
  AssignmentDto,
  CreateAssignmentDto,
  GetAssignedAssignmentsParams,
  GetAssignmentsParams,
  GetAssignmentStudentsParams,
  GetMyAssignmentsParams,
  MyAssignmentDto,
  UpdateAssignmentDto,
} from "@/types/dto/assignments";
import type { PaginatedResult } from "@/types/dto/pagination.dto";

import { buildQuestionOptions } from "./question-options";

interface CreateAssignmentResult {
  assignmentId: string;
}

const isWithinAssignmentWindow = (
  availableFrom?: string | null,
  availableTo?: string | null,
  now: number = Date.now(),
): boolean => {
  if (availableFrom) {
    const startMs = new Date(availableFrom).getTime();
    if (!Number.isNaN(startMs) && now < startMs) {
      return false;
    }
  }
  if (availableTo) {
    const endMs = new Date(availableTo).getTime();
    if (!Number.isNaN(endMs) && now > endMs) {
      return false;
    }
  }
  return true;
};


async function createAssignmentWithRelations(
  payload: CreateAssignmentDto,
  createdBy: string,
): Promise<CreateAssignmentResult> {
  const supabase = await createSVClient();
  let assignmentId: string | null = null;
  let assignmentBankId: string | null = null;
  const createdQuestionIds: string[] = [];

  try {
    const assignmentBank = await assignmentBankRepository.createAssignmentBank(
      {
        name: payload.name,
        description: payload.description,
        created_by: createdBy,
        organization_id: payload.organizationId,
      },
      supabase,
    );

    assignmentBankId = assignmentBank.id;

    if (payload.questions && payload.questions.length > 0) {
      const questionsToCreate = payload.questions.map((question) => ({
        type: question.type,
        label: question.label,
        score: question.score,
        options: buildQuestionOptions(question, { shuffleOrderItems: true }),
        attachments: question.attachments || null,
        created_by: createdBy,
      }));

      const createdQuestions = await questionBankRepository.createQuestionBankQuestions(questionsToCreate, supabase);
      createdQuestionIds.push(...createdQuestions.map((question) => question.id));

      const questionRows = createdQuestions.map((question, index) => ({
        assignment_bank_id: assignmentBankId as string,
        question_id: question.id,
        order_index: index + 1,
      }));

      await assignmentBankRepository.createAssignmentBankQuestions(questionRows, supabase);
    }

    if (payload.assignmentCategories && payload.assignmentCategories.length > 0) {
      const categoriesToCreate = payload.assignmentCategories.map((categoryId) => ({
        assignment_bank_id: assignmentBankId as string,
        category_id: categoryId,
      }));

      await assignmentBankRepository.createAssignmentBankCategories(categoriesToCreate, supabase);
    }

    const assignment = await assignmentsRepository.createAssignmentFromBankWithClient(supabase, {
      assignment_bank_id: assignmentBankId,
      assigned_by: createdBy,
      organization_id: payload.organizationId,
      status: "open",
    });

    assignmentId = assignment.id;

    if (payload.assignedEmployees && payload.assignedEmployees.length > 0) {
      const employeesToCreate = payload.assignedEmployees.map((employeeId) => ({
        assignment_config_id: assignmentId as string,
        employee_id: employeeId,
      }));

      await assignmentsRepository.createAssignmentEmployeesWithClient(supabase, employeesToCreate);
    }

    return {
      assignmentId,
    };
  } catch (error) {
    console.error("Error during assignment creation, initiating rollback...");
    console.error("Service layer error:", error);

    if (assignmentId) {
      await assignmentsRepository.deleteAssignmentEmployeesByAssignmentIdWithClient(supabase, assignmentId);
      await assignmentsRepository.deleteAssignmentByIdWithClient(supabase, assignmentId);
    }

    if (assignmentBankId) {
      await assignmentBankRepository.deleteAssignmentBankQuestionsByAssignmentId(assignmentBankId);
      await assignmentBankRepository.deleteAssignmentBankCategoriesByAssignmentId(assignmentBankId, supabase);
      await assignmentBankRepository.deleteAssignmentBankById(assignmentBankId, supabase);
    }

    for (const questionId of createdQuestionIds) {
      await questionBankRepository.deleteQuestionBankCategoriesByQuestionId(questionId, supabase);
      await questionBankRepository.deleteQuestionBankQuestion(questionId, supabase);
    }

    console.log("Rollback completed (service layer)");

    throw error;
  }
}

interface UpdateAssignmentOptions {
  allowQuestionsUpdate?: boolean;
  allowAssignedEmployeesUpdate?: boolean;
}

async function updateAssignmentWithRelations(
  payload: UpdateAssignmentDto,
  updatedBy: string,
  options: UpdateAssignmentOptions = {},
): Promise<void> {
  const supabase = await createSVClient();
  const { allowQuestionsUpdate = true, allowAssignedEmployeesUpdate = true } = options;
  const assignmentBankId = await assignmentsRepository.getAssignmentBankIdByAssignmentId(payload.id, supabase);

  if (!assignmentBankId) {
    throw new Error("Không tìm thấy bài kiểm tra");
  }

  await assignmentBankRepository.updateAssignmentBankById(
    assignmentBankId,
    {
      name: payload.name,
      description: payload.description,
      updated_at: new Date().toISOString(),
    },
    supabase,
  );

  if (allowQuestionsUpdate) {
    const existingAssignment = await assignmentBankRepository.getAssignmentBankById(assignmentBankId, undefined, supabase);
    const existingQuestionIds =
      existingAssignment?.assignment_questions?.map((question) => question.question_id) ?? [];

    await assignmentBankRepository.deleteAssignmentBankQuestionsByAssignmentId(assignmentBankId);

    if (payload.questions && payload.questions.length > 0) {
      const questionsToCreate = payload.questions.map((question) => ({
        type: question.type,
        label: question.label,
        score: question.score,
        options: buildQuestionOptions(question, { shuffleOrderItems: true }),
        attachments: question.attachments || null,
        created_by: updatedBy,
      }));

      const createdQuestions = await questionBankRepository.createQuestionBankQuestions(questionsToCreate, supabase);
      const questionRows = createdQuestions.map((question, index) => ({
        assignment_bank_id: assignmentBankId,
        question_id: question.id,
        order_index: index + 1,
      }));

      await assignmentBankRepository.createAssignmentBankQuestions(questionRows, supabase);
    }

    if (existingQuestionIds.length > 0) {
      await supabase.from("question_bank_categories").delete().in("question_id", existingQuestionIds);
      await supabase.from("question_bank").delete().in("id", existingQuestionIds);
    }
  }

  await assignmentBankRepository.deleteAssignmentBankCategoriesByAssignmentId(assignmentBankId, supabase);

  if (payload.assignmentCategories && payload.assignmentCategories.length > 0) {
    const categoriesToCreate = payload.assignmentCategories.map((categoryId) => ({
      assignment_bank_id: assignmentBankId,
      category_id: categoryId,
    }));

    await assignmentBankRepository.createAssignmentBankCategories(categoriesToCreate, supabase);
  }

  if (allowAssignedEmployeesUpdate) {
    await assignmentsRepository.deleteAssignmentEmployeesByAssignmentIdWithClient(supabase, payload.id);

    if (payload.assignedEmployees && payload.assignedEmployees.length > 0) {
      const employeesToCreate = payload.assignedEmployees.map((employeeId) => ({
        assignment_config_id: payload.id,
        employee_id: employeeId,
      }));

      await assignmentsRepository.createAssignmentEmployeesWithClient(supabase, employeesToCreate);
    }
  }
}

async function deleteAssignmentWithRelations(assignmentId: string): Promise<void> {
  await assignmentResultsRepository.deleteAssignmentResultsByAssignmentId(assignmentId);
  await assignmentsRepository.deleteQuestionsByAssignmentId(assignmentId);
  await assignmentsRepository.deleteAssignmentEmployeesByAssignmentId(assignmentId);
  await assignmentsRepository.deleteAssignmentCategoriesByAssignmentId(assignmentId);
  await assignmentsRepository.nullifyLessonsAssignmentId(assignmentId);

  await assignmentsRepository.deleteAssignmentById(assignmentId);
}

async function getAssignments(params?: GetAssignmentsParams): Promise<PaginatedResult<AssignmentDto>> {
  return assignmentsRepository.getAssignments(params);
}

async function getAssignmentConfigById(id: string): Promise<AssignmentDto> {
  return assignmentsRepository.getAssignmentConfigById(id);
}

async function getAssignmentStudents(assignmentId: string, params?: GetAssignmentStudentsParams) {
  return assignmentsRepository.getAssignmentStudents(assignmentId, params);
}

async function getAssignmentQuestions(assignmentId: string) {
  return assignmentsRepository.getAssignmentQuestions(assignmentId);
}

async function getMyAssignments(
  employeeId: string,
  params?: GetMyAssignmentsParams,
): Promise<PaginatedResult<MyAssignmentDto>> {
  const { page = 0, limit = 25 } = params || {};
  const rawResult = await assignmentsRepository.getMyAssignments(employeeId, params);

  if (rawResult.data.length === 0) {
    return {
      data: [],
      total: rawResult.total,
      page,
      limit,
    };
  }

  const now = Date.now();
  const data = rawResult.data.map((assignment: MyAssignmentRpcRow) => {
    const attemptLimit = assignment.attempt_limit === null ? null : Number(assignment.attempt_limit);
    const attemptsUsed = Number(assignment.attempts_used ?? 0);
    const attemptsRemaining = attemptLimit === null ? null : Math.max(attemptLimit - attemptsUsed, 0);
    const hasAttemptsLeft = attemptLimit === null ? true : attemptsRemaining! > 0;
    const hasActiveAttempt = Boolean(assignment.has_active_attempt);
    const hasSubmitted = Boolean(assignment.has_submitted);
    const canRetry =
      (hasActiveAttempt || hasAttemptsLeft) &&
      isWithinAssignmentWindow(assignment.available_from, assignment.available_to, now);

    return {
      assignment_id: assignment.assignment_id,
      assignment_name: assignment.assignment_name ?? "",
      assignment_description: assignment.assignment_description ?? "",
      pass_score: assignment.pass_score ?? null,
      created_at: assignment.created_at,
      available_from: assignment.available_from ?? null,
      available_to: assignment.available_to ?? null,
      attempt_limit: attemptLimit,
      attempts_used: attemptsUsed,
      attempts_remaining: attemptsRemaining,
      can_retry: canRetry,
      has_submitted: hasSubmitted,
      has_active_attempt: hasActiveAttempt,
      submitted_at: assignment.submitted_at ?? null,
      score: assignment.score ?? null,
      max_score: assignment.max_score ?? null,
      status: assignment.status ?? null,
    };
  });

  return {
    data,
    total: rawResult.total,
    page,
    limit,
  };
}

async function getAssignedAssignments(params?: GetAssignedAssignmentsParams) {
  return assignmentsRepository.getAssignedAssignments(params);
}

export {
  createAssignmentWithRelations,
  updateAssignmentWithRelations,
  deleteAssignmentWithRelations,
  getAssignments,
  getAssignmentConfigById,
  getAssignmentStudents,
  getAssignmentQuestions,
  getMyAssignments,
  getAssignedAssignments,
};
