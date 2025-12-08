"use client";

import React, { useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Stack, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";

import { UpsertSurveyFormData, upsertSurveyFormSchema } from "@/modules/surveys/survey-form.schema";
import RHFTextAreaField from "@/shared/ui/form/RHFTextAreaField";
import RHFTextField from "@/shared/ui/form/RHFTextField";

import SurveyQuestionContainer from "./SurveyQuestionsContainer";

export interface UpsertSurveyFormProps {
  initialData?: UpsertSurveyFormData;
  onSubmit: (data: UpsertSurveyFormData) => void;
  isLoading?: boolean;
}

const initUpsertFormData: UpsertSurveyFormData = {
  name: "",
  description: "",
  questions: [],
};

const UpsertSurveyForm: React.FC<UpsertSurveyFormProps> = ({ initialData, onSubmit, isLoading = false }) => {
  const methods = useForm<UpsertSurveyFormData>({
    resolver: zodResolver(upsertSurveyFormSchema),
    defaultValues: initUpsertFormData,
  });

  const {
    control,
    formState: { errors },
    handleSubmit,
  } = methods;
  const router = useRouter();

  const handleCancel = () => {};

  const submitFormData: SubmitHandler<UpsertSurveyFormData> = (formData) => {
    console.log({ formData });
  };
  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(submitFormData)}>
        <Stack spacing={3} className="bg-white rounded-lg overflow-hidden p-5">
          <div>
            <Typography variant="h5" component="h4">
              Thông tin khảo sát
            </Typography>
          </div>

          <div className="flex flex-col gap-3">
            <RHFTextField control={control} name="name" label="Tên khảo sát" placeholder="Nhập tên khảo sát" required />
            <RHFTextAreaField
              control={control}
              name="description"
              label="Mô tả"
              placeholder="Nhập mô tả khảo sát"
              required
              minRows={3}
              maxRows={6}
            />
          </div>

          {errors.questions?.message && (
            <Typography color="error" variant="body2">
              {errors.questions.message}
            </Typography>
          )}
          <div>
            <Typography variant="h5" component="h4">
              Câu hỏi khảo sát
            </Typography>
          </div>
          <SurveyQuestionContainer />
        </Stack>
        <div className="h-6"></div>
        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
          <Button variant="outlined" onClick={handleCancel} disabled={isLoading}>
            Hủy
          </Button>
          <Button variant="contained" type="submit" disabled={isLoading}>
            {isLoading ? "Đang lưu..." : initialData ? "Cập nhật" : "Tạo khảo sát"}
          </Button>
        </Box>
      </form>
    </FormProvider>
  );
};

export default UpsertSurveyForm;
export const useUpsertSurveyHookForm = useForm<UpsertSurveyFormData>;
