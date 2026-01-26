import React, { memo, useMemo } from "react";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import RuleOutlinedIcon from "@mui/icons-material/RuleOutlined";
import SortOutlinedIcon from "@mui/icons-material/SortOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";

import type { QuestionBankSummaryDto } from "@/types/dto/question-bank";

import QuestionBankSummaryCard from "./QuestionBankSummaryCard";

interface QuestionBankSummaryCardsProps {
  summary: QuestionBankSummaryDto;
}

const QuestionBankSummaryCards = ({ summary }: QuestionBankSummaryCardsProps) => {
  const cards = useMemo(
    () => [
      {
        label: "Tổng câu hỏi",
        value: summary.total,
        icon: <HelpOutlineIcon width={26} height={26} className="text-[#004999]" />,
      },
      {
        label: "Trắc nghiệm",
        value: summary.multipleChoice,
        icon: <CheckCircleOutlineIcon width={26} height={26} className="text-[#004999]" />,
      },
      {
        label: "Đúng/Sai",
        value: summary.trueFalse,
        icon: <RuleOutlinedIcon width={26} height={26} className="text-[#004999]" />,
      },
      {
        label: "Tự luận",
        value: summary.essay,
        icon: <DescriptionOutlinedIcon width={26} height={26} className="text-[#004999]" />,
      },
      {
        label: "Tải File",
        value: summary.file,
        icon: <UploadFileOutlinedIcon width={26} height={26} className="text-[#004999]" />,
      },
      {
        label: "Sắp xếp",
        value: summary.order,
        icon: <SortOutlinedIcon width={26} height={26} className="text-[#004999]" />,
      },
      {
        label: "Nối câu",
        value: summary.matching,
        icon: <CompareArrowsIcon width={26} height={26} className="text-[#004999]" />,
      },
    ],
    [summary],
  );

  return (
    <div className="flex justify-between gap-2 overflow-x-auto pb-1">
      {cards.map((card) => (
        <QuestionBankSummaryCard key={card.label} {...card} />
      ))}
    </div>
  );
};

export default memo(QuestionBankSummaryCards);
