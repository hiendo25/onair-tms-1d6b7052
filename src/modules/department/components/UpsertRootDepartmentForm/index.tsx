import { forwardRef, memo, useEffect, useImperativeHandle, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormControl, FormHelperText, FormLabel, Stack, Typography } from "@mui/material";
import { Controller, FormProvider, useFormContext, useWatch } from "react-hook-form";
import { useForm } from "react-hook-form";

import BranchSelector, { BranchSelectorProps } from "@/modules/branch/container/BranchSelector";
import EmployeeSelector from "@/modules/employees/container/EmployeeSelector";
import RHFTextField from "@/shared/ui/form/RHFTextField";
import { cn } from "@/utils";

import ButtonCancel, { ButtonCancelRef } from "./ButtonCancel";
import ButtonSubmit from "./ButtonSubmit";
import { UpsertRootDepartmentFormData, upsertRootDepartmentSchema } from "./upsert-root-department.schema";

export interface UpsertDepartmentFormRef {
  triggerSubmit: () => void;
  triggerCancel: () => void;
  setFormValues: (initialValues: UpsertRootDepartmentFormData) => void;
  resetForm: () => void;
}
export interface UpsertDepartmentFormProps {
  onSubmit?: (formData: UpsertRootDepartmentFormData) => void;
  onInvalid?: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
  initialValues?: UpsertRootDepartmentFormData;
  hideButtonCancel?: boolean;
  hideButtonSubmit?: boolean;
}

const initUpsertRootDepartmentFormData = (): UpsertRootDepartmentFormData => {
  return {
    name: "",
    code: "",
    branchId: undefined,
    managedById: undefined,
    status: "active",
  };
};
const UpsertLevelForm = forwardRef<UpsertDepartmentFormRef, UpsertDepartmentFormProps>(
  (
    { isLoading, onSubmit, onCancel, onInvalid, initialValues, hideButtonCancel = false, hideButtonSubmit = false },
    ref,
  ) => {
    const buttonCancelRef = useRef<ButtonCancelRef>(null);
    const methods = useForm({
      resolver: zodResolver(upsertRootDepartmentSchema),
      defaultValues: initUpsertRootDepartmentFormData(),
    });

    const { control, reset, handleSubmit, setValue, getValues } = methods;

    const branchId = useWatch({ control, name: "id" });
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
          <RHFTextField control={control} name="name" label="Tên phòng ban" required placeholder="Tên phòng ban" />
          <RHFTextField
            control={control}
            name="code"
            label="Mã"
            required
            placeholder="Mã phòng ban"
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
            name="branchId"
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <FormControl>
                <FormLabel
                  className={cn({
                    "text-red-500": !!error?.message,
                  })}
                >
                  Chi nhánh <span className="text-red-600">*</span>
                </FormLabel>
                <BranchSelector
                  excludes={branchId ? [branchId] : undefined}
                  values={value ? [value] : undefined}
                  onChange={(values) => onChange(values[0])}
                  error={!!error?.message}
                />
                {error?.message && (
                  <FormHelperText className="mx-0" error>
                    {error.message}
                  </FormHelperText>
                )}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="managedById"
            render={({ field: { value, onChange } }) => (
              <FormControl>
                <FormLabel>Chọn người quản lý</FormLabel>
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

export const useUpsertRootDepartmentFormContext = useFormContext<UpsertRootDepartmentFormData>;
