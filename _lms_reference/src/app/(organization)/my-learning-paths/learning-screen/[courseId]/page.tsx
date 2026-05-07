import { notFound } from "next/navigation";

import { learningScreenService } from "@/services";

import LearningScreenClient from "./_components/LearningScreenClient";

interface LearningPathScreenPageProps {
  params: Promise<{
    courseId: string;
  }>;
}

const LearningPathScreenPage = async ({ params }: LearningPathScreenPageProps) => {
  const { courseId } = await params;
  const courseHeader = await learningScreenService.getLearningCourseHeader(courseId);

  if (!courseHeader) {
    notFound();
  }

  return (
    <LearningScreenClient
      courseId={courseId}
      courseTitle={courseHeader.title ?? null}
      fromLearningPath={true}
    />
  );
};

export default LearningPathScreenPage;
