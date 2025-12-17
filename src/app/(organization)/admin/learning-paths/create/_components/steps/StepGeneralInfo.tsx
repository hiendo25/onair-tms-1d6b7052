"use client";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Button, Card, CardContent, Stack, Typography } from "@mui/material";

import { useLearningPathFormContext } from "@/modules/learning-paths/use-learning-path-form-context";
import RHFImageUpload from "@/shared/ui/form/RHFImageUpload";
import RHFTextAreaField from "@/shared/ui/form/RHFTextAreaField";
import RHFTextField from "@/shared/ui/form/RHFTextField";

interface StepGeneralInfoProps {
  onContinue: () => void;
}

export default function StepGeneralInfo({ onContinue }: StepGeneralInfoProps) {
  const {
    control,
    trigger,
    formState: { errors },
  } = useLearningPathFormContext();

  const handleContinue = async () => {
    // Validate the general info fields before continuing
    const isValid = await trigger("info");
    if (isValid) {
      onContinue();
    }
  };

  return (
    <Card sx={{ border: "1px solid", borderColor: "divider" }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
          Thông tin chung
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Nhập tên, mô tả và thông tin cơ bản cho lộ trình học tập
        </Typography>

        <Stack spacing={3}>
          {/* Name Field */}
          <RHFTextField
            name="info.name"
            control={control}
            label="Tên lộ trình học tập"
            placeholder="Nhập tên lộ trình học tập"
            required
            error={!!errors.info?.name}
            helperText={errors.info?.name?.message}
          />

          {/* Description Field */}
          <RHFTextAreaField
            name="info.description"
            control={control}
            label="Mô tả"
            placeholder="Nhập mô tả cho lộ trình học tập"
            minRows={4}
            error={!!errors.info?.description}
            helperText={errors.info?.description?.message}
          />

          {/* Thumbnail Upload */}
          <RHFImageUpload
            name="info.thumbnail"
            control={control}
            label="Ảnh đại diện"
            placeholder="Nhấn để chọn ảnh"
            helpText="Định dạng: JPG, PNG, GIF (tối đa 5MB)"
            maxFileSize={5 * 1024 * 1024}
            maxWidth={400}
            maxHeight={200}
          />
        </Stack>

        <Stack direction="row" spacing={2} sx={{ mt: 4, justifyContent: "flex-end" }}>
          <Button variant="contained" endIcon={<ArrowForwardIcon />} onClick={handleContinue}>
            Tiếp tục
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

