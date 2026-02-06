import React, { memo } from "react";
import { Button, Stack } from "@mui/material";

interface QuestionBankActionsProps {
  onCancel: () => void;
  isLoading?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
}

const QuestionBankActions = ({
  onCancel,
  isLoading = false,
  submitLabel = "Lưu",
  cancelLabel = "Quay lại",
}: QuestionBankActionsProps) => {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
      <Button variant="outlined" onClick={onCancel} disabled={isLoading} type="button">
        {cancelLabel}
      </Button>
      <Button type="submit" variant="contained" disabled={isLoading} loading={isLoading}>
        {submitLabel}
      </Button>
    </Stack>
  );
};

export default memo(QuestionBankActions);
