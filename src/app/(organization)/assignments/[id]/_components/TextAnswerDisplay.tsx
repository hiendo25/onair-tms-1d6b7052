"use client";

import React from "react";
import { Box, Typography, TextField } from "@mui/material";

interface TextAnswerDisplayProps {
  text: string | undefined;
}

const TextAnswerDisplay: React.FC<TextAnswerDisplayProps> = ({ text }) => {
  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Câu trả lời của học viên:
      </Typography>
      <TextField
        fullWidth
        multiline
        rows={5}
        value={text || ""}
        disabled
        sx={{ mb: 2 }}
      />
    </Box>
  );
};

export default TextAnswerDisplay;

