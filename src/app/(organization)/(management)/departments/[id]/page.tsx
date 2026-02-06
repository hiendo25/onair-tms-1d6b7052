import React, { cache, Suspense } from "react";
import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";

import { PATHS } from "@/constants/path.constant";
import organizationAuth from "@/lib/auth";
import { departmentsRepository } from "@/repository";
import PageContainer from "@/shared/ui/PageContainer";

import DepartmentEmployeesContainer from "./_components/DepartmentEmployeesContainer";
import DepartmentGroupsContainer from "./_components/DepartmentGroupsContainer";
import DepartmentInformationContainer from "./_components/DepartmentInformationContainer";
interface DepartmentDetailPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<Record<string, any>>;
}

const getDepartmentDetail = cache(async (id: string) => {
  return await departmentsRepository.getDepartmentById(id);
});

export async function generateMetadata(
  { params, searchParams }: DepartmentDetailPageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { id } = await params;

  const departmentDetail = await getDepartmentDetail(id);

  return {
    title: departmentDetail?.name,
    description: "Quản lý phòng ban",
  };
}

export default async function DepartmentDetailPage({ params }: DepartmentDetailPageProps) {
  const { id } = await params;

  const { organizationId, employeeId } = await organizationAuth();

  const departmentDetail = await getDepartmentDetail(id);

  if (!departmentDetail) {
    notFound();
  }
  const breadcrumbs = [{ title: "Phòng ban", path: PATHS.DEPARTMENTS.ROOT }, { title: departmentDetail.name }];

  // console.log({ departmentDetail });
  return (
    <PageContainer title={departmentDetail.name} breadcrumbs={breadcrumbs}>
      <DepartmentInformationContainer
        name={departmentDetail.name}
        code={departmentDetail.code ?? undefined}
        branchCode={departmentDetail.branch?.code}
        branchName={departmentDetail.branch?.name}
        createdAt={departmentDetail.created_at}
        updatedAt={departmentDetail.updated_at ?? undefined}
        managedName={departmentDetail.managedBy?.full_name || departmentDetail.managedBy?.profiles?.full_name}
        status={departmentDetail.status ?? undefined}
        data={departmentDetail}
      />
      <div className="line my-6 bg-gray-200 h-px"></div>
      <DepartmentGroupsContainer departmentId={departmentDetail.id} />
      <div className="line my-6 bg-gray-200 h-px"></div>
      <DepartmentEmployeesContainer departmentId={departmentDetail.id} />
    </PageContainer>
  );
}
