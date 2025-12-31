import LearningPathPhaseDetailContent from "./_components/LearningPathPhaseDetailContent";

interface LearningPathPhasePageProps {
  params: Promise<{
    phaseId: string;
  }>;
}

export default async function LearningPathPhasePage({ params }: LearningPathPhasePageProps) {
  const { phaseId } = await params;

  return <LearningPathPhaseDetailContent phaseId={phaseId} />;
}
