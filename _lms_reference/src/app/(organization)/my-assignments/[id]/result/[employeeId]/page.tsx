import AssignmentResult from "@/app/(organization)/admin/assignments/[id]/result/[employeeId]/_components/AssignmentResult";
import { PATHS } from "@/constants/path.constant";

interface StudentAssignmentResultPageProps {
  params: Promise<{
    id: string;
    employeeId: string;
  }>;
}

const StudentAssignmentResultPage = async ({ params }: StudentAssignmentResultPageProps) => {
  const { id, employeeId } = await params;

  return <AssignmentResult assignmentId={id} employeeId={employeeId} basePath={PATHS.MY_ASSIGNMENTS.ROOT} />;
};

export default StudentAssignmentResultPage;
