"use client";

import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";
import { useMemo } from "react";
import SurveyForm from "../../../_components/SurveyForm";
import { SurveyFormSchema } from "@/modules/surveys/survey-form.schema";
import { MOCK_SURVEYS } from "@/constants/survey.constants";
import { Alert, CircularProgress, Box } from "@mui/material";
import { PATHS } from "@/constants/path.contstants";

interface EditSurveyFormProps {
  surveyId: string;
}

export default function EditSurveyForm({ surveyId }: EditSurveyFormProps) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const survey = useMemo(() => {
    return MOCK_SURVEYS.find((s) => s.id === surveyId);
  }, [surveyId]);

  const handleSubmit = (data: SurveyFormSchema) => {
    console.log("Updating survey:", surveyId, data);

    enqueueSnackbar("Cập nhật khảo sát thành công", { variant: "success" });
    router.push(PATHS.SURVEYS.ROOT);
  };

  if (!survey) {
    return (
      <Alert severity="error">
        Không tìm thấy khảo sát
      </Alert>
    );
  }

  return <SurveyForm initialData={survey} onSubmit={handleSubmit} />;
}

