import { PlanStatus } from "@/model/plan.model";
import { PlanFormSchema } from "@/modules/plans/plan-form.schema";
import { mapPlanDetailToFormValues } from "@/modules/plans/plan-form.utils";
import {
  PlanDetailCounts,
  PlanDetailDto,
  PlanListItem,
  PlanListResponse,
  PlanProgramDetail,
  PlanTopicDetail,
} from "@/modules/plans/types";
import { createCourse } from "@/repository/courses";
import { plansRepository } from "@/repository/plans";
import { slugify } from "@/utils/slugify";
interface GetPlansInput {
  organizationId: string;
  search?: string;
  page?: number;
  limit?: number;
  status?: PlanStatus | "all";
}

class PlanService {
  private organizationId: string;
  private userId: string;

  constructor(organizationId: string, userId: string) {
    if (!organizationId) throw new Error("organizationId is required");
    if (!userId) throw new Error("createdBy is required");
    this.organizationId = organizationId;
    this.userId = userId;
  }

  async create(form: PlanFormSchema, statusOverride?: PlanStatus) {
    const hasSurvey = !!form.info.survey;
    const surveyClosed = form.info.survey?.status === "closed";
    const canSkipPrograms = hasSurvey && !surveyClosed;
    if (!canSkipPrograms && (!form.programs || form.programs.length === 0)) {
      throw new Error("Kế hoạch cần ít nhất 1 chương trình đào tạo");
    }

    const nextStatus: PlanStatus =
      statusOverride
        ? statusOverride
        : hasSurvey
          ? (surveyClosed ? "pending" as const : "pending_survey" as const)
          : "pending";

    const planPayload = this.buildPlanRowPayload(form, nextStatus);

    const programs = this.buildProgramsPayload(form);
    const planRow = await plansRepository.insertPlan(planPayload);

    try {
      await this.insertProgramsWithRelations(planRow.id, programs);

      if (form.info.survey) {
        await plansRepository.replacePlanSurvey(planRow.id, this.buildSurveyPayload(planRow.id, form.info.survey));
      } else {
        await plansRepository.deletePlanSurveyByPlan(planRow.id);
      }

      return planRow;
    } catch (error) {
      await plansRepository.deleteProgramsByPlan(planRow.id);
      await plansRepository.deletePlanSurveyByPlan(planRow.id);
      await plansRepository.deletePlan(planRow.id);
      throw error;
    }
  }

  async createDraftCourse(title: string, description?: string | null) {
    const trimmedTitle = title?.trim();
    if (!trimmedTitle) {
      throw new Error("Tên môn học không được bỏ trống");
    }

    const slug = `${slugify(trimmedTitle) || "course"}-${Date.now()}`;
    const { data, error } = await createCourse({
      title: trimmedTitle,
      description: description?.trim() || null,
      organization_id: this.organizationId,
      created_by: this.userId,
      status: "draft",
      slug,
    });

    if (error || !data) {
      throw new Error(error?.message || "Không thể tạo môn học nháp");
    }

    return data;
  }

  async update(id: string, form: PlanFormSchema, status?: PlanStatus) {
    const originalDetail = await PlanService.getPlanDetail(id);
    const originalForm = mapPlanDetailToFormValues(originalDetail);

    const hasSurvey = !!form.info.survey;
    const surveyClosed = form.info.survey?.status === "closed";
    const nextStatus: PlanStatus =
      status
        ? status
        : hasSurvey
          ? surveyClosed
            ? "pending"
            : "pending_survey"
          : "pending";

    const planPayload = this.buildPlanRowPayload(form, nextStatus);

    const programs = this.buildProgramsPayload(form);

    try {
      await plansRepository.updatePlanRow(id, planPayload);
      await plansRepository.deleteProgramsByPlan(id);

      await this.insertProgramsWithRelations(id, programs);

      if (form.info.survey) {
        await plansRepository.replacePlanSurvey(id, this.buildSurveyPayload(id, form.info.survey));
      } else {
        await plansRepository.deletePlanSurveyByPlan(id);
      }
    } catch (error) {
      // Attempt best-effort rollback to original state
      await plansRepository.deleteProgramsByPlan(id);
      const originalPrograms = this.buildProgramsPayload(originalForm);
      await this.insertProgramsWithRelations(id, originalPrograms);

      const originalPlanPayload = this.buildPlanRowPayload(originalForm, originalDetail.status);
      await plansRepository.updatePlanRow(id, originalPlanPayload);

      if (originalForm.info.survey) {
        await plansRepository.replacePlanSurvey(id, this.buildSurveyPayload(id, originalForm.info.survey));
      } else {
        await plansRepository.deletePlanSurveyByPlan(id);
      }
      throw error;
    }
  }

