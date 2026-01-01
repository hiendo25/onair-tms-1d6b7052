"use client";

import React, { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, FormHelperText, Stack, Typography } from "@mui/material";
import { FormProvider, SubmitHandler, useFieldArray, useForm, useFormContext } from "react-hook-form";

import RHFTextAreaField from "@/shared/ui/form/RHFTextAreaField";

import CheckboxItemType from "./question-types/CheckboxItemType";
import RadioItemType from "./question-types/RadioItemType";
import RatingItemType from "./question-types/RatingItemType";
import RatingSortItemType from "./question-types/RatingSortItemType";
import YesNoType from "./question-types/YesNoType";
import QuestionItemWrapper from "./QuestionItemWrapper";
import { SurveySubmissionFormData, surveySubmissionSchema } from "./survey-submission.schema";

export interface SurveySubmissionFormProps {
  initialData?: SurveySubmissionFormData;
  onSubmit: (data: SurveySubmissionFormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

const SurveySubmissionForm: React.FC<SurveySubmissionFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
  onCancel,
}) => {
  const methods = useForm<SurveySubmissionFormData>({
    resolver: zodResolver(surveySubmissionSchema),
    defaultValues: { questions: [] },
  });

  const {
    control,
    formState: { errors },
    reset,
    handleSubmit,
  } = methods;

  const { fields: questionFields } = useFieldArray({
    control: control,
    name: "questions",
    keyName: "_questionId",
  });

  const handleCancel = () => {
    onCancel?.();
  };
  const submitFormData: SubmitHandler<SurveySubmissionFormData> = (formData) => {
    onSubmit(formData);
  };

  const getErrorMessage = (index: number) => {
    return errors?.["questions"]?.[index]?.["answer"]?.message;
  };
  useEffect(() => {
    if (!initialData) return;
    reset(initialData);
  }, [initialData, reset]);

  return (
    <FormProvider {...methods}>
      <Stack spacing={3}>
        <div className="flex flex-col gap-6">
          {questionFields.map((question, _questionIndex) => (
            <QuestionItemWrapper index={_questionIndex} key={question._questionId} label={question.questionName}>
              {question.type === "text" && (
                <div className="answer">
                  <Typography className="font-semibold mb-2">
                    Trả lời {question.isRequired && <span className="text-red-600">*</span>}
                  </Typography>
                  <RHFTextAreaField
                    name={`questions.${_questionIndex}.answer.value`}
                    control={control}
                    placeholder="Nhập nội dung"
                  />
                </div>
              )}
              {question.type === "checkbox" && (
                <div className="answer">
                  <Typography className="font-semibold mb-2">
                    Trả lời {question.isRequired && <span className="text-red-600">*</span>}
                  </Typography>
                  <CheckboxItemType question={question} questionIndex={_questionIndex} />
                </div>
              )}
              {question.type === "radio" && (
                <div className="answer">
                  <Typography className="font-semibold mb-2">
                    Trả lời {question.isRequired && <span className="text-red-600">*</span>}
                  </Typography>
                  <RadioItemType question={question} questionIndex={_questionIndex} />
                </div>
              )}
              {question.type === "yes_no" && (
                <div className="answer">
                  <Typography className="font-semibold mb-2">
                    Trả lời {question.isRequired && <span className="text-red-600">*</span>}
                  </Typography>
                  <YesNoType questionIndex={_questionIndex} />
                </div>
              )}
              {question.type === "rating" && (
                <div className="answer">
                  <Typography className="font-semibold mb-2">
                    Trả lời {question.isRequired && <span className="text-red-600">*</span>}
                  </Typography>
                  <RatingItemType control={control} questionIndex={_questionIndex} />
                </div>
              )}
              {question.type === "sort_rating" && (
                <div className="answer">
                  <Typography className="font-semibold mb-2">
                    Trả lời {question.isRequired && <span className="text-red-600">*</span>}
                  </Typography>
                  <Typography className="mb-2 text-sm">Thứ tự tăng dần từ dưới lên trên.</Typography>
                  <RatingSortItemType control={control} questionIndex={_questionIndex} question={question} />
                </div>
              )}
              {getErrorMessage(_questionIndex) && (
                <FormHelperText error>{getErrorMessage(_questionIndex)}</FormHelperText>
              )}
            </QuestionItemWrapper>
          ))}
        </div>
      </Stack>
      <div className="h-6"></div>
      <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
        <Button variant="outlined" onClick={handleCancel} disabled={isLoading}>
          Hủy
        </Button>
        <Button variant="contained" onClick={handleSubmit(submitFormData)} loading={isLoading} disabled={isLoading}>
          Nộp khảo sát
        </Button>
      </Box>
    </FormProvider>
  );
};

export default SurveySubmissionForm;
export const useSurveySubmission = useFormContext<SurveySubmissionFormData>;
