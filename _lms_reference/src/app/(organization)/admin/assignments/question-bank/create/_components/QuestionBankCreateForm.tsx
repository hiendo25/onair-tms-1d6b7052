"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";

import { PATHS } from "@/constants/path.constant";
import {
  QuestionBankActions,
  QuestionBankFormLayout,
  questionBankFormSchema,
  type QuestionBankFormValues,
} from "@/modules/assignment-management/components/question-bank";
import { useCreateQuestionBankMutation } from "@/modules/assignment-management/operations/mutation";
import { createDefaultQuestion } from "@/modules/assignment-management/utils/question.utils";
import { useUserOrganization } from "@/modules/organization";

export default function QuestionBankCreateForm() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const organizationId = useUserOrganization((state) => state.currentOrganization.orgId);
  const currentEmployee = useUserOrganization((state) => state.currentEmployee);
  const { mutate: createQuestionBank, isPending } = useCreateQuestionBankMutation();

  const methods = useForm<QuestionBankFormValues>({
    resolver: zodResolver(questionBankFormSchema),
    defaultValues: {
      questions: [createDefaultQuestion()],
      questionCategories: [],
      difficulty: "medium",
    },
  });

  const handleSubmit: SubmitHandler<QuestionBankFormValues> = (data) => {
    if (!organizationId) {
      enqueueSnackbar("Không tìm thấy tổ chức hiện tại", { variant: "error" });
      return;
    }
    if (!currentEmployee?.id) {
      enqueueSnackbar("Không tìm thấy người tạo câu hỏi", { variant: "error" });
      return;
    }

    const question = data.questions[0];

    if (!question) {
      enqueueSnackbar("Câu hỏi không hợp lệ", { variant: "error" });
      return;
    }

    createQuestionBank(
      {
        questions: [
          {
            ...question,
            difficulty: data.difficulty,
            questionCategories: data.questionCategories,
          },
        ],
        organizationId,
        createdBy: currentEmployee.id,
      },
      {
        onSuccess: () => {
          enqueueSnackbar("Tạo câu hỏi thành công", { variant: "success" });
          router.push(PATHS.ASSIGNMENTS.QUESTION_BANK);
        },
      },
    );
  };

  const handleCancel = () => {
    router.push(PATHS.ASSIGNMENTS.QUESTION_BANK);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleSubmit)} className="flex flex-col gap-6">
        <QuestionBankFormLayout />
        <QuestionBankActions onCancel={handleCancel} isLoading={isPending} submitLabel="Lưu" />
      </form>
    </FormProvider>
  );
}
