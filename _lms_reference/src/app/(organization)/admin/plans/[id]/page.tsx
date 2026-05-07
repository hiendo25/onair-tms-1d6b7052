import PlanDetailPageClient from "./_components/PlanDetailPage";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PlanDetailPage({ params }: PageProps) {
  const {id} = await params
  return <PlanDetailPageClient id={id} />;
}

