"use client";

import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import { Box, Card, Chip, Stack, Typography } from "@mui/material";
import Link from "next/link";

import ClassLive from "@/shared/assets/icons/phase-detail/ClassLive";
import ClassOffline from "@/shared/assets/icons/phase-detail/ClassOffline";
import ClassOnline from "@/shared/assets/icons/phase-detail/ClassOnline";
import { CLASSROOM_PROGRESS_STATUS, DEFAULT_COUNT } from "../../learning-path-user.constants";
import { PhaseClassRoomCardItem } from "../../types";

import { buildLearningPathClassRoomHref } from "./learning-path-user.utils";


const ACTION_ICON_SIZE = 28;
const ACTION_ICON_BG = "rgba(148, 163, 184, 0.12)";
const ACTION_ICON_BG_ACTIVE = "rgba(59, 130, 246, 0.12)";
const ACTION_ICON_COLOR = "rgba(100, 116, 139, 0.8)";
const ACTION_ICON_COLOR_ACTIVE = "#2563EB";
const CARD_SHADOW = "0 14px 28px rgba(15, 23, 42, 0.08)";
const CARD_SHADOW_HOVER = "0 18px 36px rgba(15, 23, 42, 0.12)";
const CARD_RADIUS = 3;
const CARD_PADDING = 2;

const MODE_ICONS = {
  online: ClassOnline,
  live: ClassLive,
  offline: ClassOffline,
};

const CLASSROOM_SESSION_TYPE_LABELS: Record<string, string> = {
  live: "Live",
  online: "Online",
  offline: "Trực tiếp",
  pending: "Chưa xác định",
};

const CLASSROOM_ROOMTYPE_LABELS: Record<string, string> = {
  single: "Đơn",
  multiple: "Chuỗi",
};

const MODE_ACCENT_COLORS: Record<string, { color: string; bg: string }> = {
  online: {
    color: "#007AFF",
    bg: "#007AFF14",
  },
  live: {
    color: "#118D57",
    bg: "#22C55E1F",
  },
  offline: {
    color: "#370363",
    bg: "#9723F91F",
  },
};

const COURSE_LABEL_SUFFIX = "Môn học";

const getCourseLabel = (courseCount: number): string => {
  return `${courseCount} ${COURSE_LABEL_SUFFIX}`;
};

const getPhaseClassRoomViewMeta = (item: PhaseClassRoomCardItem) => {
  const sessionCount = Number.isFinite(item.sessionCount) ? item.sessionCount : DEFAULT_COUNT;
  const courseCount = Number.isFinite(item.courseCount) ? item.courseCount : DEFAULT_COUNT;
  const modeSessionTypeLabel = CLASSROOM_SESSION_TYPE_LABELS[item.sessionType] ?? CLASSROOM_SESSION_TYPE_LABELS.pending;
  const modeRoomTypeLabel = CLASSROOM_ROOMTYPE_LABELS[item.roomType] ?? CLASSROOM_ROOMTYPE_LABELS.pending;
  const modeStyle = MODE_ACCENT_COLORS[item.sessionType] ?? MODE_ACCENT_COLORS.pending;


  return {
    modeSessionTypeLabel,
    modeRoomTypeLabel,
    courseLabel: getCourseLabel(courseCount),
    modeStyle,
  };
};

export interface LearningPathPhaseClassRoomCardProps {
  item: PhaseClassRoomCardItem;
  learningPathId?: string | null;
}

export default function LearningPathPhaseClassRoomCard({
  item,
  learningPathId,
}: LearningPathPhaseClassRoomCardProps) {
  const ModeIcon = MODE_ICONS[item.sessionType];
  const isLocked = item.isLocked ?? item.status === CLASSROOM_PROGRESS_STATUS.NOT_STARTED;;
  const href = buildLearningPathClassRoomHref(item.slug, learningPathId);
  const isClickable = Boolean(href) && !isLocked;
  const cardProps = isClickable ? { component: Link, href } : {};
  const viewMeta = getPhaseClassRoomViewMeta(item);

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
        <div>
          <ModeIcon className="text-[44px]" />
        </div>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={0.5}>
            <Chip
              size="medium"
              variant="filled"
              label={`${viewMeta.modeSessionTypeLabel} - ${viewMeta.modeRoomTypeLabel}`}
              sx={{
                width: "fit-content",
                fontWeight: 600,
                bgcolor: viewMeta?.modeStyle?.bg,
                '& .MuiChip-label': {
                  color: viewMeta.modeStyle?.color,
                  fontWeight: 700,
                }
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
          </Stack>
          <Typography className="text-xs text-[#00000099] pt-2">{viewMeta.courseLabel}</Typography>
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
