import { notFound } from "next/navigation";

import { learningScreenService } from "@/services";

import LearningScreenClient from "./_components/LearningScreenClient";

interface LearningScreenPageProps {
  params: Promise<{
    courseId: string;
  }>;
}

const LearningScreenPage = async ({ params }: LearningScreenPageProps) => {
  const { courseId } = await params;
  const courseHeader = await learningScreenService.getLearningCourseHeader(courseId);

  if (!courseHeader) {
    notFound();
  }

  return (
    <LearningScreenClient
      courseId={courseId}
      courseTitle={courseHeader.title ?? null}
    />
  );
};

export default LearningScreenPage;
