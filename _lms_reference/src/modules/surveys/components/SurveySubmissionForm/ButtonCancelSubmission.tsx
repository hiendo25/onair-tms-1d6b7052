import React, { memo, useMemo } from "react";
import { Button } from "@mui/material";
import { useWatch } from "react-hook-form";

import { useDialogs } from "@/hooks/useDialogs/useDialogs";
import { useSurveySubmissionForm } from ".";

import { SurveySubmissionFormData } from "./survey-submission.schema";
interface ButtonCancelSubmissionProps {
  loading?: boolean;
  onOk?: () => void;
  initialData?: SurveySubmissionFormData;
  disabled?: boolean;
}
const ButtonCancelSubmission: React.FC<ButtonCancelSubmissionProps> = ({ loading, onOk, disabled }) => {
  const { control } = useSurveySubmissionForm();
  const dialog = useDialogs();

  const questions = useWatch({ control, name: "questions" });

  const isOpenDialogConfirm = useMemo(() => {
    return questions.some((question) => {
      if (question.type === "text") {
        return !!question.answer.value;
      }
      if (question.type === "checkbox") {
        return !!question.answer.length;
      }
      if (question.type === "yes_no") {
        return !!question.answer?.value;
      }
      if (question.type === "radio") {
        return !!question.answer;
      }
    });
  }, [questions]);

  const handleClickCancel = async () => {
    if (isOpenDialogConfirm) {
      const confirm = await dialog.confirm("Hủy bỏ sẽ không thể khôi phục nội dung đã làm, bạn vẫn muốn hủy?", {
        title: "Lưu ý",
        cancelText: "Quay lại",
        severity: "warning",
      });
      if (!confirm) return;
    }

    onOk?.();
  };

  return (
    <Button
      variant="outlined"
      onClick={handleClickCancel}
      disabled={disabled || loading}
      loading={loading}
      type="button"
    >
      Hủy
    </Button>
  );
};
export default memo(ButtonCancelSubmission);
