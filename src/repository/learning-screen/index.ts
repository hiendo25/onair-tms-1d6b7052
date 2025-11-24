import type { LearningCourseOutline, LearningLesson } from "@/modules/learning-screen/types";

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

const getCourseLearningOutline = async (courseId: string): Promise<LearningCourseOutline> => {
  const trimmedCourseId = courseId?.trim();
  if (!trimmedCourseId) {
    return DEFAULT_OUTLINE;
  }

  const params = new URLSearchParams({ courseId: trimmedCourseId });
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
