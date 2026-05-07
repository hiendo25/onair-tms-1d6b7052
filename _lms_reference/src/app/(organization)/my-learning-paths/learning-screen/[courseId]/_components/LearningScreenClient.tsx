"use client";

import { useMemo } from "react";

import { PATHS } from "@/constants/path.constant";
import { useGetCurrentLearningPath } from "@/modules/learning-paths/operations/query";
import LearningScreenPageShell from "@/modules/learning-screen/components/LearningScreenPageShell";

interface LearningScreenClientProps {
  courseId: string;
  courseTitle: string | null;
  fromLearningPath?: boolean;
}

const LearningScreenClient = ({
  courseId,
  courseTitle,
  fromLearningPath = false
}: LearningScreenClientProps) => {
  const { data: currentLearningPathData } = useGetCurrentLearningPath({
    enabled: fromLearningPath,
  });

  const learningPathData = fromLearningPath ? currentLearningPathData?.data : undefined;
  const isLearningPathMode = Boolean(learningPathData);
  const learningPathId = learningPathData?.id ?? null;

  const backHref = isLearningPathMode ? PATHS.MY_LEARNING_PATHS.ROOT : PATHS.DASHBOARD;

  const breadcrumbs = useMemo(() => {
    if (isLearningPathMode) {
      return [
        {
          title: "LMS",
          path: PATHS.DASHBOARD,
        },
        {
          title: "Lộ trình học tập",
          path: PATHS.MY_LEARNING_PATHS.ROOT,
        },
        {
          title: courseTitle ?? "Khóa học",
        },
      ];
    }

    return [
      {
        title: "LMS",
        path: PATHS.DASHBOARD,
      },
      {
        title: courseTitle ?? "Khóa học",
      },
    ];
  }, [isLearningPathMode, courseTitle]);

  return (
    <LearningScreenPageShell
      courseId={courseId}
      courseTitle={courseTitle}
      backHref={backHref}
      breadcrumbs={breadcrumbs}
      learningPathData={learningPathData}
      learningPathId={learningPathId}
    />
  );
};

export default LearningScreenClient;
