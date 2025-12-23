import React from "react";
import { Control } from "react-hook-form";

import { SurveySubmissionFormData } from "../survey-submission.schema";

interface RatingSortTypeProps {
  className?: string;
  questionIndex: number;
  control: Control<SurveySubmissionFormData>;
}
const RatingSortType: React.FC<RatingSortTypeProps> = (props) => {
  return <div>123</div>;
};
export default RatingSortType;
