"use client";
import React, { useRef, useState } from "react";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import DescriptionIcon from "@mui/icons-material/Description";
import ImageIcon from "@mui/icons-material/Image";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import { Box, Button, CircularProgress, IconButton, Typography } from "@mui/material";
import { useSnackbar } from "notistack";

import { TrashIcon1 } from "@/shared/assets/icons";
import { uploadFileToS3 } from "@/utils/s3-upload";

interface FileUploadProps {
  value?: string[]; // Array of URLs, but typically only first element is used
  onChange: (urls: string[]) => void;
  label?: string;
  helperText?: string;
  required?: boolean;
  maxFileSize?: number; // in bytes
  acceptedFileTypes?: Record<string, string[]>;
  buttonText?: string;
  disabled?: boolean;
}

const DEFAULT_ACCEPTED_FILE_TYPES = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/gif": [".gif"],
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "application/vnd.ms-excel": [".xls"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
};

const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const getFileIcon = (fileName: string) => {
  const extension = fileName.split(".").pop()?.toLowerCase();

  if (["jpg", "jpeg", "png", "gif"].includes(extension || "")) {
    return <ImageIcon className="w-5 h-5 text-blue-500" />;
  }
  if (["pdf"].includes(extension || "")) {
    return <DescriptionIcon className="w-5 h-5 text-red-500" />;
  }
  if (["doc", "docx"].includes(extension || "")) {
    return <DescriptionIcon className="w-5 h-5 text-blue-600" />;
  }
  if (["xls", "xlsx"].includes(extension || "")) {
    return <DescriptionIcon className="w-5 h-5 text-green-600" />;
  }

  return <InsertDriveFileIcon className="w-5 h-5 text-gray-500" />;
};

const FileUpload: React.FC<FileUploadProps> = ({
  value = [],
  onChange,
  label = "Đính kèm tệp tin",
  helperText,
  required = false,
  maxFileSize = DEFAULT_MAX_FILE_SIZE,
  acceptedFileTypes = DEFAULT_ACCEPTED_FILE_TYPES,
  buttonText = "Chọn tệp tin",
  disabled = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { enqueueSnackbar } = useSnackbar();

  const currentFileUrl = value && value.length > 0 ? value[0] : null;
  const currentFileName = currentFileUrl ? decodeURIComponent(currentFileUrl.split("/").pop() || "") : null;

  // Generate default helper text if not provided
  const defaultHelperText = (() => {
    const types = Object.values(acceptedFileTypes).flat();
    const sizeInMB = maxFileSize / 1024 / 1024;

    // Group file types for better readability
    const hasImages = types.some((ext) => [".jpg", ".jpeg", ".png", ".gif"].includes(ext));
    const hasPDF = types.includes(".pdf");
    const hasWord = types.some((ext) => [".doc", ".docx"].includes(ext));
    const hasExcel = types.some((ext) => [".xls", ".xlsx"].includes(ext));

    const typeGroups = [];
    if (hasImages) typeGroups.push("Ảnh (JPG, PNG, GIF)");
    if (hasPDF) typeGroups.push("PDF");
    if (hasWord) typeGroups.push("Word (DOC, DOCX)");
    if (hasExcel) typeGroups.push("Excel (XLS, XLSX)");

    return `Hỗ trợ: ${typeGroups.join(", ")}. Tối đa ${sizeInMB}MB.`;
  })();

  const displayHelperText = helperText !== undefined ? helperText : defaultHelperText;

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const fileType = file.type;
    const acceptedTypes = Object.keys(acceptedFileTypes);
    if (!acceptedTypes.includes(fileType)) {
      const typeNames = Object.values(acceptedFileTypes).flat().join(", ");
      enqueueSnackbar(`Loại tệp không được hỗ trợ. Vui lòng chọn: ${typeNames}`, {
        variant: "error",
      });
      return;
    }

    // Validate file size
    if (file.size > maxFileSize) {
      enqueueSnackbar(`Kích thước tệp vượt quá ${maxFileSize / 1024 / 1024}MB.`, {
        variant: "error",
      });
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      const result = await uploadFileToS3(file, {
        onProgress: (percent) => {
          setUploadProgress(percent);
        },
      });

      // Store as single-element array
      onChange([result.url]);

      enqueueSnackbar("Tải tệp lên thành công!", { variant: "success" });
    } catch (error) {
      console.error("Error uploading file:", error);
      enqueueSnackbar(error instanceof Error ? error.message : "Có lỗi xảy ra khi tải tệp lên.", { variant: "error" });
    } finally {
      setUploading(false);
      setUploadProgress(0);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveFile = () => {
    onChange([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col gap-2">
      <Typography className="text-sm text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Typography>

      <input
        ref={fileInputRef}
        type="file"
        accept={Object.values(acceptedFileTypes).flat().join(",")}
        onChange={handleFileSelect}
        disabled={disabled}
        style={{ display: "none" }}
      />

      {!currentFileUrl && !uploading && (
        <Button
          variant="outlined"
          size="small"
          startIcon={<AttachFileIcon />}
          onClick={handleButtonClick}
          disabled={disabled}
          className="self-start"
        >
          {buttonText}
        </Button>
      )}

      {uploading && (
        <Box className="flex items-center gap-2 p-3 border border-gray-200 rounded bg-gray-50">
          <CircularProgress size={20} variant="determinate" value={uploadProgress} />
          <Typography className="text-sm text-gray-600">Đang tải lên... {uploadProgress}%</Typography>
        </Box>
      )}

      {currentFileUrl && !uploading && (
        <Box className="flex items-center gap-2 p-3 border border-gray-200 rounded bg-gray-50">
          {getFileIcon(currentFileName || "")}
          <Typography className="text-sm text-gray-700 flex-1 truncate">{currentFileName}</Typography>
          <IconButton size="small" onClick={handleRemoveFile} disabled={disabled} className="p-1">
            <TrashIcon1 className="w-4 h-4" />
          </IconButton>
        </Box>
      )}

      {displayHelperText && <Typography className="text-xs text-gray-500">{displayHelperText}</Typography>}
    </div>
  );
};

export default FileUpload;
