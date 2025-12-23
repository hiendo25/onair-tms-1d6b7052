import { memo } from "react";
import { IconButton } from "@mui/material";
import { Control, useController } from "react-hook-form";

import { UpsertSurveyFormData } from "@/modules/surveys/components/UpsertSurveyForm/survey-form.schema";
import { Trash01Icon } from "@/shared/assets/icons";
import RHFTextField from "@/shared/ui/form/RHFTextField";

interface OptionContentItemProps {
  questionIndex: number;
  optionIndex: number;
  control: Control<UpsertSurveyFormData>;
  onRemove?: (index: number) => void;
}
const OptionContentItem: React.FC<OptionContentItemProps> = ({ optionIndex, control, questionIndex, onRemove }) => {
  const {
    field: { value: optionData },
  } = useController({ control: control, name: `questions.${questionIndex}.options.${optionIndex}` });

  console.log(optionData);
  return (
    <div className="flex items-center gap-2">
      <RHFTextField
        name={`questions.${questionIndex}.options.${optionIndex}.content`}
        control={control}
        placeholder={optionData.is_other ? "Tùy chọn khác" : `Tùy chọn ${optionIndex + 1}`}
        disabled={optionData.is_other}
      />
      <IconButton color="error" size="small" onClick={() => onRemove?.(optionIndex)} disabled={!onRemove}>
        <Trash01Icon className="w-4 h-4" />
      </IconButton>
    </div>
  );
};
export default memo(OptionContentItem);
