import * as React from "react";
import { Metadata, ResolvingMetadata } from "next";

import ClassRoomTypeBoxMenu from "@/modules/class-room-management/components/ClassRoomTypeBoxMenu";
import PageContainer from "@/shared/ui/PageContainer";

type NoOrganizationProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
  { params, searchParams }: NoOrganizationProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  return {
    title: "Quản lý lớp học",
    description: "Quản lý lớp học",
  };
}

export default function NoOrganization(props: NoOrganizationProps) {
  return (
    <PageContainer>
      <div className="flex items-center justify-center">
        <div>Tài khoản của bạn hiện chưa thuộc bất kỳ doanh nghiệp nào, vui lòng liên hệ để đăng ký</div>
      </div>
    </PageContainer>
  );
}
