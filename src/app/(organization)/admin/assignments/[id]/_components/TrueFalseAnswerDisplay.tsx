"use client";

import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

interface TrueFalseAnswerDisplayProps {
  studentAnswer: boolean;
  correctAnswer: boolean;
}

export default function TrueFalseAnswerDisplay({
  studentAnswer,
  correctAnswer,
}: TrueFalseAnswerDisplayProps) {
  const isCorrect = studentAnswer === correctAnswer;

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
          borderColor: isCorrect ? "success.main" : "error.main",
          bgcolor: isCorrect ? "success.50" : "error.50",
        }}
      >
        <Typography sx={{ flex: 1, fontWeight: 600 }}>
          {studentAnswer ? "Đúng" : "Sai"}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {isCorrect ? (
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
      </Paper>
    </Box>
  );
}

