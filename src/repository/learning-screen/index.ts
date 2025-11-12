import { supabase } from "@/services";
import type { Tables } from "@/types/supabase.types";
import type {
  LearningCourseDetail,
  LearningLesson,
  LearningLessonAttachment,
  LearningSection,
  ResourceRow,
} from "@/modules/learning-screen/types";

type LessonResourceBridgeRow = Tables<"lessons_resources"> & {
  resource?: ResourceRow | null;
};

type RawLessonRow = Tables<"lessons"> & {
  lesson_resources?: LessonResourceBridgeRow[] | null;
};

type RawSectionRow = Tables<"sections"> & {
  lessons?: RawLessonRow[] | null;
};

type RawCourseRow = Tables<"courses"> & {
  sections?: RawSectionRow[] | null;
};

const COURSE_DETAIL_SELECT = `
  *,
  sections:sections (
    *,
    lessons:lessons (
      *,
      lesson_resources:lessons_resources (
        *,
        resource:resources (*)
      )
    )
  )
`;

const sortByPriority = <T extends { priority: number; created_at: string }>(a: T, b: T) => {
  if (a.priority !== b.priority) {
    return a.priority - b.priority;
  }
  return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
};

const toAttachment = (bridge: LessonResourceBridgeRow): LearningLessonAttachment => ({
  bridgeId: bridge.id,
  resourceId: bridge.resource_id,
  resource: bridge.resource ?? null,
});

const getCourseLearningDetail = async (courseId: string): Promise<LearningCourseDetail> => {
  const trimmedCourseId = courseId?.trim();
  if (!trimmedCourseId) {
    return {
      course: null,
      sections: [],
    };
  }

  const { data, error } = await supabase
    .from("courses")
    .select(COURSE_DETAIL_SELECT)
    .eq("id", trimmedCourseId)
    .single();

  if (error) {
    throw error;
  }

  const rawCourse = (data ?? null) as unknown as RawCourseRow | null;

  if (!rawCourse) {
    return {
      course: null,
      sections: [],
    };
  }

  const { sections: rawSections = [], ...courseInfo } = rawCourse;

  const assignmentIds = new Set<string>();
  const resourceIdsToFetch = new Set<string>();

  const normalizedSections: LearningSection[] = rawSections
    .filter((section): section is RawSectionRow => Boolean(section))
    .map((section) => {
      const { lessons: rawLessons = [], ...sectionInfo } = section;

      const normalizedLessons: LearningLesson[] = rawLessons
        .filter((lesson): lesson is RawLessonRow => Boolean(lesson))
        .map((lesson) => {
          const { lesson_resources: lessonResourceBridges = [], ...lessonInfo } = lesson;

          const attachments: LearningLessonAttachment[] = (lessonResourceBridges ?? [])
            .filter((bridge): bridge is LessonResourceBridgeRow => Boolean(bridge))
            .map((bridge) => {
              if (!bridge.resource && bridge.resource_id) {
                resourceIdsToFetch.add(bridge.resource_id);
              }
              return toAttachment(bridge);
            });

          if (lessonInfo.lesson_type === "assessment" && lessonInfo.main_resource) {
            assignmentIds.add(lessonInfo.main_resource);
          } else if (lessonInfo.main_resource) {
            const hasPrimaryAttachment = attachments.some(
              (item) => item.resource?.id === lessonInfo.main_resource,
            );
            if (!hasPrimaryAttachment) {
              resourceIdsToFetch.add(lessonInfo.main_resource);
            }
          }

          const normalizedLesson: LearningLesson = {
            ...lessonInfo,
            attachments,
            assignment: null,
            mainResource: null,
          };

          return normalizedLesson;
        })
        .sort(sortByPriority);

      const normalizedSection: LearningSection = {
        ...sectionInfo,
        lessons: normalizedLessons,
      };

      return normalizedSection;
    })
    .sort(sortByPriority);

  const allLessons = normalizedSections.flatMap((section) => section.lessons);

  const resourceMap = new Map<string, ResourceRow>();

  if (resourceIdsToFetch.size > 0) {
    const { data: extraResources, error: resourcesError } = await supabase
      .from("resources")
      .select("*")
      .in("id", Array.from(resourceIdsToFetch));

    if (resourcesError) {
      throw resourcesError;
    }

    for (const resource of extraResources ?? []) {
      resourceMap.set(resource.id, resource);
    }
  }

  for (const lesson of allLessons) {
    lesson.attachments = lesson.attachments.map((attachment) => ({
      ...attachment,
      resource: attachment.resource ?? resourceMap.get(attachment.resourceId) ?? null,
    }));

    if (lesson.main_resource) {
      const attachmentResource =
        lesson.attachments.find((item) => item.resource?.id === lesson.main_resource)?.resource ??
        null;
      lesson.mainResource = attachmentResource ?? resourceMap.get(lesson.main_resource) ?? null;
    } else {
      lesson.mainResource = lesson.attachments[0]?.resource ?? null;
    }
  }

  if (assignmentIds.size > 0) {
    const { data: assignments, error: assignmentsError } = await supabase
      .from("assignments")
      .select("*")
      .in("id", Array.from(assignmentIds));

    if (assignmentsError) {
      throw assignmentsError;
    }

    const assignmentMap = new Map<string, Tables<"assignments">>();
    for (const assignment of assignments ?? []) {
      assignmentMap.set(assignment.id, assignment);
    }

    for (const lesson of allLessons) {
      if (lesson.lesson_type === "assessment" && lesson.main_resource) {
        lesson.assignment = assignmentMap.get(lesson.main_resource) ?? null;
      }
    }
  }

  return {
    course: courseInfo as Tables<"courses">,
    sections: normalizedSections,
  };
};

export { getCourseLearningDetail };
