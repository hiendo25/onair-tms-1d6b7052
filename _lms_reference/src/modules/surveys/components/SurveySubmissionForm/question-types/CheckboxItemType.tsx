import React, { memo, useCallback } from "react";
import { Checkbox, FormControl, FormControlLabel, OutlinedInput, OutlinedInputProps } from "@mui/material";
import { useFormContext, useWatch } from "react-hook-form";

import { QuestionWithMultipleSelectFormData, SurveySubmissionFormData } from "../survey-submission.schema";

interface CheckboxItemTypeProps {
  questionIndex: number;
  question: QuestionWithMultipleSelectFormData;
}
const CheckboxItemType: React.FC<CheckboxItemTypeProps> = ({ questionIndex, question }) => {
  const { setValue, control } = useFormContext<SurveySubmissionFormData>();
  const { options } = question;

  const currentAnswer = useWatch({
    control,
    name: `questions.${questionIndex}.answer`,
    exact: true,
  }) as QuestionWithMultipleSelectFormData["answer"];

  type OptionItem = (typeof options)[number];

  const handleSelectOption = useCallback(
    (option: OptionItem) => {
      const existItem = currentAnswer.find((item) => item.optionId === option.id);
      const updatedAnswers: QuestionWithMultipleSelectFormData["answer"] = existItem
        ? currentAnswer.filter((item) => item.optionId !== option.id)
        : [
            ...currentAnswer,
            {
              optionId: option.id,
              optionText: option.text || "",
              isOther: option.isOther,
              otherText: "",
            },
          ];

      setValue(`questions.${questionIndex}.answer`, updatedAnswers, {
        shouldDirty: true,
      });
    },
    [currentAnswer, questionIndex, setValue],
  );

  const handleChangeText =
    (optionId: string): OutlinedInputProps["onChange"] =>
    (evt) => {
      const text = evt.target.value;

      const updatedAnswers = currentAnswer.map((item) =>
        item.optionId === optionId ? { ...item, otherText: text } : item,
      );

      setValue(`questions.${questionIndex}.answer`, updatedAnswers, {
        shouldDirty: true,
      });
    };

  const hasSelected = (itemId: string) => {
    return currentAnswer.some((item) => item.optionId === itemId);
  };

  const getOtherTextValue = useCallback(
    (optionId: string) => currentAnswer.find((item) => item.optionId === optionId)?.otherText || "",
    [currentAnswer],
  );

  return (
    <>
      {options.map((option) => (
        <div className="flex items-center" key={option.id}>
          <FormControlLabel
            control={
              <Checkbox
                value={option.id}
                checked={hasSelected(option.id)}
                onChange={() => handleSelectOption(option)}
              />
            }
            label={option.isOther ? "Khác" : option.text}
          />
          {option.isOther && hasSelected(option.id) && (
            <FormControl size="small">
              <OutlinedInput
                key={option.id}
                placeholder="Nhập lựa chọn khác"
                value={getOtherTextValue(option.id)}
                onChange={handleChangeText(option.id)}
              />
            </FormControl>
          )}
        </div>
      ))}
    </>
  );
};
export default memo(CheckboxItemType);
