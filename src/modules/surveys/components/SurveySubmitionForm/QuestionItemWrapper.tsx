import React, { PropsWithChildren } from "react";
import { Typography } from "@mui/material";

interface QuestionItemWrapperProps extends PropsWithChildren {
  className?: string;
  label?: string;
  required?: boolean;
}
const QuestionItemWrapper: React.FC<QuestionItemWrapperProps> = ({ label, required, children }) => {
  return (
    <div className="question-item">
      <div className="question-name flex items-center mb-3">
        <Typography className="font-semibold">{label}</Typography>
        {required && <span className="text-red-600 ml-1">*</span>}
      </div>
      <div className="question-body">{children}</div>
    </div>
  );
};
export default QuestionItemWrapper;
