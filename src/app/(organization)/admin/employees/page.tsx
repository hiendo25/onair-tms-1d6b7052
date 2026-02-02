import React from "react";
import { Metadata, ResolvingMetadata } from "next";
import { redirect } from "next/navigation";

import EmployeeList from "@/app/(organization)/admin/employees/_components/EmployeeList";
import { PATHS } from "@/constants/path.constant";
import PageContainer from "@/shared/ui/PageContainer";

import EmployeeListContainer from "./_components/EmployeeListContainer";

type EmployeesPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
  { params, searchParams }: EmployeesPageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  return {
    title: "Quản lý lớp học",
    description: "Quản lý lớp học",
  };
}

const EmployeePage: React.FC<EmployeesPageProps> = async () => {
  return (
    <PageContainer title="Danh sách người dùng" breadcrumbs={[{ title: "Nhân viên", path: "/admin/employees" }]}>
      <EmployeeListContainer />
    </PageContainer>
  );
};
export default EmployeePage;
