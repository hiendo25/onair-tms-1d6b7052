interface EditPlanPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditPlanPage({ params }: EditPlanPageProps) {
  const { id } = await params;

  return (
    <div>
      <p>Edit page</p>
    </div>
  );
}

