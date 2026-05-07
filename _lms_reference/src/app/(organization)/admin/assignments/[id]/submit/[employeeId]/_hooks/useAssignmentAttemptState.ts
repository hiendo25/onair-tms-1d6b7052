import * as React from "react";

import type { AssignmentAttemptSummaryDto, AssignmentDto } from "@/types/dto/assignments";

import { useAssignmentAttemptStart } from "./useAssignmentAttemptStart";

interface UseAssignmentAttemptStateParams {
  assignmentId?: string;
  employeeId?: string;
  assignment?: AssignmentDto;
  attemptSummary?: AssignmentAttemptSummaryDto;
  isLoadingAssignment: boolean;
  isLoadingQuestions: boolean;
  isLoadingEmployee: boolean;
  isLoadingAttemptSummary: boolean;
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  onAttemptStartError?: (error: Error) => void;
}

const useAssignmentAttemptState = ({
  assignmentId,
  employeeId,
  assignment,
  attemptSummary,
  isLoadingAssignment,
  isLoadingQuestions,
  isLoadingEmployee,
  isLoadingAttemptSummary,
  shuffleQuestions,
  shuffleAnswers,
  onAttemptStartError,
}: UseAssignmentAttemptStateParams) => {
  const [remainingSeconds, setRemainingSeconds] = React.useState<number | null>(null);
  const [windowNow, setWindowNow] = React.useState(() => Date.now());
  const [manualStartRequested, setManualStartRequested] = React.useState(false);

  const baseLoading = isLoadingAssignment || isLoadingQuestions || isLoadingEmployee || isLoadingAttemptSummary;

  const attemptLimit = attemptSummary?.attemptLimit ?? assignment?.attempt_limit ?? null;
  const attemptsRemaining =
    attemptSummary?.attemptsRemaining ??
    (attemptLimit === null ? null : Math.max(attemptLimit - (attemptSummary?.attemptsUsed ?? 0), 0));
  const durationMinutes = attemptSummary?.attemptDurationMinutes ?? assignment?.attempt_duration_minutes ?? null;
  const availableFrom = attemptSummary?.availableFrom ?? assignment?.available_from ?? null;
  const availableTo = attemptSummary?.availableTo ?? assignment?.available_to ?? null;
  const latestAttemptStatus = attemptSummary?.latestAttempt?.status;

  const isWithinWindow = React.useMemo(() => {
    const now = windowNow;
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
  }, [availableFrom, availableTo, windowNow]);

  const isTimeExpired = remainingSeconds !== null && remainingSeconds <= 0;

  React.useEffect(() => {
    setManualStartRequested(false);
  }, [assignmentId, employeeId]);

  const hasActiveAttemptFromSummary = latestAttemptStatus === "in_progress";
  const canStartByAttempts =
    attemptLimit === null ? true : hasActiveAttemptFromSummary ? true : (attemptsRemaining ?? 0) > 0;
  const requiresManualStart =
    latestAttemptStatus === "submitted" || latestAttemptStatus === "graded";
  const shouldStartAttempt =
    Boolean(assignmentId && employeeId) &&
    !baseLoading &&
    isWithinWindow &&
    canStartByAttempts &&
    (!requiresManualStart || manualStartRequested);

  const { attempt: activeAttempt, isStarting: isStartingAttempt } = useAssignmentAttemptStart({
    assignmentId,
    employeeId,
    enabled: shouldStartAttempt,
    onError: onAttemptStartError,
  });

  const shouldWaitForAttemptSeed =
    (shuffleQuestions || shuffleAnswers) && shouldStartAttempt && isStartingAttempt;
  const isLoading = baseLoading || shouldWaitForAttemptSeed;

  const fallbackAttempt = attemptSummary?.latestAttempt;
  const activeAttemptId =
    activeAttempt?.status === "in_progress"
      ? activeAttempt.id
      : fallbackAttempt?.status === "in_progress"
        ? fallbackAttempt.id
        : undefined;
  const activeAttemptExpiresAt =
    activeAttempt?.status === "in_progress"
      ? activeAttempt.expiresAt
      : fallbackAttempt?.status === "in_progress"
        ? fallbackAttempt.expiresAt
        : null;
  const displayDurationMinutes =
    activeAttempt?.durationMinutesSnapshot ??
    fallbackAttempt?.durationMinutesSnapshot ??
    durationMinutes;
  const hasActiveAttempt =
    activeAttempt?.status === "in_progress" ||
    attemptSummary?.latestAttempt?.status === "in_progress";
  const hasAttemptsLeft =
    attemptLimit === null ? true : hasActiveAttempt ? true : (attemptsRemaining ?? 0) > 0;

  const attemptSeedKey = React.useMemo(() => {
    if (activeAttempt?.status === "in_progress") {
      return activeAttempt.attemptNumber;
    }
    if (fallbackAttempt?.status === "in_progress") {
      return fallbackAttempt.attemptNumber;
    }
    return undefined;
  }, [activeAttempt, fallbackAttempt]);

  React.useEffect(() => {
    if (!availableFrom && !availableTo) {
      return;
    }

    const updateNow = () => setWindowNow(Date.now());
    updateNow();

    const timer = window.setInterval(updateNow, 1000);
    return () => window.clearInterval(timer);
  }, [availableFrom, availableTo]);

  React.useEffect(() => {
    if (!activeAttemptExpiresAt || !hasAttemptsLeft || !isWithinWindow) {
      setRemainingSeconds(null);
      return;
    }

    const expiresMs = new Date(activeAttemptExpiresAt).getTime();
    if (Number.isNaN(expiresMs)) {
      setRemainingSeconds(null);
      return;
    }

    const updateRemaining = () => {
      const remaining = Math.max(expiresMs - Date.now(), 0);
      setRemainingSeconds(Math.ceil(remaining / 1000));
    };

    updateRemaining();

    const timer = window.setInterval(updateRemaining, 1000);

    return () => window.clearInterval(timer);
  }, [activeAttemptExpiresAt, hasAttemptsLeft, isWithinWindow]);

  return {
    attemptLimit,
    attemptsRemaining,
    availableFrom,
    availableTo,
    displayDurationMinutes,
    remainingSeconds,
    isWithinWindow,
    isTimeExpired,
    manualStartRequested,
    setManualStartRequested,
    requiresManualStart,
    isStartingAttempt,
    isLoading,
    activeAttemptId,
    hasAttemptsLeft,
    attemptSeedKey,
  };
};

export { useAssignmentAttemptState };
export type { UseAssignmentAttemptStateParams };
