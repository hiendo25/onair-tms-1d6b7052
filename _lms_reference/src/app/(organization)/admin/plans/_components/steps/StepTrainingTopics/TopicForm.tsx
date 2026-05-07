"use client";

import { Box, Button, Stack } from "@mui/material";
import { UseFormReturn } from "react-hook-form";

import { Topic } from "@/modules/plans/plan-form.schema";
import RHFTextAreaField from "@/shared/ui/form/RHFTextAreaField";
import RHFTextField from "@/shared/ui/form/RHFTextField";

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
        border: "1px dashed",
        borderColor: "primary.200",
        borderRadius: 2,
        bgcolor: "primary.50",
        boxShadow: "0 10px 26px rgba(0,0,0,0.06)",
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
            sx={{ minWidth: 160 }}
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
