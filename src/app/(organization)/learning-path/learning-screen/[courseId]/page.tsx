import { notFound } from "next/navigation";

import { PATHS } from "@/constants/path.constant";
import LearningScreenPageShell from "@/modules/learning-screen/components/LearningScreenPageShell";
import { learningScreenService } from "@/services";

interface LearningPathLearningScreenPageProps {
  params: Promise<{
    courseId: string;
  }>;
}

const LearningPathLearningScreenPage = async ({ params }: LearningPathLearningScreenPageProps) => {
  const { courseId } = await params;
  const courseHeader = await learningScreenService.getLearningCourseHeader(courseId);

  if (!courseHeader) {
    notFound();
  }

  return (
    <LearningScreenPageShell
      courseId={courseId}
      courseTitle={courseHeader.title ?? null}
      backHref={PATHS.DASHBOARD}
      breadcrumbs={[
        {
          title: "LMS",
          path: PATHS.DASHBOARD,
        },
        {
          title: "Lộ trình học tập",
        },
      ]}
    />
  );
};

export default LearningPathLearningScreenPage;
