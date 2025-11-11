"use client";

import React from "react";
import { Box, Typography, Stack, Link } from "@mui/material";
import { FileMetadata } from "@/types/dto/assignments";

interface FileAnswerDisplayProps {
  files: FileMetadata[] | undefined;
}

const FileAnswerDisplay: React.FC<FileAnswerDisplayProps> = ({ files }) => {
  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Tệp nộp của học viên:
      </Typography>
      {files && files.length > 0 ? (
        <Stack spacing={1} sx={{ mb: 2 }}>
          {files.map((file, index) => (
            <Box key={index}>
              <Link
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ fontSize: "0.875rem" }}
              >
                {`Tệp ${index + 1}: ${file.originalName}`}
              </Link>
            </Box>
          ))}
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Học viên chưa nộp tệp
        </Typography>
      )}
    </Box>
  );
};

export default FileAnswerDisplay;

