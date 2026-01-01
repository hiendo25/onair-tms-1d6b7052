import React, { PropsWithChildren } from "react";
import { Typography } from "@mui/material";

interface QuestionItemWrapperProps extends PropsWithChildren {
  className?: string;
  label?: string;
  required?: boolean;
  index: number;
}
const QuestionItemWrapper: React.FC<QuestionItemWrapperProps> = ({ label, required, children, index }) => {
  return (
    <div className="question-item bg-white rounded-xl overflow-hidden p-3 md:p-6 border border-gray-300">
      <div className="question-name flex flex-col gap-2 mb-3">
        <Typography className="font-semibold">{`Câu hỏi: ${index + 1}`}</Typography>
        <Typography>
          {label} {required && <span className="text-red-600 ml-1">*</span>}
        </Typography>
      </div>
      <div className="question-body">{children}</div>
    </div>
  );
};
export default QuestionItemWrapper;
