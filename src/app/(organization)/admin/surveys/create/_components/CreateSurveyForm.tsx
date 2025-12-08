"use client";
import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";
import UpsertSurveyForm, { UpsertSurveyFormProps } from "@/modules/surveys/components/UpsertSurveyForm";
import { PATHS } from "@/constants/path.contstants";

export default function CreateSurveyForm() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const handleSubmit: UpsertSurveyFormProps["onSubmit"] = (data) => {
    console.log("Creating survey:", data);

    enqueueSnackbar("Tạo khảo sát thành công", { variant: "success" });
    router.push(PATHS.SURVEYS.ROOT);
  };

  return <UpsertSurveyForm onSubmit={handleSubmit} />;
}
