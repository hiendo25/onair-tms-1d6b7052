import { Metadata, ResolvingMetadata } from "next";

import { PATHS } from "@/constants/path.constant";
import PageContainer from "@/shared/ui/PageContainer";
import DepartmentListContainer from "../_components/DepartmentListContainer";
type ManageBranchProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
  { params, searchParams }: ManageBranchProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  return {
    title: "Quản lý phòng ban",
    description: "Quản lý phòng ban",
  };
}

export default function BranchesPage(props: ManageBranchProps) {
  return (
    <PageContainer
      title="Quản lý phòng ban"
      breadcrumbs={[{ title: "Quản lý phòng ban", path: PATHS.DEPARTMENTS.ROOT }, { title: "Danh sách phòng ban" }]}
    >
      <DepartmentListContainer />
    </PageContainer>
  );
}