  private async insertProgramsWithRelations(planId: string, programs: ReturnType<PlanService["buildProgramsPayload"]>) {
    await Promise.all(
      programs.map(async (program) => {
        const { topics = [], courses = [], ...programFields } = program;

        const programRow = await plansRepository.insertProgram({
          ...programFields,
          plan_id: planId,
        });

        const programCoursesPromise =
          courses.length > 0
            ? plansRepository.insertProgramCourses(
              courses.map((courseId) => ({
                program_id: programRow.id,
                course_id: courseId,
              })),
            )
            : Promise.resolve();

        const topicsPromise = Promise.all(
          topics.map(async (topic) => {
            const { courses: topicCourses = [], ...topicFields } = topic;

            const topicRow = await plansRepository.insertTopic({
              ...topicFields,
              program_id: programRow.id,
            });

            if (topicCourses.length > 0) {
              await plansRepository.insertTopicCourses(
                topicCourses.map((courseId) => ({
                  topic_id: topicRow.id,
                  course_id: courseId,
                })),
              );
            }
          }),
        );

        await Promise.all([programCoursesPromise, topicsPromise]);
      }),
    );
  }

  private buildProgramsPayload(form: PlanFormSchema) {
    return form.programs.map((program, programIndex) => ({
      name: program.name,
      description: program.description || null,
      start_date: (program.startDate) || null,
      end_date: (program.endDate) || null,
      order_index: programIndex,
      courses: program.courses?.map(course => course.id).filter(Boolean) || [],
      topics:
        program.topics?.map((topic, topicIndex) => ({
          name: topic.name,
          description: topic.description || null,
          order_index: topicIndex,
          courses: topic.courses?.map(course => course.id).filter(Boolean) || [],
        })) || [],
    }));
  }

  private buildPlanRowPayload(form: PlanFormSchema, status: PlanStatus) {
    return {
      name: form.info.name,
      objective: form.info.objective || null,
      start_date: form.info.startDate || null,
      end_date: form.info.endDate || null,
      budget: form.info.budget ?? null,
      status,
      organization_id: this.organizationId,
      created_by: this.userId,
      survey_id: form.info.survey?.id ?? null,
    };
  }

  private buildSurveyPayload(planId: string, survey: NonNullable<PlanFormSchema["info"]["survey"]>) {
    return {
      plan_id: planId,
      survey_id: survey.id,
      organization_id: this.organizationId,
      created_by: this.userId,
      start_date: survey.startDate ?? null,
      end_date: survey.endDate ?? null,
      status: survey.status ?? "pending",
      target_type: survey.targetType ?? "all",
      target_unit_ids: survey.targetUnitIds?.length ? survey.targetUnitIds : null,
    };
  }
  private static mapPlanList(rows: Awaited<ReturnType<typeof plansRepository.getPlans>>["data"]): PlanListItem[] {
    return rows.map(row => {
      return {
        id: row.id,
        name: row.name,
        objective: row.objective,
        startDate: row.start_date,
        endDate: row.end_date,
        budget: row.budget,
        status: row.status,
      };
    });
  }

