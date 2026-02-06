import React, { forwardRef, memo, useEffect, useImperativeHandle, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormControl, FormLabel, Stack, Typography } from "@mui/material";
import { Controller, FormProvider, useFormContext, useWatch } from "react-hook-form";
import { useForm } from "react-hook-form";

import EmployeeSelector from "@/modules/employees/container/EmployeeSelector";
import RHFTextAreaField from "@/shared/ui/form/RHFTextAreaField";
import RHFTextField from "@/shared/ui/form/RHFTextField";
import { cn } from "@/utils";
import BranchSelector, { BranchSelectorProps } from "../../container/BranchSelector";

import ButtonCancel, { ButtonCancelRef } from "./ButtonCancel";
import ButtonSubmit from "./ButtonSubmit";
import { UpsertBranchFormData, upsertBranchSchema } from "./upsert-branch.schema";

export interface UpsertBranchFormRef {
  triggerSubmit: () => void;
  triggerCancel: () => void;
  setFormValues: (initialValues: UpsertBranchFormData) => void;
  resetForm: () => void;
}
export interface UpsertBranchFormProps {
  onSubmit?: (formData: UpsertBranchFormData) => void;
  onInvalid?: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
  initialValues?: UpsertBranchFormData;
  hideButtonCancel?: boolean;
  hideButtonSubmit?: boolean;
}

const initUpsertBranchFormData = (): UpsertBranchFormData => {
  return {
    name: "",
    code: "",
    address: "",
    managedById: undefined,
    status: "active",
  };
};
const UpsertLevelForm = forwardRef<UpsertBranchFormRef, UpsertBranchFormProps>(
  (
    { isLoading, onSubmit, onCancel, onInvalid, initialValues, hideButtonCancel = false, hideButtonSubmit = false },
    ref,
  ) => {
    const buttonCancelRef = useRef<ButtonCancelRef>(null);
    const methods = useForm({
      resolver: zodResolver(upsertBranchSchema),
      defaultValues: initUpsertBranchFormData(),
    });

    const { control, reset, handleSubmit, setValue, getValues } = methods;

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
          <RHFTextField control={control} name="name" label="Tên chi nhánh" required placeholder="Tên chi nhánh" />
          <RHFTextField
            control={control}
            name="code"
            label="Mã chi nhánh"
            placeholder="Mã chi nhánh"
            required
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
                <FormLabel>Chọn người quản lý</FormLabel>
                <EmployeeSelector
                  placeholder="Chọn người quản lý"
                  values={value ? [value] : undefined}
                  onChange={(values) => onChange(values[0])}
                />
              </FormControl>
            )}
          />
          <RHFTextAreaField control={control} name="address" label="Địa chỉ" maxRows={2} />
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

export const useUpsertLevelFormContext = useFormContext<UpsertBranchFormData>;
