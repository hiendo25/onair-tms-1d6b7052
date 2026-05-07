import React, { memo, useEffect } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from "@mui/material";

import type { QuestionBankFilterOption } from "@/app/(organization)/admin/assignments/question-bank/_components/QuestionBankFilterSelect";
import useAssignmentBankQuestionSelection from "@/modules/assignment-management/hooks/useAssignmentBankQuestionSelection";
import type { QuestionBankDto } from "@/types/dto/question-bank";

import AssignmentBankQuestionTransfer from "./AssignmentBankQuestionTransfer";

interface AssignmentBankQuestionDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (questions: QuestionBankDto[]) => void;
  selectedQuestions: QuestionBankDto[];
  availableQuestions: QuestionBankDto[];
  totalAvailable: number;
  searchValue: string;
  onSearchChange: (value: string) => void;
  categoryValue: string;
  categoryOptions: QuestionBankFilterOption[];
  onCategoryChange: (value: string) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

const AssignmentBankQuestionDialog = ({
  open,
  onClose,
  onConfirm,
  selectedQuestions,
  availableQuestions,
  totalAvailable,
  searchValue,
  onSearchChange,
  categoryValue,
  categoryOptions,
  onCategoryChange,
  page,
  totalPages,
  onPageChange,
  isLoading = false,
}: AssignmentBankQuestionDialogProps) => {
  const {
    selectedQuestions: localSelectedQuestions,
    selectedQuestionIds,
    setSelectedQuestions,
    toggleQuestion,
    toggleAll,
    removeQuestion,
    clearAll,
  } = useAssignmentBankQuestionSelection();

  useEffect(() => {
    if (open) {
      setSelectedQuestions(selectedQuestions);
    }
  }, [open, selectedQuestions, setSelectedQuestions]);

  const handleConfirm = () => {
    onConfirm(localSelectedQuestions);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ pb: 1 }}>
        Tạo bài kiểm tra
      </DialogTitle>
      <DialogContent dividers sx={{ pt: 3 }}>
        <AssignmentBankQuestionTransfer
          availableQuestions={availableQuestions}
          selectedQuestions={localSelectedQuestions}
          selectedQuestionIds={selectedQuestionIds}
          totalAvailable={totalAvailable}
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          categoryValue={categoryValue}
          categoryOptions={categoryOptions}
          onCategoryChange={onCategoryChange}
          onToggleQuestion={toggleQuestion}
          onRemoveQuestion={removeQuestion}
          onSelectAll={(checked) => toggleAll(availableQuestions, checked)}
          onClearAll={clearAll}
          page={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
          isLoading={isLoading}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Stack direction="row" spacing={1.5}>
          <Button variant="text" onClick={onClose}>
            Hủy
          </Button>
          <Button variant="contained" onClick={handleConfirm}>
            Xác nhận
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default memo(AssignmentBankQuestionDialog);
