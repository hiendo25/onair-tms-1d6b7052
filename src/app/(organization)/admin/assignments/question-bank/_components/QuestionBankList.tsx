"use client";

import * as React from "react";
import { Alert, Box } from "@mui/material";
import { useRouter } from "next/navigation";

import { PATHS } from "@/constants/path.constant";
import { useDialogs } from "@/hooks/useDialogs/useDialogs";
import useNotifications from "@/hooks/useNotifications/useNotifications";
import {
  QUESTION_TYPE_FILTERS,
  QUESTION_TYPE_LABELS,
  QuestionType,
} from "@/modules/assignment-management/constants/question.constants";
import { useDeleteQuestionBankMutation } from "@/modules/assignment-management/operations/mutation";
import { useGetQuestionBankQuery, useGetQuestionBankSummaryQuery } from "@/modules/assignment-management/operations/query";
import { useGetClassFieldQuery } from "@/modules/class-room-management/operation/query";
import { useUserOrganization } from "@/modules/organization";
import PageContainer from "@/shared/ui/PageContainer";
import TableData, { TableDataProps } from "@/shared/ui/TableData";
import type { QuestionBankDto } from "@/types/dto/question-bank";

import QuestionBankActionMenu from "./QuestionBankActionMenu";
import QuestionBankDetailDialog from "./QuestionBankDetailDialog";
import QuestionBankListItem from "./QuestionBankListItem";
import QuestionBankSummaryCards from "./QuestionBankSummaryCards";
import QuestionBankToolbar from "./QuestionBankToolbar";

type QuestionBankRow = QuestionBankDto & { displayIndex: number };

