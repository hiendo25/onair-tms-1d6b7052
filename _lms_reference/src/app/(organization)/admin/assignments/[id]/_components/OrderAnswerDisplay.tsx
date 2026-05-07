"use client";

import React from "react";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Box, Paper, Stack,Typography } from "@mui/material";

interface OrderItem {
  id: string;
  content: string;
  correctOrder: number;
  displayOrder?: number; // Optional for backward compatibility
}

interface OrderAnswerDisplayProps {
  studentOrder: Array<{ id: string; position: number }>;
  correctItems: OrderItem[];
  showCorrectAnswers: boolean;
}

export default function OrderAnswerDisplay({
  studentOrder,
  correctItems,
  showCorrectAnswers,
}: OrderAnswerDisplayProps) {
  // Create a map of student's order
  const studentOrderMap = new Map(
    studentOrder.map(item => [item.id, item.position])
  );

  // Sort items by student's order
  const sortedByStudentOrder = [...correctItems].sort((a, b) => {
    const posA = studentOrderMap.get(a.id) || 0;
    const posB = studentOrderMap.get(b.id) || 0;
    return posA - posB;
  });

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: "0.875rem" }}>
        Câu trả lời của học viên:
      </Typography>
      <Stack spacing={0.75}>
        {sortedByStudentOrder.map((item, index) => {
          const studentPosition = index + 1;
          const isCorrect = showCorrectAnswers && item.correctOrder === studentPosition;
          const borderColor = showCorrectAnswers ? (isCorrect ? "success.main" : "error.main") : "grey.300";
          const backgroundColor = showCorrectAnswers ? (isCorrect ? "success.50" : "error.50") : "grey.50";
          const badgeColor = showCorrectAnswers ? (isCorrect ? "success.main" : "error.main") : "grey.500";

          return (
            <Paper
              key={item.id}
              elevation={0}
              sx={{
                px: 1.5,
                py: 1,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                border: "1px solid",
                borderColor,
                bgcolor: backgroundColor,
                borderRadius: 1,
              }}
            >
              <Box
                sx={{
                  minWidth: 28,
                  height: 28,
                  borderRadius: "50%",
                  bgcolor: badgeColor,
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                }}
              >
                {studentPosition}
              </Box>
              <Typography variant="body2" sx={{ flex: 1, lineHeight: 1.5 }}>
                {item.content}
              </Typography>
              {showCorrectAnswers && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  {isCorrect ? (
                    <CheckCircleIcon fontSize="small" color="success" />
                  ) : (
                    <>
                      <CancelIcon fontSize="small" color="error" />
                      <Typography variant="caption" color="error" sx={{ fontSize: "0.75rem" }}>
                        Đúng: {item.correctOrder}
                      </Typography>
                    </>
                  )}
                </Box>
              )}
            </Paper>
          );
        })}
      </Stack>
    </Box>
  );
}
