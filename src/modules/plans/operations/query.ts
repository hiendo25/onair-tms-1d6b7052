import { useTQuery } from "@/lib/queryClient";
import { PlanDetailDto, PlanListItem, PlanTopicCourse } from "@/modules/plans/types";
import { GET_PLAN_DETAIL, GET_PLANS, GET_COURSES_OPTIONS } from "./key";
import { planService } from "@/services/plans/plan.service";

interface UsePlanListParams {
  organizationId?: string;
  search?: string;
}

export const useGetPlansQuery = ({ organizationId, search }: UsePlanListParams) => {
  return useTQuery<PlanListItem[]>({
    queryKey: [GET_PLANS, organizationId, search],
    queryFn: () => planService.getPlans({ organizationId: organizationId!, search }),
    enabled: !!organizationId,
  });
};

export const useGetPlanDetailQuery = (id?: string) => {
  return useTQuery<PlanDetailDto>({
    queryKey: [GET_PLAN_DETAIL, id],
    queryFn: () => planService.getPlanDetail(id!),
    enabled: !!id,
  });
};

export const useGetPlanCourseOptionsQuery = (organizationId?: string) => {
  return useTQuery<PlanTopicCourse[]>({
    queryKey: [GET_COURSES_OPTIONS, organizationId],
    queryFn: () => planService.getCourseOptions(organizationId!),
    enabled: !!organizationId,
  });
};
