import PageContainer from "@/shared/ui/PageContainer";
import * as React from "react";
import { Metadata, ResolvingMetadata } from "next";
import ClassRoomTypeBoxMenu from "@/modules/class-room-management/components/ClassRoomTypeBoxMenu";
interface ManageClassRoomPageProps {}

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

export default function ManageClassRoomPage({}: ManageClassRoomPageProps) {
  return (
    <PageContainer title="Tạo lớp học" breadcrumbs={[{ title: "Dashboard" }, { title: "Tạo lớp học" }]}>
      <ClassRoomTypeBoxMenu />
    </PageContainer>
  );
}
