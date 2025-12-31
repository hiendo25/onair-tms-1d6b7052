"use client";

import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import { Box, Card, Chip, CircularProgress, Stack, Typography } from "@mui/material";
import Link from "next/link";

import { PATHS } from "@/constants/path.constant";
import { getPhaseLabel } from "@/modules/learning-paths/components/learning-path-detail.utils";

import { PHASE_STATUS, PROGRESS_COMPLETED_PERCENT } from "./learning-path-user.constants";
import type { PhaseTimelineItem } from "./learning-path-user.types";

const NODE_SIZE = 88;
const NODE_INNER_SIZE = 64;
const NODE_THICKNESS = 5;
const BADGE_SIZE = 32;

const PHASE_CARD_STYLES = {
  [PHASE_STATUS.COMPLETED]: {
    borderColor: "success.main",
    bgcolor: "background.paper",
  },
  [PHASE_STATUS.ACTIVE]: {
    borderColor: "primary.main",
    bgcolor: "background.paper",
  },
  [PHASE_STATUS.LOCKED]: {
    borderColor: "divider",
    bgcolor: "background.paper",
  },
} as const;

const PHASE_STATUS_STYLES = {
  [PHASE_STATUS.COMPLETED]: {
    ringColor: "success.main",
    fillColor: "success.main",
    icon: CheckRoundedIcon,
    iconColor: "#FFFFFF",
  },
  [PHASE_STATUS.ACTIVE]: {
    ringColor: "primary.main",
    fillColor: "primary.main",
    icon: PlayArrowRoundedIcon,
    iconColor: "#FFFFFF",
  },
  [PHASE_STATUS.LOCKED]: {
    ringColor: "grey.400",
    fillColor: "grey.200",
    icon: LockRoundedIcon,
    iconColor: "grey.600",
  },
} as const;

const PHASE_STATUS_META = {
  [PHASE_STATUS.COMPLETED]: {
    label: "Hoàn thành",
    chipColor: "success",
    valueColor: "success.main",
  },
  [PHASE_STATUS.ACTIVE]: {
    label: "Đang học",
    chipColor: "info",
    valueColor: "primary.main",
  },
  [PHASE_STATUS.LOCKED]: {
    label: "Chưa mở",
    chipColor: "default",
    valueColor: "text.secondary",
  },
} as const;

const PHASE_ACCENT_COLORS = {
  [PHASE_STATUS.COMPLETED]: "success.main",
  [PHASE_STATUS.ACTIVE]: "primary.main",
  [PHASE_STATUS.LOCKED]: "grey.300",
} as const;

export interface LearningPathPhaseTimelineItemProps {
  item: PhaseTimelineItem;
  index: number;
  align: "left" | "right";
}

const PhaseStatusIndicator = ({ status, progress }: { status: PhaseTimelineItem["status"]; progress: number }) => {
  const style = PHASE_STATUS_STYLES[status];
  const Icon = style.icon;
  const ringValue = status === PHASE_STATUS.LOCKED ? PROGRESS_COMPLETED_PERCENT : progress;

  return (
    <Box sx={{ position: "relative", width: NODE_SIZE, height: NODE_SIZE }}>
      <CircularProgress
        variant="determinate"
        value={PROGRESS_COMPLETED_PERCENT}
        size={NODE_SIZE}
        thickness={NODE_THICKNESS}
        sx={{ color: "grey.200", position: "absolute", inset: 0 }}
      />
      <CircularProgress
        variant="determinate"
        value={ringValue}
        size={NODE_SIZE}
        thickness={NODE_THICKNESS}
        sx={{
          color: style.ringColor,
          filter: "drop-shadow(0 6px 12px rgba(15, 23, 42, 0.18))",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: NODE_INNER_SIZE,
          height: NODE_INNER_SIZE,
          borderRadius: "50%",
          bgcolor: style.fillColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 14px 28px rgba(15, 23, 42, 0.16)",
          border: "2px solid rgba(255, 255, 255, 0.6)",
        }}
      >
        <Icon sx={{ color: style.iconColor, fontSize: 30 }} />
      </Box>
    </Box>
  );
};

