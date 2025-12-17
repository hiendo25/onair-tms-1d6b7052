"use client";

import React, { useEffect, useId, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import ImageIcon from "@mui/icons-material/Image";
import { Box, Button, FormControl, FormHelperText, FormLabel, IconButton, Typography } from "@mui/material";
import type { Control, FieldValues, Path } from "react-hook-form";
import { Controller } from "react-hook-form";

export interface RHFImageUploadProps<T extends FieldValues> {
  className?: string;
  label?: React.ReactNode;
  control: Control<T>;
  name: Path<T>;
  required?: boolean;
  disabled?: boolean;
  helpText?: React.ReactNode;
  placeholder?: string;
  maxFileSize?: number; // in bytes, default 5MB
  acceptedFileTypes?: string; // e.g., "image/*"
  uploadButtonText?: string;
  maxWidth?: number | string;
  maxHeight?: number | string;
  aspectRatio?: string; // e.g., "16/9", "1/1"
}

const RHFImageUpload = <T extends FieldValues>({
  className,
  control,
  name,
  label,
  required,
  disabled,
  helpText,
  placeholder = "Nhấn để chọn ảnh",
  maxFileSize = 5 * 1024 * 1024, // 5MB default
  acceptedFileTypes = "image/*",
  uploadButtonText,
  maxWidth = 400,
  maxHeight = 200,
  aspectRatio,
}: RHFImageUploadProps<T>) => {
  const fieldId = useId();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const createPreviewUrl = (value: File | string | null | undefined): string | null => {
    if (!value) return null;
    
    if (typeof value === "string") {
      return value;
    }
    
    if (value instanceof File) {
      return URL.createObjectURL(value);
    }
    
    return null;
  };

  const handleFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
    onChange: (value: File | null) => void,
    onError?: (message: string) => void
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      onError?.("Vui lòng chọn file ảnh");
      event.target.value = "";
      return;
    }

    // Validate file size
    if (file.size > maxFileSize) {
      const maxSizeMB = (maxFileSize / (1024 * 1024)).toFixed(1);
      onError?.(`Kích thước file không được vượt quá ${maxSizeMB}MB`);
      event.target.value = "";
      return;
    }

    // Clean up old preview URL
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    // Create new preview URL
    const newPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(newPreviewUrl);

    // Update form value
    onChange(file);
    
    // Reset input
    event.target.value = "";
  };

  const handleRemove = (onChange: (value: null) => void) => {
    // Clean up preview URL
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    onChange(null);
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange }, fieldState: { error } }) => {
        // Update preview URL when value changes externally
        const currentPreviewUrl = previewUrl || createPreviewUrl(value);

        return (
          <FormControl className={className} error={!!error} fullWidth>
            {label && (
              <FormLabel htmlFor={fieldId}>
                {label}
                {required && <span className="ml-1 text-red-600">*</span>}
              </FormLabel>
            )}

            {currentPreviewUrl ? (
              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                  maxWidth,
                  borderRadius: 2,
                  overflow: "hidden",
                  border: "1px solid",
                  borderColor: error ? "error.main" : "divider",
                  mt: label ? 1 : 0,
                }}
              >
                <Box
                  component="img"
                  src={currentPreviewUrl}
                  alt="Preview"
                  sx={{
                    width: "100%",
                    height: "auto",
                    maxHeight,
                    display: "block",
                    objectFit: "contain",
                    ...(aspectRatio && { aspectRatio }),
                  }}
                />
                <IconButton
                  color="error"
                  size="small"
                  onClick={() => handleRemove(onChange)}
                  disabled={disabled}
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    bgcolor: "background.paper",
                    "&:hover": {
                      bgcolor: "error.main",
                      color: "white",
                    },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ) : (
              <Box
                sx={{
                  width: "100%",
                  maxWidth,
                  height: maxHeight,
                  border: "2px dashed",
                  borderColor: error ? "error.main" : "grey.300",
                  borderRadius: 2,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "grey.50",
                  cursor: disabled ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                  mt: label ? 1 : 0,
                  "&:hover": disabled
                    ? {}
                    : {
                        borderColor: error ? "error.main" : "primary.main",
                        bgcolor: error ? "error.lighter" : "primary.50",
                      },
                  ...(aspectRatio && { aspectRatio }),
                }}
                component="label"
              >
                <input
                  type="file"
                  accept={acceptedFileTypes}
                  hidden
                  onChange={(e) => handleFileSelect(e, onChange, (msg) => console.error(msg))}
                  disabled={disabled}
                  id={fieldId}
                />
                <ImageIcon sx={{ fontSize: 48, color: "grey.400", mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  {uploadButtonText || placeholder}
                </Typography>
                {helpText && !error && (
                  <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, textAlign: "center", px: 2 }}>
                    {helpText}
                  </Typography>
                )}
              </Box>
            )}

            {error?.message && <FormHelperText>{error.message}</FormHelperText>}
            {helpText && !error && currentPreviewUrl && (
              <FormHelperText>{helpText}</FormHelperText>
            )}
          </FormControl>
        );
      }}
    />
  );
};

export default RHFImageUpload;

