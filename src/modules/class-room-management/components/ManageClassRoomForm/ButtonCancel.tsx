import React, { memo, useMemo } from "react";
import { useTransition } from "react";
import { Button, IconButton } from "@mui/material";
import { isEqual } from "lodash";
import { useWatch } from "react-hook-form";

import { useDialogs } from "@/hooks/useDialogs/useDialogs";
import { CloseIcon } from "@/shared/assets/icons";

import { ClassRoom } from "./classroom-form.schema";
import { useClassRoomFormContext } from "./ClassRoomFormContainer";
interface ButtonCancelProps {
  loading?: boolean;
  onOk?: () => void;
  initialData?: ClassRoom;
}
const ButtonCancel: React.FC<ButtonCancelProps> = ({ loading, initialData, onOk }) => {
  const { control } = useClassRoomFormContext();
  const [isTransition, startTransition] = useTransition();
  const dialog = useDialogs();

  const formValues = useWatch({ control, name: ["title", "slug", "description"] });

  const isOpenDialogConfirm = useMemo(() => {
    if (!initialData) {
      return formValues.some((it) => it.length);
    }

    return !isEqual(
      { name: initialData.title, description: initialData.description },
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
    <IconButton
      className="border rounded-lg border-gray-300 bg-white"
      onClick={handleClickCancel}
      disabled={loading}
      loading={loading || isTransition}
    >
      <CloseIcon />
    </IconButton>
  );
};
export default memo(ButtonCancel);
