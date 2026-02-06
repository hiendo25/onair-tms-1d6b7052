"use client";

import React from "react";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import {
  Box,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

interface MatchingAnswerDisplayProps {
  studentMappings: Array<{ columnAId: string; columnBId: string }> | undefined;
  columnAItems: Array<{ id: string; content: string }>;
  columnBItems: Array<{ id: string; content: string }>;
  correctMappings: Array<{ columnAId: string; columnBId: string }>;
  showCorrectAnswers: boolean;
}

const MatchingAnswerDisplay: React.FC<MatchingAnswerDisplayProps> = ({
  studentMappings,
  columnAItems,
  columnBItems,
  correctMappings,
  showCorrectAnswers,
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
          const isCorrect = showCorrectAnswers && studentMapping
            ? isMappingCorrect(itemA.id, studentMapping.columnBId)
            : false;
          const borderColor = showCorrectAnswers ? (isCorrect ? "success.main" : "error.main") : "grey.300";
          const backgroundColor = showCorrectAnswers ? (isCorrect ? "success.lighter" : "error.lighter") : "grey.50";

          return (
            <Paper
              key={itemA.id}
              variant="outlined"
              sx={{
                p: 2,
                backgroundColor,
                borderColor,
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
                  {showCorrectAnswers && (isCorrect ? (
                    <CheckCircleIcon fontSize="small" color="success" />
                  ) : (
                    <CancelIcon fontSize="small" color="error" />
                  ))}
                </Stack>

                {/* Show correct answer if student's answer is wrong */}
                {showCorrectAnswers && !isCorrect && correctColumnBId && (
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
