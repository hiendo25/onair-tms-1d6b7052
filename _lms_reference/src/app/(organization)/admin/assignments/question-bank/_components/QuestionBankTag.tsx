import React, { memo } from "react";

type TagTone = "gray" | "green" | "orange" | "pink" | "blue";

const toneClasses: Record<TagTone, string> = {
  gray: "bg-gray-100 text-gray-700",
  green: "bg-green-100 text-green-700",
  orange: "bg-orange-100 text-orange-700",
  pink: "bg-pink-100 text-pink-700",
  blue: "bg-blue-100 text-blue-700",
};

interface QuestionBankTagProps {
  label: string;
  tone?: TagTone;
}

const QuestionBankTag = ({ label, tone = "gray" }: QuestionBankTagProps) => {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${toneClasses[tone]}`}>
      {label}
    </span>
  );
};

export default memo(QuestionBankTag);
export type { TagTone };
