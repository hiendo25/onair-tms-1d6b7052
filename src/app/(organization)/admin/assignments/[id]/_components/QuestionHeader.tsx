"use client";

import React from "react";
import { Stack, Typography, Chip } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

interface QuestionHeaderProps {
  questionNumber: number;
  questionLabel: string;
  maxScore: number;
  earnedScore: number | null;
  isAutoGraded?: boolean;
}

const QuestionHeader: React.FC<QuestionHeaderProps> = ({
  questionNumber,
  questionLabel,
  maxScore,
  earnedScore,
  isAutoGraded = false,
}) => {
  const isCorrect = earnedScore === maxScore;

  return (
    <>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Câu {questionNumber} ({maxScore} điểm)
        </Typography>
        {isAutoGraded && (
          <Chip
            icon={isCorrect ? <CheckCircleIcon /> : <CancelIcon />}
            label={`${earnedScore}/${maxScore} điểm`}
            color={isCorrect ? "success" : "error"}
            size="small"
          />
        )}
      </Stack>

      <Typography variant="body1" sx={{ mb: 2 }}>
        {questionLabel}
      </Typography>
    </>
  );
};

export default QuestionHeader;

