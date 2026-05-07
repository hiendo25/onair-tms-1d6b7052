import React, { memo, useMemo } from "react";
import { useTransition } from "react";
import { Button } from "@mui/material";
import { isEqual } from "lodash";
import { useWatch } from "react-hook-form";

import { useDialogs } from "@/hooks/useDialogs/useDialogs";
import { useUpsertSurveyFormContext } from ".";

import { UpsertSurveyFormData } from "./survey-form.schema";
interface ButtonCancelConfirmationProps {
  loading?: boolean;
  onOk?: () => void;
  initialData?: UpsertSurveyFormData;
}
const ButtonCancelConfirmation: React.FC<ButtonCancelConfirmationProps> = ({ loading, initialData, onOk }) => {
  const { control } = useUpsertSurveyFormContext();
  const [isTransition, startTransition] = useTransition();
  const dialog = useDialogs();

  const formValues = useWatch({ control, name: ["name", "slug", "description"] });

  const isOpenDialogConfirm = useMemo(() => {
    if (!initialData) {
      return formValues.some((it) => it.length);
    }

    return !isEqual(
      { name: initialData.name, description: initialData.description },
      { name: formValues[0], description: formValues[2] },
    );
  }, [formValues, initialData]);

  const handleClickCancel = async () => {
    if (isOpenDialogConfirm) {
      const message = initialData
        ? "Hủy bỏ sẽ không thể khôi phục lại những thay đổi đã cập nhât, bạn vẫn muốn hủy?"
        : "Hủy bỏ sẽ mất toàn bộ dữ liệu đã nhập, bạn vẫn muốn hủy?";

      const confirm = await dialog.confirm(message, {
        title: "Lưu ý",
        cancelText: "Quay lại",
        severity: "warning",
      });
      if (!confirm) return;
    }
    startTransition(async () => {
      onOk?.();
    });
  };

  return (
    <Button
      variant="outlined"
      onClick={handleClickCancel}
      disabled={loading}
      loading={loading || isTransition}
      type="button"
    >
      Hủy
    </Button>
  );
};
export default memo(ButtonCancelConfirmation);
