import AssignmentResult from "./_components/AssignmentResult";

interface AssignmentResultPageProps {
  params: Promise<{
    id: string;
    employeeId: string;
  }>;
}

const AssignmentResultPage = async ({ params }: AssignmentResultPageProps) => {
  const { id, employeeId } = await params;

  return <AssignmentResult assignmentId={id} employeeId={employeeId} />;
};

export default AssignmentResultPage;

