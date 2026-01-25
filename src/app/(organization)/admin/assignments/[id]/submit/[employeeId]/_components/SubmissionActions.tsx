import * as React from "react";
import { Box, Button, CircularProgress } from "@mui/material";

interface SubmissionActionsProps {
  onCancel: () => void;
  onSubmit: () => void;
  isSubmitDisabled: boolean;
  isSubmitting?: boolean;
  hideCancelButton?: boolean;
}

export default function SubmissionActions({
  onCancel,
  onSubmit,
  isSubmitDisabled,
  isSubmitting = false,
  hideCancelButton = false,
}: SubmissionActionsProps) {
  return (
    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
      {!hideCancelButton && (
        <Button variant="outlined" onClick={onCancel} disabled={isSubmitting}>
          Hủy
        </Button>
      )}
      <Button
        type="submit"
        variant="contained"
        disabled={isSubmitDisabled}
        onClick={onSubmit}
        startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
      >
        {isSubmitting ? "Đang nộp bài..." : "Nộp bài"}
      </Button>
    </Box>
  );
}
