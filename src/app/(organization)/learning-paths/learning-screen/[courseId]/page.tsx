import { notFound } from "next/navigation";

import LearningScreenClient from "@/app/(organization)/learning-screen/[courseId]/_components/LearningScreenClient";
import { learningScreenService } from "@/services";

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
