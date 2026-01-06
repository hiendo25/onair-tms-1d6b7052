"use client";

import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import ComputerRoundedIcon from "@mui/icons-material/ComputerRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import LiveTvRoundedIcon from "@mui/icons-material/LiveTvRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import { Box, Card, Chip, Stack, Typography } from "@mui/material";
import Link from "next/link";

import { toPlainText } from "../../learning-path-text.utils";
import { CLASSROOM_PROGRESS_STATUS, DEFAULT_COUNT } from "../../learning-path-user.constants";
import { PhaseClassRoomCardItem } from "../../types";


const MODE_ICONS: Record<string, typeof ComputerRoundedIcon> = {
  online: ComputerRoundedIcon,
  live: LiveTvRoundedIcon,
  offline: LocationOnRoundedIcon,
  pending: HelpOutlineRoundedIcon,
};

const CLASSROOM_MODE_LABELS: Record<string, string> = {
  live: "Live",
  online: "Online",
  offline: "Trực tiếp",
  pending: "Chưa xác định",
};

const MODE_ACCENT_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  online: {
    color: "#2563EB",
    bg: "rgba(219, 234, 254, 0.8)",
    border: "rgba(59, 130, 246, 0.35)",
  },
  live: {
    color: "#059669",
    bg: "rgba(209, 250, 229, 0.8)",
    border: "rgba(16, 185, 129, 0.3)",
  },
  offline: {
    color: "#7C3AED",
    bg: "rgba(237, 233, 254, 0.8)",
    border: "rgba(139, 92, 246, 0.3)",
  },
  pending: {
    color: "#64748B",
    bg: "rgba(241, 245, 249, 0.9)",
    border: "rgba(148, 163, 184, 0.4)",
  },
};

const EMPTY_SCHEDULE_LABEL = "Chưa có lịch";
const SESSION_LABEL_SUFFIX = "buổi";
const ACTION_ICON_SIZE = 28;
const MODE_ICON_SIZE = 22;
const MODE_ICON_WRAP_SIZE = 48;
const ACTION_ICON_BG = "rgba(148, 163, 184, 0.12)";
const ACTION_ICON_BG_ACTIVE = "rgba(59, 130, 246, 0.12)";
const ACTION_ICON_COLOR = "rgba(100, 116, 139, 0.8)";
const ACTION_ICON_COLOR_ACTIVE = "#2563EB";
const CARD_SHADOW = "0 14px 28px rgba(15, 23, 42, 0.08)";
const CARD_SHADOW_HOVER = "0 18px 36px rgba(15, 23, 42, 0.12)";
const CARD_RADIUS = 3;
const CARD_PADDING = 2;

const getDurationLabel = (sessionCount: number): string => {
  if (sessionCount === 0) {
    return EMPTY_SCHEDULE_LABEL;
  }

  return `${sessionCount} ${SESSION_LABEL_SUFFIX}`;
};

const getPhaseClassRoomViewMeta = (item: PhaseClassRoomCardItem) => {
  const sessionCount = Number.isFinite(item.sessionCount) ? item.sessionCount : DEFAULT_COUNT;
  const modeLabel = CLASSROOM_MODE_LABELS[item.modeKey] ?? CLASSROOM_MODE_LABELS.pending;
  const modeStyle = MODE_ACCENT_COLORS[item.modeKey] ?? MODE_ACCENT_COLORS.pending;

  console.log("item 222", item);


  return {
    modeLabel,
    durationLabel: getDurationLabel(sessionCount),
    modeStyle,
  };
};

export interface LearningPathPhaseClassRoomCardProps {
  item: PhaseClassRoomCardItem;
}

export default function LearningPathPhaseClassRoomCard({ item }: LearningPathPhaseClassRoomCardProps) {
  const ModeIcon = MODE_ICONS[item.modeKey] ?? MODE_ICONS.pending;
  const isLocked = item.isLocked ?? item.status === CLASSROOM_PROGRESS_STATUS.NOT_STARTED;
  const isClickable = Boolean(item.href) && !isLocked;
  const cardProps = isClickable ? { component: Link, href: item.href } : {};
  const viewMeta = getPhaseClassRoomViewMeta(item);
  const description = toPlainText(item.description);
  const metaLine = description
    ? `${viewMeta.durationLabel} - ${description}`
    : viewMeta.durationLabel;

  return (
    <Card
      {...cardProps}
      sx={{
        p: CARD_PADDING,
        borderRadius: CARD_RADIUS,
        border: "1px solid",
        borderColor: "divider",
        boxShadow: CARD_SHADOW,
        textDecoration: "none",
        display: "block",
        width: "100%",
        cursor: isClickable ? "pointer" : "default",
        transition: "all 0.2s ease",
        "&:hover": isClickable
          ? {
            borderColor: "primary.main",
            boxShadow: CARD_SHADOW_HOVER,
          }
          : undefined,
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Box
          sx={{
            width: MODE_ICON_WRAP_SIZE,
            height: MODE_ICON_WRAP_SIZE,
            borderRadius: "50%",
            bgcolor: viewMeta.modeStyle?.bg,
            color: viewMeta.modeStyle?.color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid",
            borderColor: viewMeta.modeStyle?.border,
            flexShrink: 0,
          }}
        >
          <ModeIcon sx={{ fontSize: MODE_ICON_SIZE }} />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack spacing={0.5}>
            <Chip
              size="small"
              label={viewMeta.modeLabel}
              sx={{
                width: "fit-content",
                borderRadius: 999,
                fontWeight: 600,
                color: viewMeta?.modeStyle?.color,
                bgcolor: viewMeta?.modeStyle?.bg,
                border: "1px solid",
                borderColor: viewMeta?.modeStyle?.border,
              }}
            />
            <Typography
              variant="subtitle1"
              fontWeight={700}
              color="text.primary"
              sx={{
                display: "-webkit-box",
                WebkitLineClamp: 1,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {item.title}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {metaLine}
            </Typography>
          </Stack>
        </Box>

        <Box
          sx={{
            width: ACTION_ICON_SIZE,
            height: ACTION_ICON_SIZE,
            borderRadius: "50%",
            bgcolor: isLocked ? ACTION_ICON_BG : ACTION_ICON_BG_ACTIVE,
            color: isLocked ? ACTION_ICON_COLOR : ACTION_ICON_COLOR_ACTIVE,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {isLocked ? <LockRoundedIcon sx={{ fontSize: 18 }} /> : <ChevronRightRoundedIcon sx={{ fontSize: 22 }} />}
        </Box>
      </Stack>
    </Card>
  );
}
