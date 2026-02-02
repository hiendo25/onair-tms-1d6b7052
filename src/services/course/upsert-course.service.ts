import { isUndefined } from "lodash";

import { UpsertCourseFormData } from "@/modules/courses/components/ManageCourseForm/upsert-course.schema";
import {
  assignmentBankRepository,
  assignmentsRepository,
  coursesLessonsRepository,
  coursesRepository,
  coursesSectionsRepository,
} from "@/repository";
import { GetCourseByIdResponse } from "@/repository/courses";
import {
  CreateLessonPayload,
  CreatePivotLessonsWithResourcesPayload,
  UpsertLessonPayload,
} from "@/repository/courses-lessons/type";
import { CreateSectionPayload, UpsertSectionPayload } from "@/repository/courses-sections/type";
import { supabase } from "@/services/supabase/client";
export class UpsertCourseService {
  private userId: string;

  private organizationId: string;

  constructor(userId: string, organizationId: string) {
    if (!userId) throw new Error("userId is required");
    if (!organizationId) throw new Error("organizationId is required");
    this.userId = userId;
    this.organizationId = organizationId;
  }

  async create(payload: { formData: UpsertCourseFormData }) {
    const { formData } = payload;
    const _this = this;
    const userId = this.userId;
    const organizationId = this.organizationId;

    const { categories, description, slug, status, title, sections } = formData;

    /**
     * Step 1: Create ClassRoom
     */
    const { data: courseData, error } = await coursesRepository.createCourse({
      organization_id: organizationId,
      created_by: userId,
      title: title,
      slug: slug,
      description: description,
      status: status,
    });

    if (error) {
      console.log("Create Course Failed", error);
      throw new Error("Create Course failed.");
    }

    /**
     * Step 2: Sync Class room with Class Field
     */
    await coursesRepository.createPivotCoursesWithCategories(
      categories.map((categoryId) => ({
        category_id: categoryId,
        course_id: courseData.id,
      })),
    );

    /**
     * Step 3: Create course sections
     */

    await _this.bulkCreateCourseSections(courseData.id, payload.formData.sections);
    await _this.syncCourseAssignments(courseData.id, _this.collectAssignmentBankIds(sections));

    return courseData;
  }

  /**
   * UPDATE
   * @param courseId
   * @param payload
   * @returns
   */

