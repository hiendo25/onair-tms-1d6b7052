import { useQueryClient } from "@tanstack/react-query";
import { useTMutation } from "@/lib/queryClient";
import { CREATE_PLAN, DELETE_PLAN, GET_PLAN_DETAIL, GET_PLANS, UPDATE_PLAN } from "./key";
import { planService } from "@/services/plans/plan.service";

export const useCreatePlanMutation = () => {
  const queryClient = useQueryClient();

  return useTMutation({
    mutationKey: [CREATE_PLAN],
    mutationFn: planService.createPlan,
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
    }) => planService.updatePlan(id, payload as any),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [GET_PLANS] });
      queryClient.invalidateQueries({ queryKey: [GET_PLAN_DETAIL, variables.id] });
    },
  });
};
