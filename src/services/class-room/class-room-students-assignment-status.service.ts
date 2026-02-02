import { calculateAssignmentBankTotals } from "@/modules/assignment-management/utils/assignment-bank.utils";
import type { AssignmentBankDto } from "@/types/dto/assignment-bank";
import type { Database } from "@/types/supabase.types";
import { createSVClient } from "@/services/supabase/server";

type AttemptStatus = Database["public"]["Enums"]["assignment_attempt_status"];

export type AssignmentGradingStatus = "graded" | "submitted" | "not_submitted";
export type AssignmentExamResult = "passed" | "failed" | "pending" | "not_submitted";

export interface ClassRoomStudentAssignmentStatusItem {
  employeeId: string;
  status: AttemptStatus | null;
  score: number | null;
  maxScore: number | null;
  gradingStatus: AssignmentGradingStatus;
  examResult: AssignmentExamResult;
}

export interface ClassRoomStudentsAssignmentStatusResult {
  assignmentConfigId: string;
  assignmentBankId: string | null;
  assignmentName: string | null;
  passScore: number | null;
  totalScore: number;
  students: ClassRoomStudentAssignmentStatusItem[];
}

export interface ClassRoomStudentAssignmentsStatusItem {
  assignmentConfigId: string;
  assignmentBankId: string | null;
  assignmentName: string | null;
  passScore: number | null;
  totalScore: number;
  status: AttemptStatus | null;
  score: number | null;
  maxScore: number | null;
  gradingStatus: AssignmentGradingStatus;
  examResult: AssignmentExamResult;
}

export interface ClassRoomStudentAssignmentsStatusResult {
  employeeId: string;
  assignments: ClassRoomStudentAssignmentsStatusItem[];
}

interface GetClassRoomStudentsAssignmentStatusParams {
  assignmentConfigId: string;
  employeeIds: string[];
}

interface GetClassRoomStudentAssignmentsStatusParams {
  employeeId: string;
  assignmentConfigIds: string[];
}

const resolveGradingStatus = (status: AttemptStatus | null): AssignmentGradingStatus => {
  if (status === "graded") {
    return "graded";
  }
  if (status === "submitted") {
    return "submitted";
  }
  return "not_submitted";
};

const resolveExamResult = (
  status: AttemptStatus | null,
  score: number | null,
  passScore: number | null,
  totalScore: number,
): AssignmentExamResult => {
  if (!status) {
    return "not_submitted";
  }
  if (status === "graded") {
    if (typeof score !== "number" || passScore === null || totalScore <= 0) {
      return "pending";
    }
    return score >= passScore ? "passed" : "failed";
  }
  if (status === "submitted") {
    return "pending";
  }
  return "not_submitted";
};

export const getClassRoomStudentsAssignmentStatus = async (
  params: GetClassRoomStudentsAssignmentStatusParams,
): Promise<ClassRoomStudentsAssignmentStatusResult> => {
  const { assignmentConfigId, employeeIds } = params;

  if (!assignmentConfigId) {
    throw new Error("Assignment config ID is required");
  }

  const supabase = await createSVClient();

  const { data: assignmentConfig, error: assignmentError } = await supabase
    .from("assignment_config")
    .select(
      `
      id,
      assignment_bank_id,
      assignment_bank(
        id,
        name,
        pass_score,
        assignment_questions(
          question_id,
          order_index,
          score_override,
          question_bank(
            id,
            score
          )
        )
      )
    `,
    )
    .eq("id", assignmentConfigId)
    .maybeSingle();

  if (assignmentError) {
    throw new Error(`Failed to fetch assignment config: ${assignmentError.message}`);
  }

  if (!assignmentConfig) {
    throw new Error("Assignment config not found");
  }

  const assignmentBank = assignmentConfig.assignment_bank as AssignmentBankDto | null;
  const totals = assignmentBank ? calculateAssignmentBankTotals(assignmentBank) : { totalQuestions: 0, totalScore: 0 };

  if (employeeIds.length === 0) {
    return {
      assignmentConfigId,
      assignmentBankId: assignmentConfig.assignment_bank_id ?? null,
      assignmentName: assignmentBank?.name ?? null,
      passScore: assignmentBank?.pass_score ?? null,
      totalScore: totals.totalScore,
      students: [],
    };
  }

  const { data: attempts, error: attemptsError } = await supabase
    .from("assignments_attempts")
    .select("employee_id, attempt_number, status, submitted_at, score, max_score")
    .eq("assignment_config_id", assignmentConfigId)
    .in("employee_id", employeeIds);

  if (attemptsError) {
    throw new Error(`Failed to fetch assignment attempts: ${attemptsError.message}`);
  }

  const latestAttemptMap = new Map<
    string,
    {
      status: AttemptStatus;
      attempt_number: number;
      score: number | null;
      max_score: number | null;
    }
  >();

  (attempts ?? []).forEach((attempt) => {
    const existing = latestAttemptMap.get(attempt.employee_id);
    if (!existing || attempt.attempt_number > existing.attempt_number) {
      latestAttemptMap.set(attempt.employee_id, {
        status: attempt.status,
        attempt_number: attempt.attempt_number,
        score: attempt.score ?? null,
        max_score: attempt.max_score ?? null,
      });
    }
  });

  const students = employeeIds.map((employeeId) => {
    const attempt = latestAttemptMap.get(employeeId) ?? null;
    const status = attempt?.status ?? null;
    const score = attempt?.score ?? null;
    const maxScore = attempt?.max_score ?? null;

    return {
      employeeId,
      status,
      score,
      maxScore,
      gradingStatus: resolveGradingStatus(status),
      examResult: resolveExamResult(status, score, assignmentBank?.pass_score ?? null, totals.totalScore),
    };
  });

  return {
    assignmentConfigId,
    assignmentBankId: assignmentConfig.assignment_bank_id ?? null,
    assignmentName: assignmentBank?.name ?? null,
    passScore: assignmentBank?.pass_score ?? null,
    totalScore: totals.totalScore,
    students,
  };
};

