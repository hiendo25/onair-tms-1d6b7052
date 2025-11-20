import * as React from "react";
import { Button, Typography } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

interface FileUploadButtonProps {
  onFileSelect: (files: FileList | null) => void;
}

export default function FileUploadButton({ onFileSelect }: FileUploadButtonProps) {
  return (
    <>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: "block" }}>
        Hỗ trợ: Hình ảnh (JPG, PNG, GIF), Video (MP4, MOV, AVI), Audio (MP3, WAV)
      </Typography>

      <Button
        variant="outlined"
        component="label"
        startIcon={<CloudUploadIcon />}
        sx={{ mb: 2 }}
      >
        Chọn file
        <input
          type="file"
          hidden
          multiple
          accept="image/*,video/*,audio/*"
          onChange={(e) => onFileSelect(e.target.files)}
        />
      </Button>
    </>
  );
}

