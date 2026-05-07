import React from "react";

import AssignmentBankAssignView from "./_components/AssignmentBankAssignView";

type AssignmentBankAssignPageProps = {
  params: Promise<{ id: string }>;
};

const AssignmentBankAssignPage = async ({ params }: AssignmentBankAssignPageProps) => {
  const { id } = await params;
  return <AssignmentBankAssignView assignmentId={id} />;
};

export default AssignmentBankAssignPage;
