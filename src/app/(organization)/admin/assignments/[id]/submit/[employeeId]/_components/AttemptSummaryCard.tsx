import * as React from "react";
import { Card, Stack, Typography } from "@mui/material";

interface AttemptSummaryCardProps {
  attemptsRemaining: number | null;
  attemptLimit: number | null;
  availableFrom: string | null;
  availableTo: string | null;
  durationMinutes: number | null;
  remainingSeconds: number | null;
}

const formatDateTime = (value: string | null) => {
  if (!value) {
    return "--";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatRemainingTime = (seconds: number) => {
  const totalSeconds = Math.max(seconds, 0);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  const minuteLabel = minutes.toString().padStart(2, "0");
  const secondLabel = remainingSeconds.toString().padStart(2, "0");
  return `${minuteLabel}:${secondLabel}`;
};

const AttemptSummaryCard = ({
  attemptsRemaining,
  attemptLimit,
  availableFrom,
  availableTo,
  durationMinutes,
  remainingSeconds,
}: AttemptSummaryCardProps) => {
  const attemptsLabel =
    attemptLimit === null ? "Không giới hạn" : `${Math.max(attemptsRemaining ?? 0, 0)}/${attemptLimit}`;
  const durationLabel = durationMinutes ? `${durationMinutes} phút` : "--";
  const timeLeftLabel = remainingSeconds !== null ? formatRemainingTime(remainingSeconds) : null;

  return (
    <Card sx={{ p: 2.5, borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
      <Stack spacing={1}>
        <Typography variant="subtitle1" fontWeight={600}>
          Thông tin làm bài
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} flexWrap="wrap">
          <Stack spacing={0.5}>
            <Typography variant="caption" color="text.secondary">
              Số lần còn lại
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {attemptsLabel}
            </Typography>
          </Stack>
          <Stack spacing={0.5}>
            <Typography variant="caption" color="text.secondary">
              Thời gian làm bài
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {durationLabel}
            </Typography>
          </Stack>
          <Stack spacing={0.5}>
            <Typography variant="caption" color="text.secondary">
              Cửa sổ làm bài
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {formatDateTime(availableFrom)} - {formatDateTime(availableTo)}
            </Typography>
          </Stack>
          {timeLeftLabel && (
            <Stack spacing={0.5}>
              <Typography variant="caption" color="text.secondary">
                Thời gian còn lại
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {timeLeftLabel}
              </Typography>
            </Stack>
          )}
        </Stack>
      </Stack>
    </Card>
  );
};

export default React.memo(AttemptSummaryCard);
