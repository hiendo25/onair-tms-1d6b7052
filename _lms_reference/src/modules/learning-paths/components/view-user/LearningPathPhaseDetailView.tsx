"use client";

import { JSX } from "react";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import SignalCellularAltRoundedIcon from "@mui/icons-material/SignalCellularAltRounded";
import { Box, Button, Card, CircularProgress, IconButton, Stack, Typography } from "@mui/material";
import Link from "next/link";

import { getPhaseLabel } from "@/modules/learning-paths/components/learning-path-detail.utils";
import { PROGRESS_COMPLETED_PERCENT } from "@/modules/learning-paths/learning-path-user.constants";
import { buildLearningPathClassRoomHref } from "./learning-path-user.utils";
import { PhaseDetailData } from "../../types";
import ExpandableDescription from "../ExpandableDescription";

import LearningPathPhaseClassRoomCard from "./LearningPathPhaseClassRoomCard";

const DETAIL_CARD_BORDER = "1px solid rgba(226, 232, 240, 0.7)";
const DETAIL_CARD_SHADOW = "0 30px 60px rgba(15, 23, 42, 0.08)";
const DETAIL_CARD_RADIUS = 4;
const DETAIL_CARD_MAX_WIDTH = 564;
const HEADER_BADGE_BORDER = "#E0D9D9";
const HEADER_BADGE_COLOR = "#3F9AFF";
const HEADER_BADGE_ICON_SIZE = 16;
const HEADER_BADGE_RADIUS = 999;
const HEADER_BADGE_PADDING_X = 1.5;
const HEADER_BADGE_PADDING_Y = 0.6;
const HEADER_TITLE_LETTER_SPACING = 1.5;
const DEFAULT_PHASE_INDEX = 1;
const RING_SIZE = 108;
const RING_THICKNESS = 5;
const RING_INNER_SIZE = 80;
const RING_TRACK_COLOR = "rgba(37, 99, 235, 0.18)";
const RING_SHADOW = "0 12px 24px rgba(37, 99, 235, 0.25)";
const LIST_SECTION_LABEL = "BẠN SẼ HỌC";
const DEFAULT_PHASE_DESCRIPTION = "Chưa có mô tả cho giai đoạn này.";
const START_BUTTON_LABEL = "Bắt đầu học";
const START_BUTTON_SHADOW = "0 16px 32px rgba(37, 99, 235, 0.24)";
const DESCRIPTION_MAX_WIDTH = 640;

export interface LearningPathPhaseDetailViewProps {
  learningPathName: string;
  learningPathId?: string | null;
  detailData: PhaseDetailData;
  onBack?: () => void;
}

interface PhaseInfoBadgeProps {
  icon: JSX.Element;
  label: string;
}

const PhaseInfoBadge = ({ icon, label }: PhaseInfoBadgeProps) => {
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.75,
        px: HEADER_BADGE_PADDING_X,
        py: HEADER_BADGE_PADDING_Y,
        borderRadius: HEADER_BADGE_RADIUS,
        border: "1px solid",
        borderColor: HEADER_BADGE_BORDER,
        color: HEADER_BADGE_COLOR,
        fontWeight: 600,
        fontSize: 13,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", color: HEADER_BADGE_COLOR }}>
        {icon}
      </Box>
      {label}
    </Box>
  );
};

