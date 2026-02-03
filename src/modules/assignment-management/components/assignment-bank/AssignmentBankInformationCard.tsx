import React, { memo, useEffect } from "react";
import { Button, Card, Grid, InputAdornment, Stack, Typography } from "@mui/material";
import { useFormContext, useWatch } from "react-hook-form";

import RHFCheckboxField from "@/shared/ui/form/RHFCheckboxField";
import RHFTextAreaField from "@/shared/ui/form/RHFTextAreaField";
import RHFTextField from "@/shared/ui/form/RHFTextField";

import type { AssignmentBankFormValues } from "./assignment-bank.schema";

interface AssignmentBankInformationCardProps {
  selectedCount: number;
  onOpenQuestionDialog: () => void;
  onCreateQuestion: () => void;
  questionError?: string;
  totalScore: number;
}

const AssignmentBankInformationCard = ({
  selectedCount,
  onOpenQuestionDialog,
  onCreateQuestion,
  questionError,
  totalScore,
}: AssignmentBankInformationCardProps) => {
  const { control, setValue, trigger, formState, getValues } = useFormContext<AssignmentBankFormValues>();
  const isUnlimitedDuration = useWatch({ control, name: "isUnlimitedDuration" });

  const shouldRevalidateDuration = formState.isSubmitted || Boolean(formState.errors.durationMinutes);

  useEffect(() => {
    if (!isUnlimitedDuration) {
      return;
    }

    if (getValues("durationMinutes")) {
      setValue("durationMinutes", "");
    }

    if (shouldRevalidateDuration) {
      void trigger("durationMinutes");
    }
  }, [
    getValues,
    isUnlimitedDuration,
    setValue,
    shouldRevalidateDuration,
    trigger,
  ]);

  return (
    <Card sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, border: "1px solid", borderColor: "grey.200", boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px" }}>
      <Stack spacing={3}>
        <RHFTextField
          control={control}
          name="name"
          label="Tên bài kiểm tra"
          required
          placeholder="Nhập tên bài kiểm tra"
          inputProps={{ maxLength: 100 }}
          helpText={<span className="text-xs text-gray-400">Tối đa 100 ký tự</span>}
          size="small"
        />

        <RHFTextAreaField
          control={control}
          name="description"
          label="Mô tả"
          required
          placeholder="Nhập mô tả bài kiểm tra"
          minRows={4}
          maxRows={6}
          helpText={<span className="text-xs text-gray-400">Tối đa 500 ký tự</span>}
        />

        <Stack spacing={1}>
          <Stack direction={{ xs: "column", md: "row" }} alignItems={{ xs: "flex-start", md: "center" }} justifyContent={"space-between"} spacing={2}>
            <Typography variant="subtitle2" fontWeight={600}>
              Chọn câu hỏi <span className="text-red-500">*</span>
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <Button variant="outlined" onClick={onCreateQuestion}>
                Tạo câu hỏi mới
              </Button>
              <Button variant="contained" onClick={onOpenQuestionDialog}>
                Chọn câu hỏi ({selectedCount})
              </Button>
            </Stack>
          </Stack>
          {questionError ? (
            <Typography variant="caption" color="error">
              {questionError}
            </Typography>
          ) : null}
        </Stack>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={1}>
              <RHFTextField
                control={control}
                name="durationMinutes"
                label="Thời gian làm bài (phút)"
                required={!isUnlimitedDuration}
                disabled={isUnlimitedDuration}
                placeholder={isUnlimitedDuration ? "Không giới hạn" : "45"}
                inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                size="small"
                helpText={
                  isUnlimitedDuration ? (
                    <span className="text-xs text-gray-400">Đang chọn không giới hạn thời gian.</span>
                  ) : null
                }
              />
              <RHFCheckboxField control={control} name="isUnlimitedDuration" label="Không giới hạn thời gian" />
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <RHFTextField
              control={control}
              name="passScore"
              label="Điểm đạt tối thiểu"
              required
              placeholder="80"
              inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
              size="small"
              endAdornment={
                totalScore > 0 ? (
                  <InputAdornment position="end">/{totalScore}</InputAdornment>
                ) : null
              }
            />
          </Grid>
        </Grid>
      </Stack>
    </Card>
  );
};

export default memo(AssignmentBankInformationCard);
