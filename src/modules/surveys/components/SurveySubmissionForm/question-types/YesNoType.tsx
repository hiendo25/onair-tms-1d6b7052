import React, { memo } from "react";
import { FormControlLabel, Radio, RadioGroup } from "@mui/material";
import { useFormContext } from "react-hook-form";

import { SurveySubmissionFormData } from "../survey-submission.schema";

interface YesNoTypeProps {
  questionIndex: number;
}
const YES_NO_OPTIONS: { value: "yes" | "no"; label: string }[] = [
  { label: "Có", value: "yes" },
  {
    label: "Không",
    value: "no",
  },
];
const YesNoType: React.FC<YesNoTypeProps> = ({ questionIndex }) => {
  const { setValue, control } = useFormContext<SurveySubmissionFormData>();

  const handleSelect = (newValue: "yes" | "no") => {
    setValue(`questions.${questionIndex}.answer`, { value: newValue });
  };
  return (
    <div className="yes-no-type flex items-center gap-3">
      <RadioGroup aria-labelledby="demo-radio-buttons-group-label" defaultValue="female" name="radio-buttons-group">
        {YES_NO_OPTIONS.map((opt) => (
          <FormControlLabel
            key={opt.value}
            value="female"
            control={<Radio value={opt.value} />}
            label={opt.label}
            onChange={() => handleSelect(opt.value)}
          />
        ))}
      </RadioGroup>
    </div>
  );
};
export default memo(YesNoType);
