"use client";

import * as React from "react";
import { Alert, Box, Stack, Typography } from "@mui/material";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

import AttemptSummaryCard from "./AttemptSummaryCard";

const ASSIGNMENT_DESCRIPTION_TITLE = "Mô tả bài kiểm tra";
const EMPTY_ASSIGNMENT_DESCRIPTION = "Chưa có mô tả bài kiểm tra.";

interface AssignmentDescriptionSectionProps {
  description?: string | null;
  attemptsRemaining: number | null;
  attemptLimit: number | null;
  availableFrom: string | null;
  availableTo: string | null;
  durationMinutes: number | null;
  remainingSeconds: number | null;
  hasAttemptsLeft: boolean;
  isWithinWindow: boolean;
  isTimeExpired: boolean;
}

const AssignmentDescriptionSection = ({
  description,
  attemptsRemaining,
  attemptLimit,
  availableFrom,
  availableTo,
  durationMinutes,
  remainingSeconds,
  hasAttemptsLeft,
  isWithinWindow,
  isTimeExpired,
}: AssignmentDescriptionSectionProps) => {
  const descriptionContent = description?.trim();

  return (
    <Stack spacing={2}>
      <Stack
        spacing={1}
        sx={{
          p: 2,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.default",
        }}
      >
        <Typography variant="subtitle1" fontWeight={600}>
          {ASSIGNMENT_DESCRIPTION_TITLE}
        </Typography>
        {descriptionContent ? (
          <Box
            sx={{
              "& p": { mb: 1 },
              "& ul, & ol": { pl: 3, mb: 1 },
              "& li": { mb: 0.5 },
            }}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeSanitize]}>
              {descriptionContent}
            </ReactMarkdown>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            {EMPTY_ASSIGNMENT_DESCRIPTION}
          </Typography>
        )}
      </Stack>
      <AttemptSummaryCard
        attemptsRemaining={attemptsRemaining}
        attemptLimit={attemptLimit}
        availableFrom={availableFrom}
        availableTo={availableTo}
        durationMinutes={durationMinutes}
        remainingSeconds={remainingSeconds}
      />
      {!hasAttemptsLeft && <Alert severity="error">Bạn đã hết số lần làm bài.</Alert>}
      {!isWithinWindow && (
        <Alert severity="warning">Bài kiểm tra không nằm trong thời gian được phép làm bài.</Alert>
      )}
      {isTimeExpired && <Alert severity="error">Đã hết thời gian làm bài.</Alert>}
    </Stack>
  );
};

export default React.memo(AssignmentDescriptionSection);
