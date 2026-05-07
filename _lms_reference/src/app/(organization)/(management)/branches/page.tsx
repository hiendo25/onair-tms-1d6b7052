import { Metadata, ResolvingMetadata } from "next";
import { redirect } from "next/navigation";

type RootBranchPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
  { params, searchParams }: RootBranchPageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  return {
    title: "Quản lý chi nhánh",
    description: "Quản lý chi nhánh",
  };
}

export default function RootBranchesPage(props: RootBranchPageProps) {
  redirect("/branches/list");
}
