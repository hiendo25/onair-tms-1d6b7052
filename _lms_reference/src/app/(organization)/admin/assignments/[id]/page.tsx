import React from "react";

import AssignmentBankDetailView from "./_components/AssignmentBankDetailView";

type AssignmentBankDetailPageProps = {
  params: Promise<{ id: string }>;
};

const AssignmentBankDetailPage = async ({ params }: AssignmentBankDetailPageProps) => {
  const { id } = await params;

  return <AssignmentBankDetailView assignmentId={id} />;
};

export default AssignmentBankDetailPage;
