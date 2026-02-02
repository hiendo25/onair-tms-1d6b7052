import { Metadata, ResolvingMetadata } from "next";

import { PATHS } from "@/constants/path.constant";
import PageContainer from "@/shared/ui/PageContainer";
import BranchList from "../_components/BranchList";

type ManageBranchProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
  { params, searchParams }: ManageBranchProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  return {
    title: "Quản lý chi nhánh",
    description: "Quản lý chi nhánh",
  };
}

export default function BranchesPage(props: ManageBranchProps) {
  return (
    <PageContainer
      title="Quản lý Chi nhánh"
      breadcrumbs={[{ title: "Quản lý Chi nhánh", path: PATHS.BRANCHES.ROOT }, { title: "Danh sách chi nhánh" }]}
    >
      <BranchList />
    </PageContainer>
  );
}
