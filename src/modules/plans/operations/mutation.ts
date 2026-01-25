import { useQueryClient } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/constants/query-key.constant";
import { useTMutation } from "@/lib/queryClient";
import { PlanStatus } from "@/model/plan.model";
import { PlanTopicCourse } from "@/modules/plans/types";
import { planService } from "@/services/plans/plan.service";

import {
  CREATE_PLAN,
  CREATE_PLAN_DRAFT_COURSE,
  DELETE_PLAN,
  GET_COURSES_OPTIONS,
  GET_PLAN_DETAIL,
  GET_PLANS,
  UPDATE_PLAN,
  UPDATE_PLAN_STATUS,
} from "./key";

export const useCreatePlanMutation = () => {
  const queryClient = useQueryClient();

  return useTMutation({
    mutationKey: [CREATE_PLAN],
    mutationFn: ({
      form,
      organizationId,
      createdBy,
      status,
    }: {
      form: any;
      organizationId: string;
      createdBy: string;
      status?: PlanStatus;
    }) => planService.createPlanWithStatus({ form, organizationId, createdBy, status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_PLANS] });
    },
  });
};

export const useDeletePlanMutation = () => {
  const queryClient = useQueryClient();

  return useTMutation({
    mutationKey: [DELETE_PLAN],
    mutationFn: planService.deletePlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_PLANS] });
    },
    onSettled: (_data, _error, variables) => {
      if (variables) {
        queryClient.removeQueries({ queryKey: [GET_PLAN_DETAIL, variables] });
      }
    },
  });
};

export const useUpdatePlanMutation = () => {
  const queryClient = useQueryClient();

  return useTMutation({
    mutationKey: [UPDATE_PLAN],
    mutationFn: ({
      id,
      ...payload
    }: {
      id: string;
      form: any;
      organizationId: string;
      createdBy: string;
      status?: PlanStatus;
    }) => planService.updatePlan(id, payload as any),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [GET_PLANS] });
      queryClient.invalidateQueries({ queryKey: [GET_PLAN_DETAIL, variables.id] });
    },
  });
};

export const useCreatePlanDraftCourseMutation = () => {
  const queryClient = useQueryClient();

  return useTMutation({
    mutationKey: [CREATE_PLAN_DRAFT_COURSE],
    mutationFn: ({
      organizationId,
      createdBy,
      title,
      description,
    }: {
      organizationId: string;
      createdBy: string;
      title: string;
      description?: string;
    }) => planService.createDraftCourse({ organizationId, createdBy, title, description }),
    onSuccess: (data, variables) => {
      queryClient.setQueryData<PlanTopicCourse[] | undefined>(
        [GET_COURSES_OPTIONS, variables.organizationId],
        (prev = []) => {
          const next = prev ?? [];
          if (!data) return next;

          const exists = next.some((course) => course.id === data.id);
          if (exists) return next;

          return [...next, { id: data.id, title: data.title ?? variables.title }];
        },
      );

      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_COURSES] });
    },
  });
};

export const useUpdatePlanStatusMutation = () => {
  const queryClient = useQueryClient();

  return useTMutation({
    mutationKey: [UPDATE_PLAN_STATUS],
    mutationFn: ({ id, status, approverId }: { id: string; status: PlanStatus; approverId?: string | null }) =>
      planService.updatePlanStatus({ id, status, approverId }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [GET_PLANS] });
      queryClient.invalidateQueries({ queryKey: [GET_PLAN_DETAIL, variables.id] });
    },
  });
};
