import React from "react";
import {
  Box,
  FormControl,
  FormHelperText,
  FormLabel,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { Control, Controller, FieldErrors, useWatch } from "react-hook-form";

import { QUESTION_TYPE_OPTIONS } from "@/constants/survey.constant";
import { FaceSadIcon, FaceSmileIcon, Trash01Icon } from "@/shared/assets/icons";
import RHFCheckboxField from "@/shared/ui/form/RHFCheckboxField";
import RHFTextField from "@/shared/ui/form/RHFTextField";

import QuestionRatingType from "./question-fields-type/QuestionRatingType";
import QuestionOptionContainer from "./QuestionOptionContainer";
import { UpsertSurveyFormData } from "./survey-form.schema";
interface QuestionContentItemProps {
  questionIndex: number;
  control: Control<UpsertSurveyFormData>;
  error?: Exclude<FieldErrors<UpsertSurveyFormData>["questions"], undefined>[number];
  onRemove?: (index: number) => void;
}
const QuestionContentItem: React.FC<QuestionContentItemProps> = ({ questionIndex, control, onRemove, error }) => {
  const questionType = useWatch({
    control,
    name: `questions.${questionIndex}.type`,
  });

  return (
    <Stack spacing={2}>
      <div className="flex flex-wrap justify-between items-center">
        <FormLabel component="div" className="mb-0 text-[16px]">{`Câu hỏi ${questionIndex + 1}`}</FormLabel>
        <IconButton color="error" onClick={() => onRemove?.(questionIndex)} size="small">
          <Trash01Icon className="w-4 h-4" />
        </IconButton>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex flex-1 gap-4">
          <RHFTextField
            label="Nội dung câu hỏi"
            name={`questions.${questionIndex}.label`}
            control={control}
            placeholder="Nội dung câu hỏi"
            required
          />
          <div className="w-60">
            <Controller
              name={`questions.${questionIndex}.type`}
              control={control}
              render={({ field: { value, onChange } }) => (
                <FormControl fullWidth size="small">
                  <FormLabel className="opacity-0">Loại câu hỏi</FormLabel>
                  <Select onChange={onChange} value={value}>
                    {QUESTION_TYPE_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </div>
        </div>
        <RHFCheckboxField
          name={`questions.${questionIndex}.is_required`}
          control={control}
          label="Câu hỏi bắt buộc"
          className="w-fit"
        />
      </div>
      <div className="question-type-options">
        {(questionType === "sort_rating" || questionType === "radio" || questionType === "checkbox") && (
          <div className={`question-${questionType}`}>
            <FormLabel component="div">
              Tùy chọn <span className="text-red-600">*</span>
            </FormLabel>
            {error?.options && (
              <FormHelperText error={!!error?.options}>{error?.options?.root?.message}</FormHelperText>
            )}
            <QuestionOptionContainer control={control} questionIndex={questionIndex} questionType={questionType} />
          </div>
        )}
        {questionType === "text" && (
          <div className="flex items-center justify-center">
            <div className="bg-gray-100 rounded-lg p-4 w-full max-w-xl text-center">
              <Typography sx={{ fontSize: "0.875rem" }}>Văn bản câu trả lời ngắn</Typography>
            </div>
          </div>
        )}
        {questionType === "rating" && (
          <div className="text-center flex flex-col gap-2 w-full">
            <QuestionRatingType />
          </div>
        )}
        {questionType === "yes_no" && (
          <div className="text-center flex justify-center w-full">
            <div className="flex items-center gap-3">
              <div>
                <FaceSmileIcon className="w-8 h-8" />
                <Typography sx={{ fontSize: "0.875rem" }}>Có</Typography>
              </div>
              <div>
                <FaceSadIcon className="w-8 h-8" />
                <Typography sx={{ fontSize: "0.875rem" }}>Không</Typography>
              </div>
            </div>
          </div>
        )}
      </div>
    </Stack>
  );
};
export default QuestionContentItem;
