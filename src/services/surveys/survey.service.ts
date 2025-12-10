import { surveysRepository } from "@/repository/surveys";

export interface PlanningSurveyOption {
  id: string;
  title: string;
  createdAt: string | null;
  description?: string | null;
}

interface GetPlanningSurveysInput {
  organizationId: string;
  search?: string;
}

const getPlanningSurveys = async ({ organizationId, search }: GetPlanningSurveysInput) => {
  const data = await surveysRepository.getPlanningSurveys({ organizationId, search });

  return data.map((item) => ({
    id: item.id,
    title: item.title,
    createdAt: (item as any)?.created_at ?? null,
    description: (item as any)?.description ?? null,
  })) satisfies PlanningSurveyOption[];
};

export const surveyService = {
  getPlanningSurveys,
};
