import PageContainer from "@/shared/ui/PageContainer";
import * as React from "react";
import { Metadata, ResolvingMetadata } from "next";
import UpdateCourseForm from "./_components/UpdateCourseForm";
import { PATHS } from "@/constants/path.contstants";
import { coursesRepository } from "@/repository";
import { notFound } from "next/navigation";

type EditCoursePageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
  { params, searchParams }: EditCoursePageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  return {
    title: "Quản lý môn học",
    description: "Quản lý môn học",
  };
}

export default async function EditCoursePage({ params }: EditCoursePageProps) {
  const { id: courseId } = await params;
  const courseDetail = await coursesRepository.getCourseById(courseId);

  if (courseDetail.error || !courseDetail.data) {
    notFound();
  }

  return (
    <PageContainer
      title={courseDetail.data.title || "Sửa môn học"}
      breadcrumbs={[
        { title: "Quản lý môn học", path: PATHS.COURSES.LIST },
        { title: courseDetail.data.title || "" },
        { title: "sửa" },
      ]}
    >
      <UpdateCourseForm data={courseDetail.data} />
    </PageContainer>
  );
}