export default function QuestionBankList() {
  const router = useRouter();
  const dialogs = useDialogs();
  const notifications = useNotifications();
  const currentEmployee = useUserOrganization((state) => state.currentEmployee);

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(12);
  const [searchInput, setSearchInput] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [questionType, setQuestionType] = React.useState<QuestionType | "">("");
  const [categoryId, setCategoryId] = React.useState("");
  const [selectedQuestion, setSelectedQuestion] = React.useState<QuestionBankDto | null>(null);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);

  const organizationId = currentEmployee?.organization?.id;

  const {
    data: questionBankResult,
    isLoading,
    error,
  } = useGetQuestionBankQuery({
    page,
    limit: rowsPerPage,
    search: debouncedSearch,
    organizationId,
    questionType: questionType || undefined,
    categoryId: categoryId || undefined,
  });

  const questions = questionBankResult?.data || [];
  const totalCount = questionBankResult?.total || 0;
  const { data: summaryData } = useGetQuestionBankSummaryQuery(organizationId);
  const summary = summaryData || {
    total: 0,
    multipleChoice: 0,
    trueFalse: 0,
    essay: 0,
    file: 0,
    order: 0,
    matching: 0,
  };

  const { mutateAsync: deleteQuestionBank } = useDeleteQuestionBankMutation();
  const { data: categoryListData } = useGetClassFieldQuery();

  const questionTypeOptions = React.useMemo(
    () =>
      QUESTION_TYPE_FILTERS.map((type) => ({
        label: QUESTION_TYPE_LABELS[type],
        value: type,
      })),
    [],
  );

  const categoryOptions = React.useMemo(
    () =>
      (categoryListData?.data || []).map((category) => ({
        label: category.name || "",
        value: category.id,
      })),
    [categoryListData?.data],
  );

  const handleChangePage = (newPage: number) => {
    setPage(Math.max(newPage - 1, 0));
  };

  const handleChangeRowsPerPage = (pageSize: number) => {
    setRowsPerPage(pageSize);
    setPage(0);
  };

  const handleCreateQuestion = () => {
    router.push(PATHS.ASSIGNMENTS.CREATE_QUESTION_BANK);
  };

  const handleEditQuestion = React.useCallback(
    (questionId: string) => {
      router.push(PATHS.ASSIGNMENTS.EDIT_QUESTION_BANK(questionId));
    },
    [router],
  );

  const handleDeleteQuestion = React.useCallback(
    async (questionId: string) => {
      const confirmed = await dialogs.confirm("Bạn có chắc chắn muốn xóa câu hỏi này không?", {
        title: "Xác nhận xóa",
        okText: "Xóa",
        cancelText: "Hủy",
        severity: "error",
      });

      if (!confirmed) {
        return;
      }

      try {
        await deleteQuestionBank(questionId);
        notifications.show("Xóa câu hỏi thành công", { severity: "success", autoHideDuration: 3000 });
      } catch (deleteError) {
        notifications.show(
          deleteError instanceof Error ? deleteError.message : "Có lỗi xảy ra khi xóa câu hỏi",
          {
            severity: "error",
            autoHideDuration: 5000,
          },
        );
      }
    },
    [deleteQuestionBank, dialogs, notifications],
  );

  const handleViewQuestion = React.useCallback((question: QuestionBankDto) => {
    setSelectedQuestion(question);
    setIsDetailOpen(true);
  }, []);

  const handleCloseDetail = React.useCallback(() => {
    setIsDetailOpen(false);
  }, []);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(0);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  React.useEffect(() => {
    setPage(0);
  }, [questionType, categoryId]);

  const rows = React.useMemo<QuestionBankRow[]>(
    () =>
      questions.map((question, index) => ({
        ...question,
        displayIndex: page * rowsPerPage + index + 1,
      })),
    [page, questions, rowsPerPage],
  );

  const columns = React.useMemo<TableDataProps<QuestionBankRow>["columns"]>(
    () => [
      {
        id: "index",
        field: "displayIndex",
        headerName: "",
        align: "center",
        sx: { width: 72 },
        renderCell: (value) => (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-500">
            {value}
          </div>
        ),
      },
      {
        id: "question",
        field: "label",
        headerName: "Nội dung câu hỏi",
        renderCell: (_value, row) => (
          <QuestionBankListItem question={row} showIndex={false} showActions={false} />
        ),
      },
      {
        id: "actions",
        field: "id",
        headerName: "",
        align: "right",
        fixed: "right",
        sx: { width: 72 },
        renderCell: (_value, row) => (
          <QuestionBankActionMenu
            onView={() => handleViewQuestion(row)}
            onEdit={() => handleEditQuestion(row.id)}
            onDelete={() => handleDeleteQuestion(row.id)}
          />
        ),
      },
    ],
    [handleDeleteQuestion, handleEditQuestion, handleViewQuestion],
  );

  console.log("questions 123", questions);

  return (
    <PageContainer
      title="Ngân hàng câu hỏi"
      breadcrumbs={[
        { title: "Bài kiểm tra", path: PATHS.ASSIGNMENTS.ROOT },
        { title: "Ngân hàng câu hỏi", path: PATHS.ASSIGNMENTS.QUESTION_BANK },
      ]}
    >
      <Box className="flex flex-col gap-6 pb-8">
        <QuestionBankSummaryCards summary={summary} />

        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <QuestionBankToolbar
            searchValue={searchInput}
            onSearchChange={setSearchInput}
            questionTypeValue={questionType}
            categoryValue={categoryId}
            questionTypeOptions={questionTypeOptions}
            categoryOptions={categoryOptions}
            onQuestionTypeChange={(value) => setQuestionType(value ? (value as QuestionType) : "")}
            onCategoryChange={setCategoryId}
            onCreate={handleCreateQuestion}
          />

          <div className="mt-4">
            {error ? (
              <Alert severity="error">Có lỗi xảy ra khi tải ngân hàng câu hỏi</Alert>
            ) : (
              <TableData
                rows={rows}
                columns={columns}
                loading={isLoading}
                hoverRow
                bordered={false}
                pagination={{
                  page: page + 1,
                  pageSize: rowsPerPage,
                  total: totalCount,
                  perPageOptions: [12, 25, 50, 100],
                  onChangePage: handleChangePage,
                  onChangePageSize: handleChangeRowsPerPage,
                }}
                minWidth={920}
              />
            )}
          </div>
        </div>
      </Box>

      <QuestionBankDetailDialog open={isDetailOpen} question={selectedQuestion} onClose={handleCloseDetail} />
    </PageContainer>
  );
}