  async update(
    courseId: string,
    payload: {
      formData: UpsertCourseFormData;
    },
  ) {
    const _this = this;

    const { formData } = payload;
    const { categories, description, slug, status, title, sections } = formData;

    const { data: courseDetail, error: courseDetailError } = await coursesRepository.getCourseById(courseId);

    if (courseDetailError || !courseDetail) {
      console.error("Error get course", courseDetailError);
      throw new Error(courseDetailError?.message || `Course ${courseId} not found.`);
    }

    /**
     * Step 1: Update Course
     */
    const courseDataUpdated = await coursesRepository.updateCourse({
      id: courseId,
      title: title,
      slug: slug,
      description: description,
      status: status,
    });

    /**
     * Step 2: Sync Courses with Categories
     */

    await _this.updateCategories({
      courseId: courseDetail.id,
      oldCategories: courseDetail.courses_categories,
      newCategoryIds: categories,
    });

    /**
     * Step 3 Synchronize sections
     * 1. Delete any section in courseDetail that does not exist in formData.sections.
     * 2. Upsert (create or update) sections from formData.
     */

    /**
     * Step 3.1: Delete Sections
     */

    const sectionsDeletion = courseDetail.sections.filter((s) => sections.every((newS) => s.id !== newS.id));
    const sectionsAddition = sections.filter((newS) => !newS.id);

    console.log({ sections: sections, sectionsDeletion, sectionsAddition });

    if (sectionsDeletion.length) {
      const LessonsDeletionIds = sectionsDeletion.reduce<string[]>((sumLessonIds, section) => {
        const lessonIds = section.lessons.map((ls) => ls.id);
        return [...sumLessonIds, ...lessonIds];
      }, []);

      await coursesLessonsRepository.bulkDeleteLessonProgressByLessonIds(LessonsDeletionIds);
      await coursesLessonsRepository.bulkDeleteLessons(LessonsDeletionIds);
      await coursesSectionsRepository.bulkdeleteSections(sectionsDeletion.map((sec) => sec.id));
    }

    /**
     * Step 3.2: UpSert Sections
     */

    await Promise.all(
      sections.map(async (section, _indexSection) => {
        const { data: dataSection, error: errorSection } = await coursesSectionsRepository.upsertSection(
          _this.mapUpsertSectionPayload({
            courseId: courseDetail.id,
            section,
            sectionIndex: _indexSection,
          }),
        );

        if (!dataSection || errorSection) {
          throw new Error(`Upsert section failed ${_indexSection}`);
        }

        const upsertLessonsPromise = (async ({ indexSection, dataSection, newLessons }) => {
          /**
           * To update Lessons in section
           * Check section is update or create (compare id from courseDetail.sections and dataSection)
           * 1. If section is Update:
           *    - Delete lessons in sectionUpdate if lessons that are not included in newLessons.
           *    - Delete pivot records linking those lessons with resources.
           * 2. If section is Create:
           *    - Do nothing.
           * 3. Finally:
           *    - Upsert lessons.
           *    - Sync lessons with their associated resources.
           */

          const sectionId = dataSection.id;

          const sectionUpdate = courseDetail.sections.find((section) => section.id === sectionId);

          if (sectionUpdate) {
            await _this.bulkDeleteLessonsInSection({
              section: sectionUpdate,
              newLessons: newLessons,
            });
          }

          await Promise.all(
            newLessons.map(async (newLesson, _lessonIndex) => {
              const { data: dataLesson, error: errorLesson } = await coursesLessonsRepository.upsertLesson(
                _this.mapUpsertLessonsPayload({
                  sectionId: sectionId,
                  lessonIndex: _lessonIndex,
                  lesson: newLesson,
                }),
              );

              if (!dataLesson || errorLesson) {
                throw new Error(`upsert lesson ${_lessonIndex} failed in section ${indexSection}`);
              }

              const lessonId = newLesson.id;

              if (lessonId) {
                // if newLesson has ID => this is update action.
                const lessonUpdateItem = courseDetail.sections
                  .find((section) => section.id === sectionId)
                  ?.lessons.find((ls) => ls.id === lessonId);

                _this.updateLessonsResources({
                  lessonId: lessonId,
                  oldLessonResources: lessonUpdateItem?.lessons_resources || [],
                  newResources: newLesson.resources,
                });
              } else {
                await coursesLessonsRepository.bulkCreatePivotLessonsWithResources(
                  newLesson.resources.map((resource) => ({
                    lesson_id: dataLesson.id,
                    resource_id: resource.id,
                  })),
                );
              }
            }),
          );
        })({
          indexSection: _indexSection,
          dataSection: dataSection,
          newLessons: section.lessons,
        });
        /**
         * Parallel upsert lessons
         */
        await Promise.all([upsertLessonsPromise]);
      }),
    );
    await _this.syncCourseAssignments(courseId, _this.collectAssignmentBankIds(sections));
    console.log("Update Susscess", courseDataUpdated);
    return courseDataUpdated;
  }

  private async bulkCreateCourseSections(courseId: string, sections: UpsertCourseFormData["sections"]) {
    const _this = this;

    await Promise.all(
      sections.map(async (section, sectionIndex) => {
        try {
          const sectionPayload = _this.mapSectionWithCourse(courseId, section, sectionIndex);
          const { data: sectionData, error: sessionError } = await coursesSectionsRepository.createSection(
            sectionPayload,
          );

          if (sessionError) {
            console.log("Create Session failed", sessionError);
            throw new Error(`Create Classroom Session Failed ${sectionIndex}`);
          }

          /**
           * lessons
           */
          const lessonPromises = (async () => {
            const dataLessons = await coursesLessonsRepository.createLessons(
              _this.mapLessonWithSection(sectionData.id, section.lessons),
            );

            /**
             * sync lesson With Resouce after create success.
             */
            const createPivotLessonsWithResourcesPayload = dataLessons.reduce<CreatePivotLessonsWithResourcesPayload[]>(
              (acc, dataLesson, lessonIndex) => {
                const lessonResources = section.lessons[lessonIndex]?.resources;

                return lessonResources
                  ? [
                    ...acc,
                    ...lessonResources.map((lessonResouce) => ({
                      lesson_id: dataLesson.id,
                      resource_id: lessonResouce.id,
                    })),
                  ]
                  : acc;
              },
              [],
            );
            await coursesLessonsRepository.bulkCreatePivotLessonsWithResources(createPivotLessonsWithResourcesPayload);
          })();

          /**
           * Run all promise in parallel
           */
          await Promise.all([lessonPromises]);
        } catch (error: any) {
          console.error(`Session ${sectionIndex} failed:`, error);
          throw new Error(error?.message);
        }
      }),
    );
  }

