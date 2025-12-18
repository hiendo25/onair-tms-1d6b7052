import { notFound } from "next/navigation";

import { getClassRoomBySlug } from "@/repository/class-room";

import ClassRoomDetailSection from "./_components/ClassRoomDetailSection";

interface ClassRoomDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ClassRoomDetailPage({ params }: ClassRoomDetailPageProps) {
  const slug = (await params).slug as string;

  const data = await getClassRoomBySlug(slug);

  if (!data || !data.data) throw notFound();

  return <ClassRoomDetailSection data={data.data} />;
}
