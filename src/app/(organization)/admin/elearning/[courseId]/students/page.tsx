import { notFound } from "next/navigation";
import PageContainer from "@/shared/ui/PageContainer";
import { getElearningCourseById } from "@/repository/elearning";
import ElearningStudentsSection from "./_components";

const ElearningCourseStudentsPage = async ({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) => {
  const { courseId } = await params;
  const { data: course, error } = await getElearningCourseById(courseId);

  if (!course || error) {
    return notFound();
  }

  const courseTitle = course?.title || "Khóa học eLearning";
  const pageTitle = `Danh sách học viên ${course?.title ? ` • ${courseTitle}` : ""
    }`;

  return (
    <PageContainer
      title={pageTitle}
      breadcrumbs={[
        { title: "LMS", path: "/dashboard" },
        { title: "Khóa học eLearning", path: "/class-room/list?tab=ElearningTab" },
        { title: courseTitle },
        { title: "Danh sách học viên" },
      ]}
    >
      <ElearningStudentsSection courseId={courseId} />
    </PageContainer>
  );
};

export default ElearningCourseStudentsPage;
