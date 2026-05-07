import { coursesLessonsRepository, coursesRepository, coursesSectionsRepository } from "@/repository";
import { LessonInsert, LessonResourceInsert } from "@/repository/courses-lessons/type";
import { SectionInsert } from "@/repository/courses-sections/type";

import { CreateCourseInput } from "./dto/create-course.dto";

export class CreateCourseSerivce {
  private organizationId: string;
  private authorId: string;

  constructor(organizationId: string, authorId: string) {
    this.organizationId = organizationId;
    this.authorId = authorId;
  }

  async execute(input: CreateCourseInput) {
    const userId = this.authorId;
    const organizationId = this.organizationId;

    const { categoryIds, description, slug, status, title, sections } = input;

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
      categoryIds.map((categoryId) => ({
        category_id: categoryId,
        course_id: courseData.id,
      })),
    );

    /**
     * Step 3: Create course sections
     */

    await this.bulkCreateCourseSections(courseData.id, sections);

    return courseData;
  }

  private async bulkCreateCourseSections(courseId: string, sections: CreateCourseInput["sections"]) {
    await Promise.all(
      sections.map(async (section, sectionIndex) => {
        try {
          const sectionPayload = this.mapSectionWithCourse(courseId, section, sectionIndex);
          const { data: sectionData, error: sessionError } =
            await coursesSectionsRepository.createSection(sectionPayload);

          if (sessionError) {
            console.log("Create Session failed", sessionError);
            throw new Error(`Create Classroom Session Failed ${sectionIndex}`);
          }

          /**
           * lessons
           */
          const lessonPromises = (async () => {
            const dataLessons = await coursesLessonsRepository.bulkCreateLessons(
              this.mapLessonWithSection(sectionData.id, section.lessons),
            );

            /**
             * sync lesson With Resouce after create success.
             */
            const lessonResourceInserts = dataLessons.reduce<LessonResourceInsert[]>((acc, dataLesson, lessonIndex) => {
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
            }, []);
            await coursesLessonsRepository.bulkCreateLessonsWithResources(lessonResourceInserts);
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

  /** --------------------------------------------------------
   *  Helper
   * -------------------------------------------------------- */

  private mapSectionWithCourse(
    courseId: string,
    section: CreateCourseInput["sections"][number],
    index: number,
  ): SectionInsert {
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
    lessons: CreateCourseInput["sections"][number]["lessons"],
  ): LessonInsert[] {
    return lessons.map<LessonInsert>((lesson, _index) => ({
      content: lesson.content,
      lesson_type: lesson.lessonType,
      priority: _index + 1,
      status: lesson.status,
      title: lesson.title,
      section_id: sessionId,
      main_resource: lesson.mainResourceId || null,
      assignment_id: lesson.assignmentId || null,
    }));
  }
}
