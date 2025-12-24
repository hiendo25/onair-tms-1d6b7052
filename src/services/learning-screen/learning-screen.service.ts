import type {
  LearningCourseOutline,
  LearningLesson,
  LearningLessonAttachment,
  LearningLessonSummary,
  LearningSectionOutline,
  LessonProgressStatus,
  ResourceRow,
} from "@/modules/learning-screen/types";
import type {
  LessonProgressRow,
  LessonResourceBridgeRow,
  RawOutlineLessonRow,
  RawOutlineSectionRow,
} from "@/repository/learning-screen/server";
import * as learningScreenServerRepository from "@/repository/learning-screen/server";
import type { Tables } from "@/types/supabase.types";

interface CourseOutlineOptions {
  includeProgress?: boolean;
  learningPathId?: string | null;
}

const toAttachment = (
  bridge: LessonResourceBridgeRow,
): LearningLessonAttachment => ({
  bridgeId: bridge.id,
  resourceId: bridge.resource_id,
  resource: bridge.resource ?? null,
});

const buildResourceMap = (resources: ResourceRow[]) => {
  const resourceMap = new Map<string, ResourceRow>();
  for (const resource of resources) {
    resourceMap.set(resource.id, resource);
  }
  return resourceMap;
};

const buildProgressMap = (rows: LessonProgressRow[]): Map<string, LessonProgressStatus> => {
  const progressMap = new Map<string, LessonProgressStatus>();
  for (const row of rows) {
    progressMap.set(row.lesson_id, row.status);
  }
  return progressMap;
};

const normalizeOutlineSections = (rawSections: RawOutlineSectionRow[] | null | undefined) => {
  const lessonIds = new Set<string>();

  const normalizedSections: LearningSectionOutline[] = (rawSections ?? [])
    .filter((section): section is RawOutlineSectionRow => Boolean(section))
    .map((section) => {
      const { lessons: rawLessons = [], ...sectionInfo } = section;

      const normalizedLessons: LearningLessonSummary[] = (rawLessons ?? [])
        .filter((lesson): lesson is RawOutlineLessonRow => Boolean(lesson))
        .map((lesson) => {
          lessonIds.add(lesson.id);
          const { main_resource_detail: mainResourceDetail, ...lessonInfo } = lesson;
          return {
            ...lessonInfo,
            content: null,
            mainResource: mainResourceDetail ?? null,
          };
        });

      return {
        ...sectionInfo,
        lessons: normalizedLessons,
      };
    });

  return {
    normalizedSections,
    lessonIds,
  };
};

const applyOutlineProgress = (
  sections: LearningSectionOutline[],
  progressMap: Map<string, LessonProgressStatus>,
  shouldIncludeProgress: boolean,
) => {
  if (!shouldIncludeProgress) {
    return;
  }
  for (const section of sections) {
    for (const lesson of section.lessons) {
      lesson.progressStatus = progressMap.get(lesson.id) ?? null;
    }
  }
};

const getCourseLearningOutline = async (
  courseId: string,
  options?: CourseOutlineOptions,
): Promise<LearningCourseOutline> => {
  const trimmedCourseId = courseId?.trim();
  if (!trimmedCourseId) {
    return {
      course: null,
      sections: [],
    };
  }

  const rawCourse = await learningScreenServerRepository.getCourseOutlineRaw(trimmedCourseId);
  if (!rawCourse) {
    return {
      course: null,
      sections: [],
    };
  }

  const { sections: rawSections = [], ...courseInfo } = rawCourse;
  const { normalizedSections, lessonIds } = normalizeOutlineSections(rawSections);
  const learningPathId = options?.learningPathId?.trim();
  const shouldIncludeProgress = Boolean(options?.includeProgress);
  const progressRows =
    shouldIncludeProgress && learningPathId
      ? await learningScreenServerRepository.getLessonProgressRows(
        Array.from(lessonIds),
        learningPathId,
      )
      : [];
  const progressMap = buildProgressMap(progressRows);

  applyOutlineProgress(normalizedSections, progressMap, shouldIncludeProgress);

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

  const rawLesson = await learningScreenServerRepository.getLessonDetailRaw(trimmedLessonId);
  if (!rawLesson) {
    return null;
  }

  const {
    lesson_resources: lessonResourceBridges = [],
    main_resource_detail: mainResourceDetail,
    ...lessonInfo
  } = rawLesson;
  const attachments: LearningLessonAttachment[] = (lessonResourceBridges ?? [])
    .filter((bridge): bridge is LessonResourceBridgeRow => Boolean(bridge))
    .map(toAttachment);

  const resourceIdsToFetch = new Set<string>();

  for (const attachment of attachments) {
    if (!attachment.resource && attachment.resourceId) {
      resourceIdsToFetch.add(attachment.resourceId);
    }
  }

  const resources =
    resourceIdsToFetch.size > 0
      ? await learningScreenServerRepository.getResourcesByIds(Array.from(resourceIdsToFetch))
      : [];
  const resourceMap = buildResourceMap(resources);

  const resolvedAttachments = attachments.map((attachment) => ({
    ...attachment,
    resource: attachment.resource ?? resourceMap.get(attachment.resourceId) ?? null,
  }));

  let mainResource = mainResourceDetail ?? null;
  if (!mainResource && lessonInfo.main_resource) {
    mainResource =
      resolvedAttachments.find((item) => item.resource?.id === lessonInfo.main_resource)?.resource ??
      null;
  }

  if (!mainResource) {
    mainResource = resolvedAttachments[0]?.resource ?? null;
  }

  let assignment: Tables<"assignments"> | null = null;
  if (lessonInfo.lesson_type === "assessment" && lessonInfo.main_resource) {
    assignment = await learningScreenServerRepository.getAssignmentById(lessonInfo.main_resource);
  }

  return {
    ...(lessonInfo as Tables<"lessons">),
    attachments: resolvedAttachments,
    assignment,
    mainResource,
  };
};

export { getCourseLearningOutline, getLessonLearningDetail };
