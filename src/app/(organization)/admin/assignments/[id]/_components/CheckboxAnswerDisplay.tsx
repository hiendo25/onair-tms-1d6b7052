"use client";

import React from "react";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import {
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Stack,
  Typography,
} from "@mui/material";

import { QuestionOption } from "@/types/dto/assignments";

interface CheckboxAnswerDisplayProps {
  selectedOptionIds: string[] | undefined;
  options: QuestionOption[] | undefined;
}

const CheckboxAnswerDisplay: React.FC<CheckboxAnswerDisplayProps> = ({
  selectedOptionIds,
  options,
}) => {
  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Câu trả lời của học viên:
      </Typography>
      <FormGroup>
        {options?.map((option) => {
          const isSelected = selectedOptionIds?.includes(option.id);
          const isCorrectOption = option.correct;

          return (
            <FormControlLabel
              key={option.id}
              control={<Checkbox size="small" checked={isSelected} disabled />}
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
      </FormGroup>
    </Box>
  );
};

export default CheckboxAnswerDisplay;

