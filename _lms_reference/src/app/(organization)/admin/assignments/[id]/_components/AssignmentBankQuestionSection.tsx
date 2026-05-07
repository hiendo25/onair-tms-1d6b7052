import React, { memo } from "react";
import { Card, Stack, Typography } from "@mui/material";

import type { AssignmentBankDto } from "@/types/dto/assignment-bank";

import AssignmentBankQuestionList from "./AssignmentBankQuestionList";

interface AssignmentBankQuestionSectionProps {
  questions: NonNullable<AssignmentBankDto["assignment_questions"]>;
  totalQuestions: number;
  description: string;
  createdAtLabel: string;
}

const AssignmentBankQuestionSection = ({
  questions,
  totalQuestions,
  description,
  createdAtLabel,
}: AssignmentBankQuestionSectionProps) => {
  return (
    <Card sx={{ borderRadius: 3, border: "1px solid", borderColor: "grey.200", boxShadow: "none" }}>
      <Stack spacing={2} sx={{ p: { xs: 2, md: 3 } }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={1}
        >
          <Stack spacing={0.5}>
            <Typography variant="subtitle1" fontWeight={600} color="text.primary">
              Danh sách câu hỏi ({totalQuestions} câu)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {description || "--"}
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Đã tạo: {createdAtLabel}
          </Typography>
        </Stack>
      </Stack>
      <AssignmentBankQuestionList questions={questions} />
    </Card>
  );
};

export default memo(AssignmentBankQuestionSection);
