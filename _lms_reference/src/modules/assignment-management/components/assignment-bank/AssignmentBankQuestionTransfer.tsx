import React, { memo } from "react";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  InputAdornment,
  Pagination,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import QuestionBankFilterSelect, {
  QuestionBankFilterOption,
} from "@/app/(organization)/admin/assignments/question-bank/_components/QuestionBankFilterSelect";
import type { QuestionBankDto } from "@/types/dto/question-bank";

import AssignmentBankQuestionListItem from "./AssignmentBankQuestionListItem";
import AssignmentBankSelectedQuestionItem from "./AssignmentBankSelectedQuestionItem";

interface AssignmentBankQuestionTransferProps {
  availableQuestions: QuestionBankDto[];
  selectedQuestions: QuestionBankDto[];
  selectedQuestionIds: Set<string>;
  totalAvailable: number;
  searchValue: string;
  onSearchChange: (value: string) => void;
  categoryValue: string;
  categoryOptions: QuestionBankFilterOption[];
  onCategoryChange: (value: string) => void;
  onToggleQuestion: (question: QuestionBankDto) => void;
  onRemoveQuestion: (questionId: string) => void;
  onSelectAll: (checked: boolean) => void;
  onClearAll: () => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  errorMessage?: string;
}

const AssignmentBankQuestionTransfer = ({
  availableQuestions,
  selectedQuestions,
  selectedQuestionIds,
  totalAvailable,
  searchValue,
  onSearchChange,
  categoryValue,
  categoryOptions,
  onCategoryChange,
  onToggleQuestion,
  onRemoveQuestion,
  onSelectAll,
  onClearAll,
  page,
  totalPages,
  onPageChange,
  isLoading = false,
  errorMessage,
}: AssignmentBankQuestionTransferProps) => {
  const selectedCount = selectedQuestions.length;
  const isAllSelected =
    availableQuestions.length > 0 && availableQuestions.every((question) => selectedQuestionIds.has(question.id));
  const isSomeSelected =
    availableQuestions.some((question) => selectedQuestionIds.has(question.id)) && !isAllSelected;
  const panelSx = {
    border: "1px solid",
    borderColor: "grey.200",
    borderRadius: 2,
    overflow: "hidden",
    backgroundColor: "common.white",
  };
  const panelHeaderSx = {
    px: 2,
    py: 1.5,
    backgroundColor: "grey.100",
    borderBottom: "1px solid",
    borderColor: "grey.200",
  };
  const panelToolbarSx = {
    px: 2,
    py: 2,
    borderBottom: "1px solid",
    borderColor: "grey.200",
    backgroundColor: "common.white",
  };
  const listContainerSx = {
    maxHeight: 520,
    overflowY: "auto",
  };

  return (
    <Stack spacing={2.5}>
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
        }}
      >
        <Stack spacing={0} sx={panelSx}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={panelHeaderSx}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="subtitle2" fontWeight={600}>
                Chọn từ ngân hàng câu hỏi ({totalAvailable})
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Đã chọn {selectedCount}
              </Typography>
            </Stack>
          </Stack>

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", md: "center" }}
            sx={panelToolbarSx}
          >
            <Checkbox
              checked={isAllSelected}
              indeterminate={isSomeSelected}
              onChange={(event) => onSelectAll(event.target.checked)}
              sx={{
                alignSelf: { xs: "flex-start", md: "center" },
                mt: { xs: 0.5, md: 0 },
                p: 0.5,
              }}
            />
            <TextField
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Tìm kiếm..."
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{
                flex: 1,
                maxWidth: { md: 280 },
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "grey.100",
                },
              }}
            />
            <Box sx={{ minWidth: { xs: "100%", md: 200 } }}>
              <QuestionBankFilterSelect
                value={categoryValue}
                placeholder="Tất cả các lĩnh vực"
                options={categoryOptions}
                onChange={onCategoryChange}
              />
            </Box>
          </Stack>

          <Box sx={listContainerSx}>
            {isLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                <CircularProgress size={28} />
              </Box>
            ) : availableQuestions.length === 0 ? (
              <Box sx={{ py: 6, textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  Không tìm thấy câu hỏi phù hợp
                </Typography>
              </Box>
            ) : (
              availableQuestions.map((question) => (
                <AssignmentBankQuestionListItem
                  key={question.id}
                  question={question}
                  checked={selectedQuestionIds.has(question.id)}
                  onToggle={() => onToggleQuestion(question)}
                />
              ))
            )}
          </Box>

          {totalPages > 1 ? (
            <Stack
              direction="row"
              justifyContent="flex-end"
              sx={{ px: 2, py: 1.5, borderTop: "1px solid", borderColor: "grey.200" }}
            >
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => onPageChange(value)}
                color="primary"
                shape="rounded"
                size="small"
              />
            </Stack>
          ) : null}
        </Stack>

        <Stack spacing={0} sx={panelSx}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={panelHeaderSx}>
            <Typography variant="subtitle2" fontWeight={600}>
              Câu hỏi đã chọn ({selectedCount})
            </Typography>
          </Stack>
          <Box sx={{ ...panelToolbarSx, display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="text"
              color="primary"
              onClick={onClearAll}
              disabled={selectedCount === 0}
              sx={{ fontWeight: 600 }}
            >
              Xóa tất cả
            </Button>
          </Box>
          <Box sx={listContainerSx}>
            {selectedCount === 0 ? (
              <Box sx={{ py: 6, textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  Chưa chọn câu hỏi nào
                </Typography>
              </Box>
            ) : (
              selectedQuestions.map((question, index) => (
                <AssignmentBankSelectedQuestionItem
                  key={question.id}
                  question={question}
                  index={index + 1}
                  onRemove={() => onRemoveQuestion(question.id)}
                />
              ))
            )}
          </Box>
        </Stack>
      </Box>
      {errorMessage ? (
        <Typography variant="caption" color="error">
          {errorMessage}
        </Typography>
      ) : null}
    </Stack>
  );
};

export default memo(AssignmentBankQuestionTransfer);
