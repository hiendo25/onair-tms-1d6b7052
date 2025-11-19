"use server";
import PageContainer from "@/shared/ui/PageContainer";
import CourseListContainer from "./_components/CourseListContainer";
import { PATHS } from "@/constants/path.contstants";
import { Metadata, ResolvingMetadata } from "next";

type CreateCoursePageProps = {
  searchParams: Promise<Record<string, any>>;
};

export async function generateMetadata(
  { searchParams }: CreateCoursePageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  return {
    title: "Danh sách môn học",
    description: "Danh sách môn học",
  };
}

const OnlineCourseListPage = () => {
  return (
    <PageContainer
      title="Danh sách môn học"
      breadcrumbs={[
        {
          title: "Quản lý lớp học",
          path: PATHS.CLASSROOMS.ROOT,
        },
        {
          title: "Danh sách môn học",
        },
      ]}
    >
      <CourseListContainer />
    </PageContainer>
  );
};

export default OnlineCourseListPage;
