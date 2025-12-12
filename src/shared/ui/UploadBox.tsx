import { useDropzone } from "react-dropzone";
import { IconButton, SxProps, Theme, alpha } from "@mui/material";
import Box from "@mui/material/Box";
import type { DropzoneOptions } from "react-dropzone";
import { memo } from "react";

export type FileUploadType = File | string | null;

export type FilesUploadType = (File | string)[];

export interface UploadProps extends DropzoneOptions {
  error?: boolean;
  sx?: SxProps<Theme>;
  thumbnail?: boolean;
  onDelete?: () => void;
  onUpload?: () => void;
  onRemoveAll?: () => void;
  helperText?: React.ReactNode;
  placeholder?: React.ReactNode;
  value?: FileUploadType | FilesUploadType;
  onRemove?: (file: File | string) => void;
  unsetBox?: boolean;
}

const UploadBox: React.FC<UploadProps> = ({
  placeholder,
  error,
  disabled,
  unsetBox,
  sx,
  ...other
}) => {
  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      disabled,
      ...other,
    });

  const hasError = isDragReject || error;

  return (
    <Box
      {...getRootProps()}
      sx={{
        width: unsetBox ? "unset" : 64,
        height: unsetBox ? "unset" : 64,
        flexShrink: 0,
        display: "flex",
        borderRadius: 1,
        cursor: "pointer",
        alignItems: "center",
        color: unsetBox ? "unset" : "text.disabled",
        justifyContent: "center",
        bgcolor: unsetBox
          ? "unset"
          : (theme) => alpha(theme.palette.grey[500], 0.08),
        border: unsetBox
          ? "unset"
          : (theme) => `dashed 1px ${alpha(theme.palette.grey[500], 0.16)}`,
        ...(isDragActive && { opacity: 0.72 }),
        ...(disabled && { opacity: 0.48, pointerEvents: "none" }),
        ...(hasError && {
          color: "error.main",
          borderColor: "error.main",
          bgcolor: (theme) => alpha(theme.vars.palette.error.mainChannel, 0.08),
        }),
        "&:hover": { opacity: 0.72 },
        ...sx,
      }}
    >
      <input {...getInputProps()} />
      {placeholder || <IconButton>Upload</IconButton>}
    </Box>
  );
};

export default memo(UploadBox);
