import ClassRoomDetailSection from "./_components/ClassRoomDetailSection";

interface ClassRoomDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ClassRoomDetailPage({ params }: ClassRoomDetailPageProps) {
  const slug = (await params).slug as string;

  return <ClassRoomDetailSection slug={slug} />;
}
