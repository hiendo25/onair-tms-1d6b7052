import React from "react";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import QuizOutlinedIcon from "@mui/icons-material/QuizOutlined";
import StarOutlineOutlinedIcon from "@mui/icons-material/StarOutlineOutlined";
import { Box, Card, IconButton, Stack, Typography } from "@mui/material";

import type { ClassRoomExamItem } from "../_hooks/useClassRoomExams";

interface ClassRoomExamCardProps {
  exam: ClassRoomExamItem;
  onClick?: () => void;
  onMenuClick?: (event: React.MouseEvent<HTMLElement>) => void;
  hideResultStats?: boolean;
}

const THUMBNAIL_HEIGHT = 140;
const ICON_SIZE = 44;

export default function ClassRoomExamCard({
  exam,
  onClick,
  onMenuClick,
  hideResultStats = false,
}: ClassRoomExamCardProps) {
  const durationLabel = exam.durationMinutes ? `${exam.durationMinutes} phút` : "--";
  const passScoreLabel =
    exam.passScore !== null && exam.totalScore > 0
      ? `${exam.passScore}/${exam.totalScore} điểm`
      : exam.passScore !== null
        ? `${exam.passScore} điểm`
        : "--";
  return (
    <Card
      onClick={onClick}
      sx={{
        p: 2.5,
        borderRadius: 3,
        height: "100%",
        border: "1px solid",
        borderColor: "grey.200",
        boxShadow: "0px 1px 6px rgba(15, 23, 42, 0.08)",
        cursor: onClick ? "pointer" : "default",
        transition: "box-shadow 0.2s ease",
        "&:hover": onClick
          ? {
            boxShadow: "0px 8px 18px rgba(15, 23, 42, 0.12)",
          }
          : undefined,
      }}
    >
      <Box
        sx={{
          position: "relative",
          borderRadius: 3,
          backgroundColor: "#EEF4FF",
          height: THUMBNAIL_HEIGHT,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 2,
        }}
      >
        <QuizOutlinedIcon sx={{ fontSize: ICON_SIZE, color: "primary.main" }} />
      </Box>

      <Stack spacing={1.25}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
          <Typography variant="subtitle1" fontWeight={600} className="line-clamp-2">
            {exam.name}
          </Typography>
          {onMenuClick && (
            <IconButton
              size="small"
              onClick={(event) => {
                event.stopPropagation();
                onMenuClick(event);
              }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>
        <Typography variant="body2" color="text.secondary" className="line-clamp-2">
          {exam.description || "Chưa có mô tả"}
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center" color="text.secondary">
          <Stack direction="row" spacing={0.5} alignItems="center">
            <HelpOutlineOutlinedIcon sx={{ fontSize: 16 }} />
            <Typography variant="caption">{exam.totalQuestions} câu</Typography>
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
        {!hideResultStats && (
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Box className="bg-[#F63D6814] text-[#F63D68] text-[10px] font-bold px-2 rounded-sm">
              Không đạt ({exam.failedCount})
            </Box>
            <Box className="bg-[#22C55E14] text-[#118D57] text-[10px] font-bold px-2 rounded-sm">
              đạt ({exam.passedCount})
            </Box>
          </Stack>
        )}
      </Stack>
    </Card>
  );
}
