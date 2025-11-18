"use client";
import {
  coursesRepository,
  coursesMetaRepository,
  coursesLessonsRepository,
  coursesSectionsRepository,
} from "@/repository";
import { enqueueSnackbar } from "notistack";

import { UpsertCourseFormData } from "../components/ManageCourseForm/upsert-course.schema";
import { useUserOrganization } from "@/modules/organization/store/UserOrganizationProvider";
import { useTMutation } from "@/lib";
import { UpsertCourseStore } from "../store/upsert-course-store";

import { CreateSectionPayload, UpsertSectionPayload } from "@/repository/courses-sections/type";
import {
  CreateLessonPayload,
  CreatePivotLessonsWithResourcesPayload,
  UpsertLessonPayload,
} from "@/repository/courses-lessons/type";
import dayjs from "dayjs";
import { UpSertCourseMetaPayload } from "@/repository/courses-meta";
import { isUndefined } from "lodash";

const useUpsertCourse = () => {
  const userInfo = useUserOrganization((state) => state.data);

  const { mutate: doCreateCourse, isPending } = useTMutation({
    mutationKey: ["CREATE_COURSE"],
    mutationFn: async (payload: { formData: UpsertCourseFormData }) => {
      const { formData } = payload;
      const { categories, description, slug, status, title, sections } = formData;

      /**
       * Step 1: Create ClassRoom
       */
      const { data: courseData, error } = await coursesRepository.createCourse({
        organization_id: userInfo.organization.id,
        created_by: userInfo.id,
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

      await Promise.all(
        sections.map(async (section, sectionIndex) => {
          try {
            const sectionPayload = mapSectionWithCourse(courseData.id, section, sectionIndex);

            const { data: sectionData, error: sessionError } = await coursesSectionsRepository.createSection(
              sectionPayload,
            );

            if (sessionError) {
              console.log("Create Session failed", sessionError);
              throw new Error("Create Classroom Session Failed");
            }

            /**
             * lessons
             */
            const lessonPromises = (async () => {
              const { data: dataLessons, error: agendaError } = await coursesLessonsRepository.createLessons(
                mapLessonWithSection(sectionData.id, section.lessons),
              );

              if (!dataLessons || agendaError) {
                throw new Error(`Create Lessons for Section index ${sectionIndex} failed.`);
              }
              /**
               * sync lesson With Resouce after create success.
               */
              const createPivotLessonsWithResourcesPayload = dataLessons.reduce<
                CreatePivotLessonsWithResourcesPayload[]
              >((acc, dataLesson, lessonIndex) => {
                const lessonResources = section.lessons[lessonIndex]?.resources;
                if (lessonResources) {
                  acc = [
                    ...acc,
                    ...lessonResources.map((lessonResouce) => ({
                      lesson_id: dataLesson.id,
                      resource_id: lessonResouce.id,
                    })),
                  ];
                }
                return acc;
              }, []);
              const { data, error: lessonWithResouceError } =
                await coursesLessonsRepository.bulkCreatePivotLessonsWithResources(
                  createPivotLessonsWithResourcesPayload,
                );
              if (lessonWithResouceError) {
                throw new Error("Sync Lessons with Resouces Failed");
              }
            })();

            /**
             * Run all promise in parallel
             */
            await Promise.all([lessonPromises]);
          } catch (err) {
            console.error(`Session ${sectionIndex} failed:`, error);
            throw error;
          }
        }),
      );
      console.log("Create course success", courseData);
      return courseData;
    },
    onError: (error) => {
      enqueueSnackbar({ message: error.message, variant: "error" });
    },
  });

  const { mutate: doUpdate, isPending: isPendingUpdate } = useTMutation({
    mutationKey: ["UPDATE_COURSE"],
    mutationFn: async (payload: { courseId: string; formData: UpsertCourseFormData }) => {
      const { formData, courseId } = payload;

      const { data: courseDetail, error: courseDetailError } = await coursesRepository.getCourseById(courseId);
      console.log(courseDetail);

      if (!courseDetail) {
        throw new Error(`Course ${courseId} not found.`);
      }

      const { categories, description, slug, status, title, sections } = formData;

      /**
       * Step 1: Create Course
       */
      const { data: courseDataUpdated, error: updateError } = await coursesRepository.updateCourse({
        id: courseId,
        title: title,
        slug: slug,
        description: description,
        status: status,
      });

      if (updateError) {
        console.error(updateError);
        throw new Error("Update course failed.");
      }

      /**
       * Step 2: Sync Courses with Categories
       */

      const currentCategories = [...courseDetail.courses_categories];
      const currentCategoriesIds = currentCategories
        .map((item) => item.categories?.id)
        .filter((item) => !isUndefined(item));

      const categoriesAddition = categories.filter((id) => !currentCategoriesIds.includes(id));
      const categoriesDeletation = currentCategories.filter((it) => categories.every((id) => id !== it.categories?.id));

      if (categoriesDeletation.length) {
        await coursesRepository.deletePivotCoursesWithCategories(categoriesDeletation.map((it) => it.id));
      }

      if (categoriesAddition.length) {
        await coursesRepository.createPivotCoursesWithCategories(
          categoriesAddition.map((catId) => ({
            category_id: catId,
            course_id: courseDetail.id,
          })),
        );
      }

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

        await coursesLessonsRepository.bulkDeleteLessons(LessonsDeletionIds);
        await coursesSectionsRepository.bulkdeleteSections(sectionsDeletion.map((sec) => sec.id));
      }

      /**
       * Step 3.2: UpSert Sections
       */

      await Promise.all(
        sections.map(async (section, _indexSection) => {
          const upsertSectionPayload: UpsertSectionPayload = mapUpsertSectionPayload({
            courseId: courseDetail.id,
            section,
            sectionIndex: _indexSection,
          });
          const { data: dataSection, error: errorSection } = await coursesSectionsRepository.upsertSection(
            upsertSectionPayload,
          );

          if (!dataSection || errorSection) {
            throw new Error(`Upsert section failed ${_indexSection}`);
          }

          /**
           * Update Lessons
           * 1. If sectionUpdate exists:
           *    - Delete lessons in sectionUpdate.lessons that are not included in newLessons.
           *    - Delete pivot records linking those lessons with resources.
           * 2. If sectionUpdate does not exist:
           *    - Do nothing.
           * 3. Finally:
           *    - Upsert lessons.
           *    - Sync lessons with their associated resources.
           */

          const upsertLessonsPromise = (async (sectionId: string, sectionIndex: number) => {
            const sectionUpdate = courseDetail.sections.find((section) => section.id === sectionId);
            const newLessons = [...section.lessons];
            if (sectionUpdate) {
              const lessonsDeletion = sectionUpdate.lessons.filter((lesson) =>
                newLessons.every((newLesson) => newLesson.id !== lesson.id),
              );

              if (lessonsDeletion.length) {
                const lessonsResourcesIdsDeletion = lessonsDeletion.reduce<number[]>((acc, lesson) => {
                  return [...acc, ...lesson.lessons_resources.map((lr) => lr.id)];
                }, []);
                await coursesLessonsRepository.bulkDeletePivotLessonsWithResources(lessonsResourcesIdsDeletion);
                await coursesLessonsRepository.bulkDeleteLessons(lessonsDeletion.map((lesson) => lesson.id));
              }
            }

            await Promise.all(
              newLessons.map(async (newLesson, _lessonIndex) => {
                const isUpdateLesson = Boolean(newLesson.id);
                const upsertLessonPayload: UpsertLessonPayload = mapUpsertLessonsPayload({
                  sectionId: sectionId,
                  lessonIndex: _lessonIndex,
                  lesson: newLesson,
                });

                const { data: dataLesson, error: errorLesson } = await coursesLessonsRepository.upsertLesson(
                  upsertLessonPayload,
                );

                if (!dataLesson || errorLesson) {
                  throw new Error(`upsert lesson ${_lessonIndex} failed in section ${sectionIndex}`);
                }

                if (isUpdateLesson) {
                  const lessonUpdateItem = courseDetail.sections
                    .find((section) => section.id === sectionId)
                    ?.lessons.find((ls) => ls.id === dataLesson.id);

                  const lessonResoucesDeletion = lessonUpdateItem?.lessons_resources.filter((lr) =>
                    newLesson.resources.every((rs) => rs.id !== lr.resource.id),
                  );
                  const resourcesAddition = newLesson.resources.filter((rs) =>
                    lessonUpdateItem?.lessons_resources.every((lr) => lr.resource.id !== rs.id),
                  );

                  if (lessonResoucesDeletion?.length) {
                    await coursesLessonsRepository.bulkDeletePivotLessonsWithResources(
                      lessonResoucesDeletion.map((lr) => lr.id),
                    );
                  }
                  if (resourcesAddition.length) {
                    await coursesLessonsRepository.bulkCreatePivotLessonsWithResources(
                      resourcesAddition.map((lr) => ({
                        lesson_id: dataLesson.id,
                        resource_id: lr.id,
                      })),
                    );
                  }
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
          })(dataSection.id, _indexSection);
          /**
           * Parallel upsert lessons
           */
          await Promise.all([upsertLessonsPromise]);
        }),
      );
      console.log("Update Susscess", courseDataUpdated);
      return courseDataUpdated;
    },
    onError: (error) => {
      enqueueSnackbar({ message: error.message, variant: "error" });
    },
  });

  /** --------------------------------------------------------
   *  Helper: Map create session payloads
   * -------------------------------------------------------- */

  const mapSectionWithCourse = (
    courseId: string,
    section: UpsertCourseFormData["sections"][number],
    index: number,
  ): CreateSectionPayload => {
    return {
      title: section.title,
      description: section.description,
      status: section.status,
      priority: index + 1,
      course_id: courseId,
    };
  };

  /** --------------------------------------------------------
   *  Helper: Map Lesson with section payloads
   * -------------------------------------------------------- */
  const mapLessonWithSection = (
    sessionId: string,
    lessons: UpsertCourseFormData["sections"][number]["lessons"],
  ): CreateLessonPayload[] => {
    return lessons.map<CreateLessonPayload>((lesson, _index) => ({
      content: lesson.content,
      lesson_type: lesson.lessonType,
      priority: _index + 1,
      status: lesson.status,
      title: lesson.title,
      section_id: sessionId,
      main_resource: lesson.mainResource?.id || null,
      assignment_id: lesson.assignmentId || null,
    }));
  };

  /** --------------------------------------------------------
   *  Helper: Map Lessons with session payloads
   * -------------------------------------------------------- */
  const mapBulkUpsertLessonsPayload = (
    sectionId: string,
    lessons: UpsertCourseFormData["sections"][number]["lessons"],
  ): UpsertLessonPayload[] => {
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
            assignment_id: lesson.assignmentId ?? null,
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
            assignment_id: lesson.assignmentId ?? null,
            priority: lessonIndex + 1,
            status: lesson.status,
            section_id: sectionId,
          },
        };
      }
    });
  };

  const mapUpsertLessonsPayload = (params: {
    sectionId: string;
    lesson: UpsertCourseFormData["sections"][number]["lessons"][number];
    lessonIndex: number;
  }): UpsertLessonPayload => {
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
            assignment_id: lesson.assignmentId ?? null,
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
            assignment_id: lesson.assignmentId ?? null,
            priority: lessonIndex + 1,
            status: lesson.status,
          },
        };
  };

  /**
   *
   * Helper: Map Upsert section payload
   *
   */
  const mapUpsertSectionPayload = (params: {
    courseId: string;
    section: UpsertCourseFormData["sections"][number];
    sectionIndex: number;
  }): UpsertSectionPayload => {
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
  };

  return {
    onCreate: doCreateCourse,
    onUpdate: doUpdate,
    isLoading: isPending,
  };
};
export { useUpsertCourse };
