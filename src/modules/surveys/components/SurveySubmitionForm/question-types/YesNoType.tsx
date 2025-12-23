import React from "react";
import { Typography } from "@mui/material";
import { useField } from "@mui/x-date-pickers/internals";
import { Control, useFieldArray } from "react-hook-form";

import { FaceSadIcon, FaceSmileIcon } from "@/shared/assets/icons";
import RHFRadioGroupField from "@/shared/ui/form/RHFRadioGroupField";
import { SurveySubmissionFormData } from "../survey-submission.schema";

interface YesNoTypeProps {
  control: Control<SurveySubmissionFormData>;
  questionIndex: number;
}
const YesNoType: React.FC<YesNoTypeProps> = ({ control, questionIndex }) => {
  const fieldsArr = useFieldArray({
    control: control,
    name: `questions.${questionIndex}.answer.values`,
    keyName: "_answerId",
  });
  return (
    <div className="yes-no-type flex items-center gap-3">
      <RHFRadioGroupField
        name={`questions.${questionIndex}.answer.values`}
        control={control}
        options={[
          { label: "Có", value: "yes" },
          {
            label: "Không",
            value: "no",
          },
        ]}
      />
    </div>
  );
};
export default YesNoType;