  private async updateCategories(variables: {
    newCategoryIds: string[];
    oldCategories: NonNullable<GetCourseByIdResponse["data"]>["courses_categories"];
    courseId: string;
  }) {
    const { newCategoryIds, oldCategories, courseId } = variables;
    const currentCategoriesIds = oldCategories.map((item) => item.categories?.id).filter((item) => !isUndefined(item));

    const categoriesAddition = newCategoryIds.filter((id) => !currentCategoriesIds.includes(id));
    const categoriesDeletation = oldCategories.filter((it) => newCategoryIds.every((id) => id !== it.categories?.id));

    if (categoriesDeletation.length) {
      await coursesRepository.deletePivotCoursesWithCategories(categoriesDeletation.map((it) => it.id));
    }

    if (categoriesAddition.length) {
      await coursesRepository.createPivotCoursesWithCategories(
        categoriesAddition.map((catId) => ({
          category_id: catId,
          course_id: courseId,
        })),
      );
    }
  }

  private async bulkDeleteLessonsInSection(variables: {
    section: NonNullable<GetCourseByIdResponse["data"]>["sections"][number];
    newLessons: UpsertCourseFormData["sections"][number]["lessons"];
  }) {
    const { section, newLessons } = variables;

    const delLessons = section.lessons.filter((lesson) => newLessons.every((newLesson) => newLesson.id !== lesson.id));

    if (!delLessons.length) return;

    const lessonsResourcesIdsDeletion = delLessons.reduce<number[]>((acc, lesson) => {
      return [...acc, ...lesson.lessons_resources.map((lr) => lr.id)];
    }, []);
    await coursesLessonsRepository.bulkDeletePivotLessonsWithResources(lessonsResourcesIdsDeletion);
    await coursesLessonsRepository.bulkDeleteLessonProgressByLessonIds(delLessons.map((lesson) => lesson.id));
    await coursesLessonsRepository.bulkDeleteLessons(delLessons.map((lesson) => lesson.id));
  }

  private async updateLessonsResources(variables: {
    lessonId: string;
    oldLessonResources: NonNullable<
      GetCourseByIdResponse["data"]
    >["sections"][number]["lessons"][number]["lessons_resources"];
    newResources: UpsertCourseFormData["sections"][number]["lessons"][number]["resources"];
  }) {
    const { oldLessonResources, lessonId, newResources } = variables;

    const delLessonsResources = oldLessonResources.filter((lr) => newResources.every((rs) => rs.id !== lr.resource.id));
    const addLessonsResources = newResources.filter((rs) => oldLessonResources.every((lr) => lr.resource.id !== rs.id));

    if (delLessonsResources?.length) {
      await coursesLessonsRepository.bulkDeletePivotLessonsWithResources(delLessonsResources.map((lr) => lr.id));
    }
    if (addLessonsResources.length) {
      await coursesLessonsRepository.bulkCreatePivotLessonsWithResources(
        addLessonsResources.map((lr) => ({
          lesson_id: lessonId,
          resource_id: lr.id,
        })),
      );
    }
  }
  /** --------------------------------------------------------
   *  Helper
   * -------------------------------------------------------- */

  /** --------------------------------------------------------
   *  Helper: Map create session payloads
   * -------------------------------------------------------- */

  private collectAssignmentBankIds(sections: UpsertCourseFormData["sections"]) {
    const assignmentBankIds = new Set<string>();
    sections.forEach((section) => {
      section.lessons.forEach((lesson) => {
        if (lesson.lessonType !== "assessment") return;
        if (!lesson.assignmentBankId) return;
        assignmentBankIds.add(lesson.assignmentBankId);
      });
    });
    return Array.from(assignmentBankIds);
  }

  private async syncCourseAssignments(courseId: string, assignmentBankIds: string[]) {
    const uniqueBankIds = Array.from(new Set(assignmentBankIds));
    const { data: existingAssignments, error } = await assignmentsRepository.getAssignmentCoursesByCourseId(courseId);

    if (error) {
      throw new Error(`Failed to fetch course assignments: ${error.message}`);
    }

    const existingRows = (existingAssignments ?? []).filter(
      (item) => Boolean(item.assignment_config?.assignment_bank_id),
    );
    const existingMap = new Map(
      existingRows.map((item) => [item.assignment_config!.assignment_bank_id as string, item.assignment_config_id]),
    );
    const incomingSet = new Set(uniqueBankIds);

    const assignmentConfigIdsToDelete = existingRows
      .filter((item) => !incomingSet.has(item.assignment_config!.assignment_bank_id as string))
      .map((item) => item.assignment_config_id);

    if (assignmentConfigIdsToDelete.length) {
      await assignmentsRepository.deleteAssignmentCoursesByAssignmentConfigIds(courseId, assignmentConfigIdsToDelete);
    }

    const assignmentBankIdsToCreate = uniqueBankIds.filter((bankId) => !existingMap.has(bankId));
    if (!assignmentBankIdsToCreate.length) {
      return;
    }

    const assignmentConfigs = await Promise.all(
      assignmentBankIdsToCreate.map(async (assignmentBankId) => {
        const assignmentBank = await assignmentBankRepository.getAssignmentBankById(
          assignmentBankId,
          this.organizationId,
        );

        if (!assignmentBank) {
          throw new Error("Không tìm thấy bài kiểm tra");
        }

        return assignmentsRepository.createAssignmentFromBankWithClient({
          assignment_bank_id: assignmentBankId,
          assigned_by: this.userId,
          organization_id: this.organizationId,
          attempt_duration_minutes: assignmentBank.duration_minutes ?? null,
          attempt_limit: 1,
          available_from: null,
          available_to: null,
          status: "open",
          scope: "course",
        });
      }),
    );

    await assignmentsRepository.createAssignmentCourses(
      assignmentConfigs.map((assignment) => ({
        assignment_config_id: assignment.id,
        course_id: courseId,
      })),
    );
  }

