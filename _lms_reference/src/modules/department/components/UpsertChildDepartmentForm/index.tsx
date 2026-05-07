import { forwardRef, memo, useEffect, useImperativeHandle, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormControl, FormHelperText, FormLabel, Stack, Typography } from "@mui/material";
import { Controller, FormProvider, useFormContext, useWatch } from "react-hook-form";
import { useForm } from "react-hook-form";

import BranchSelector, { BranchSelectorProps } from "@/modules/branch/container/BranchSelector";
import EmployeeSelector from "@/modules/employees/container/EmployeeSelector";
import RHFTextField from "@/shared/ui/form/RHFTextField";
import { cn } from "@/utils";
import DepartmentSelector from "../../container/DepartmentSelector";
import DepartmentSelectorV2 from "../../container/DepartmentSelectorV2";

import ButtonCancel, { ButtonCancelRef } from "./ButtonCancel";
import ButtonSubmit from "./ButtonSubmit";
import { UpsertChildDepartmentFormData, upsertChildDepartmentSchema } from "./upsert-child-department.schema";

export interface UpsertChildDepartmentFormRef {
  triggerSubmit: () => void;
  triggerCancel: () => void;
  setFormValues: (initialValues: UpsertChildDepartmentFormData) => void;
  resetForm: () => void;
}
export interface UpsertChildDepartmentFormProps {
  onSubmit?: (formData: UpsertChildDepartmentFormData) => void;
  onInvalid?: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
  initialValues?: UpsertChildDepartmentFormData;
  hideButtonCancel?: boolean;
  hideButtonSubmit?: boolean;
}

const initUpsertChildDepartmentFormData = (): UpsertChildDepartmentFormData => {
  return {
    name: "",
    code: "",
    managedById: undefined,
    status: "active",
  };
};
const UpsertLevelForm = forwardRef<UpsertChildDepartmentFormRef, UpsertChildDepartmentFormProps>(
  (
    { isLoading, onSubmit, onCancel, onInvalid, initialValues, hideButtonCancel = false, hideButtonSubmit = false },
    ref,
  ) => {
    const buttonCancelRef = useRef<ButtonCancelRef>(null);
    const methods = useForm({
      resolver: zodResolver(upsertChildDepartmentSchema),
      defaultValues: initUpsertChildDepartmentFormData(),
    });

    const { control, reset, handleSubmit } = methods;

    const handleSumbitForm = () => {
      if (onSubmit) handleSubmit(onSubmit, onInvalid)();
    };

    useEffect(() => {
      initialValues ? reset(initialValues) : reset();
    }, [initialValues, reset]);

    useImperativeHandle(ref, () => ({
      triggerSubmit: () => {
        handleSumbitForm();
      },
      triggerCancel: () => {
        buttonCancelRef.current?.triggerClick();
      },
      setFormValues: (initValue) => {
        reset(initValue);
      },
      resetForm: () => {
        reset();
      },
    }));

    return (
      <FormProvider {...methods}>
        <div className="flex flex-col gap-6">
          <RHFTextField control={control} name="name" label="Tên nhóm" required placeholder="Tên Tên nhóm" />
          <RHFTextField
            control={control}
            name="code"
            label="Mã"
            required
            placeholder="Mã nhóm"
            note={
              <Stack component="ul" style={{ listStyle: "outside", paddingLeft: 15 }}>
                <Typography component="li" sx={{ fontSize: 12 }} color="text.secondary">
                  Mã chỉ từ 2 - 8 ký tự.
                </Typography>
                <Typography component="li" sx={{ fontSize: 12 }} color="text.secondary">
                  Không chứa ký tự đặc biệt, ngoại từ (-)
                </Typography>
                <Typography component="li" sx={{ fontSize: 12 }} color="text.secondary">
                  Không có khoảng cách.
                </Typography>
              </Stack>
            }
          />
          <Controller
            control={control}
            name="managedById"
            render={({ field: { value, onChange } }) => (
              <FormControl>
                <FormLabel>Người quản lý</FormLabel>
                <EmployeeSelector
                  placeholder="Chọn người quản lý"
                  values={value ? [value] : undefined}
                  onChange={(values) => onChange(values[0])}
                />
              </FormControl>
            )}
          />
          <div
            className={cn("flex gap-3", {
              hidden: hideButtonCancel && hideButtonSubmit,
            })}
          >
            <ButtonCancel
              ref={buttonCancelRef}
              loading={isLoading}
              onOk={onCancel}
              initialValues={initialValues}
              className={cn("w-24", {
                hidden: !onCancel || hideButtonCancel,
              })}
            />
            <ButtonSubmit
              onClick={handleSumbitForm}
              className={cn("w-24", {
                hidden: hideButtonSubmit,
              })}
            >
              {initialValues ? "Cập nhật" : "Lưu"}
            </ButtonSubmit>
          </div>
        </div>
      </FormProvider>
    );
  },
);
export default memo(UpsertLevelForm);

export const useUpsertChilDepartmentForm = useFormContext<UpsertChildDepartmentFormData>;
