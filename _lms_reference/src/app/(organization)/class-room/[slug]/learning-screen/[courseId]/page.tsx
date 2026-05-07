import { notFound } from "next/navigation";

import { PATHS } from "@/constants/path.constant";
import LearningScreenPageShell from "@/modules/learning-screen/components/LearningScreenPageShell";
import { classRoomRepository } from "@/repository";
import { learningScreenService } from "@/services";

interface ClassRoomLearningScreenPageProps {
  params: Promise<{
    slug: string;
    courseId: string;
  }>;
}

const ClassRoomLearningScreenPage = async ({ params }: ClassRoomLearningScreenPageProps) => {
  const { slug, courseId } = await params;

  // Get class-room details by slug to extract class_room_id
  const classRoomResponse = await classRoomRepository.getClassRoomBySlug(slug);

  if (classRoomResponse.error || !classRoomResponse.data) {
    notFound();
  }

  const classRoom = classRoomResponse.data;

  // Get course header
  const courseHeader = await learningScreenService.getLearningCourseHeader(courseId);

  if (!courseHeader) {
    notFound();
  }

  return (
    <LearningScreenPageShell
      courseId={courseId}
      courseTitle={courseHeader.title ?? null}
      backHref={PATHS.CLASSROOMS.DETAIL_CLASSROOM(slug)}
      classRoomId={classRoom.id}
      breadcrumbs={[
        {
          title: "TMS",
          path: PATHS.DASHBOARD,
        },
        {
          title: classRoom.title || "Lớp học",
          path: PATHS.CLASSROOMS.DETAIL_CLASSROOM(slug),
        },
      ]}
    />
  );
};

export default ClassRoomLearningScreenPage;
