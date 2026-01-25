"use server";
import { Metadata, ResolvingMetadata } from "next";

import { PATHS } from "@/constants/path.constant";
import PageContainer from "@/shared/ui/PageContainer";

import CourseTableList from "./_components/CourseTableList";

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
          title: "Quản lý môn học",
          path: PATHS.COURSES.LIST,
        },
        {
          title: "Danh sách môn học",
          path: "",
        },
      ]}
    >
      <CourseTableList />
    </PageContainer>
  );
};

export default OnlineCourseListPage;
