import EditLearningPathContent from "./_components/EditLearningPathContent";

interface EditLearningPathPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditLearningPathPage({ params }: EditLearningPathPageProps) {
  const { id } = await params;

  return <EditLearningPathContent learningPathId={id} />;
}

