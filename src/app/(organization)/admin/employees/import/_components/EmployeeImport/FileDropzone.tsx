import React, { ChangeEvent, memo, useRef, useState } from "react";
import { Box, Button, FormHelperText, IconButton, Stack, Typography } from "@mui/material";

import useNotifications from "@/hooks/useNotifications/useNotifications";
import { CloseIcon, CloudUploadIcon, FileExcelIcon, FileIcon } from "@/shared/assets/icons";
import { cn } from "@/utils";

const ACCEPTED_FILE_EXTENSIONS = [".csv", ".xlsx", ".xls"];
const MAX_FILE_SIZE_MB = 4; //mb

interface FileDropzoneProps {
  onChange?: (file: File) => void;
  maxFileSize?: number;
  accept?: string[];
  onRemove?: () => void;
  errorMessage?: string;
}

const FileDropzone: React.FC<FileDropzoneProps> = ({
  onChange,
  maxFileSize = MAX_FILE_SIZE_MB,
  accept = ACCEPTED_FILE_EXTENSIONS,
  onRemove,
  errorMessage,
}) => {
  const [file, setFile] = React.useState<File>();

  const [isDragging, setIsDragging] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const notifications = useNotifications();
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (evt: React.DragEvent<HTMLDivElement>) => {
    evt.preventDefault();
    setIsDragging(false);

    const fileList = evt.dataTransfer.files;
    const oneFirstFile = fileList[0];
    if (!oneFirstFile) return;

    const isValidFile = validateFile(oneFirstFile);
    if (!isValidFile) return;

    onChange?.(oneFirstFile);
    setFile(oneFirstFile);
  };

  const handleFileInputChange = (evt: ChangeEvent<HTMLInputElement>) => {
    const fileList = evt.target.files;

    const oneFirstFile = fileList?.[0];

    if (!oneFirstFile) return;

    const isValidFile = validateFile(oneFirstFile);

    if (!isValidFile) return;

    onChange?.(oneFirstFile);
    setFile(oneFirstFile);
  };

  const validateFile = (file: File): boolean => {
    const fileName = file.name.toLowerCase();
    const ext = fileName.split(".").pop();

    if (!ext || !accept.includes(`.${ext}`)) {
      notifications.show(`Chỉ hỗ trợ file ${accept.join(", ")}`, {
        severity: "error",
        autoHideDuration: 3000,
      });
      return false;
    }

    const maxSize = maxFileSize * 1024 * 1024;
    if (file.size > maxSize) {
      notifications.show(`Kích thước file không được vượt quá ${maxFileSize}MB`, {
        severity: "error",
        autoHideDuration: 3000,
      });
      return false;
    }

    return true;
  };

  const handleRemoveFile = () => {
    if (!onRemove) return;

    if (inputRef.current) inputRef.current.value = "";

    setFile(undefined);
    onRemove?.();
  };
  return (
    <div>
      <Box
        sx={{
          p: 4,
          borderRadius: 1.5,
          border: "1px dashed",
          borderColor: isDragging ? "primary.main" : "divider",
          bgcolor: isDragging ? "action.hover" : "background.paper",
          textAlign: "center",
          cursor: "pointer",
          transition: "all 0.3s",
          "&:hover": {
            borderColor: "primary.main",
            bgcolor: "action.hover",
          },
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div>
          <div className="flex flex-col gap-1 justify-center">
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {`Kéo thả file vào đây`}
            </Typography>
            <Typography color="text.secondary" variant="body2" gutterBottom>
              Hoặc
            </Typography>
          </div>
          <Button
            startIcon={<CloudUploadIcon />}
            variant="outlined"
            size="small"
            onClick={() => inputRef.current?.click()}
            type="button"
            className="mb-3"
          >
            Chọn file
          </Button>
          <div>
            <Typography variant="caption" color="text.secondary">
              {`Hỗ trợ (${accept.join(", ")}), tối đa (${maxFileSize}MB)`}
            </Typography>
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept.join(",")}
          style={{ display: "none" }}
          onChange={handleFileInputChange}
        />
      </Box>

      {file && (
        <>
          <div
            className={cn("file border p-4 rounded-lg border-gray-200 mt-6 flex items-center justify-between", {
              "border-red-500": !!errorMessage,
            })}
          >
            <div className="flex items-center justify-between">
              <Stack direction="row" gap={1}>
                <FileIcon />
                <Typography>{file.name}</Typography>
              </Stack>
            </div>
            {onRemove ? (
              <IconButton size="small" onClick={handleRemoveFile}>
                <CloseIcon className="w-5 h-5" />
              </IconButton>
            ) : null}
          </div>
          {errorMessage && <FormHelperText error>{errorMessage}</FormHelperText>}
        </>
      )}
    </div>
  );
};
export default memo(FileDropzone);
