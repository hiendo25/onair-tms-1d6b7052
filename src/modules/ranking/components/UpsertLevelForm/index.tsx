import React, { forwardRef, memo, useEffect, useImperativeHandle, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@mui/material";
import Image from "next/image";
import { FormProvider, useFormContext } from "react-hook-form";
import { useForm } from "react-hook-form";

import { ImageIcon } from "@/shared/assets/icons";
import RHFNumberField from "@/shared/ui/form/RHFNumberField";
import RHFTextField from "@/shared/ui/form/RHFTextField";
import RHFThumbnailUpload from "@/shared/ui/form/RHFThumbnailUpload";
import RHFTinyEditor from "@/shared/ui/form/RHFTinyEditor";
import { cn } from "@/utils";

import ButtonCancel, { ButtonCancelRef } from "./ButtonCancel";
import ButtonSubmit from "./ButtonSubmit";
import upsertLevelFormSchema, { UpsertLevelFormData } from "./upsert-level.schema";

export interface UpsertLevelFormRef {
  triggerSubmit: () => void;
  triggerCancel: () => void;
}
export interface UpsertLevelFormProps {
  onSubmit?: (formData: UpsertLevelFormData) => void;
  onInvalid?: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
  initialValues?: UpsertLevelFormData;
  hideButtonCancel?: boolean;
  hideButtonSubmit?: boolean;
}

const initUpsertLevelFormData = (): UpsertLevelFormData => {
  return {
    description: "",
    scoreRequired: 0,
    title: "",
    icon: "",
  };
};
const UpsertLevelForm = forwardRef<UpsertLevelFormRef, UpsertLevelFormProps>(
  (
    { isLoading, onSubmit, onCancel, onInvalid, initialValues, hideButtonCancel = false, hideButtonSubmit = false },
    ref,
  ) => {
    const buttonCancelRef = useRef<ButtonCancelRef>(null);
    const methods = useForm({
      resolver: zodResolver(upsertLevelFormSchema),
      defaultValues: initUpsertLevelFormData(),
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
    }));

    return (
      <FormProvider {...methods}>
        <div className="flex flex-col gap-6">
          <RHFTextField control={control} name="title" label="Tên danh hiệu" required placeholder="Tên danh hiệu" />
          <RHFNumberField
            control={control}
            name="scoreRequired"
            label="Điểm yêu cầu"
            required
            placeholder="Điểm yêu cầu"
          />
          <RHFThumbnailUpload
            control={control}
            name="icon"
            required
            label="Icon"
            aspectRatio="1/1"
            accepts={[".jpeg", ".jpg", ".png", ".svg"]}
          >
            {(value, onChange) => (
              <div className="icon-select cursor-pointer w-fit" onClick={onChange}>
                <div className="w-16 h-16 rounded-lg border border-dashed border-gray-200 bg-gray-50 flex items-center justify-center p-1">
                  {value ? (
                    <Image src={value} alt="icon" width={100} height={100} />
                  ) : (
                    <div className="flex flex-col gap-1 justify-center items-center">
                      <ImageIcon className="w-4 h-4 stroke-gray-400" />
                      <span className="text-xs text-gray-600">Chọn</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </RHFThumbnailUpload>
          <RHFTinyEditor control={control} name="description" label="Mô tả danh hiệu" />
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

export const useUpsertLevelFormContext = useFormContext<UpsertLevelFormData>;
