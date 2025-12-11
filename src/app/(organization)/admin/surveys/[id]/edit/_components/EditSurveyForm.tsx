"use client";

import { useMemo } from "react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";

import { PATHS } from "@/constants/path.contstants";
import UpsertSurveyForm, { UpsertSurveyFormProps } from "@/modules/surveys/components/UpsertSurveyForm";
import { useUpsertSurvey } from "@/modules/surveys/hooks/useUpsertSurvey";
import { GetSurveyByIdResponse } from "@/repository/surveys";

interface EditSurveyFormProps {
  data: NonNullable<GetSurveyByIdResponse["data"]>;
}

type SurveyFormDataInitial = Exclude<UpsertSurveyFormProps["initialData"], undefined>;
export default function EditSurveyForm({ data }: EditSurveyFormProps) {
  const { update, isLoading } = useUpsertSurvey();
  const router = useRouter();
  console.log({ data });
  const { enqueueSnackbar } = useSnackbar();
  const [isTransition, startTransition] = useTransition();
  const initFormData: UpsertSurveyFormProps["initialData"] = useMemo(() => {
    const questions = data["surveys_questions"].reduce<SurveyFormDataInitial["questions"]>((allQuestions, question) => {
      const questionItem: SurveyFormDataInitial["questions"][number] = {
        id: question.id,
        is_required: question.is_required,
        label: question.name || "",
        type: question.question_type,
        options: [],
      };

      type OptionItemType = SurveyFormDataInitial["questions"][number]["options"][number];
      const options = question.surveys_questions_options.reduce<OptionItemType[]>((acc, option): OptionItemType[] => {
        return [
          ...acc,
          {
            id: option.id,
            is_other: option.is_other || false,
            content: option.option_text || "",
          },
        ];
      }, []);

      return [
        ...allQuestions,
        {
          ...questionItem,
          options: options,
        },
      ];
    }, []);
    return {
      name: data.title,
      description: data.description || "",
      slug: data.slug,
      questions: questions,
    };
  }, [data]);

  const handleUpdateSurvey: UpsertSurveyFormProps["onSubmit"] = (formData) => {
    update(
      { surveyId: data.id, formData },
      {
        onSuccess(data, variables) {
          startTransition(() => {
            enqueueSnackbar("Cập nhật khảo sát thành công", { variant: "success" });
            router.push(PATHS.SURVEYS.LIST);
          });
        },
      },
    );
  };
  return (
    <UpsertSurveyForm initialData={initFormData} onSubmit={handleUpdateSurvey} isLoading={isLoading || isTransition} />
  );
}
