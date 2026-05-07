"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Stack, Typography } from "@mui/material";
import { FormProvider, useForm, useFormContext } from "react-hook-form";

import {
  UpsertSurveyFormData,
  upsertSurveyFormSchema,
} from "@/modules/surveys/components/UpsertSurveyForm/survey-form.schema";
import RHFTextField from "@/shared/ui/form/RHFTextField";
import RHFTinyEditor from "@/shared/ui/form/RHFTinyEditor";

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
  const buttonActionRef = useRef<"submit" | "cancel">(null);
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
    buttonActionRef.current === "cancel";
    onCancel?.();
  }, [onCancel]);

  const handleSubmitForm = () => {
    buttonActionRef.current === "submit";
    handleSubmit(onSubmit)();
  };

  useEffect(() => {
    buttonActionRef.current = null;
    initialData ? reset(initialData) : reset();
    return () => {
      buttonActionRef.current = null;
    };
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
          <RHFTinyEditor control={control} name="description" minHeight={220} label="Mô tả" required />
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
          loading={isLoading && buttonActionRef.current === "cancel"}
          initialData={initialData}
        />
        <Button
          variant="contained"
          onClick={handleSubmitForm}
          loading={isLoading && buttonActionRef.current === "submit"}
          disabled={isLoading}
        >
          {initialData ? "Cập nhật" : "Tạo khảo sát"}
        </Button>
      </Box>
    </FormProvider>
  );
};

export default UpsertSurveyForm;
export const useUpsertSurveyFormContext = useFormContext<UpsertSurveyFormData>;
