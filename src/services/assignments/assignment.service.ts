import type {
  CreateAssignmentDto,
  UpdateAssignmentDto,
  GetAssignmentsParams,
  GetMyAssignmentsParams,
  AssignmentDto,
} from "@/types/dto/assignments";
import type { PaginatedResult } from "@/types/dto/pagination.dto";
import { assignmentsRepository, assignmentResultsRepository } from "@/repository";

interface CreateAssignmentResult {
  assignmentId: string;
}

async function createAssignmentWithRelations(
  payload: CreateAssignmentDto,
  createdBy: string
): Promise<CreateAssignmentResult> {
  let assignmentId: string | null = null;

  try {
    // Create the assignment
    const assignmentData = await assignmentsRepository.createAssignment({
      name: payload.name,
      description: payload.description,
      created_by: createdBy,
    });

    assignmentId = assignmentData.id;
    console.log(`Assignment created: ${assignmentId}`);

    // Create questions
    if (payload.questions && payload.questions.length > 0) {
      const questionsToCreate = payload.questions.map((question) => {
        let options = question.options || null;

        // Transform matchingData to options for matching type
        if (question.type === "matching" && question.matchingData) {
          const { columnAItems, columnBItems, correctMappings } = question.matchingData;

          // Store the matching data structure in options
          options = {
            columnAItems,
            columnBItems,
            correctMappings,
          } as any;
        }

        // Transform orderItems to options for order type
        // Ensure correctOrder and displayOrder are assigned
        if (question.type === "order" && question.orderItems) {
          const orderItemsWithCorrectOrder = question.orderItems.map((item, index) => ({
            ...item,
            correctOrder: index + 1, // 1-based index represents the correct order
          }));

          // Generate shuffled displayOrder using Fisher-Yates algorithm
          const shuffledIndices = Array.from({ length: orderItemsWithCorrectOrder.length }, (_, i) => i);
          for (let i = shuffledIndices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledIndices[i], shuffledIndices[j]] = [shuffledIndices[j], shuffledIndices[i]];
          }

          const orderItemsWithDisplayOrder = orderItemsWithCorrectOrder.map((item, index) => ({
            ...item,
            displayOrder: shuffledIndices[index] + 1, // 1-based shuffled display position
          }));

          // Store the order data structure in options (similar to matching)
          options = {
            orderItems: orderItemsWithDisplayOrder,
          } as any;
        }

        return {
          assignment_id: assignmentId as string,
          type: question.type,
          label: question.label,
          score: question.score,
          options,
          attachments: question.attachments || null,
          created_by: createdBy,
        };
      });

      await assignmentsRepository.createQuestions(questionsToCreate);
      console.log(`Created ${questionsToCreate.length} question(s)`);
    }

    // Create assignment categories
    if (payload.assignmentCategories && payload.assignmentCategories.length > 0) {
      const categoriesToCreate = payload.assignmentCategories.map((categoryId) => ({
        assignment_id: assignmentId as string,
        category_id: categoryId,
      }));

      await assignmentsRepository.createAssignmentCategories(categoriesToCreate);
      console.log(`Created ${categoriesToCreate.length} assignment category/categories`);
    }

    // Create assignment employees
    if (payload.assignedEmployees && payload.assignedEmployees.length > 0) {
      const employeesToCreate = payload.assignedEmployees.map((employeeId) => ({
        assignment_id: assignmentId as string,
        employee_id: employeeId,
      }));

      await assignmentsRepository.createAssignmentEmployees(employeesToCreate);
      console.log(`Created ${employeesToCreate.length} assignment employee(s)`);
    }

    return {
      assignmentId,
    };
  } catch (error) {
    console.error("Error during assignment creation, initiating rollback...");
    console.error("Service layer error:", error);

    if (assignmentId) {
      console.log(`Rolling back: Deleting questions for assignment ${assignmentId}`);
      await assignmentsRepository.deleteQuestionsByAssignmentId(assignmentId);

      console.log(`Rolling back: Deleting categories for assignment ${assignmentId}`);
      await assignmentsRepository.deleteAssignmentCategoriesByAssignmentId(assignmentId);

      console.log(`Rolling back: Deleting employees for assignment ${assignmentId}`);
      await assignmentsRepository.deleteAssignmentEmployeesByAssignmentId(assignmentId);

      console.log(`Rolling back: Deleting assignment ${assignmentId}`);
      await assignmentsRepository.deleteAssignmentById(assignmentId);
    }

    console.log("Rollback completed (service layer)");

    throw error;
  }
}

