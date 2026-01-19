import { RequestInit } from "next/dist/server/web/spec-extension/request";

import type { LearningCourseOutline, LearningLesson } from "@/modules/learning-screen/types";

interface CourseOutlineOptions {
  includeProgress?: boolean;
  learningPathId?: string | null;
  employeeId?: string | null;
}

const DEFAULT_OUTLINE: LearningCourseOutline = {
  course: null,
  sections: [],
};

const fetchFromApi = async <T>(input: string | URL, init?: RequestInit) => {
  const response = await fetch(input, {
    cache: "no-store",
    ...init,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const errorBody = await response.json();
      if (errorBody && typeof errorBody.error === "string") {
        message = errorBody.error;
      }
    } catch {
      // Ignore JSON parsing error for non-JSON responses
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
};

const getCourseLearningOutline = async (
  courseId: string,
  options?: CourseOutlineOptions,
): Promise<LearningCourseOutline> => {
  const trimmedCourseId = courseId?.trim();
  if (!trimmedCourseId) {
    return DEFAULT_OUTLINE;
  }

  const params = new URLSearchParams({ courseId: trimmedCourseId });
  const trimmedLearningPathId = options?.learningPathId ? options.learningPathId.trim() : null;
  const trimmedEmployeeId = options?.employeeId ? options.employeeId.trim() : null;
  if (options?.includeProgress) {
    params.set("includeProgress", "true");
  }
  if (trimmedLearningPathId) {
    params.set("learningPathId", trimmedLearningPathId);
  }
  if (trimmedEmployeeId) {
    params.set("employeeId", trimmedEmployeeId);
  }
  return fetchFromApi<LearningCourseOutline>(
    `/api/learning-screen/course-outline?${params.toString()}`,
  );
};

const getLessonLearningDetail = async (lessonId: string): Promise<LearningLesson | null> => {
  const trimmedLessonId = lessonId?.trim();
  if (!trimmedLessonId) {
    return null;
  }

  const target = `/api/learning-screen/lessons/${encodeURIComponent(trimmedLessonId)}`;
  return fetchFromApi<LearningLesson | null>(target);
};

export { getCourseLearningOutline, getLessonLearningDetail };
