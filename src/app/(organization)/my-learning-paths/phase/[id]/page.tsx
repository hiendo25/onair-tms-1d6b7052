import LearningPathPhaseDetailContent from "./_components/LearningPathPhaseDetailContent";

interface LearningPathPhasePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function LearningPathPhasePage({ params }: LearningPathPhasePageProps) {
  const { id } = await params;

  return <LearningPathPhaseDetailContent phaseId={id} />;
}
