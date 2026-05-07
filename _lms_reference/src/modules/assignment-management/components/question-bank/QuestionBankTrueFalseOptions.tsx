import React, { memo } from "react";
import { Box, Radio, Stack, Typography } from "@mui/material";
import { useFormContext, useWatch } from "react-hook-form";

import useQuestionEditorHandlers from "@/modules/assignment-management/hooks/useQuestionEditorHandlers";

import { QuestionBankFormValues } from "./question-bank.schema";

interface QuestionBankTrueFalseOptionsProps {
  questionIndex?: number;
}

const QuestionBankTrueFalseOptions = ({ questionIndex = 0 }: QuestionBankTrueFalseOptionsProps) => {
  const { control, setValue } = useFormContext<QuestionBankFormValues>();
  const options = useWatch({ control, name: `questions.${questionIndex}.options` }) || [];

  const { handleOptionCorrectChange } = useQuestionEditorHandlers({ setValue });

  return (
    <Stack spacing={2}>
      {options.map((option, optionIndex) => (
        <Box
          key={option.id}
          className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3"
          onClick={() => handleOptionCorrectChange(questionIndex, optionIndex, true, options, "true_false")}
        >
          <Radio
            checked={option.correct}
            onChange={() => handleOptionCorrectChange(questionIndex, optionIndex, true, options, "true_false")}
          />
          <Typography className="text-sm font-medium text-gray-800">{option.label}</Typography>
        </Box>
      ))}
    </Stack>
  );
};

export default memo(QuestionBankTrueFalseOptions);