export default function LearningPathPhaseDetailView({
  learningPathName,
  learningPathId,
  detailData,
  onBack,
}: LearningPathPhaseDetailViewProps) {
  const phaseLabel = getPhaseLabel(detailData.phase, 0);
  const phaseIndexRaw = detailData.phase.order_index ?? DEFAULT_PHASE_INDEX;
  const phaseIndex = phaseIndexRaw > 0 ? phaseIndexRaw : DEFAULT_PHASE_INDEX;
  const phaseIndexLabel = String(phaseIndex).padStart(2, "0");
  const progressPercentage = detailData.summary.progressPercentage;
  const startClassRoom = detailData.classRooms.find(
    (classRoom) => !classRoom.isLocked && Boolean(classRoom.slug),
  );
  const startHref = buildLearningPathClassRoomHref(startClassRoom?.slug, learningPathId);

  return (
    <Card
      sx={{
        borderRadius: DETAIL_CARD_RADIUS,
        border: DETAIL_CARD_BORDER,
        boxShadow: DETAIL_CARD_SHADOW,
        position: "relative",
        overflow: "hidden",
        maxWidth: DETAIL_CARD_MAX_WIDTH,
        width: "100%",
        mx: "auto",
      }}
    >
      <IconButton
        onClick={onBack}
        aria-label={`Quay lại ${learningPathName}`}
        sx={{
          position: "absolute",
          top: { xs: 16, md: 20 },
          left: { xs: 16, md: 20 },
          bgcolor: "background.paper",
          boxShadow: "0 12px 24px rgba(15, 23, 42, 0.12)",
        }}
        disabled={!onBack}
      >
        <ArrowBackRoundedIcon />
      </IconButton>

      <Box sx={{ p: { xs: 3, md: 4 } }}>
        <Stack spacing={3} alignItems="center">
          <Box sx={{ position: "relative", width: RING_SIZE, height: RING_SIZE }}>
            <CircularProgress
              variant="determinate"
              value={PROGRESS_COMPLETED_PERCENT}
              size={RING_SIZE}
              thickness={RING_THICKNESS}
              sx={{ color: RING_TRACK_COLOR, position: "absolute", inset: 0 }}
            />
            <CircularProgress
              variant="determinate"
              value={progressPercentage}
              size={RING_SIZE}
              thickness={RING_THICKNESS}
              sx={{ color: "primary.main", filter: "drop-shadow(0 8px 16px rgba(37, 99, 235, 0.28))" }}
            />
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: RING_INNER_SIZE,
                height: RING_INNER_SIZE,
                borderRadius: "50%",
                bgcolor: "background.paper",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: RING_SHADOW,
                border: "2px solid rgba(255, 255, 255, 0.8)",
              }}
            >
              <Typography variant="h4" fontWeight={800} color="primary.main">
                {phaseIndexLabel}
              </Typography>
            </Box>
          </Box>

          <Stack spacing={1} alignItems="center">
            <Typography
              variant="h5"
              fontWeight={800}
              sx={{ letterSpacing: HEADER_TITLE_LETTER_SPACING }}
            >
              {phaseLabel.toUpperCase()}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
              <PhaseInfoBadge
                icon={<SignalCellularAltRoundedIcon sx={{ fontSize: HEADER_BADGE_ICON_SIZE }} />}
                label={`Cấp độ ${phaseIndex}`}
              />
              <PhaseInfoBadge
                icon={<AutoAwesomeRoundedIcon sx={{ fontSize: HEADER_BADGE_ICON_SIZE }} />}
                label={`${progressPercentage}% tiến độ`}
              />
            </Stack>
          </Stack>

          <Box
            sx={{
              maxWidth: DESCRIPTION_MAX_WIDTH,
              textAlign: "center",
              "& .MuiButton-root": { alignSelf: "center" },
            }}
          >
            <ExpandableDescription
              text={detailData.phase.description}
              fallbackText={DEFAULT_PHASE_DESCRIPTION}
              textProps={{ align: "left" }}
            />
          </Box>

          <Stack spacing={2} alignSelf="stretch">
            <Typography className="font-extrabold text-xs text-[#A69B98]">
              {LIST_SECTION_LABEL}
            </Typography>
            {detailData.classRooms.length === 0 ? (
              <Box
                sx={{
                  p: 3,
                  borderRadius: 2,
                  border: "1px dashed",
                  borderColor: "divider",
                  textAlign: "center",
                  color: "text.secondary",
                }}
              >
                <Typography variant="body2">Chưa có lớp học nào trong giai đoạn này.</Typography>
              </Box>
            ) : (
              <Stack spacing={1.5}>
                {detailData.classRooms.map((classRoom) => (
                  <LearningPathPhaseClassRoomCard
                    key={classRoom.id}
                    item={classRoom}
                    learningPathId={learningPathId}
                  />
                ))}
              </Stack>
            )}
          </Stack>

          {startHref ? (
            <Button
              component={Link}
              href={startHref}
              variant="contained"
              size="large"
              fullWidth
              sx={{
                textTransform: "none",
                fontWeight: 700,
                fontSize: 16,
                py: 1.5,
                boxShadow: START_BUTTON_SHADOW,
              }}
            >
              {START_BUTTON_LABEL}
            </Button>
          ) : null}
        </Stack>
      </Box>
    </Card>
  );
}
