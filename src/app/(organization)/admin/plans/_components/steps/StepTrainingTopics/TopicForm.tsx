"use client";

import { Box, Button, Stack } from "@mui/material";
import { UseFormReturn } from "react-hook-form";
import { Topic } from "@/modules/plans/plan-form.schema";
import RHFTextField from "@/shared/ui/form/RHFTextField";
import RHFTextAreaField from "@/shared/ui/form/RHFTextAreaField";

interface TopicFormProps {
  form: UseFormReturn<Topic>;
  onSubmit: () => void;
  onCancel: () => void;
}

export function TopicForm({ form, onSubmit, onCancel }: TopicFormProps) {
  return (
    <Box
      sx={{
        p: 3,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        bgcolor: "common.white",
      }}
    >
      <Stack spacing={2}>
        <RHFTextField
          control={form.control}
          name="name"
          label="Tên chủ đề"
          placeholder="VD: Kỹ năng giao tiếp"
          required
        />

        <RHFTextAreaField
          control={form.control}
          name="description"
          label="Thông tin mô tả"
          placeholder="Mô tả mục tiêu ngắn của kế hoạch đào tạo"
          minRows={3}
          maxRows={6}
        />

        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-start" }}>
          <Button
            onClick={onSubmit}
            variant="contained"
            size="medium"
          >
            Lưu chủ đề
          </Button>
          <Button
            onClick={onCancel}
            variant="outlined"
            size="medium"
          >
            Hủy
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