  private mapSectionWithCourse(
    courseId: string,
    section: UpsertCourseFormData["sections"][number],
    index: number,
  ): CreateSectionPayload {
    return {
      title: section.title,
      description: section.description,
      status: section.status,
      priority: index + 1,
      course_id: courseId,
    };
  }

  /** --------------------------------------------------------
   *  Helper: Map Lesson with section payloads
   * -------------------------------------------------------- */
  private mapLessonWithSection(
    sessionId: string,
    lessons: UpsertCourseFormData["sections"][number]["lessons"],
  ): CreateLessonPayload[] {
    return lessons.map<CreateLessonPayload>((lesson, _index) => ({
      content: lesson.content,
      lesson_type: lesson.lessonType,
      priority: _index + 1,
      status: lesson.status,
      title: lesson.title,
      section_id: sessionId,
      main_resource: lesson.mainResource?.id || null,
      assignment_id: lesson.assignmentBankId || null,
    }));
  }

  /** --------------------------------------------------------
   *  Helper: Map Lessons with session payloads
   * -------------------------------------------------------- */
  private mapBulkUpsertLessonsPayload(
    sectionId: string,
    lessons: UpsertCourseFormData["sections"][number]["lessons"],
  ): UpsertLessonPayload[] {
    return lessons.map<UpsertLessonPayload>((lesson, lessonIndex) => {
      const lessonId = lesson.id;
      if (lessonId) {
        return {
          action: "update",
          payload: {
            id: lessonId,
            title: lesson.title,
            lesson_type: lesson.lessonType,
            content: lesson.content,
            main_resource: lesson.mainResource?.id ?? null,
            assignment_id: lesson.assignmentBankId ?? null,
            priority: lessonIndex + 1,
            status: lesson.status,
          },
        };
      } else {
        return {
          action: "create",
          payload: {
            title: lesson.title,
            lesson_type: lesson.lessonType,
            content: lesson.content,
            main_resource: lesson.mainResource?.id ?? null,
            assignment_id: lesson.assignmentBankId ?? null,
            priority: lessonIndex + 1,
            status: lesson.status,
            section_id: sectionId,
          },
        };
      }
    });
  }

  private mapUpsertLessonsPayload(params: {
    sectionId: string;
    lesson: UpsertCourseFormData["sections"][number]["lessons"][number];
    lessonIndex: number;
  }): UpsertLessonPayload {
    const { lesson, lessonIndex, sectionId } = params;
    return lesson.id
      ? {
        action: "update",
        payload: {
          id: lesson.id,
          title: lesson.title,
          lesson_type: lesson.lessonType,
          content: lesson.content,
          main_resource: lesson.mainResource?.id ?? null,
          assignment_id: lesson.assignmentBankId ?? null,
          priority: lessonIndex + 1,
          status: lesson.status,
        },
      }
      : {
        action: "create",
        payload: {
          section_id: sectionId,
          title: lesson.title,
          lesson_type: lesson.lessonType,
          content: lesson.content,
          main_resource: lesson.mainResource?.id ?? null,
          assignment_id: lesson.assignmentBankId ?? null,
          priority: lessonIndex + 1,
          status: lesson.status,
        },
      };
  }

  /**
   *
   * Helper: Map Upsert section payload
   *
   */
  private mapUpsertSectionPayload(params: {
    courseId: string;
    section: UpsertCourseFormData["sections"][number];
    sectionIndex: number;
  }): UpsertSectionPayload {
    const { courseId, section, sectionIndex } = params;
    return section.id
      ? {
        action: "update",
        payload: {
          id: section.id,
          description: section.description,
          priority: sectionIndex + 1, // update new priority
          status: section.status,
          title: section.title,
        },
      }
      : {
        action: "create",
        payload: {
          course_id: courseId,
          description: section.description,
          priority: sectionIndex + 1, // update new priority
          status: section.status,
          title: section.title,
        },
      };
  }
}
