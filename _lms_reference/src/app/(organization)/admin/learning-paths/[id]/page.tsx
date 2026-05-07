import LearningPathDetailContent from "./_components/LearningPathDetailContent";

interface LearningPathDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function LearningPathDetailPage({ params }: LearningPathDetailPageProps) {
  const { id } = await params;

  return <LearningPathDetailContent learningPathId={id} />;
}
