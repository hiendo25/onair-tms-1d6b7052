"use client";

import React from "react";
import { Box, Paper, Typography, Stack } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

interface OrderItem {
  id: string;
  content: string;
  correctOrder: number;
  displayOrder?: number; // Optional for backward compatibility
}

interface OrderAnswerDisplayProps {
  studentOrder: Array<{ id: string; position: number }>;
  correctItems: OrderItem[];
}

export default function OrderAnswerDisplay({
  studentOrder,
  correctItems,
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
      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
        Câu trả lời của học viên:
      </Typography>
      <Stack spacing={1.5}>
        {sortedByStudentOrder.map((item, index) => {
          const studentPosition = index + 1;
          const isCorrect = item.correctOrder === studentPosition;

          return (
            <Paper
              key={item.id}
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
              <Box
                sx={{
                  minWidth: 40,
                  height: 40,
                  borderRadius: "50%",
                  bgcolor: isCorrect ? "success.main" : "error.main",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                }}
              >
                {studentPosition}
              </Box>
              <Typography sx={{ flex: 1 }}>{item.content}</Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {isCorrect ? (
                  <CheckCircleIcon color="success" />
                ) : (
                  <>
                    <CancelIcon color="error" />
                    <Typography variant="body2" color="error">
                      Đúng: {item.correctOrder}
                    </Typography>
                  </>
                )}
              </Box>
            </Paper>
          );
        })}
      </Stack>
    </Box>
  );
}

