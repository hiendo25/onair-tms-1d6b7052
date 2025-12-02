import PlanDetailPageClient from "./_components/PlanDetailPage";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function PlanDetailPage({ params }: PageProps) {
  const {id} = await params
  return <PlanDetailPageClient id={id} />;
}

