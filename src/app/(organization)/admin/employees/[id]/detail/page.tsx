import EmployeeDetailPageClient from "./_components/EmployeeDetailPage";

interface DetailEmployeePageProps {
  params: Promise<{ id: string }>;
}

const DetailEmployeePage = async ({ params }: DetailEmployeePageProps) => {
  const { id } = await params;

  return <EmployeeDetailPageClient id={id} />;
};

export default DetailEmployeePage;
