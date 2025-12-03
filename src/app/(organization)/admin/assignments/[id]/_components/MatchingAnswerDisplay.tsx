"use client";

import React from "react";
import {
  Box,
  Typography,
  Stack,
  Paper,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

interface MatchingAnswerDisplayProps {
  studentMappings: Array<{ columnAId: string; columnBId: string }> | undefined;
  columnAItems: Array<{ id: string; content: string }>;
  columnBItems: Array<{ id: string; content: string }>;
  correctMappings: Array<{ columnAId: string; columnBId: string }>;
}

const MatchingAnswerDisplay: React.FC<MatchingAnswerDisplayProps> = ({
  studentMappings,
  columnAItems,
  columnBItems,
  correctMappings,
}) => {
  // Helper function to check if a student mapping is correct
  const isMappingCorrect = (columnAId: string, columnBId: string): boolean => {
    return correctMappings.some(
      (cm) => cm.columnAId === columnAId && cm.columnBId === columnBId
    );
  };

  // Helper function to get the correct Column B item for a Column A item
  const getCorrectColumnBId = (columnAId: string): string | undefined => {
    return correctMappings.find((cm) => cm.columnAId === columnAId)?.columnBId;
  };

  // Helper function to get Column B content by ID
  const getColumnBContent = (columnBId: string): string => {
    return columnBItems.find((item) => item.id === columnBId)?.content || "";
  };

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Câu trả lời của học viên:
      </Typography>

      <Stack spacing={1.5}>
        {columnAItems.map((itemA) => {
          const studentMapping = studentMappings?.find(
            (sm) => sm.columnAId === itemA.id
          );
          const correctColumnBId = getCorrectColumnBId(itemA.id);
          const isCorrect = studentMapping
            ? isMappingCorrect(itemA.id, studentMapping.columnBId)
            : false;

          return (
            <Paper
              key={itemA.id}
              variant="outlined"
              sx={{
                p: 2,
                backgroundColor: isCorrect ? "success.lighter" : "error.lighter",
                borderColor: isCorrect ? "success.main" : "error.main",
              }}
            >
              <Stack spacing={1}>
                {/* Column A Item */}
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {itemA.content}
                </Typography>

                {/* Student's Answer */}
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    Ghép với:
                  </Typography>
                  <Typography variant="body2">
                    {studentMapping
                      ? getColumnBContent(studentMapping.columnBId)
                      : "(Chưa ghép)"}
                  </Typography>
                  {isCorrect ? (
                    <CheckCircleIcon fontSize="small" color="success" />
                  ) : (
                    <CancelIcon fontSize="small" color="error" />
                  )}
                </Stack>

                {/* Show correct answer if student's answer is wrong */}
                {!isCorrect && correctColumnBId && (
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                      Đáp án đúng:
                    </Typography>
                    <Typography variant="body2" color="success.main">
                      {getColumnBContent(correctColumnBId)}
                    </Typography>
                  </Stack>
                )}
              </Stack>
            </Paper>
          );
        })}
      </Stack>
    </Box>
  );
};

export default MatchingAnswerDisplay;

