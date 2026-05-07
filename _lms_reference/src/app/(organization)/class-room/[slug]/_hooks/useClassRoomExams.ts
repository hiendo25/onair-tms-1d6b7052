import { useMemo } from "react";

import { calculateAssignmentBankTotals } from "@/modules/assignment-management/utils/assignment-bank.utils";
import type { ClassRoomDetailWithProgress } from "@/services/class-room/class-room-progress-mapping.service";
import type { AssignmentBankDto } from "@/types/dto/assignment-bank";

export interface ClassRoomExamItem {
  assignmentConfigId: string;
  assignmentBankId?: string | null;
  name: string;
  description: string;
  durationMinutes: number | null;
  passScore: number | null;
  totalQuestions: number;
  totalScore: number;
  passedCount: number;
  failedCount: number;
}

const DEFAULT_EXAM_COUNTS = {
  passedCount: 0,
  failedCount: 0,
};

export const useClassRoomExams = (
  data: ClassRoomDetailWithProgress | null,
): ClassRoomExamItem[] => {
  return useMemo(() => {
    if (!data?.sessions?.length) {
      return [];
    }

    const examMap = new Map<string, ClassRoomExamItem>();

    data.sessions.forEach((session) => {
      (session.assignments ?? []).forEach((assignment) => {
        const configId = assignment.assignment_config_id;
        if (!configId || examMap.has(configId)) {
          return;
        }

        const assignmentConfig = assignment.assignment_config;
        const assignmentBank = assignmentConfig?.assignment_bank;
        if (!assignmentBank) {
          return;
        }

        const totals = calculateAssignmentBankTotals(assignmentBank as AssignmentBankDto);
        const durationMinutes =
          assignmentConfig?.attempt_duration_minutes ?? assignmentBank.duration_minutes ?? null;

        examMap.set(configId, {
          assignmentConfigId: configId,
          assignmentBankId: assignmentBank.id ?? assignmentConfig?.assignment_bank_id ?? null,
          name: assignmentBank.name ?? "Bài kiểm tra",
          description: assignmentBank.description ?? "",
          durationMinutes,
          passScore: assignmentBank.pass_score ?? null,
          totalQuestions: totals.totalQuestions,
          totalScore: totals.totalScore,
          ...DEFAULT_EXAM_COUNTS,
        });
      });
    });

    return Array.from(examMap.values());
  }, [data]);
};
