import { notFound } from "next/navigation";

import { PATHS } from "@/constants/path.constant";
import LearningScreenPageShell from "@/modules/learning-screen/components/LearningScreenPageShell";
import { learningScreenService } from "@/services";

interface MyClassLearningScreenPageProps {
  params: Promise<{
    couresId: string;
  }>;
}

const MyClassLearningScreenPage = async ({ params }: MyClassLearningScreenPageProps) => {
  const { couresId } = await params;
  const courseHeader = await learningScreenService.getLearningCourseHeader(couresId);

  console.log({ courseHeader });
  if (!courseHeader) {
    notFound();
  }

  return (
    <LearningScreenPageShell
      courseId={couresId}
      courseTitle={courseHeader.title ?? null}
      backHref={PATHS.STUDENTS.ROOT}
      breadcrumbs={[
        {
          title: "LMS",
          path: PATHS.DASHBOARD,
        },
        {
          title: "Lớp học của tôi",
          path: PATHS.STUDENTS.ROOT,
        },
      ]}
    />
  );
};

export default MyClassLearningScreenPage;
