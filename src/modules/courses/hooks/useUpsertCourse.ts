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

import { CreateSectionPayload } from "@/repository/courses-sections/type";
import { CreateLessonPayload, CreatePivotLessonsWithResourcesPayload } from "@/repository/courses-lessons/type";
import dayjs from "dayjs";

const useUpsertCourse = () => {
  const userInfo = useUserOrganization((state) => state.data);

  const { mutate: doCreateCourse, isPending } = useTMutation({
    mutationKey: ["CREATE_COURSE"],
    mutationFn: async (payload: {
      formData: UpsertCourseFormData;
      teachers: UpsertCourseStore["state"]["selectedTeachers"];
      students: UpsertCourseStore["state"]["selectedStudents"];
    }) => {
      const { formData, teachers, students } = payload;
      const { categories, description, thumbnailUrl, slug, status, title, sections, benefits, docs } = formData;

      /**
       * Step 1: Create ClassRoom
       */
      const { data: courseData, error } = await coursesRepository.createCourse({
        organization_id: userInfo.organization.id,
        created_by: userInfo.id,
        title: title,
        slug: slug,
        description: description,
        community_info: "",
        thumbnail_url: thumbnailUrl,
        start_at: dayjs().toISOString(),
        end_at: dayjs().add(1).toISOString(),
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
       * Step 3: Create Course Meta
       */

      if (benefits.length) {
        await coursesMetaRepository.createCourseMeta({
          course_id: courseData.id,
          key: "benefits",
          value: benefits.map((item) => item.content),
        });
      }

      /**
       * Step 4: Sync Course with Students
       */
      await coursesRepository.createPivotCoursesWithStudents(
        students.map((std) => ({
          course_id: courseData.id,
          student_id: std.id,
        })),
      );

      /**
       * Step 5: Sync Course with Teachers
       */
      await coursesRepository.createPivotCoursesWithTeachers(
        teachers.map((teacher) => ({
          course_id: courseData.id,
          teacher_id: teacher.id,
        })),
      );

      /**
       * Step 5: Sync Course with Teachers
       */
      await coursesRepository.createPivotCoursesWithResources(
        docs.map((doc) => ({
          course_id: courseData.id,
          resource_id: doc.id,
        })),
      );

      /**
       * Step 6: Create course sections
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
                await coursesLessonsRepository.createPivotLessonsWithResources(createPivotLessonsWithResourcesPayload);
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
    mutationFn: async (payload: {
      courseId: string;
      formData: UpsertCourseFormData;
      teachers: UpsertCourseStore["state"]["selectedTeachers"];
      students: UpsertCourseStore["state"]["selectedStudents"];
    }) => {
      const { formData, teachers, students, courseId } = payload;

      const { categories, description, thumbnailUrl, slug, status, title, sections, benefits, docs } = formData;
      const courseDetail = await coursesRepository.getCourseById(courseId);
      /**
       * Step 1: Create ClassRoom
       */
      const { data: courseData, error } = await coursesRepository.createCourse({
        organization_id: userInfo.organization.id,
        created_by: userInfo.id,
        title: title,
        slug: slug,
        description: description,
        community_info: "",
        thumbnail_url: thumbnailUrl,
        start_at: dayjs().toISOString(),
        end_at: dayjs().add(1).toISOString(),
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
       * Step 3: Create Course Meta
       */

      if (benefits.length) {
        await coursesMetaRepository.createCourseMeta({
          course_id: courseData.id,
          key: "benefits",
          value: benefits.map((item) => item.content),
        });
      }

      /**
       * Step 4: Sync Course with Students
       */
      await coursesRepository.createPivotCoursesWithStudents(
        students.map((std) => ({
          course_id: courseData.id,
          student_id: std.id,
        })),
      );

      /**
       * Step 5: Sync Course with Teachers
       */
      await coursesRepository.createPivotCoursesWithTeachers(
        teachers.map((teacher) => ({
          course_id: courseData.id,
          teacher_id: teacher.id,
        })),
      );

      /**
       * Step 5: Sync Course with Teachers
       */
      await coursesRepository.createPivotCoursesWithResources(
        docs.map((doc) => ({
          course_id: courseData.id,
          resource_id: doc.id,
        })),
      );

      /**
       * Step 6: Create course sections
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
                await coursesLessonsRepository.createPivotLessonsWithResources(createPivotLessonsWithResourcesPayload);
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
   *  Helper: Map Agenda with session payloads
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

  return {
    onCreate: doCreateCourse,
    onUpdate: doUpdate,
    isLoading: isPending,
  };
};
export { useUpsertCourse };
