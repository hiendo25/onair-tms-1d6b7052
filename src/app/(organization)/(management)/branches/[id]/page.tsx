import { cache } from "react";
import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";

import { PATHS } from "@/constants/path.constant";
import organizationAuth from "@/lib/auth";
import { branchRepository } from "@/repository";
import InfoGroupCard from "@/shared/ui/InfoGroupCard";
import PageContainer from "@/shared/ui/PageContainer";

import DepartmentListContainer from "./_components/DepartmentListContainer";
import TestServerComp from "./TestServerComponent";

interface BranchDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const getBranchDetailById = cache(async (branchId: string) => {
  return await branchRepository.getBranchById(branchId);
});

export async function generateMetadata(
  { params, searchParams }: BranchDetailPageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { id } = await params;

  const branchDetail = await getBranchDetailById(id);

  return {
    title: branchDetail?.name || "Quản lý chi nhánh",
    description: "Quản lý chi nhánh",
  };
}

export default async function BranchDetailRoute({ params }: BranchDetailPageProps) {
  const { id } = await params;

  const auth = await organizationAuth();

  console.log({ auth });
  const branchDetail = await getBranchDetailById(id);

  if (!branchDetail) {
    notFound();
  }

  const breadcrumbs = [{ title: "Quản lý chi nhánh", path: PATHS.BRANCHES.LIST }, { title: branchDetail.name }];

  return (
    <PageContainer title={branchDetail.name} breadcrumbs={breadcrumbs}>
      <InfoGroupCard
        title="Thông tin chi nhánh"
        description="Thông tin cơ bản và mã định danh chi nhánh."
        items={[
          { label: "Tên chi nhánh", value: branchDetail.name },
          { label: "Mã chi nhánh", value: branchDetail.code },
          { label: "Địa điểm", value: branchDetail.address },
          { label: "Ngày tạo", value: branchDetail.created_at },
        ]}
      />
      <DepartmentListContainer branchId={branchDetail.id} />
      <TestServerComp />
    </PageContainer>
  );
}
