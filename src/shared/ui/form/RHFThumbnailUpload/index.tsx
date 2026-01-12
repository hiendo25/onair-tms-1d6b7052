"use client";

import React, { memo, useEffect, useMemo, useState } from "react";
import { Children } from "react";
import { FormHelperText, FormLabel, IconButton, Typography } from "@mui/material";
import Image from "next/image";
import { Control, FieldPath, FieldValues, useController } from "react-hook-form";

import { FILE_TYPES, FileTypes, ImageFileType } from "@/constants/file.constant";
import { useLibraryStore } from "@/modules/library/store/libraryProvider";
import { CloseIcon } from "@/shared/assets/icons";
import { cn } from "@/utils";
export interface RHFThumbnailUploadProps<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label?: string;
  subTitle?: string;
  description?: React.ReactNode;
  required?: boolean;
  aspectRatio?: string; // e.g., "21/9", "16/9", "4/3"
  width?: string; // e.g., "480px", "100%"
  accepts?: ImageFileType[];
  onChange?: (url: string) => void;
  children?: (url: string | undefined, onChange: () => void) => React.ReactNode;
}

/**
 * RHFThumbnailUpload - Reusable thumbnail upload component for React Hook Form
 *
 * Features:
 * - Integrates with Library module for image selection
 * - Supports image preview and removal
 * - Customizable aspect ratio and width
 * - Form validation support
 * - Works with any React Hook Form setup
 *
 * @example
 * ```tsx
 * <RHFThumbnailUpload
 *   control={control}
 *   name="thumbnail"
 *   label="Ảnh bìa đại diện"
 *   subTitle="Hình ảnh đại diện cho nội dung của bạn"
 *   required
 *   aspectRatio="21/9"
 *   width="480px"
 * />
 * ```
 */
const RHFThumbnailUpload = <TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  label = "Ảnh bìa đại diện",
  subTitle,
  description,
  required = false,
  aspectRatio = "21/9",
  onChange,
  accepts = [],
  children,
}: RHFThumbnailUploadProps<TFieldValues>) => {
  const openResource = useLibraryStore((state) => state.openLibrary);
  const [errorMessage, setErrorMessage] = useState<string>();
  const {
    field,
    fieldState: { error },
  } = useController({
    control,
    name,
    rules: {
      validate: (val) => /\.(png|jpe?g)$/i.test(val) || "Only PNG or JPG allowed",
    },
  });

  const handleRemoveThumbnail = () => {
    field.onChange("");
    onChange?.("");
  };

  const handleOpenResource = async () => {
    const resource = await openResource({ mode: "single" });
    const resourceItem = resource[0];
    const path = resourceItem?.path;

    if (!resourceItem || !resourceItem.mime_type?.includes("image") || !path || !resourceItem?.extension) {
      setErrorMessage(`Vui lòng chọn hình hình ảnh định dạng ${accepts.join(",")}.`);
      return;
    }

    if (accepts.length && !accepts.includes(`.${resourceItem.extension}` as ImageFileType)) {
      setErrorMessage(`Định dạng không hợp lệ, chỉ chấp nhận ${accepts.join(",")}.`);
      return;
    }
    setErrorMessage(undefined);
    field.onChange(path);
    onChange?.(path);
  };
  // const element = Children.only(children);

  useEffect(() => {
    const errorMessage = error?.message;
    setErrorMessage(errorMessage);
  }, [error]);
  return (
    <div>
      <FormLabel component="div" className="mb-2 inline-block">
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </FormLabel>

      {subTitle && <Typography className="text-xs mb-4">{subTitle}</Typography>}
      {description && <div className="description">{description}</div>}

      {children ? (
        children(field.value, handleOpenResource)
      ) : (
        <div
          className={cn(
            "thumbnail-wrapper",
            "rounded-xl border border-dashed",
            "flex items-center justify-center w-full max-w-[480px]",
            {
              "border-red-500 bg-red-50": !!errorMessage,
              "border-gray-300 bg-gray-100": !errorMessage,
            },
          )}
          style={{ aspectRatio }}
        >
          {field.value && (
            <div className="preview-url relative w-full h-full overflow-hidden rounded-xl">
              <Image src={field.value} alt="thumbnail" fill className="w-full h-full object-cover" />
              <IconButton
                sx={{
                  width: "2rem",
                  height: "2rem",
                  position: "absolute",
                  right: "0.5rem",
                  top: "0.5rem",
                  bgcolor: "rgba(255, 255, 255, 0.9)",
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 1)",
                  },
                }}
                onClick={handleRemoveThumbnail}
              >
                <CloseIcon className="w-4 h-4" />
              </IconButton>
            </div>
          )}

          <div
            className={cn("cursor-pointer", { "opacity-0 hidden pointer-events-none": field.value })}
            onClick={handleOpenResource}
          >
            <Image
              src="/assets/icons/upload-cloud.svg"
              width={80}
              height={40}
              alt="upload icon"
              className="mb-3 mx-auto"
            />
            <Typography
              sx={(theme) => ({
                color: theme.palette.primary["dark"],
                backgroundColor: theme.palette.primary["lighter"],
                fontWeight: "bold",
                borderRadius: "8px",
                padding: "6px 12px",
                fontSize: "0.75rem",
              })}
            >
              Tải ảnh lên
            </Typography>
          </div>
        </div>
      )}

      {errorMessage && <FormHelperText error={!!error || !!errorMessage}>{errorMessage}</FormHelperText>}
    </div>
  );
};

export default memo(RHFThumbnailUpload) as typeof RHFThumbnailUpload;
