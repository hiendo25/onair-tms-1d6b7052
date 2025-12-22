import BranchDetailPage from "./_components/BranchDetailPage";

interface BranchDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function BranchDetailRoute({ params }: BranchDetailPageProps) {
  const { id } = await params;
  return <BranchDetailPage id={id} />;
}
