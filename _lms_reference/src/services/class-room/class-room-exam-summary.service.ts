import { createSVClient } from "@/services/supabase/server";
import type { Database } from "@/types/supabase.types";

type AttemptStatus = Database["public"]["Enums"]["assignment_attempt_status"];

export interface ClassRoomExamSummaryItem {
  assignmentConfigId: string;
  passedCount: number;
  failedCount: number;
}

export interface ClassRoomExamSummaryResult {
  classRoomId: string;
  assignments: ClassRoomExamSummaryItem[];
}

interface GetClassRoomExamSummaryParams {
  classRoomId: string;
  assignmentConfigIds: string[];
}

const unique = (values: string[]) => Array.from(new Set(values));

const buildAttemptKey = (assignmentConfigId: string, employeeId: string) =>
  `${assignmentConfigId}:${employeeId}`;

const resolveLatestAttempts = (attempts: Array<{
  assignment_config_id: string;
  employee_id: string;
  attempt_number: number;
  status: AttemptStatus;
  score: number | null;
}>) => {
  const latestMap = new Map<string, typeof attempts[number]>();
  attempts.forEach((attempt) => {
    const key = buildAttemptKey(attempt.assignment_config_id, attempt.employee_id);
    const existing = latestMap.get(key);
    if (!existing || attempt.attempt_number > existing.attempt_number) {
      latestMap.set(key, attempt);
    }
  });
  return latestMap;
};

export const getClassRoomExamSummary = async (
  params: GetClassRoomExamSummaryParams,
): Promise<ClassRoomExamSummaryResult> => {
  const { classRoomId, assignmentConfigIds } = params;

  if (!classRoomId) {
    throw new Error("Class room ID is required");
  }

  const assignmentIds = unique(assignmentConfigIds.filter((id) => id.trim().length > 0));
  if (assignmentIds.length === 0) {
    return { classRoomId, assignments: [] };
  }

  const supabase = await createSVClient();

  const { data: classRoomStudents, error: studentsError } = await supabase
    .from("class_room_employee")
    .select("employee_id")
    .eq("class_room_id", classRoomId);

  if (studentsError) {
    throw new Error(`Failed to fetch class room students: ${studentsError.message}`);
  }

  const studentIds = unique((classRoomStudents ?? []).map((row) => row.employee_id));
  if (studentIds.length === 0) {
    return {
      classRoomId,
      assignments: assignmentIds.map((assignmentConfigId) => ({
        assignmentConfigId,
        passedCount: 0,
        failedCount: 0,
      })),
    };
  }

  const { data: assignmentConfigs, error: assignmentError } = await supabase
    .from("assignment_config")
    .select("id, assignment_bank(pass_score)")
    .in("id", assignmentIds);

  if (assignmentError) {
    throw new Error(`Failed to fetch assignment configs: ${assignmentError.message}`);
  }

  const passScoreMap = new Map<string, number | null>();
  (assignmentConfigs ?? []).forEach((assignment: any) => {
    passScoreMap.set(assignment.id, assignment.assignment_bank?.pass_score ?? null);
  });

  const { data: attempts, error: attemptsError } = await supabase
    .from("assignments_attempts")
    .select("assignment_config_id, employee_id, attempt_number, status, score")
    .in("assignment_config_id", assignmentIds)
    .in("employee_id", studentIds)
    .eq("status", "graded");

  if (attemptsError) {
    throw new Error(`Failed to fetch assignment attempts: ${attemptsError.message}`);
  }

  const latestAttempts = resolveLatestAttempts(
    (attempts ?? []) as Array<{
      assignment_config_id: string;
      employee_id: string;
      attempt_number: number;
      status: AttemptStatus;
      score: number | null;
    }>,
  );

  const summaryMap = new Map<string, { passedCount: number; failedCount: number }>();
  assignmentIds.forEach((assignmentConfigId) => {
    summaryMap.set(assignmentConfigId, { passedCount: 0, failedCount: 0 });
  });

  latestAttempts.forEach((attempt, key) => {
    const [assignmentConfigId] = key.split(":");
    const summary = summaryMap.get(assignmentConfigId!);
    if (!summary) {
      return;
    }
    const passScore = passScoreMap.get(assignmentConfigId!);
    if (passScore === null || typeof attempt.score !== "number") {
      return;
    }
    if (attempt.score >= passScore!) {
      summary.passedCount += 1;
    } else {
      summary.failedCount += 1;
    }
  });

  return {
    classRoomId,
    assignments: assignmentIds.map((assignmentConfigId) => ({
      assignmentConfigId,
      passedCount: summaryMap.get(assignmentConfigId)?.passedCount ?? 0,
      failedCount: summaryMap.get(assignmentConfigId)?.failedCount ?? 0,
    })),
  };
};
