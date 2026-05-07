import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";

import { GET_ASSIGNMENTS } from "@/modules/assignment-management/operations/key";
import type { AssignmentAttemptSummaryDto } from "@/types/dto/assignments";

interface UseAssignmentAttemptStartParams {
  assignmentId?: string;
  employeeId?: string;
  enabled?: boolean;
  onError?: (error: Error) => void;
}

const useAssignmentAttemptStart = ({
  assignmentId,
  employeeId,
  enabled = true,
  onError,
}: UseAssignmentAttemptStartParams) => {
  const [attempt, setAttempt] = React.useState<AssignmentAttemptSummaryDto["latestAttempt"] | null>(null);
  const [isStarting, setIsStarting] = React.useState(false);
  const startedRef = React.useRef(false);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    startedRef.current = false;
    setAttempt(null);
  }, [assignmentId, employeeId]);

  React.useEffect(() => {
    if (!enabled || !assignmentId || !employeeId) {
      return;
    }

    if (startedRef.current) {
      return;
    }

    const startAttempt = async () => {
      setIsStarting(true);
      startedRef.current = true;
      try {
        const response = await fetch(`/api/assignments/${assignmentId}/attempts/start`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ employeeId }),
        });

        if (!response.ok) {
          const errorBody = await response.json();
          throw new Error(errorBody.error || "Không thể bắt đầu làm bài.");
        }

        const data = await response.json();
        setAttempt((data.data as AssignmentAttemptSummaryDto["latestAttempt"]) ?? null);
        queryClient.invalidateQueries({
          queryKey: [GET_ASSIGNMENTS, assignmentId, "attempt-summary", employeeId],
        });
      } catch (error) {
        const resolvedError = error instanceof Error ? error : new Error("Không thể bắt đầu làm bài.");
        onError?.(resolvedError);
      } finally {
        setIsStarting(false);
      }
    };

    startAttempt();
  }, [assignmentId, employeeId, enabled, onError]);

  return {
    attempt,
    isStarting,
  };
};

export { useAssignmentAttemptStart };
