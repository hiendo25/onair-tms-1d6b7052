import PageContainer from "@/shared/ui/PageContainer";
import * as React from "react";
import { Metadata, ResolvingMetadata } from "next";
import CreateCourseForm from "./_components/CreateCourseForm";
import { PATHS } from "@/constants/path.contstants";

type CreateCoursePageProps = {
  searchParams: Promise<Record<string, any>>;
};

export async function generateMetadata(
  { searchParams }: CreateCoursePageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  return {
    title: "Tạo môn học",
    description: "Tạo môn học",
  };
}

export default function CreateCoursePage({ searchParams }: CreateCoursePageProps) {
  return (
    <PageContainer
      title="Tạo bài học"
      breadcrumbs={[{ title: "Quản lý lớp học", path: PATHS.CLASSROOMS.ROOT }, { title: "Tạo môn học" }]}
    >
      <CreateCourseForm />
    </PageContainer>
  );
}
