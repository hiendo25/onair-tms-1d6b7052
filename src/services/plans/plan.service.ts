import { PlanFormSchema } from "@/modules/plans/plan-form.schema";
import { PlanDetailDto, PlanListItem, PlanProgramDetail, PlanTopicDetail } from "@/modules/plans/types";
import { plansRepository } from "@/repository/plans";
interface GetPlansInput {
  organizationId: string;
  search?: string;
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

  async create(form: PlanFormSchema) {
    if (!form.programs || form.programs.length === 0) {
      throw new Error("Kế hoạch cần ít nhất 1 chương trình đào tạo");
    }

    const planPayload = {
      name: form.info.name,
      objective: form.info.objective || null,
      start_date:form.info.startDate || null,
      end_date:form.info.endDate || null,
      budget: form.info.budget ?? null,
      status: "pending" as const,
      organization_id: this.organizationId,
      created_by: this.userId,
      survey_id: form.info.survey?.id ?? null,
    };

    const programs = this.buildProgramsPayload(form);
    const planRow = await plansRepository.insertPlan(planPayload);

    try {
      await Promise.all(
        programs.map(async (program) => {
          const { topics, courses, ...programFields } = program;
          const programRow = await plansRepository.insertProgram({
            ...programFields,
            plan_id: planRow.id,
          });

          const tasks: Promise<unknown>[] = [];

          if (courses.length > 0) {
            tasks.push(
              plansRepository.insertProgramCourses(
                courses.map(courseId => ({ program_id: programRow.id, course_id: courseId })),
              ),
            );
          }

          if (topics.length > 0) {
            tasks.push(
              Promise.all(
                topics.map(async (topic) => {
                  const { courses: topicCourses, ...topicFields } = topic;
                  const topicRow = await plansRepository.insertTopic({
                    ...topicFields,
                    program_id: programRow.id,
                  });

                  if (topicCourses.length > 0) {
                    await plansRepository.insertTopicCourses(
                      topicCourses.map(courseId => ({ topic_id: topicRow.id, course_id: courseId })),
                    );
                  }
                }),
              ),
            );
          }

          await Promise.all(tasks);
        }),
      );

      return planRow;
    } catch (error) {
      await plansRepository.deletePlan(planRow.id);
      throw error;
    }
  }

  async update(id: string, form: PlanFormSchema) {
    const planPayload = {
      name: form.info.name,
      objective: form.info.objective || null,
      start_date: form.info.startDate || null,
      end_date: form.info.endDate ||null,
      budget: form.info.budget ?? null,
      status: "pending" as const,
      organization_id: this.organizationId,
      created_by: this.userId,
      survey_id: form.info.survey?.id ?? null,
    };

    const programs = this.buildProgramsPayload(form);

    await plansRepository.updatePlanRow(id, planPayload);
    await plansRepository.deleteProgramsByPlan(id);

    await Promise.all(
      programs.map(async (program) => {
        const { topics, courses, ...programFields } = program;
        const programRow = await plansRepository.insertProgram({
          ...programFields,
          plan_id: id,
        });

        const tasks: Promise<unknown>[] = [];

        if (courses.length > 0) {
          tasks.push(
            plansRepository.insertProgramCourses(
              courses.map(courseId => ({ program_id: programRow.id, course_id: courseId })),
            ),
          );
        }

        if (topics.length > 0) {
          tasks.push(
            Promise.all(
              topics.map(async (topic) => {
                const { courses: topicCourses, ...topicFields } = topic;
                const topicRow = await plansRepository.insertTopic({
                  ...topicFields,
                  program_id: programRow.id,
                });

                if (topicCourses.length > 0) {
                  await plansRepository.insertTopicCourses(
                    topicCourses.map(courseId => ({ topic_id: topicRow.id, course_id: courseId })),
                  );
                }
              }),
            ),
          );
        }

        await Promise.all(tasks);
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
  private static mapPlanList(rows: Awaited<ReturnType<typeof plansRepository.getPlans>>): PlanListItem[] {
    return rows.map(row => {
      const programs = row.training_plan_programs || [];
      const topicsCount = programs.reduce((acc, program) => acc + (program.training_plan_topics?.length || 0), 0);

      return {
        id: row.id,
        name: row.name,
        objective: row.objective,
        startDate: row.start_date,
        endDate: row.end_date,
        budget: row.budget,
        status: row.status,
        programsCount: programs.length,
        topicsCount,
      };
    });
  }

  private static mapPlanDetail(
    row: Awaited<ReturnType<typeof plansRepository.getPlanDetail>>,
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

    const topicsCount = programs.reduce((acc, p) => acc + (p.topics?.length || 0), 0);
    const coursesCount = programs.reduce((acc, p) => {
      const topicCourses = p.topics.reduce((topicAcc, t) => topicAcc + (t.courses?.length || 0), 0);
      const programCourses = p.courses?.length || 0;
      return acc + topicCourses + programCourses;
    }, 0);
    const approverName = (row as any)?.approved_by_employee?.profile?.full_name;

    return {
      id: row.id,
      name: row.name,
      objective: row.objective,
      startDate: row.start_date,
      endDate: row.end_date,
      createdAt:row.created_at,
      budget: row.budget,
      status: row.status,
      approver: approverName || row.approved_by,
      programsCount: programs.length,
      topicsCount,
      coursesCount,
      instructorsCount: 0,
      programs,
    };
  }

  static async getPlans(params: GetPlansInput) {
    const data = await plansRepository.getPlans(params);
    return PlanService.mapPlanList(data);
  }

  static async getPlanDetail(id: string) {
    const data = await plansRepository.getPlanDetail(id);
    return PlanService.mapPlanDetail(data);
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
  updatePlan: (id: string, payload: { form: PlanFormSchema; organizationId: string; createdBy: string }) =>
    new PlanService(payload.organizationId, payload.createdBy).update(id, payload.form),
};

export { PlanService };
