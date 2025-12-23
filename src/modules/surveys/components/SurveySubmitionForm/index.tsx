"use client";

import React, { useCallback, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Stack, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { FormProvider, SubmitHandler, useFieldArray, useForm, useFormContext } from "react-hook-form";

import { FaceSmileIcon } from "@/shared/assets/icons";
import RHFCheckboxField from "@/shared/ui/form/RHFCheckboxField";
import RHFRadioGroupField from "@/shared/ui/form/RHFRadioGroupField";
import RHFRatingField from "@/shared/ui/form/RHFRatingField";
import RHFTextAreaField from "@/shared/ui/form/RHFTextAreaField";
import RHFTextField from "@/shared/ui/form/RHFTextField";

import RatingSortType from "./question-types/RatingSortType";
import YesNoType from "./question-types/YesNoType";
import QuestionItemWrapper from "./QuestionItemWrapper";
import { SurveySubmissionFormData, surveySubmissionSchema } from "./survey-submission.schema";

export interface SurveySubmissionFormProps {
  initialData?: SurveySubmissionFormData;
  onSubmit: (data: SurveySubmissionFormData) => void;
  isLoading?: boolean;
}

const initUpsertFormData: SurveySubmissionFormData = {
  questions: [],
};

const SurveySubmissionForm: React.FC<SurveySubmissionFormProps> = ({ initialData, onSubmit, isLoading = false }) => {
  const methods = useForm<SurveySubmissionFormData>({
    resolver: zodResolver(surveySubmissionSchema),
    defaultValues: initUpsertFormData,
  });

  const {
    control,
    formState: { errors },
    getValues,
    reset,
    handleSubmit,
  } = methods;

  const { fields: questionFields } = useFieldArray({
    control: control,
    name: "questions",
    keyName: "_questionId",
  });
  const router = useRouter();

  const handleCancel = () => {};

  console.log({ values: getValues(), errors });
  const submitFormData: SubmitHandler<SurveySubmissionFormData> = (formData) => {
    console.log({ formData });
    onSubmit(formData);
  };

  useEffect(() => {
    if (!initialData) return;
    reset(initialData);
  }, [initialData, reset]);

  return (
    <FormProvider {...methods}>
      <Stack spacing={3} className="bg-white rounded-xl overflow-hidden p-3 md:p-6 border border-gray-200">
        <Typography variant="h5" component="h4">
          Câu hỏi khảo sát
        </Typography>
        <div className="flex flex-col gap-6">
          {questionFields.map(({ name, _questionId, isRequred, type, options }, _questionIndex) => (
            <QuestionItemWrapper key={_questionId} label={name} required={isRequred}>
              {type === "text" && (
                <RHFTextAreaField
                  name={`questions.${_questionIndex}.answer.text`}
                  control={control}
                  placeholder="Nhập nội dung"
                />
              )}
              {type === "checkbox" && (
                <>
                  {options.map((option, optIndex) => (
                    <div key={optIndex}>
                      <div className="flex">
                        <RHFCheckboxField
                          control={control}
                          name={`questions.${_questionIndex}.answer.value`}
                          label={option?.text}
                        />
                        {option.isOther && (
                          <RHFTextField
                            control={control}
                            name={`questions.${_questionIndex}.answer.value`}
                            placeholder="Khác"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </>
              )}
              {type === "radio" && (
                <RHFRadioGroupField
                  control={control}
                  name={`questions.${_questionIndex}.answer.value`}
                  options={options.map((opt) => ({ label: opt.text, value: opt.id }))}
                />
              )}
              {type === "rating" && (
                <RHFRatingField
                  control={control}
                  name={`questions.${_questionIndex}.answer.value`}
                  options={options.map((opt) => ({ label: opt.text, value: opt.id }))}
                />
              )}
              {type === "yes_no" && <YesNoType control={control} questionIndex={_questionIndex} />}
              {type === "rating_sort" && <RatingSortType control={control} questionIndex={_questionIndex} />}
            </QuestionItemWrapper>
          ))}
        </div>

        {/* <SurveyQuestionContainer control={control} errors={errors} /> */}
      </Stack>
      <div className="h-6"></div>
      <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
        <Button variant="outlined" onClick={handleCancel} disabled={isLoading}>
          Hủy
        </Button>
        <Button variant="contained" onClick={handleSubmit(submitFormData)} loading={isLoading} disabled={isLoading}>
          {initialData ? "Cập nhật" : "Tạo khảo sát"}
        </Button>
      </Box>
    </FormProvider>
  );
};

export default SurveySubmissionForm;
export const useSurveySubmission = useFormContext<SurveySubmissionFormData>;
