"use client";

import { Card, CardContent, Stack, Typography } from "@mui/material";

import { useLearningPathFormContext } from "@/modules/learning-paths/use-learning-path-form-context";
import RHFTextAreaField from "@/shared/ui/form/RHFTextAreaField";
import RHFTextField from "@/shared/ui/form/RHFTextField";
import RHFThumbnailUpload from "@/shared/ui/form/RHFThumbnailUpload";

import EmployeeAssignmentField from "./EmployeeAssignmentField";

export default function StepGeneralInfo() {
  const {
    control,
    formState: { errors },
  } = useLearningPathFormContext();

  return (
    <Card sx={{ border: "1px solid", borderColor: "divider" }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
          Thông tin cơ bản
        </Typography>

        <Stack mt={2} spacing={3}>
          {/* Name Field */}
          <RHFTextField
            name="info.name"
            control={control}
            label="Tên lộ trình"
            placeholder="Nhập tên lộ trình học tập"
            required
          />

          {/* Employee Assignment Section */}
          <EmployeeAssignmentField control={control} />

          {/* Description Field */}
          <RHFTextAreaField
            name="info.description"
            control={control}
            label="Mô tả"
            placeholder="Mô tả chi tiết lộ trình học tập"
            minRows={4}
          />

          {/* Thumbnail Upload */}
          <RHFThumbnailUpload
            control={control}
            name="info.thumbnail"
            label="Ảnh bìa đại diện"
            subTitle="Hình ảnh đại diện cho lộ trình học tập của bạn"
            required
            aspectRatio="21/9"
            width="480px"
            description={
              <div className="flex flex-wrap gap-2 items-center mb-2">
                <Typography className="text-xs">
                  Kích thước chuẩn: <strong>1152 x 480 px (21:9)</strong>
                </Typography>
                <span className="w-1 h-1 rounded-full bg-slate-500"></span>
                <Typography className="text-xs">
                  Định dạng: <strong>JPG, PNG, GIF</strong>
                </Typography>
              </div>
            }
          />
        </Stack>
      </CardContent>
    </Card>
  );
}

