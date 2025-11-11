 import AssignmentSubmission from "@/app/(organization)/assignments/[id]/submit/[employeeId]/_components/AssignmentSubmission";
import { PATHS } from "@/constants/path.contstants";

const StudentAssignmentSubmissionPage = async () => {
  return <AssignmentSubmission basePath={PATHS.MY_ASSIGNMENTS.ROOT} />;
};

export default StudentAssignmentSubmissionPage;

