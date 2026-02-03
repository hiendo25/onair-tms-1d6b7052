import React, { memo } from "react";
import { Card, Grid, Stack, Typography } from "@mui/material";
import dayjs from "dayjs";
import { useFormContext, useWatch } from "react-hook-form";

import type { AssignmentBankAssignFormValues } from "@/modules/assignment-management/components/assignment-bank";
import RHFDateTimePicker from "@/shared/ui/form/RHFDateTimePicker";
import RHFTextField from "@/shared/ui/form/RHFTextField";

const MIN_END_DATE_OFFSET_MINUTES = 1;

const AssignmentBankAssignConfigCard = () => {
  const { control } = useFormContext<AssignmentBankAssignFormValues>();
  const startDate = useWatch({ control, name: "startDate" });
  const minEndDate = startDate
    ? dayjs(startDate).add(MIN_END_DATE_OFFSET_MINUTES, "minute")
    : dayjs();

  return (
    <Card sx={{ borderRadius: 3, border: "1px solid", borderColor: "grey.200", boxShadow: "none" }}>
      <Stack spacing={2} sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="subtitle1" fontWeight={600} color="text.primary">
          Cấu hình
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <RHFDateTimePicker
                  control={control}
                  name="startDate"
                  label="Từ ngày"
                  required
                  minDateTime={dayjs()}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <RHFDateTimePicker
                  control={control}
                  name="endDate"
                  label="Đến ngày"
                  required
                  minDateTime={minEndDate}
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <RHFTextField
              control={control}
              name="attemptLimit"
              label="Số lần làm cho phép"
              required
              placeholder="VD: 2"
              inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
              size="small"
            />
          </Grid>
        </Grid>
      </Stack>
    </Card>
  );
};

export default memo(AssignmentBankAssignConfigCard);
