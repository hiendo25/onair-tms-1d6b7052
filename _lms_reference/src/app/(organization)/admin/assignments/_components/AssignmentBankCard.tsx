import React, { memo } from "react";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import QuizOutlinedIcon from "@mui/icons-material/QuizOutlined";
import StarOutlineOutlinedIcon from "@mui/icons-material/StarOutlineOutlined";
import { Box, Card, IconButton, Stack, Typography } from "@mui/material";

import { calculateAssignmentBankTotals } from "@/modules/assignment-management/utils/assignment-bank.utils";
import type { AssignmentBankDto } from "@/types/dto/assignment-bank";

import AssignmentBankActionMenu from "./AssignmentBankActionMenu";

interface AssignmentBankCardProps {
  assignment: AssignmentBankDto;
  onView?: () => void;
  onAssign?: () => void;
  onEdit: () => void;
  onDelete?: () => void;
}

const AssignmentBankCard = ({ assignment, onView, onAssign, onEdit, onDelete }: AssignmentBankCardProps) => {
  const { totalQuestions, totalScore } = calculateAssignmentBankTotals(assignment);
  const passScore = assignment.pass_score ?? null;

  const passScoreLabel =
    passScore !== null && totalScore > 0
      ? `${passScore}/${totalScore} điểm`
      : passScore !== null
        ? `${passScore} điểm`
        : "--";
  const durationLabel =
    assignment.duration_minutes !== null && assignment.duration_minutes !== undefined
      ? `${assignment.duration_minutes} phút`
      : "--";

  return (
    <Card
      sx={{
        p: 2.5,
        borderRadius: 3,
        height: "100%",
        border: "1px solid",
        borderColor: "grey.200",
        boxShadow: "0px 1px 6px rgba(15, 23, 42, 0.08)",
      }}
    >
      <Box
        sx={{
          position: "relative",
          borderRadius: 3,
          backgroundColor: "#EEF4FF",
          height: 140,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 2,
        }}
      >
        <QuizOutlinedIcon sx={{ fontSize: 44, color: "primary.main" }} />
        <IconButton
          onClick={onAssign}
          aria-label="Gán học viên"
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            width: 40,
            height: 40,
            borderRadius: "50%",
            backgroundColor: "#DDE7FF",
            "&:hover": { backgroundColor: "#CFDFFF" },
          }}
          disabled={!onAssign}
        >
          <PersonAddAltOutlinedIcon sx={{ fontSize: 20, color: "primary.main" }} />
        </IconButton>
      </Box>

      <Stack spacing={1.25}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
          <Typography variant="subtitle1" fontWeight={600} className="line-clamp-2">
            {assignment.name}
          </Typography>
          <AssignmentBankActionMenu onView={onView} onEdit={onEdit} onDelete={onDelete} />
        </Stack>
        <Typography variant="body2" color="text.secondary" className="line-clamp-2">
          {assignment.description}
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center" color="text.secondary">
          <Stack direction="row" spacing={0.5} alignItems="center">
            <HelpOutlineOutlinedIcon sx={{ fontSize: 16 }} />
            <Typography variant="caption">{totalQuestions} câu</Typography>
          </Stack>
          <Typography variant="caption">•</Typography>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <AccessTimeOutlinedIcon sx={{ fontSize: 16 }} />
            <Typography variant="caption">{durationLabel}</Typography>
          </Stack>
          <Typography variant="caption">•</Typography>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <StarOutlineOutlinedIcon sx={{ fontSize: 16 }} />
            <Typography variant="caption">{passScoreLabel}</Typography>
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
};

export default memo(AssignmentBankCard);
