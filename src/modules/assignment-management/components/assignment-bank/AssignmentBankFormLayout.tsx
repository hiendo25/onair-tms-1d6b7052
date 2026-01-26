import React, { memo } from "react";
import { Grid, Stack } from "@mui/material";

import AssignmentBankConfigCard from "./AssignmentBankConfigCard";
import AssignmentBankInformationCard from "./AssignmentBankInformationCard";
import AssignmentBankSummaryCard from "./AssignmentBankSummaryCard";

interface AssignmentBankFormLayoutProps {
  selectedCount: number;
  onOpenQuestionDialog: () => void;
  onCreateQuestion: () => void;
  questionError?: string;
  totalQuestions: number;
  totalScore: number;
}

const AssignmentBankFormLayout = ({
  selectedCount,
  onOpenQuestionDialog,
  onCreateQuestion,
  questionError,
  totalQuestions,
  totalScore,
}: AssignmentBankFormLayoutProps) => {
  return (
    <div className="flex flex-col gap-6">
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <AssignmentBankInformationCard
            selectedCount={selectedCount}
            onOpenQuestionDialog={onOpenQuestionDialog}
            onCreateQuestion={onCreateQuestion}
            questionError={questionError}
            totalScore={totalScore}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={3}>
            <AssignmentBankConfigCard />
            <AssignmentBankSummaryCard totalQuestions={totalQuestions} totalScore={totalScore} />
          </Stack>
        </Grid>
      </Grid>
    </div>
  );
};

export default memo(AssignmentBankFormLayout);
