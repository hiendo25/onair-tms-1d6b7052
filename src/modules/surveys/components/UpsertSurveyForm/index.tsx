"use client";

import React, { useCallback, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Stack, Typography } from "@mui/material";
import { Controller, FormProvider, SubmitHandler, useForm, useFormContext } from "react-hook-form";

import {
  UpsertSurveyFormData,
  upsertSurveyFormSchema,
} from "@/modules/surveys/components/UpsertSurveyForm/survey-form.schema";
import RHFTextAreaField from "@/shared/ui/form/RHFTextAreaField";
import RHFTextField from "@/shared/ui/form/RHFTextField";
import TinyEditor from "@/shared/ui/form/TinyEditor";

import ButtonCancelConfirmation from "./ButtonCancelConfirmation";
import SlugField from "./SlugField";
import SurveyQuestionContainer from "./SurveyQuestionsContainer";
export interface UpsertSurveyFormProps {
  initialData?: UpsertSurveyFormData;
  onSubmit: (data: UpsertSurveyFormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

const initUpsertFormData: UpsertSurveyFormData = {
  name: "",
  description: "",
  questions: [],
  slug: "",
};

const UpsertSurveyForm: React.FC<UpsertSurveyFormProps> = ({ initialData, onSubmit, isLoading = false, onCancel }) => {
  const methods = useForm<UpsertSurveyFormData>({
    resolver: zodResolver(upsertSurveyFormSchema),
    defaultValues: initUpsertFormData,
  });

  const {
    control,
    formState: { errors },
    reset,
    handleSubmit,
  } = methods;

  const handleCancel = useCallback(() => {
    onCancel?.();
  }, [onCancel]);

  const submitFormData: SubmitHandler<UpsertSurveyFormData> = (formData) => {
    onSubmit(formData);
  };

  useEffect(() => {
    initialData ? reset(initialData) : reset();
  }, [initialData, reset]);

  return (
    <FormProvider {...methods}>
      <Stack spacing={3} className="bg-white rounded-xl overflow-hidden p-3 md:p-6 border border-gray-200">
        <Typography variant="h5" component="h4">
          Thông tin khảo sát
        </Typography>

        <div className="flex flex-col gap-3">
          <RHFTextField control={control} name="name" label="Tên khảo sát" placeholder="Nhập tên khảo sát" required />
          <div className="flex flex-col gap-3">
            <SlugField control={control} disableUpdate={!!initialData} />
          </div>

          <Controller
            control={control}
            name="description"
            render={({ field, fieldState: { error } }) => (
              <TinyEditor {...field} helperText={error?.message} error={!!error} />
            )}
          />
        </div>

        {errors.questions?.message && (
          <Typography color="error" variant="body2">
            {errors.questions.message}
          </Typography>
        )}
        <Typography variant="h5" component="h4">
          Câu hỏi khảo sát
        </Typography>

        <SurveyQuestionContainer control={control} errors={errors} />
      </Stack>
      <div className="h-6"></div>
      <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
        <ButtonCancelConfirmation
          onOk={handleCancel}
          action={initialData ? "update" : "create"}
          loading={isLoading}
          initialData={initialData}
        />
        <Button variant="contained" onClick={handleSubmit(submitFormData)} loading={isLoading} disabled={isLoading}>
          {initialData ? "Cập nhật" : "Tạo khảo sát"}
        </Button>
      </Box>
    </FormProvider>
  );
};

export default UpsertSurveyForm;
export const useUpsertSurveyFormContext = useFormContext<UpsertSurveyFormData>;
