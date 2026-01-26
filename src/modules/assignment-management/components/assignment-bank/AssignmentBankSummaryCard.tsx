import React, { memo } from "react";
import { Card, Divider, Stack, Typography } from "@mui/material";
import { useFormContext, useWatch } from "react-hook-form";

import type { AssignmentBankFormValues } from "./assignment-bank.schema";

interface AssignmentBankSummaryCardProps {
  totalQuestions: number;
  totalScore: number;
}

const AssignmentBankSummaryCard = ({ totalQuestions, totalScore }: AssignmentBankSummaryCardProps) => {
  const { control } = useFormContext<AssignmentBankFormValues>();
  const durationMinutes = useWatch({ control, name: "durationMinutes" });
  const passScore = useWatch({ control, name: "passScore" });

  const passScoreLabel =
    passScore && totalScore > 0 ? `${passScore}/${totalScore}` : passScore ? `${passScore}` : "--";

  return (
    <Card sx={{ p: { xs: 2, md: 3 }, borderRadius: 2, boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px" }}>
      <Stack spacing={2}>
        <Typography variant="subtitle1" fontWeight={600}>
          Thông tin tóm tắt
        </Typography>
        <Divider />
        <Stack spacing={1.5}>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">
              Số câu hỏi
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {totalQuestions}
            </Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">
              Tổng điểm
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {totalScore}
            </Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">
              Thời gian (phút)
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {durationMinutes || "--"}
            </Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">
              Điểm đạt tối thiểu
            </Typography>
            <Typography variant="body2" fontWeight={600} color="primary.main">
              {passScoreLabel}
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
};

export default memo(AssignmentBankSummaryCard);