  private static mapPlanDetail(
    row: Awaited<ReturnType<typeof plansRepository.getPlanDetail>>,
    counts?: PlanDetailCounts,
  ): PlanDetailDto {
    const programs: PlanProgramDetail[] =
      row.training_plan_programs?.map(program => {
        const topics: PlanTopicDetail[] =
          program.training_plan_topics?.map(topic => ({
            id: topic.id,
            name: topic.name,
            description: topic.description,
            orderIndex: topic.order_index,
            courses:
              (topic.training_plan_topic_courses
                ?.map(tc => ({
                  id: tc.course?.id || tc.course_id || "",
                  title: tc.course?.title || "Môn học",
                }))
                .filter(course => !!course.id)) || [],
          })) || [];

        const programCourses =
          program.training_plan_program_courses
            ?.map(pc => ({
              id: pc.course?.id || pc.course_id || "",
              title: pc.course?.title || "Môn học",
            }))
            .filter(course => !!course.id) || [];

        return {
          id: program.id,
          name: program.name,
          description: program.description,
          startDate: program.start_date,
          endDate: program.end_date,
          orderIndex: program.order_index,
          courses: programCourses,
          topics,
        };
      }) || [];

    const approverName = (row as any)?.approved_by_employee?.profile?.full_name;
    const planSurvey = (row as any)?.training_plan_surveys?.[0];
    const surveyDetail = planSurvey
      ? {
        id: planSurvey.id,
        surveyId: planSurvey.survey_id,
        surveyTitle: planSurvey?.survey?.title || "",
        surveyCreatedAt: planSurvey?.survey?.created_at ?? null,
        startDate: planSurvey.start_date,
        endDate: planSurvey.end_date,
        status: planSurvey.status,
        targetType: planSurvey.target_type,
        targetUnitIds: planSurvey.target_unit_ids,
      }
      : null;

    return {
      id: row.id,
      name: row.name,
      objective: row.objective,
      startDate: row.start_date,
      endDate: row.end_date,
      createdAt: row.created_at,
      budget: row.budget,
      status: row.status,
      approver: approverName || row.approved_by,
      programsCount: counts?.programsCount ?? 0,
      topicsCount: counts?.topicsCount ?? 0,
      coursesCount: counts?.coursesCount ?? 0,
      instructorsCount: counts?.instructorsCount ?? 0,
      programs,
      survey: surveyDetail,
    };
  }

  static async getPlans(params: GetPlansInput) {
    const [{ data, total }, stats] = await Promise.all([
      plansRepository.getPlans(params),
      plansRepository.getPlanStatusCounts(params),
    ]);

    return {
      data: PlanService.mapPlanList(data),
      total,
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      stats,
    } satisfies PlanListResponse;
  }

  static async getPlanDetail(id: string) {
    const [data, counts] = await Promise.all([
      plansRepository.getPlanDetail(id),
      plansRepository.getPlanDetailCounts(id),
    ]);
    return PlanService.mapPlanDetail(data, counts);
  }

  static async getCourseOptions(organizationId: string) {
    const data = await plansRepository.getCourseOptions(organizationId);
    return data.map(course => ({
      id: course.id,
      title: course.title || "Chưa đặt tên",
    }));
  }

  static async deletePlan(id: string) {
    return plansRepository.deletePlan(id);
  }
}

export const planService = {
  getPlans: PlanService.getPlans,
  getPlanDetail: PlanService.getPlanDetail,
  getCourseOptions: PlanService.getCourseOptions,
  deletePlan: PlanService.deletePlan,
  createPlan: (payload: { form: PlanFormSchema; organizationId: string; createdBy: string }) =>
    new PlanService(payload.organizationId, payload.createdBy).create(payload.form),
  createPlanWithStatus: (
    payload: { form: PlanFormSchema; organizationId: string; createdBy: string; status?: PlanStatus },
  ) =>
    new PlanService(payload.organizationId, payload.createdBy).create(payload.form, payload.status),
  createDraftCourse: (
    payload: { title: string; description?: string | null; organizationId: string; createdBy: string },
  ) =>
    new PlanService(payload.organizationId, payload.createdBy).createDraftCourse(payload.title, payload.description),
  updatePlan: (
    id: string,
    payload: { form: PlanFormSchema; organizationId: string; createdBy: string; status?: PlanStatus },
  ) =>
    new PlanService(payload.organizationId, payload.createdBy).update(id, payload.form, payload.status),
};

export { PlanService };
