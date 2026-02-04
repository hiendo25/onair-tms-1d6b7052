import { forwardRef, memo, useImperativeHandle, useMemo, useRef } from "react";
import { useTransition } from "react";
import { Button } from "@mui/material";
import { isEqual } from "lodash";
import { useWatch } from "react-hook-form";

import { useDialogs } from "@/hooks/useDialogs/useDialogs";
import { useUpsertChilDepartmentForm } from ".";

import { UpsertChildDepartmentFormData } from "./upsert-child-department.schema";
export interface ButtonCancelRef {
  triggerClick: () => void;
}
export interface ButtonCancelProps {
  loading?: boolean;
  onOk?: () => void;
  initialValues?: UpsertChildDepartmentFormData;
  className?: string;
}
const ButtonCancel = forwardRef<ButtonCancelRef, ButtonCancelProps>(
  ({ loading, initialValues, onOk, className }, ref) => {
    const { control } = useUpsertChilDepartmentForm();
    const [isTransition, startTransition] = useTransition();
    const dialog = useDialogs();

    const [name, code, managedById] = useWatch({
      control,
      name: ["name", "code", "managedById"],
    });

    const isOpenDialogConfirm = useMemo(() => {
      if (!initialValues) {
        return [name, code, managedById].some((val) => {
          if (!val) return false;
          if (typeof val === "string" && val.length > 0) return true;
          return false;
        });
      }

      return !isEqual(
        {
          name: initialValues.name,
          code: initialValues.code,
          managedById: initialValues.managedById,
        },
        { name, code, managedById },
      );
    }, [name, code, managedById, initialValues]);

    const handleClickCancel = async () => {
      if (isOpenDialogConfirm) {
        const message = initialValues
          ? "Hủy bỏ sẽ không thể khôi phục lại những thay đổi đã cập nhât, bạn vẫn muốn hủy?"
          : "Hủy bỏ sẽ mất toàn bộ dữ liệu đã nhập, bạn vẫn muốn hủy?";

        const confirm = await dialog.confirm(message, {
          title: "Lưu ý",
          cancelText: "Quay lại",
          severity: "warning",
        });
        if (!confirm) return;
      }
      startTransition(() => {
        onOk?.();
      });
    };

    useImperativeHandle(ref, () => ({
      triggerClick: () => {
        handleClickCancel();
      },
    }));

    return (
      <Button
        variant="outlined"
        onClick={handleClickCancel}
        disabled={loading}
        loading={loading || isTransition}
        className={className}
      >
        Hủy bỏ
      </Button>
    );
  },
);
export default memo(ButtonCancel);
