import React, { memo, useMemo } from "react";
import { Button } from "@mui/material";
import { useWatch } from "react-hook-form";

import { useDialogs } from "@/hooks/useDialogs/useDialogs";
import { useUpsertSurveyFormContext } from ".";

import { UpsertSurveyFormData } from "./survey-form.schema";
interface ButtonCancelConfirmationProps {
  action?: "create" | "update";
  loading?: boolean;
  onOk?: () => void;
  initialData?: UpsertSurveyFormData;
}
const ButtonCancelConfirmation: React.FC<ButtonCancelConfirmationProps> = ({ loading, action = "create", onOk }) => {
  const { control } = useUpsertSurveyFormContext();
  const dialog = useDialogs();

  const values = useWatch({ control, name: ["name", "slug", "description"] });

  const isOpenDialogConfirm = useMemo(() => {
    if (action === "create") {
      return values.some((it) => it.length);
    }
    return false;
  }, [values, action]);

  const handleClickCancel = async () => {
    if (isOpenDialogConfirm) {
      const message =
        action === "update"
          ? "Hủy bỏ sẽ không thể khôi phục lại những thay đổi đã cập nhât, bạn vẫn muốn hủy?"
          : "Hủy bỏ sẽ mất toàn bộ dữ liệu đã nhập, bạn vẫn muốn hủy?";

      const confirm = await dialog.confirm(message, {
        title: "Lưu ý",
        cancelText: "Quay lại",
        severity: "warning",
      });
      if (!confirm) return;
    }

    onOk?.();
  };

  return (
    <Button variant="outlined" onClick={handleClickCancel} disabled={loading} loading={loading} type="button">
      Hủy
    </Button>
  );
};
export default memo(ButtonCancelConfirmation);
