import type { LearningCourseOutline, LearningLesson } from "@/modules/learning-screen/types";
import * as learningScreenServerRepository from "@/repository/learning-screen/server";

const getCourseLearningOutline = async (courseId: string): Promise<LearningCourseOutline> => {
  return learningScreenServerRepository.getCourseLearningOutline(courseId);
};

const getLessonLearningDetail = async (lessonId: string): Promise<LearningLesson | null> => {
  return learningScreenServerRepository.getLessonLearningDetail(lessonId);
};

export { getCourseLearningOutline, getLessonLearningDetail };
