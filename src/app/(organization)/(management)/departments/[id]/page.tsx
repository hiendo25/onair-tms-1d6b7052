import DepartmentDetailPage from "./_components/DepartmentDetailPage";

interface DepartmentDetailRouteProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DepartmentDetailRoute({ params }: DepartmentDetailRouteProps) {
  const { id } = await params;
  return <DepartmentDetailPage id={id} />;
}
