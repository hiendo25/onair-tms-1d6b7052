import { surveysRepository } from "@/repository/surveys";
import { PaginatedResult, PaginationParams } from "@/types/dto/pagination.dto";

export interface PlanningSurveyOption {
  id: string;
  title: string;
  createdAt: string | null;
  description?: string | null;
}

export type PlanningSurveyListResponse = PaginatedResult<PlanningSurveyOption>;

interface GetPlanningSurveysInput extends PaginationParams {
  organizationId: string;
  search?: string;
}

const getPlanningSurveys = async ({ organizationId, search, page = 1, limit = 10 }: GetPlanningSurveysInput) => {
  const { data, total } = await surveysRepository.getPlanningSurveys({ organizationId, search, page, limit });

  return {
    data: data.map((item) => ({
      id: item.id,
      title: item.title,
      createdAt: (item as any)?.created_at ?? null,
      description: (item as any)?.description ?? null,
    })),
    total,
    page,
    limit,
  } satisfies PlanningSurveyListResponse;
};

export const surveyService = {
  getPlanningSurveys,
};
