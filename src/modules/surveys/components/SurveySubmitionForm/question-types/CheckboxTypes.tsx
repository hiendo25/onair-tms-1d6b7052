import React from "react";
import { useField } from "@mui/x-date-pickers/internals";
import { Control, useFieldArray } from "react-hook-form";

import { SurveySubmissionFormData } from "../survey-submission.schema";

interface CheckboxTypesProps {
  control: Control<SurveySubmissionFormData>;
  questionIndex: number;
}
const CheckboxTypes: React.FC<CheckboxTypesProps> = ({ control, questionIndex }) => {
  const fieldsArr = useFieldArray({
    control: control,
    name: `questions.${questionIndex}.answer.values`,
    keyName: "_answerId",
  });
  return <></>;
};
export default CheckboxTypes;
