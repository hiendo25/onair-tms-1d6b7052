"use client";

import React from "react";
import {
  Box,
  Typography,
  Stack,
  Radio,
  RadioGroup,
  FormControlLabel,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { QuestionOption } from "@/types/dto/assignments";

interface RadioAnswerDisplayProps {
  selectedOptionId: string | undefined;
  options: QuestionOption[] | undefined;
}

const RadioAnswerDisplay: React.FC<RadioAnswerDisplayProps> = ({
  selectedOptionId,
  options,
}) => {
  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Câu trả lời của học viên:
      </Typography>
      <RadioGroup value={selectedOptionId || ""}>
        {options?.map((option) => {
          const isSelected = option.id === selectedOptionId;
          const isCorrectOption = option.correct;

          return (
            <FormControlLabel
              key={option.id}
              value={option.id}
              control={<Radio size="small" disabled />}
              label={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="body2">{option.label}</Typography>
                  {isSelected && isCorrectOption && (
                    <CheckCircleIcon fontSize="small" color="success" />
                  )}
                  {isSelected && !isCorrectOption && (
                    <CancelIcon fontSize="small" color="error" />
                  )}
                  {!isSelected && isCorrectOption && (
                    <Typography variant="caption" color="success.main">
                      (Đáp án đúng)
                    </Typography>
                  )}
                </Stack>
              }
              sx={{ mb: 0.5 }}
            />
          );
        })}
      </RadioGroup>
    </Box>
  );
};

export default RadioAnswerDisplay;

