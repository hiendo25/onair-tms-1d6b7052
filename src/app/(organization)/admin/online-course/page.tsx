import { Metadata, ResolvingMetadata } from "next";
import { redirect } from "next/navigation";

import { PATHS } from "@/constants/path.constant";

type ManageCourseProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
  { params, searchParams }: ManageCourseProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  return {
    title: "Quản lý môn học",
    description: "Quản lý môn học",
  };
}

export default function ManageClassRoomPage(props: ManageCourseProps) {
  redirect(PATHS.COURSES.LIST);
}
