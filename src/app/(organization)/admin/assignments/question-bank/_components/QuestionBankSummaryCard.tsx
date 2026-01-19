import React, { memo } from "react";
import { Box, Typography } from "@mui/material";

import type { TagTone } from "./QuestionBankTag";

interface QuestionBankSummaryCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone?: TagTone;
}

const QuestionBankSummaryCard = ({ label, value, icon }: QuestionBankSummaryCardProps) => {
  return (
    <div className="flex min-w-[200px] items-center gap-4 rounded-2xl p-4 border border-[rgba(0,0,0,0.12)]">
      <div className={`flex h-11 w-11 items-center justify-center rounded-[10px] bg-[#E6F2FF]`}>
        {icon}
      </div>
      <div className="flex flex-col">
        <Typography className="text-sm font-medium text-gray-700">{label}</Typography>
        <Typography className="text-2xl font-semibold text-gray-900">{value}</Typography>
      </div>
    </div>
  );
};

export default memo(QuestionBankSummaryCard);
