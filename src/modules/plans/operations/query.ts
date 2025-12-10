import { useTQuery } from "@/lib/queryClient";
import { PlanDetailDto, PlanListResponse, PlanTopicCourse } from "@/modules/plans/types";
import { GET_PLAN_DETAIL, GET_PLANS, GET_COURSES_OPTIONS, GET_PLANNING_SURVEYS } from "./key";
import { planService } from "@/services/plans/plan.service";
import { surveyService, PlanningSurveyListResponse } from "@/services/surveys/survey.service";

interface UsePlanListParams {
  organizationId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const useGetPlansQuery = ({ organizationId, search, page, limit }: UsePlanListParams) => {
  return useTQuery<PlanListResponse>({
    queryKey: [GET_PLANS, organizationId, search, page, limit],
    queryFn: () => planService.getPlans({ organizationId: organizationId!, search, page, limit }),
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

interface UsePlanningSurveyListParams {
  organizationId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const useGetPlanningSurveysQuery = ({ organizationId, search, page, limit }: UsePlanningSurveyListParams) => {
  return useTQuery<PlanningSurveyListResponse>({
    queryKey: [GET_PLANNING_SURVEYS, organizationId, search, page, limit],
    queryFn: () => surveyService.getPlanningSurveys({ organizationId: organizationId!, search, page, limit }),
    enabled: !!organizationId,
    staleTime: 30_000,
  });
};
