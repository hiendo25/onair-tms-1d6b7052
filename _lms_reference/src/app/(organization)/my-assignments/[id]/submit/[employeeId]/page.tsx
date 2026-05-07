import AssignmentSubmission from "@/app/(organization)/admin/assignments/[id]/submit/[employeeId]/_components/AssignmentSubmission";
import { PATHS } from "@/constants/path.constant";

const StudentAssignmentSubmissionPage = async () => {
  return <AssignmentSubmission basePath={PATHS.MY_ASSIGNMENTS.ROOT} />;
};

export default StudentAssignmentSubmissionPage;