export const getClassRoomStudentAssignmentsStatus = async (
  params: GetClassRoomStudentAssignmentsStatusParams,
): Promise<ClassRoomStudentAssignmentsStatusResult> => {
  const { employeeId, assignmentConfigIds } = params;

  if (!employeeId) {
    throw new Error("Employee ID is required");
  }

  const uniqueAssignmentIds = Array.from(
    new Set(assignmentConfigIds.filter((id) => id.trim().length > 0)),
  );

  if (uniqueAssignmentIds.length === 0) {
    return {
      employeeId,
      assignments: [],
    };
  }

  const supabase = await createSVClient();

  const { data: assignmentConfigs, error: assignmentError } = await supabase
    .from("assignment_config")
    .select(
      `
      id,
      assignment_bank_id,
      assignment_bank(
        id,
        name,
        pass_score,
        assignment_questions(
          question_id,
          order_index,
          score_override,
          question_bank(
            id,
            score
          )
        )
      )
    `,
    )
    .in("id", uniqueAssignmentIds);

  if (assignmentError) {
    throw new Error(`Failed to fetch assignment configs: ${assignmentError.message}`);
  }

  const assignmentMap = new Map<
    string,
    {
      assignmentBankId: string | null;
      assignmentName: string | null;
      passScore: number | null;
      totalScore: number;
    }
  >();

  (assignmentConfigs ?? []).forEach((assignmentConfig: any) => {
    const assignmentBank = assignmentConfig.assignment_bank as AssignmentBankDto | null;
    const totals = assignmentBank
      ? calculateAssignmentBankTotals(assignmentBank)
      : { totalQuestions: 0, totalScore: 0 };

    assignmentMap.set(assignmentConfig.id, {
      assignmentBankId: assignmentConfig.assignment_bank_id ?? null,
      assignmentName: assignmentBank?.name ?? null,
      passScore: assignmentBank?.pass_score ?? null,
      totalScore: totals.totalScore,
    });
  });

  const { data: attempts, error: attemptsError } = await supabase
    .from("assignments_attempts")
    .select("assignment_config_id, attempt_number, status, score, max_score")
    .eq("employee_id", employeeId)
    .in("assignment_config_id", uniqueAssignmentIds);

  if (attemptsError) {
    throw new Error(`Failed to fetch assignment attempts: ${attemptsError.message}`);
  }

  const latestAttemptMap = new Map<
    string,
    {
      status: AttemptStatus;
      attempt_number: number;
      score: number | null;
      max_score: number | null;
    }
  >();

  (attempts ?? []).forEach((attempt) => {
    const existing = latestAttemptMap.get(attempt.assignment_config_id);
    if (!existing || attempt.attempt_number > existing.attempt_number) {
      latestAttemptMap.set(attempt.assignment_config_id, {
        status: attempt.status,
        attempt_number: attempt.attempt_number,
        score: attempt.score ?? null,
        max_score: attempt.max_score ?? null,
      });
    }
  });

  const assignments = uniqueAssignmentIds.map((assignmentConfigId) => {
    const assignmentInfo = assignmentMap.get(assignmentConfigId) ?? {
      assignmentBankId: null,
      assignmentName: null,
      passScore: null,
      totalScore: 0,
    };
    const attempt = latestAttemptMap.get(assignmentConfigId);
    const status = attempt?.status ?? null;
    const score = attempt?.score ?? null;
    const maxScore = attempt?.max_score ?? null;

    return {
      assignmentConfigId,
      assignmentBankId: assignmentInfo.assignmentBankId,
      assignmentName: assignmentInfo.assignmentName,
      passScore: assignmentInfo.passScore,
      totalScore: assignmentInfo.totalScore,
      status,
      score,
      maxScore,
      gradingStatus: resolveGradingStatus(status),
      examResult: resolveExamResult(status, score, assignmentInfo.passScore, assignmentInfo.totalScore),
    };
  });

  return {
    employeeId,
    assignments,
  };
};
