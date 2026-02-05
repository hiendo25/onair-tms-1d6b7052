import type { SupabaseClient } from "@supabase/supabase-js";

import { assignmentBankRepository, assignmentResultsRepository, assignmentsRepository } from "@/repository";
import type { AssignAssignmentBankDto } from "@/types/dto/assignment-bank";
import type { Database } from "@/types/supabase.types";
import { parseDateTimeRange } from "@/utils/date";

interface AssignAssignmentBankResult {
  assignmentId: string;
}

const parseAssignmentDateRange = (startDate: string, endDate: string) => {
  const range = parseDateTimeRange(startDate, endDate);
  if (!range) {
    throw new Error("Hạn làm bài không hợp lệ");
  }

  if (range.start.getTime() >= range.end.getTime()) {
    throw new Error("Hạn làm bài không hợp lệ");
  }

  return {
    start: range.start.toISOString(),
    end: range.end.toISOString(),
  };
};

const assignAssignmentBankToEmployees = async (
  payload: AssignAssignmentBankDto,
  assignedBy: string,
  client?: SupabaseClient<Database>,
): Promise<AssignAssignmentBankResult> => {
  if (!client) {
    throw new Error("Supabase client is required");
  }

  const assignmentBank = await assignmentBankRepository.getAssignmentBankById(
    payload.assignmentBankId,
    payload.organizationId,
    client,
  );

  if (!assignmentBank) {
    throw new Error("Không tìm thấy bài kiểm tra");
  }

  const dateRange = parseAssignmentDateRange(payload.startDate, payload.endDate);
  if (payload.assignmentId) {
    const assignmentMeta = await assignmentsRepository.getAssignmentMetaById(payload.assignmentId, client);

    if (!assignmentMeta) {
      throw new Error("Không tìm thấy bài kiểm tra đã gán");
    }

    if (
      assignmentMeta.assignment_bank_id !== payload.assignmentBankId ||
      assignmentMeta.organization_id !== payload.organizationId
    ) {
      throw new Error("Dữ liệu bài kiểm tra không hợp lệ");
    }

    const currentAssignedEmployeeIds = await assignmentsRepository.getAssignmentEmployeeIdsByAssignmentIdWithClient(
      client,
      assignmentMeta.id,
    );
    const nextAssignedEmployeeIds = new Set(payload.assignedEmployeeIds);
    const removedEmployeeIds = currentAssignedEmployeeIds.filter((employeeId) => !nextAssignedEmployeeIds.has(employeeId));

    if (removedEmployeeIds.length > 0) {
      await assignmentResultsRepository.deleteAssignmentResultsByAssignmentAndEmployeeIdsWithClient(
        client,
        assignmentMeta.id,
        removedEmployeeIds,
      );
    }

    await assignmentsRepository.updateAssignmentByIdWithClient(client, assignmentMeta.id, {
      attempt_limit: payload.attemptLimit,
      available_from: dateRange.start,
      available_to: dateRange.end,
    });

    await assignmentsRepository.deleteAssignmentEmployeesByAssignmentIdWithClient(client, assignmentMeta.id);

    if (payload.assignedEmployeeIds.length > 0) {
      const employeeRows = payload.assignedEmployeeIds.map((employeeId) => ({
        assignment_config_id: assignmentMeta.id,
        employee_id: employeeId,
      }));

      await assignmentsRepository.createAssignmentEmployeesWithClient(client, employeeRows);
    }

    return { assignmentId: assignmentMeta.id };
  }

  let assignmentId: string | null = null;

  try {
    const assignment = await assignmentsRepository.createAssignmentFromBankWithClient(client, {
      assignment_bank_id: payload.assignmentBankId,
      assigned_by: assignedBy,
      organization_id: payload.organizationId,
      attempt_duration_minutes: assignmentBank.duration_minutes ?? null,
      attempt_limit: payload.attemptLimit,
      available_from: dateRange.start,
      available_to: dateRange.end,
      status: "open",
      scope: "employee"
    });

    assignmentId = assignment.id;

    if (payload.assignedEmployeeIds.length > 0) {
      const employeeRows = payload.assignedEmployeeIds.map((employeeId) => ({
        assignment_config_id: assignmentId as string,
        employee_id: employeeId,
      }));

      await assignmentsRepository.createAssignmentEmployeesWithClient(client, employeeRows);
    }

    return { assignmentId };
  } catch (error) {
    if (assignmentId) {
      await assignmentsRepository.deleteAssignmentEmployeesByAssignmentIdWithClient(client, assignmentId);
      await assignmentsRepository.deleteAssignmentByIdWithClient(client, assignmentId);
    }

    throw error;
  }
};

export { assignAssignmentBankToEmployees };
export type { AssignAssignmentBankResult };
