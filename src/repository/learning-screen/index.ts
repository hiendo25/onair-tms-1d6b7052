import { supabase } from "@/services";
import type { Tables } from "@/types/supabase.types";
import type {
  LearningCourseOutline,
  LearningLesson,
  LearningLessonAttachment,
  LearningLessonSummary,
  LearningSectionOutline,
  ResourceRow,
} from "@/modules/learning-screen/types";

type LessonResourceBridgeRow = Tables<"lessons_resources"> & {
  resource?: ResourceRow | null;
};

type RawLessonDetailRow = Tables<"lessons"> & {
  lesson_resources?: LessonResourceBridgeRow[] | null;
};

type RawOutlineLessonRow = Pick<
  Tables<"lessons">,
  | "assignment_id"
  | "created_at"
  | "id"
  | "lesson_type"
  | "main_resource"
  | "priority"
  | "section_id"
  | "status"
  | "title"
  | "updated_at"
>;

type RawOutlineSectionRow = Tables<"sections"> & {
  lessons?: RawOutlineLessonRow[] | null;
};

type RawOutlineCourseRow = Tables<"courses"> & {
  sections?: RawOutlineSectionRow[] | null;
};

const COURSE_OUTLINE_SELECT = `
  *,
  sections:sections (
    *,
    lessons:lessons (
      id,
      title,
      lesson_type,
      priority,
      main_resource,
      section_id,
      status,
      assignment_id,
      created_at,
      updated_at
    )
  )
`;

const LESSON_DETAIL_SELECT = `
  *,
  lesson_resources:lessons_resources (
    *,
    resource:resources (*)
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

const fetchResourcesByIds = async (resourceIds: Set<string>) => {
  const resourceMap = new Map<string, ResourceRow>();
  if (!resourceIds.size) {
    return resourceMap;
  }

  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .in("id", Array.from(resourceIds));

  if (error) {
    throw error;
  }

  for (const resource of data ?? []) {
    resourceMap.set(resource.id, resource);
  }

  return resourceMap;
};

const getCourseLearningOutline = async (courseId: string): Promise<LearningCourseOutline> => {
  const trimmedCourseId = courseId?.trim();
  if (!trimmedCourseId) {
    return {
      course: null,
      sections: [],
    };
  }

  const { data, error } = await supabase
    .from("courses")
    .select(COURSE_OUTLINE_SELECT)
    .eq("id", trimmedCourseId)
    .single();

  if (error) {
    throw error;
  }

  const rawCourse = (data ?? null) as unknown as RawOutlineCourseRow | null;

  if (!rawCourse) {
    return {
      course: null,
      sections: [],
    };
  }

  const { sections: rawSections = [], ...courseInfo } = rawCourse;
  const mainResourceIds = new Set<string>();

  const normalizedSections: LearningSectionOutline[] = rawSections
    .filter((section): section is RawOutlineSectionRow => Boolean(section))
    .map((section) => {
      const { lessons: rawLessons = [], ...sectionInfo } = section;

      const normalizedLessons: LearningLessonSummary[] = rawLessons
        .filter((lesson): lesson is RawOutlineLessonRow => Boolean(lesson))
        .map((lesson) => {
          if (lesson.main_resource) {
            mainResourceIds.add(lesson.main_resource);
          }
          const normalizedLesson: LearningLessonSummary = {
            ...lesson,
            content: null,
            mainResource: null,
          };
          return normalizedLesson;
        })
        .sort(sortByPriority);

      const normalizedSection: LearningSectionOutline = {
        ...sectionInfo,
        lessons: normalizedLessons,
      };

      return normalizedSection;
    })
    .sort(sortByPriority);

  const resourceMap = await fetchResourcesByIds(mainResourceIds);

  for (const section of normalizedSections) {
    for (const lesson of section.lessons) {
      lesson.mainResource = lesson.main_resource
        ? resourceMap.get(lesson.main_resource) ?? null
        : null;
    }
  }

  return {
    course: courseInfo as Tables<"courses">,
    sections: normalizedSections,
  };
};

const getLessonLearningDetail = async (lessonId: string): Promise<LearningLesson | null> => {
  const trimmedLessonId = lessonId?.trim();
  if (!trimmedLessonId) {
    return null;
  }

  const { data, error } = await supabase
    .from("lessons")
    .select(LESSON_DETAIL_SELECT)
    .eq("id", trimmedLessonId)
    .single();

  if (error) {
    throw error;
  }

  const rawLesson = (data ?? null) as unknown as RawLessonDetailRow | null;

  if (!rawLesson) {
    return null;
  }

  const { lesson_resources: lessonResourceBridges = [], ...lessonInfo } = rawLesson;

  const attachments: LearningLessonAttachment[] = (lessonResourceBridges ?? [])
    .filter((bridge): bridge is LessonResourceBridgeRow => Boolean(bridge))
    .map(toAttachment);

  const resourceIdsToFetch = new Set<string>();

  for (const attachment of attachments) {
    if (!attachment.resource && attachment.resourceId) {
      resourceIdsToFetch.add(attachment.resourceId);
    }
  }

  if (lessonInfo.main_resource) {
    const hasPrimaryAttachment = attachments.some(
      (item) => item.resource?.id === lessonInfo.main_resource,
    );
    if (!hasPrimaryAttachment) {
      resourceIdsToFetch.add(lessonInfo.main_resource);
    }
  }

  const resourceMap = await fetchResourcesByIds(resourceIdsToFetch);

  const resolvedAttachments = attachments.map((attachment) => ({
    ...attachment,
    resource: attachment.resource ?? resourceMap.get(attachment.resourceId) ?? null,
  }));

  let mainResource =
    resolvedAttachments.find((item) => item.resource?.id === lessonInfo.main_resource)?.resource ??
    null;

  if (!mainResource && lessonInfo.main_resource) {
    mainResource = resourceMap.get(lessonInfo.main_resource) ?? null;
  }

  if (!mainResource) {
    mainResource = resolvedAttachments[0]?.resource ?? null;
  }

  let assignment: Tables<"assignments"> | null = null;
  if (lessonInfo.lesson_type === "assessment" && lessonInfo.main_resource) {
    const { data: assignmentRow, error: assignmentError } = await supabase
      .from("assignments")
      .select("*")
      .eq("id", lessonInfo.main_resource)
      .maybeSingle();

    if (assignmentError) {
      throw assignmentError;
    }

    assignment = assignmentRow ?? null;
  }

  const normalizedLesson: LearningLesson = {
    ...(lessonInfo as Tables<"lessons">),
    attachments: resolvedAttachments,
    assignment,
    mainResource,
  };

  return normalizedLesson;
};

export { getCourseLearningOutline, getLessonLearningDetail };
