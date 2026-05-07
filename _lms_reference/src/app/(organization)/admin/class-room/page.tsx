import { Metadata, ResolvingMetadata } from "next";
import { redirect } from "next/navigation";

import { PATHS } from "@/constants/path.constant";

type ManageClassRoomPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
  { params, searchParams }: ManageClassRoomPageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  return {
    title: "Quản lý lớp học",
    description: "Quản lý lớp học",
  };
}

export default function ManageClassRoomPage(props: ManageClassRoomPageProps) {
  redirect(PATHS.CLASSROOMS.LIST_CLASSROOM);
}
