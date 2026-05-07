import React, { memo } from "react";
import { FormControl, FormLabel, MenuItem, Select, Stack } from "@mui/material";
import { useFormContext, useWatch } from "react-hook-form";

import { QUESTION_TYPE_LABELS, QuestionType } from "@/modules/assignment-management/constants/question.constants";
import useQuestionEditorHandlers from "@/modules/assignment-management/hooks/useQuestionEditorHandlers";
import FileUpload from "@/shared/ui/form/FileUpload";
import RHFNumberField from "@/shared/ui/form/RHFNumberField";
import RHFTextAreaField from "@/shared/ui/form/RHFTextAreaField";

import { QuestionBankFormValues } from "./question-bank.schema";

interface QuestionBankContentCardProps {
  questionIndex?: number;
}

const QuestionBankContentCard = ({ questionIndex = 0 }: QuestionBankContentCardProps) => {
  const { control, setValue } = useFormContext<QuestionBankFormValues>();
  const questionType = useWatch({ control, name: `questions.${questionIndex}.type` }) || "file";
  const attachments = useWatch({ control, name: `questions.${questionIndex}.attachments` }) || [];

  const { handleQuestionTypeChange } = useQuestionEditorHandlers({ setValue });

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <Stack spacing={3}>
        <RHFTextAreaField
          control={control}
          name={`questions.${questionIndex}.label`}
          label="Nội dung câu hỏi"
          placeholder="Nhập nội dung câu hỏi"
          required
          minRows={4}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormControl>
            <FormLabel className="text-sm">
              Loại câu hỏi <span className="text-red-500">*</span>
            </FormLabel>
            <Select
              value={questionType}
              onChange={(event) => handleQuestionTypeChange(questionIndex, event.target.value as QuestionType)}
              size="small"
            >
              <MenuItem value="file">{QUESTION_TYPE_LABELS.file}</MenuItem>
              <MenuItem value="text">{QUESTION_TYPE_LABELS.text}</MenuItem>
              <MenuItem value="checkbox">{QUESTION_TYPE_LABELS.checkbox}</MenuItem>
              <MenuItem value="radio">{QUESTION_TYPE_LABELS.radio}</MenuItem>
              <MenuItem value="matching">{QUESTION_TYPE_LABELS.matching}</MenuItem>
              <MenuItem value="true_false">{QUESTION_TYPE_LABELS.true_false}</MenuItem>
              <MenuItem value="order">{QUESTION_TYPE_LABELS.order}</MenuItem>
            </Select>
          </FormControl>

          <RHFNumberField
            control={control}
            name={`questions.${questionIndex}.score`}
            label="Điểm"
            placeholder="10"
            required
            inputProps={{ min: 0.1, step: 0.1 }}
          />
        </div>

        <FileUpload
          value={attachments}
          onChange={(urls) => setValue(`questions.${questionIndex}.attachments`, urls)}
          label="Đính kèm tệp tin (không bắt buộc)"
        />
      </Stack>
    </div>
  );
};

export default memo(QuestionBankContentCard);
