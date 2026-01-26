import React, { memo } from "react";
import { Card, Stack, Typography } from "@mui/material";
import { useFormContext } from "react-hook-form";

import RHFCheckboxField from "@/shared/ui/form/RHFCheckboxField";

import type { AssignmentBankFormValues } from "./assignment-bank.schema";

const AssignmentBankConfigCard = () => {
  const { control } = useFormContext<AssignmentBankFormValues>();

  return (
    <Card sx={{ p: { xs: 2, md: 3 }, borderRadius: 2, boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px" }}>
      <Stack spacing={2}>
        <Typography variant="subtitle1" fontWeight={600}>
          Cấu hình
        </Typography>
        <Stack spacing={1}>
          <RHFCheckboxField control={control} name="shuffleQuestions" label="Xáo trộn câu hỏi" />
          <RHFCheckboxField control={control} name="shuffleAnswers" label="Xáo trộn đáp án" />
        </Stack>
      </Stack>
    </Card>
  );
};

export default memo(AssignmentBankConfigCard);
