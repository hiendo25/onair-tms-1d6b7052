import { useTQuery } from "@/lib/queryClient";
import { PlanStatus } from "@/model/plan.model";
import { PlanDetailDto, PlanListResponse, PlanTopicCourse } from "@/modules/plans/types";
import { planService } from "@/services/plans/plan.service";
import { PlanningSurveyListResponse,surveyService } from "@/services/surveys/survey.service";

import { GET_COURSES_OPTIONS, GET_PLAN_DETAIL, GET_PLANNING_SURVEYS,GET_PLANS } from "./key";

interface UsePlanListParams {
  organizationId?: string;
  search?: string;
  page?: number;
  limit?: number;
  status?: PlanStatus | "all";
  startDate?: string;
  endDate?: string;
}

export const useGetPlansQuery = ({
  organizationId,
  search,
  page,
  limit,
  status,
  startDate,
  endDate,
}: UsePlanListParams) => {
  return useTQuery<PlanListResponse>({
    queryKey: [GET_PLANS, organizationId, search, page, limit, status, startDate, endDate],
    queryFn: () =>
      planService.getPlans({ organizationId: organizationId!, search, page, limit, status, startDate, endDate }),
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
