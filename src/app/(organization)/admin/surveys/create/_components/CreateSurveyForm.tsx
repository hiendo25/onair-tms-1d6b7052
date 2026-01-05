"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";

import { PATHS } from "@/constants/path.constant";
import UpsertSurveyForm, { UpsertSurveyFormProps } from "@/modules/surveys/components/UpsertSurveyForm";
import { useUpsertSurvey } from "@/modules/surveys/hooks/useUpsertSurvey";

export default function CreateSurveyForm() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { create, isLoading } = useUpsertSurvey();
  const [isTransition, startTransition] = useTransition();

  const handleCancel = () => {
    router.push(PATHS.SURVEYS.LIST);
  };
  const handleSubmit: UpsertSurveyFormProps["onSubmit"] = (formData) => {
    create(
      { type: "classroom", formData: formData },
      {
        onSuccess(data, variables, onMutateResult, context) {
          startTransition(() => {
            enqueueSnackbar("Tạo khảo sát thành công", { variant: "success" });
            router.push(PATHS.SURVEYS.LIST);
          });
        },
      },
    );
  };

  return <UpsertSurveyForm onSubmit={handleSubmit} onCancel={handleCancel} isLoading={isLoading || isTransition} />;
}
