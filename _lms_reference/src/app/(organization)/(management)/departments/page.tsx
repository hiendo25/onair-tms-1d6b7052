import { Metadata, ResolvingMetadata } from "next";
import { redirect } from "next/navigation";

type RootDepartmentsPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
  { params, searchParams }: RootDepartmentsPageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  return {
    title: "Quản lý phòng ban",
    description: "Quản lý phòng ban",
  };
}

export default function RootDepartmentsPage(props: RootDepartmentsPageProps) {
  redirect("/departments/list");
}
