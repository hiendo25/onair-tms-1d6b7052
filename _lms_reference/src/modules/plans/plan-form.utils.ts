import { PlanFormSchema } from "./plan-form.schema";
import { PlanDetailDto } from "./types";

const createEmptyPlanForm = (): PlanFormSchema => ({
  info: {
    name: "",
    objective: "",
    startDate: null,
    endDate: null,
    budget: undefined,
    survey: undefined,
  },
  programs: [],
});

export const buildPlanFormDefaultValues = (initialData?: PlanFormSchema): PlanFormSchema => {
  if (!initialData) return createEmptyPlanForm();

  return {
    info: {
      name: initialData.info?.name ?? "",
      objective: initialData.info?.objective ?? "",
      startDate: initialData.info?.startDate ?? null,
      endDate: initialData.info?.endDate ?? null,
      budget: initialData.info?.budget,
      survey: initialData.info?.survey
        ? {
          ...initialData.info.survey,
          targetType: initialData.info.survey.targetType ?? "all",
          targetUnitIds: initialData.info.survey.targetUnitIds ?? [],
          createdAt: initialData.info.survey.createdAt ?? null,
          resultSummary: initialData.info.survey.resultSummary ?? null,
        }
        : undefined,
    },
    programs: (initialData.programs ?? []).map((program) => ({
      name: program.name ?? "",
      description: program.description ?? "",
      startDate: program.startDate ?? null,
      endDate: program.endDate ?? null,
      courses: program.courses ?? [],
      topics: (program.topics ?? []).map((topic) => ({
        name: topic.name ?? "",
        description: topic.description ?? "",
        courses: topic.courses ?? [],
      })),
    })),
  };
};

export const mapPlanDetailToFormValues = (planDetail: PlanDetailDto): PlanFormSchema => ({
  info: {
    name: planDetail.name,
    objective: planDetail.objective ?? "",
    startDate: planDetail.startDate,
    endDate: planDetail.endDate,
    budget: planDetail.budget ?? undefined,
    survey: planDetail.survey
      ? {
        id: planDetail.survey.surveyId,
        title: planDetail.survey.surveyTitle,
        planSurveyId: planDetail.survey.id,
        createdAt: planDetail.survey.surveyCreatedAt ?? null,
        startDate: planDetail.survey.startDate,
        endDate: planDetail.survey.endDate,
        status: planDetail.survey.status,
        targetType: planDetail.survey.targetType ?? "all",
        targetUnitIds: planDetail.survey.targetUnitIds ?? [],
        resultSummary: planDetail.survey.resultSummary ?? null,
      }
      : undefined,
  },
  programs:
    planDetail.programs?.map((program) => {
      const mappedTopics =
        program.topics?.map((topic) => ({
          name: topic.name,
          description: topic.description ?? "",
          courses: topic.courses?.map((course) => ({ id: course.id, title: course.title })) || [],
        })) || [];

      const isSyntheticTopic =
        mappedTopics.length === 1 && mappedTopics?.[0]?.name === program.name;

      return {
        name: program.name,
        description: program.description ?? "",
        startDate: program.startDate,
        endDate: program.endDate,
        courses: isSyntheticTopic ? mappedTopics?.[0]?.courses : program.courses || [],
        topics: isSyntheticTopic ? [] : mappedTopics,
      };
    }) || [],
});
