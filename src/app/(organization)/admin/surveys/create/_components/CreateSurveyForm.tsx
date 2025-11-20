"use client";

import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";
import SurveyForm from "../../_components/SurveyForm";
import { SurveyFormSchema } from "@/modules/surveys/survey-form.schema";

export default function CreateSurveyForm() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const handleSubmit = (data: SurveyFormSchema) => {
    console.log("Creating survey:", data);
    
    enqueueSnackbar("Tạo khảo sát thành công", { variant: "success" });
    router.push("/admin/surveys");
  };

  return <SurveyForm onSubmit={handleSubmit} />;
}

