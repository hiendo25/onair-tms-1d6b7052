import React, { memo } from "react";
import { Box, Stack, Typography } from "@mui/material";

import type { AssignmentBankDto } from "@/types/dto/assignment-bank";

import AssignmentBankQuestionItem from "./AssignmentBankQuestionItem";

interface AssignmentBankQuestionListProps {
  questions: NonNullable<AssignmentBankDto["assignment_questions"]>;
}

const AssignmentBankQuestionList = ({ questions }: AssignmentBankQuestionListProps) => {
  if (questions.length === 0) {
    return (
      <Box sx={{ px: { xs: 2, md: 3 }, pb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Chưa có câu hỏi nào.
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={0}>
      {questions.map((question, index) => (
        <AssignmentBankQuestionItem
          key={question.question_id}
          question={question}
          index={index + 1}
          showTopBorder={index === 0}
        />
      ))}
    </Stack>
  );
};

export default memo(AssignmentBankQuestionList);
