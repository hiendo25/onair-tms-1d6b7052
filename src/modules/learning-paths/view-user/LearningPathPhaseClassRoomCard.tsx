"use client";

import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ComputerRoundedIcon from "@mui/icons-material/ComputerRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import LiveTvRoundedIcon from "@mui/icons-material/LiveTvRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import RadioButtonUncheckedRoundedIcon from "@mui/icons-material/RadioButtonUncheckedRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import { Box, Card, Chip, LinearProgress, Stack, Typography } from "@mui/material";
import Link from "next/link";

import type { PhaseClassRoomCardItem } from "./learning-path-phase.types";
import { CLASSROOM_PROGRESS_STATUS } from "./learning-path-user.constants";

const MODE_ICONS: Record<string, typeof ComputerRoundedIcon> = {
  online: ComputerRoundedIcon,
  live: LiveTvRoundedIcon,
  offline: LocationOnRoundedIcon,
  pending: HelpOutlineRoundedIcon,
};

const STATUS_CARD_BORDER: Record<PhaseClassRoomCardItem["status"], string> = {
  [CLASSROOM_PROGRESS_STATUS.COMPLETED]: "success.main",
  [CLASSROOM_PROGRESS_STATUS.IN_PROGRESS]: "primary.main",
  [CLASSROOM_PROGRESS_STATUS.NOT_STARTED]: "divider",
};

const PROGRESS_BAR_COLOR: Record<PhaseClassRoomCardItem["status"], string> = {
  [CLASSROOM_PROGRESS_STATUS.COMPLETED]: "success.main",
  [CLASSROOM_PROGRESS_STATUS.IN_PROGRESS]: "primary.main",
  [CLASSROOM_PROGRESS_STATUS.NOT_STARTED]: "grey.300",
};

export interface LearningPathPhaseClassRoomCardProps {
  item: PhaseClassRoomCardItem;
}

export default function LearningPathPhaseClassRoomCard({ item }: LearningPathPhaseClassRoomCardProps) {
  const ModeIcon = MODE_ICONS[item.modeKey] ?? MODE_ICONS.pending;
  const isCompleted = item.status === CLASSROOM_PROGRESS_STATUS.COMPLETED;
  const cardProps = item.href ? { component: Link, href: item.href } : {};

  return (
    <Card
      {...cardProps}
      variant="outlined"
      sx={{
        p: 2.5,
        borderRadius: 2,
        borderColor: STATUS_CARD_BORDER[item.status],
        boxShadow: "0 12px 24px rgba(15, 23, 42, 0.06)",
        textDecoration: "none",
        display: "block",
        width: "100%",
        cursor: item.href ? "pointer" : "default",
        transition: "all 0.2s ease",
        "&:hover": item.href
          ? {
            borderColor: "primary.main",
            boxShadow: "0 16px 32px rgba(15, 23, 42, 0.12)",
          }
          : undefined,
      }}
    >
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip size="small" label={item.statusLabel} color={item.statusColor} />
            <Stack direction="row" spacing={0.5} alignItems="center">
              {/* <ModeIcon sx={{ fontSize: 18, color: "text.secondary" }} /> */}
              <Typography variant="body2" color="text.secondary">
                {item.modeLabel}
              </Typography>
            </Stack>
          </Stack>
          {isCompleted ? (
            <CheckCircleRoundedIcon sx={{ color: "success.main" }} />
          ) : (
            <RadioButtonUncheckedRoundedIcon sx={{ color: "grey.300" }} />
          )}
        </Stack>

        <Stack spacing={0.5}>
          <Typography variant="subtitle1" fontWeight={700} color="text.primary">
            {item.title}
          </Typography>
          {item.description ? (
            <Typography variant="body2" color="text.secondary">
              {item.description}
            </Typography>
          ) : null}
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <ScheduleRoundedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
          <Typography variant="body2" color="text.secondary">
            {item.durationLabel}
          </Typography>
        </Stack>

        <Box>
          <LinearProgress
            variant="determinate"
            value={item.progressPercentage}
            sx={{
              height: 8,
              borderRadius: 999,
              bgcolor: "grey.100",
              "& .MuiLinearProgress-bar": {
                borderRadius: 999,
                backgroundColor: PROGRESS_BAR_COLOR[item.status],
              },
            }}
          />
          <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Tiến độ
            </Typography>
            <Typography variant="caption" fontWeight={600} color="text.secondary">
              {item.progressPercentage}%
            </Typography>
          </Stack>
        </Box>
      </Stack>
    </Card>
  );
}
