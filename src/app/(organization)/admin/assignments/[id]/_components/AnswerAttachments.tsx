"use client";

import React from "react";
import { Box, Typography, Stack, Link } from "@mui/material";
import { FileMetadata } from "@/types/dto/assignments";

interface AnswerAttachmentsProps {
  attachments: FileMetadata[];
}

const AnswerAttachments: React.FC<AnswerAttachmentsProps> = ({ attachments }) => {
  if (!attachments || attachments.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
        Tệp đính kèm của học viên:
      </Typography>
      <Stack spacing={0.5}>
        {attachments.map((attachment, index) => (
          <Box key={index}>
            <Link
              href={attachment.url}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ fontSize: "0.875rem" }}
            >
              {`Tệp đính kèm ${index + 1}: ${attachment.originalName}`}
            </Link>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default AnswerAttachments;

