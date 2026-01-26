import React, { memo } from "react";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import StarOutlineOutlinedIcon from "@mui/icons-material/StarOutlineOutlined";
import { Box } from "@mui/material";

import AssignmentBankSummaryCard from "./AssignmentBankSummaryCard";

interface AssignmentBankSummaryCardsProps {
  durationLabel: string;
  totalQuestionsLabel: string;
  passScoreLabel: string;
}

const AssignmentBankSummaryCards = ({
  durationLabel,
  totalQuestionsLabel,
  passScoreLabel,
}: AssignmentBankSummaryCardsProps) => {
  return (
    <Box
      sx={{
        display: "grid",
        gap: 2,
        gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
      }}
    >
      <AssignmentBankSummaryCard
        label="Thời gian làm bài"
        value={durationLabel}
        icon={<AccessTimeOutlinedIcon sx={{ color: "#E64980" }} />}
        iconBackground="#FDE7F3"
      />
      <AssignmentBankSummaryCard
        label="Tổng câu hỏi"
        value={totalQuestionsLabel}
        icon={<HelpOutlineOutlinedIcon sx={{ color: "#2F6FED" }} />}
        iconBackground="#E7F0FF"
      />
      <AssignmentBankSummaryCard
        label="Điểm đạt tối thiểu"
        value={passScoreLabel}
        icon={<StarOutlineOutlinedIcon sx={{ color: "#F59F00" }} />}
        iconBackground="#FFF3E0"
      />
    </Box>
  );
};

export default memo(AssignmentBankSummaryCards);