async function updateAssignmentWithRelations(payload: UpdateAssignmentDto, updatedBy: string): Promise<void> {
  // Update the assignment
  await assignmentsRepository.updateAssignmentById(payload.id, {
    name: payload.name,
    description: payload.description,
  });

  // Delete and recreate questions
  await assignmentsRepository.deleteQuestionsByAssignmentId(payload.id);

  if (payload.questions && payload.questions.length > 0) {
    const questionsToCreate = payload.questions.map((question) => {
      let options = question.options || null;

      // Transform matchingData to options for matching type
      if (question.type === "matching" && question.matchingData) {
        const { columnAItems, columnBItems, correctMappings } = question.matchingData;

        // Store the matching data structure in options
        options = {
          columnAItems,
          columnBItems,
          correctMappings,
        } as any;
      }

      // Transform orderItems to options for order type
      // Ensure correctOrder and displayOrder are assigned
      if (question.type === "order" && question.orderItems) {
        const orderItemsWithCorrectOrder = question.orderItems.map((item, index) => ({
          ...item,
          correctOrder: index + 1, // 1-based index represents the correct order
        }));

        // Generate shuffled displayOrder using Fisher-Yates algorithm
        const shuffledIndices = Array.from({ length: orderItemsWithCorrectOrder.length }, (_, i) => i);
        for (let i = shuffledIndices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledIndices[i], shuffledIndices[j]] = [shuffledIndices[j], shuffledIndices[i]];
        }

        const orderItemsWithDisplayOrder = orderItemsWithCorrectOrder.map((item, index) => ({
          ...item,
          displayOrder: shuffledIndices[index] + 1, // 1-based shuffled display position
        }));

        // Store the order data structure in options (similar to matching)
        options = {
          orderItems: orderItemsWithDisplayOrder,
        } as any;
      }

      return {
        assignment_id: payload.id,
        type: question.type,
        label: question.label,
        score: question.score,
        options,
        attachments: question.attachments || null,
        created_by: updatedBy,
      };
    });

    await assignmentsRepository.createQuestions(questionsToCreate);
  }

  // Delete and recreate assignment categories
  await assignmentsRepository.deleteAssignmentCategoriesByAssignmentId(payload.id);

  if (payload.assignmentCategories && payload.assignmentCategories.length > 0) {
    const categoriesToCreate = payload.assignmentCategories.map((categoryId) => ({
      assignment_id: payload.id,
      category_id: categoryId,
    }));

    await assignmentsRepository.createAssignmentCategories(categoriesToCreate);
  }

  // Delete and recreate assignment employees
  await assignmentsRepository.deleteAssignmentEmployeesByAssignmentId(payload.id);

  if (payload.assignedEmployees && payload.assignedEmployees.length > 0) {
    const employeesToCreate = payload.assignedEmployees.map((employeeId) => ({
      assignment_id: payload.id,
      employee_id: employeeId,
    }));

    await assignmentsRepository.createAssignmentEmployees(employeesToCreate);
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

async function getAssignmentById(id: string): Promise<AssignmentDto> {
  return assignmentsRepository.getAssignmentById(id);
}

async function getAssignmentStudents(assignmentId: string, page: number = 0, limit: number = 25) {
  return assignmentsRepository.getAssignmentStudents(assignmentId, page, limit);
}

async function getAssignmentQuestions(assignmentId: string) {
  return assignmentsRepository.getAssignmentQuestions(assignmentId);
}

async function getMyAssignments(employeeId: string, params?: GetMyAssignmentsParams) {
  return assignmentsRepository.getMyAssignments(employeeId, params);
}

export {
  createAssignmentWithRelations,
  updateAssignmentWithRelations,
  deleteAssignmentWithRelations,
  getAssignments,
  getAssignmentById,
  getAssignmentStudents,
  getAssignmentQuestions,
  getMyAssignments,
};

