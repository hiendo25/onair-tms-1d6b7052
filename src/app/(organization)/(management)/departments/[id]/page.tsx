import React, { cache } from "react";
import { Button, Stack, Typography } from "@mui/material";
import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";

import { PATHS } from "@/constants/path.constant";
import { departmentsRepository } from "@/repository";
import PlusIcon from "@/shared/assets/icons/PlusIcon";
import InfoGroupCard from "@/shared/ui/InfoGroupCard";
import PageContainer from "@/shared/ui/PageContainer";

import DepartmentGroupContainer from "./_components/DepartmentGroupContainer";
import DepartmentInformationContainer from "./_components/DepartmentInformationContainer";
import EmployeeTableData from "./_components/EmployeesTableData";
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

  const departmentDetail = await getDepartmentDetail(id);

  if (!departmentDetail) {
    notFound();
  }
  const breadcrumbs = [{ title: "Phòng ban", path: PATHS.DEPARTMENTS.ROOT }, { title: departmentDetail.name }];

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
      <DepartmentGroupContainer departmentId={departmentDetail.id} />
      <div className="line my-6 bg-gray-200 h-px"></div>
      <div className="section-content flex flex-col gap-6">
        <div className="section-content__header flex justify-between mb-3">
          <Typography component="h3" sx={{ fontSize: 18, fontWeight: 600 }}>
            Danh sách người dùng
          </Typography>
        </div>
        <div className="section-content__body">
          <EmployeeTableData departmentId={departmentDetail.id} />
        </div>
      </div>
    </PageContainer>
  );
}
