import React, { memo } from "react";
import { Box, Card, Divider, Stack, Typography } from "@mui/material";

interface AssignmentBankAssignInfoCardProps {
  title: string;
  description: string;
  totalQuestions: number;
  totalScore: number;
  durationLabel: string;
  passScoreLabel: string;
}

const AssignmentBankAssignInfoCard = ({
  title,
  description,
  totalQuestions,
  totalScore,
  durationLabel,
  passScoreLabel,
}: AssignmentBankAssignInfoCardProps) => {
  return (
    <Card sx={{ borderRadius: 3, border: "1px solid", borderColor: "grey.200", boxShadow: "none" }}>
      <Stack spacing={2} sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="subtitle1" fontWeight={600} color="text.primary">
          Thông tin bài kiểm tra
        </Typography>
        <Divider />
        <Stack spacing={1.5}>
          <Stack spacing={0.5}>
            <Typography variant="body2" color="text.secondary">
              Tiêu đề
            </Typography>
            <Typography variant="h6" fontWeight={600} color="text.primary">
              {title}
            </Typography>
          </Stack>
          <Stack spacing={0.5}>
            <Typography variant="body2" color="text.secondary">
              Mô tả
            </Typography>
            <Typography variant="body2" color="text.primary">
              {description || "--"}
            </Typography>
          </Stack>
        </Stack>
        <Box
          sx={{
            borderRadius: 2,
            border: "1px solid",
            borderColor: "grey.200",
            px: 2,
            py: 2,
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
          }}
        >
          <Stack spacing={0.5}>
            <Typography variant="body2" color="text.secondary">
              Số câu hỏi
            </Typography>
            <Typography variant="h6" fontWeight={700} color="text.primary">
              {totalQuestions}
            </Typography>
          </Stack>
          <Stack spacing={0.5}>
            <Typography variant="body2" color="text.secondary">
              Tổng điểm
            </Typography>
            <Typography variant="h6" fontWeight={700} color="text.primary">
              {totalScore}
            </Typography>
          </Stack>
          <Stack spacing={0.5}>
            <Typography variant="body2" color="text.secondary">
              Thời gian (phút)
            </Typography>
            <Typography variant="h6" fontWeight={700} color="text.primary">
              {durationLabel}
            </Typography>
          </Stack>
          <Stack spacing={0.5}>
            <Typography variant="body2" color="text.secondary">
              Điểm đạt tối thiểu
            </Typography>
            <Typography variant="h6" fontWeight={700} color="text.primary">
              {passScoreLabel}
            </Typography>
          </Stack>
        </Box>
      </Stack>
    </Card>
  );
};

export default memo(AssignmentBankAssignInfoCard);
