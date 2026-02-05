import { cache, Suspense } from "react";
import { Divider } from "@mui/material";
import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";

import { PATHS } from "@/constants/path.constant";
import organizationAuth from "@/lib/auth";
import { branchRepository } from "@/repository";
import PageContainer from "@/shared/ui/PageContainer";

import BranchDepartmentListContainer from "./_components/BranchDepartmentListContainer";
import BranchInformationContainer from "./_components/BranchInformationContainer";

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

  const branchDetail = await getBranchDetailById(id);

  if (!branchDetail) {
    notFound();
  }

  const breadcrumbs = [{ title: "Quản lý chi nhánh", path: PATHS.BRANCHES.LIST }, { title: branchDetail.name }];

  return (
    <PageContainer title={branchDetail.name} breadcrumbs={breadcrumbs}>
      <BranchInformationContainer
        name={branchDetail.name}
        code={branchDetail.code}
        managedName={branchDetail.managedBy?.full_name || branchDetail.managedBy?.profiles?.full_name}
        address={branchDetail.address}
        createdAt={branchDetail.created_at}
        updatedAt={branchDetail.updated_at ?? undefined}
        data={branchDetail}
        status={branchDetail.status ?? undefined}
      />
      <Divider className="my-6" />
      <BranchDepartmentListContainer branchId={branchDetail.id} />
    </PageContainer>
  );
}
