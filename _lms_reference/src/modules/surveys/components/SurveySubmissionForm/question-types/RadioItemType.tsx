import React, { memo, useCallback } from "react";
import { Checkbox, FormControl, FormControlLabel, OutlinedInput, OutlinedInputProps, Radio } from "@mui/material";
import { useFormContext, useWatch } from "react-hook-form";

import { QuestionWithSingleSelectFormData, SurveySubmissionFormData } from "../survey-submission.schema";

interface RadioItemTypeProps {
  questionIndex: number;
  question: QuestionWithSingleSelectFormData;
}
const RadioItemType: React.FC<RadioItemTypeProps> = ({ questionIndex, question }) => {
  const { setValue, control } = useFormContext<SurveySubmissionFormData>();
  const { options } = question;

  const currentAnswer = useWatch({
    control,
    name: `questions.${questionIndex}.answer`,
    exact: true,
  }) as QuestionWithSingleSelectFormData["answer"];

  type OptionItem = (typeof options)[number];

  const handleSelectOption = useCallback(
    (newOption: OptionItem) => {
      setValue(
        `questions.${questionIndex}.answer`,
        {
          isOther: newOption.isOther,
          optionText: newOption.isOther ? "Khác" : newOption?.text || "",
          optionId: newOption.id,
          otherText: "",
        },
        { shouldDirty: true },
      );
    },
    [questionIndex, setValue],
  );

  const handleChangeText: OutlinedInputProps["onChange"] = (evt) => {
    const text = evt.target.value;

    if (!currentAnswer) return;

    const updateAnswer = {
      ...currentAnswer,
      otherText: text,
    };
    setValue(`questions.${questionIndex}.answer`, updateAnswer, {
      shouldDirty: true,
    });
  };

  const hasSelected = (optionId: string) => {
    return currentAnswer?.optionId === optionId;
  };

  return (
    <>
      {options.map((option) => (
        <div className="flex items-center" key={option.id}>
          <FormControlLabel
            control={
              <Radio value={option.id} checked={hasSelected(option.id)} onChange={() => handleSelectOption(option)} />
            }
            label={option.isOther ? "Khác" : option.text}
          />
          {option.isOther && hasSelected(option.id) && (
            <FormControl size="small">
              <OutlinedInput
                key={option.id}
                placeholder="Nhập lựa chọn khác"
                value={currentAnswer?.otherText}
                onChange={handleChangeText}
              />
            </FormControl>
          )}
        </div>
      ))}
    </>
  );
};
export default memo(RadioItemType);
