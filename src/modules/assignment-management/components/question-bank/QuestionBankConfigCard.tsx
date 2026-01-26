import React, { memo } from "react";
import { FormControl, FormHelperText, FormLabel, MenuItem, Select, Stack, Typography } from "@mui/material";
import { useController, useFormContext } from "react-hook-form";

import {
  QUESTION_DIFFICULTY_LABELS,
  QuestionDifficulty,
} from "@/modules/assignment-management/constants/question.constants";

import { QuestionBankFormValues } from "./question-bank.schema";
import QuestionBankCategorySelector from "./QuestionBankCategorySelector";

const QuestionBankConfigCard = () => {
  const { control } = useFormContext<QuestionBankFormValues>();
  const {
    field: difficultyField,
    fieldState: difficultyState,
  } = useController({
    control,
    name: "difficulty",
  });

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <Typography className="text-lg font-semibold text-gray-900">Cấu hình</Typography>

      <Stack spacing={3} sx={{ mt: 3 }}>
        <QuestionBankCategorySelector />

        <FormControl error={!!difficultyState.error}>
          <FormLabel className="text-sm">
            Độ khó <span className="text-red-500">*</span>
          </FormLabel>
          <Select
            value={difficultyField.value || ""}
            onChange={(event) => difficultyField.onChange(event.target.value as QuestionDifficulty)}
            size="small"
            displayEmpty
          >
            <MenuItem value="" disabled>
              Chọn độ khó
            </MenuItem>
            <MenuItem value="easy">{QUESTION_DIFFICULTY_LABELS.easy}</MenuItem>
            <MenuItem value="medium">{QUESTION_DIFFICULTY_LABELS.medium}</MenuItem>
            <MenuItem value="hard">{QUESTION_DIFFICULTY_LABELS.hard}</MenuItem>
          </Select>
          {difficultyState.error?.message ? <FormHelperText>{difficultyState.error.message}</FormHelperText> : null}
        </FormControl>
      </Stack>
    </div>
  );
};

export default memo(QuestionBankConfigCard);
