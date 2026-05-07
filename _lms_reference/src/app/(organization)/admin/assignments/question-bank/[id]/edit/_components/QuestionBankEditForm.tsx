"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, CircularProgress, Stack } from "@mui/material";
import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";

import { PATHS } from "@/constants/path.constant";
import { type Question } from "@/modules/assignment-management/components/assignment-form.schema";
import {
  QuestionBankActions,
  QuestionBankFormLayout,
  questionBankFormSchema,
  type QuestionBankFormValues,
} from "@/modules/assignment-management/components/question-bank";
import { useUpdateQuestionBankMutation } from "@/modules/assignment-management/operations/mutation";
import { useGetQuestionBankByIdQuery } from "@/modules/assignment-management/operations/query";
import { createDefaultQuestion } from "@/modules/assignment-management/utils/question.utils";
import { useUserOrganization } from "@/modules/organization";
import type { QuestionBankDto } from "@/types/dto/question-bank";

interface QuestionBankEditFormProps {
  questionId: string;
}

const mapQuestionToForm = (question: QuestionBankDto): Question => {
  const baseQuestion: Question = {
    type: question.type,
    label: question.label,
    score: question.score,
    attachments: question.attachments || undefined,
  };

  if (question.type === "matching") {
    return {
      ...baseQuestion,
      matchingData: question.options ? (question.options as any) : undefined,
    };
  }

  if (question.type === "order") {
    return {
      ...baseQuestion,
      orderItems: question.options ? (question.options as any).orderItems : undefined,
    };
  }

  return {
    ...baseQuestion,
    options: question.options ? (question.options as any) : undefined,
  };
};

export default function QuestionBankEditForm({ questionId }: QuestionBankEditFormProps) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const organizationId = useUserOrganization((state) => state.currentOrganization.orgId);

  const { data, isPending, error } = useGetQuestionBankByIdQuery(questionId, organizationId);
  const { mutate: updateQuestionBank, isPending: isUpdating } = useUpdateQuestionBankMutation();

  const methods = useForm<QuestionBankFormValues>({
    resolver: zodResolver(questionBankFormSchema),
    defaultValues: {
      questions: [createDefaultQuestion()],
      questionCategories: [],
    },
  });

  useEffect(() => {
    if (!data) {
      return;
    }

    methods.reset({
      questions: [mapQuestionToForm(data)],
      difficulty: data.difficulty ?? "medium",
      questionCategories: data.question_bank_categories?.map((item) => item.category_id) || [],
    });
  }, [data, methods]);

  const handleSubmit: SubmitHandler<QuestionBankFormValues> = (formData) => {
    if (!organizationId) {
      enqueueSnackbar("Không tìm thấy tổ chức hiện tại", { variant: "error" });
      return;
    }

    const updatedQuestion = formData.questions[0];

    if (!updatedQuestion) {
      enqueueSnackbar("Câu hỏi không hợp lệ", { variant: "error" });
      return;
    }

    updateQuestionBank(
      {
        id: questionId,
        question: {
          ...updatedQuestion,
          difficulty: formData.difficulty,
          questionCategories: formData.questionCategories,
        },
        organizationId,
      },
      {
        onSuccess: () => {
          enqueueSnackbar("Cập nhật câu hỏi thành công", { variant: "success" });
          router.push(PATHS.ASSIGNMENTS.QUESTION_BANK);
        },
      },
    );
  };

  const handleCancel = () => {
    router.push(PATHS.ASSIGNMENTS.QUESTION_BANK);
  };

  if (isPending) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 240 }}>
        <CircularProgress />
      </Stack>
    );
  }

  if (error) {
    return <Alert severity="error">Không thể tải câu hỏi để chỉnh sửa</Alert>;
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleSubmit)} className="flex flex-col gap-6">
        <QuestionBankFormLayout />
        <QuestionBankActions onCancel={handleCancel} isLoading={isUpdating} submitLabel="Cập nhật" />
      </form>
    </FormProvider>
  );
}
