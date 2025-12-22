import { Metadata, ResolvingMetadata } from "next";

import PageContainer from "@/shared/ui/PageContainer";

import BranchList from "./_components/BranchList";

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
    <PageContainer title="Quản lý Chi nhánh" breadcrumbs={[{ title: "Chi nhánh", path: "/department/branches" }]}>
      <BranchList />
    </PageContainer>
  );
}