const PhaseIndexBadge = ({ index }: { index: number }) => {
  return (
    <Box
      sx={{
        position: "absolute",
        top: -8,
        right: -8,
        width: BADGE_SIZE,
        height: BADGE_SIZE,
        borderRadius: "50%",
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: 13,
        boxShadow: "0 8px 16px rgba(15, 23, 42, 0.12)",
      }}
    >
      {index}
    </Box>
  );
};

export default function LearningPathPhaseTimelineItem({
  item,
  index,
  align,
}: LearningPathPhaseTimelineItemProps) {
  const label = getPhaseLabel(item.phase, index);
  const description = item.phase.description || "Chưa có mô tả cho giai đoạn này.";
  const statusMeta = PHASE_STATUS_META[item.status];
  const progressLabel =
    item.status === PHASE_STATUS.LOCKED ? "Chưa mở" : `${item.progressPercentage}%`;
  const accentColor = PHASE_ACCENT_COLORS[item.status];

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: `${NODE_SIZE}px 1fr`, md: "minmax(0, 1fr) auto minmax(0, 1fr)" },
        columnGap: { xs: 2, md: 4 },
        alignItems: "center",
        position: "relative",
        zIndex: 1,
      }}
    >
      <Box
        sx={{
          gridColumn: { xs: "2 / 3", md: align === "left" ? "1 / 2" : "3 / 4" },
          order: { xs: 2, md: 0 },
        }}
      >
        <Card
          component={Link}
          href={PATHS.MY_LEARNING_PATHS.PHASE_DETAIL(item.phase.id)}
          variant="outlined"
          sx={{
            p: 2.5,
            borderRadius: 2,
            boxShadow: "0 14px 32px rgba(15, 23, 42, 0.08)",
            borderColor: "divider",
            bgcolor: PHASE_CARD_STYLES[item.status].bgcolor,
            borderLeft: align === "left" ? `4px solid ${accentColor}` : undefined,
            borderRight: align === "right" ? `4px solid ${accentColor}` : undefined,
            position: "relative",
            overflow: "hidden",
            display: "block",
            textDecoration: "none",
            cursor: "pointer",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 18px 36px rgba(15, 23, 42, 0.12)",
            },
            "&::after": {
              content: '""',
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(120deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0))",
              opacity: 0.6,
              pointerEvents: "none",
            },
          }}
        >
          <Stack spacing={1.5} sx={{ position: "relative", zIndex: 1 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  size="small"
                  label={statusMeta.label}
                  color={statusMeta.chipColor}
                  variant={item.status === PHASE_STATUS.LOCKED ? "outlined" : "filled"}
                />
                <Typography variant="caption" color="text.secondary">
                  {item.classRoomCount} lớp học
                </Typography>
              </Stack>
              <Typography variant="subtitle2" fontWeight={700} color={statusMeta.valueColor}>
                {progressLabel}
              </Typography>
            </Stack>

            <Typography variant="subtitle1" fontWeight={700}>
              {label}
            </Typography>

            <Stack spacing={0.5}>
              <Typography variant="overline" color="text.secondary">
                Mô tả giai đoạn
              </Typography>
              <Box
                sx={{
                  p: 1.25,
                  borderRadius: 1.5,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "rgba(248, 250, 252, 0.9)",
                }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {description}
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </Card>
      </Box>

      <Box
        sx={{
          gridColumn: { xs: "1 / 2", md: "2 / 3" },
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Box
          component={Link}
          href={PATHS.MY_LEARNING_PATHS.PHASE_DETAIL(item.phase.id)}
          sx={{
            position: "relative",
            cursor: "pointer",
            textDecoration: "none",
            display: "inline-flex",
            transition: "transform 0.2s ease",
            "&:hover": {
              transform: "translateY(-2px)",
            },
          }}
          aria-label={`Xem chi tiết ${label}`}
        >
          <PhaseStatusIndicator status={item.status} progress={item.progressPercentage} />
          <PhaseIndexBadge index={item.orderIndex} />
        </Box>
      </Box>
    </Box>
  );
}
