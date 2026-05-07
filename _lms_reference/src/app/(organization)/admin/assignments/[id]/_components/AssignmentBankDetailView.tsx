"use client";

import React from "react";
import { Alert, Box, CircularProgress, Stack } from "@mui/material";

import { PATHS } from "@/constants/path.constant";
import { fDate } from "@/lib/dayjs";
import { useGetAssignmentBankByIdQuery } from "@/modules/assignment-management/operations/query";
import { calculateAssignmentBankTotals } from "@/modules/assignment-management/utils/assignment-bank.utils";
import { useUserOrganization } from "@/modules/organization";
import PageContainer from "@/shared/ui/PageContainer";

import AssignmentBankQuestionSection from "./AssignmentBankQuestionSection";
import AssignmentBankSummaryCards from "./AssignmentBankSummaryCards";

interface AssignmentBankDetailViewProps {
  assignmentId: string;
}

const AssignmentBankDetailView = ({ assignmentId }: AssignmentBankDetailViewProps) => {
  const currentOrganization = useUserOrganization((state) => state.currentOrganization);
  const organizationId = currentOrganization.orgId;

  const {
    data: assignment,
    isLoading,
    error,
  } = useGetAssignmentBankByIdQuery(assignmentId, organizationId);

  if (isLoading) {
    return (
      <PageContainer
        title="Chi tiết bài kiểm tra"
        breadcrumbs={[{ title: "Bài kiểm tra", path: PATHS.ASSIGNMENTS.ROOT }]}
      >
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (error || !assignment) {
    return (
      <PageContainer
        title="Chi tiết bài kiểm tra"
        breadcrumbs={[{ title: "Bài kiểm tra", path: PATHS.ASSIGNMENTS.ROOT }]}
      >
        <Alert severity="error">Không thể tải dữ liệu bài kiểm tra</Alert>
      </PageContainer>
    );
  }

  const { totalQuestions, totalScore } = calculateAssignmentBankTotals(assignment);
  const durationLabel = assignment.duration_minutes ? `${assignment.duration_minutes} phút` : "--";
  const passScoreValue = assignment.pass_score ?? null;
  const passScoreLabel =
    passScoreValue !== null && totalScore > 0
      ? `${passScoreValue}/${totalScore}`
      : passScoreValue !== null
        ? `${passScoreValue}`
        : "--";
  const createdAtLabel = assignment.created_at ? (fDate(assignment.created_at, "D MMMM, YYYY") ?? "--") : "--";

  return (
    <PageContainer
      title={assignment.name}
      breadcrumbs={[
        { title: "Bài kiểm tra", path: PATHS.ASSIGNMENTS.ROOT },
        { title: assignment.name },
      ]}
    >
      <Stack spacing={3}>
        <AssignmentBankSummaryCards
          durationLabel={durationLabel}
          totalQuestionsLabel={`${totalQuestions}`}
          passScoreLabel={passScoreLabel}
        />
        <AssignmentBankQuestionSection
          questions={assignment.assignment_questions ?? []}
          totalQuestions={totalQuestions}
          description={assignment.description}
          createdAtLabel={createdAtLabel}
        />
      </Stack>
    </PageContainer>
  );
};

export default AssignmentBankDetailView;
