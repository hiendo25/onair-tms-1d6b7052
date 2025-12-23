import RHFCheckboxField from "@/shared/ui/form/RHFCheckboxField";
import React from "react";
import { Control } from "react-hook-form";

interface QuestionCheckboxProps {
  className?: string;
	control: Control<any>
  index: number;
  options: { id: string; label: string; isOther: boolean }[];
}
const QuestionCheckbox: React.FC<QuestionCheckboxProps> = ({ className, index, control }) => {
  return <div className="question-checkbox">
		<RHFCheckboxField control={control} name="">
	</div>;
};
export default QuestionCheckbox;
