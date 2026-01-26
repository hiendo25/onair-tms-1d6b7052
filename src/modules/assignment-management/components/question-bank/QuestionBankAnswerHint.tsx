import React, { memo } from "react";
import { Box, Typography } from "@mui/material";

interface QuestionBankAnswerHintProps {
  title: string;
  description: string;
}

const QuestionBankAnswerHint = ({ title, description }: QuestionBankAnswerHintProps) => {
  return (
    <Box className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-3">
      <Typography className="text-sm font-semibold text-gray-700">{title}</Typography>
      <Typography className="text-xs text-gray-600 mt-1">{description}</Typography>
    </Box>
  );
};

export default memo(QuestionBankAnswerHint);
