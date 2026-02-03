"use client";

import React from "react";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Box, Paper, Typography } from "@mui/material";

interface TrueFalseAnswerDisplayProps {
  studentAnswer?: boolean | null;
  correctAnswer: boolean;
  showCorrectAnswers: boolean;
}

export default function TrueFalseAnswerDisplay({
  studentAnswer,
  correctAnswer,
  showCorrectAnswers,
}: TrueFalseAnswerDisplayProps) {
  const hasAnswer = studentAnswer !== undefined && studentAnswer !== null;
  const isCorrect = showCorrectAnswers && hasAnswer && studentAnswer === correctAnswer;
  const borderColor = showCorrectAnswers
    ? hasAnswer
      ? isCorrect
        ? "success.main"
        : "error.main"
      : "grey.400"
    : "grey.300";
  const bgColor = showCorrectAnswers
    ? hasAnswer
      ? isCorrect
        ? "success.50"
        : "error.50"
      : "grey.50"
    : "grey.50";

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
        Câu trả lời của học viên:
      </Typography>
      <Paper
        elevation={1}
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          gap: 2,
          border: "1px solid",
          borderColor,
          bgcolor: bgColor,
        }}
      >
        <Typography sx={{ flex: 1, fontWeight: 600 }}>
          {!hasAnswer ? "Chưa trả lời" : studentAnswer ? "Đúng" : "Sai"}
        </Typography>
        {showCorrectAnswers && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {!hasAnswer ? (
              <Typography variant="body2" color="text.secondary">
                Đáp án đúng: {correctAnswer ? "Đúng" : "Sai"}
              </Typography>
            ) : isCorrect ? (
              <CheckCircleIcon color="success" />
            ) : (
              <>
                <CancelIcon color="error" />
                <Typography variant="body2" color="error">
                  Đáp án đúng: {correctAnswer ? "Đúng" : "Sai"}
                </Typography>
              </>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
}
