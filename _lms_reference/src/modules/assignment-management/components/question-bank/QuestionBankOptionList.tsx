import React, { memo } from "react";
import { Box, Button, Checkbox, IconButton, Radio, Stack } from "@mui/material";
import { useFormContext, useWatch } from "react-hook-form";

import { QuestionType } from "@/modules/assignment-management/constants/question.constants";
import useQuestionEditorHandlers from "@/modules/assignment-management/hooks/useQuestionEditorHandlers";
import { TrashIcon1 } from "@/shared/assets/icons";
import PlusIcon from "@/shared/assets/icons/PlusIcon";
import RHFTextField from "@/shared/ui/form/RHFTextField";

import { QuestionBankFormValues } from "./question-bank.schema";

interface QuestionBankOptionListProps {
  questionIndex?: number;
  questionType: "checkbox" | "radio";
}

const QuestionBankOptionList = ({ questionIndex = 0, questionType }: QuestionBankOptionListProps) => {
  const { control, setValue } = useFormContext<QuestionBankFormValues>();
  const options = useWatch({ control, name: `questions.${questionIndex}.options` }) || [];

  const { handleAddOption, handleRemoveOption, handleOptionCorrectChange } = useQuestionEditorHandlers({ setValue });
  const isSingleCorrect = questionType === "radio";

  return (
    <Stack spacing={2}>
      {options.map((option, optionIndex) => (
        <Box
          key={option.id}
          className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3"
        >
          {isSingleCorrect ? (
            <Radio
              checked={option.correct}
              onChange={() =>
                handleOptionCorrectChange(questionIndex, optionIndex, true, options, questionType as QuestionType)
              }
            />
          ) : (
            <Checkbox
              checked={option.correct}
              onChange={(event) =>
                handleOptionCorrectChange(
                  questionIndex,
                  optionIndex,
                  event.target.checked,
                  options,
                  questionType as QuestionType,
                )
              }
            />
          )}

          <RHFTextField
            control={control}
            name={`questions.${questionIndex}.options.${optionIndex}.label`}
            placeholder={`Đáp án ${optionIndex + 1}`}
            className="flex-1"
          />

          <IconButton
            size="small"
            onClick={() => handleRemoveOption(questionIndex, optionIndex, options)}
            disabled={options.length === 1}
          >
            <TrashIcon1 className="w-4 h-4" />
          </IconButton>
        </Box>
      ))}

      <Button
        onClick={() => handleAddOption(questionIndex, options)}
        startIcon={<PlusIcon />}
        variant="outlined"
        size="small"
        className="self-start"
      >
        Thêm đáp án
      </Button>
    </Stack>
  );
};

export default memo(QuestionBankOptionList);
