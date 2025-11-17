import PageContainer from "@/shared/ui/PageContainer";
import * as React from "react";
import { Metadata, ResolvingMetadata } from "next";
import UpdateCourseForm from "./_components/UpdateCourseForm";
import { PATHS } from "@/constants/path.contstants";
interface EditCoursePageProps {}

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params, searchParams }: Props, parent: ResolvingMetadata): Promise<Metadata> {
  return {
    title: "Quản lý lớp học",
    description: "Quản lý lớp học",
  };
}

export default function EditCoursePage({}: EditCoursePageProps) {
  return (
    <PageContainer
      title="Cap nhat bài học"
      breadcrumbs={[{ title: "Quản lý lớp học", path: PATHS.CLASSROOMS.ROOT }, { title: "Tạo bài học" }]}
    >
      <UpdateCourseForm />
    </PageContainer>
  );
}
