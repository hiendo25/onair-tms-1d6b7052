import dayjs from "dayjs";

import { PlanStatus } from "@/model/plan.model";

import { Survey } from "./plan-form.schema";

export type SurveyUnlockReason = "result" | "time-ended" | null;

export interface PlanSurveyAccess {
  hasSurvey: boolean;
  hasResult: boolean;
  isBeforeStart: boolean;
  isDuringWindow: boolean;
  isAfterEnd: boolean;
  shouldLock: boolean;
  unlockReason: SurveyUnlockReason;
  startDate?: string | null;
  endDate?: string | null;
}

const parseDate = (value?: string | null) => {
  if (!value) return null;
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed : null;
};

export const hasSurveyResult = (survey?: Survey | null) => {
  if (!survey) return false;

  const hasResultSummary = survey.resultSummary !== null && survey.resultSummary !== undefined;
  const closedStatus = survey.status === "closed";

  return hasResultSummary || closedStatus;
};

export const getPlanSurveyAccess = (
  planStatus?: PlanStatus,
  survey?: Survey | null,
): PlanSurveyAccess => {
  const hasSurvey = !!survey;
  const startDate = survey?.startDate ?? null;
  const endDate = survey?.endDate ?? null;

  const start = parseDate(startDate);
  const end = parseDate(endDate);
  const now = dayjs();

  const isBeforeStart = !!start && now.isBefore(start);
  const isAfterEnd = !!end && !now.isBefore(end);
  const isDuringWindow = !!start && !!end && !now.isBefore(start) && now.isBefore(end);
  const hasResult = hasSurveyResult(survey);

  const waitingForSurvey = planStatus === "pending_survey";
  const shouldLock = hasSurvey && waitingForSurvey && !hasResult && !isAfterEnd;

  const unlockReason: SurveyUnlockReason = hasResult
    ? "result"
    : isAfterEnd
      ? "time-ended"
      : null;

  return {
    hasSurvey,
    hasResult,
    isBeforeStart,
    isDuringWindow,
    isAfterEnd,
    shouldLock,
    unlockReason,
    startDate,
    endDate,
  };
};

export const isSurveyLocked = (planStatus?: PlanStatus, survey?: Survey | null) =>
  getPlanSurveyAccess(planStatus, survey).shouldLock;
