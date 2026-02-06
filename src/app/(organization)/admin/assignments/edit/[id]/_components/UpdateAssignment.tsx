"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Box, CircularProgress } from "@mui/material";
import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";

import { PATHS } from "@/constants/path.constant";
import {
  AssignmentBankFormLayout,
  assignmentBankFormSchema,
  type AssignmentBankFormValues,
  AssignmentBankQuestionDialog,
} from "@/modules/assignment-management/components/assignment-bank";
import { QuestionBankActions } from "@/modules/assignment-management/components/question-bank";
import useAssignmentBankQuestionSelection from "@/modules/assignment-management/hooks/useAssignmentBankQuestionSelection";
import { useUpdateAssignmentBankMutation } from "@/modules/assignment-management/operations/mutation";
import { useGetAssignmentBankByIdQuery, useGetQuestionBankQuery } from "@/modules/assignment-management/operations/query";
import { calculateQuestionBankTotals, getCategoryIdsFromQuestions } from "@/modules/assignment-management/utils/assignment-bank.utils";
import { useGetClassFieldQuery } from "@/modules/class-room-management/operation/query";
import { useUserOrganization } from "@/modules/organization";
import type { QuestionBankDto } from "@/types/dto/question-bank";

interface UpdateAssignmentProps {
  assignmentId: string;
}

const QUESTION_PAGE_SIZE = 10;

const DEFAULT_FORM_VALUES: AssignmentBankFormValues = {
  name: "",
  description: "",
  durationMinutes: "",
  isUnlimitedDuration: false,
  passScore: "",
  totalScore: 0,
  shuffleQuestions: true,
  shuffleAnswers: false,
  hideCorrectAnswers: false,
  questionIds: [],
};

const UpdateAssignment: React.FC<UpdateAssignmentProps> = ({ assignmentId }) => {
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const currentOrganization = useUserOrganization((state) => state.currentOrganization);

  const [page, setPage] = React.useState(1);
  const [searchInput, setSearchInput] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [categoryId, setCategoryId] = React.useState("");

  const { mutate: updateAssignmentBank, isPending: isUpdating } = useUpdateAssignmentBankMutation();
  const { data: categoryListData } = useGetClassFieldQuery();

  const methods = useForm<AssignmentBankFormValues>({
    resolver: zodResolver(assignmentBankFormSchema),
    defaultValues: DEFAULT_FORM_VALUES,
  });

  const { selectedQuestions, setSelectedQuestions } = useAssignmentBankQuestionSelection();
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = React.useState(false);
  const { totalQuestions, totalScore } = calculateQuestionBankTotals(selectedQuestions);

  const organizationId = currentOrganization.orgId;

  const {
    data: assignment,
    isLoading: isLoadingAssignment,
    error: assignmentError,
  } = useGetAssignmentBankByIdQuery(assignmentId, organizationId);

  const {
    data: questionBankResult,
    isLoading: isLoadingQuestions,
  } = useGetQuestionBankQuery({
    page: page - 1,
    limit: QUESTION_PAGE_SIZE,
    search: debouncedSearch,
    organizationId,
    categoryId: categoryId || undefined,
  });

  React.useEffect(() => {
    if (!assignment) {
      return;
    }

    const durationMinutesValue = assignment.duration_minutes;
    const isUnlimitedDuration = !durationMinutesValue || durationMinutesValue <= 0;

    const defaultValues: AssignmentBankFormValues = {
      name: assignment.name,
      description: assignment.description,
      durationMinutes: isUnlimitedDuration ? "" : durationMinutesValue.toString(),
      isUnlimitedDuration,
      passScore: assignment.pass_score?.toString() || "",
      totalScore: 0,
      shuffleQuestions: Boolean(assignment.shuffle_questions),
      shuffleAnswers: Boolean(assignment.shuffle_answers),
      hideCorrectAnswers: Boolean(assignment.hide_correct_answers),
      questionIds: assignment.assignment_questions?.map((question) => question.question_id) || [],
    };

    methods.reset(defaultValues);

    const selected = (assignment.assignment_questions || [])
      .map((item) => item.question_bank)
      .filter((question): question is QuestionBankDto => Boolean(question));

    setSelectedQuestions(selected);
  }, [assignment, methods, setSelectedQuestions]);

  React.useEffect(() => {
    const shouldValidateQuestionIds =
      methods.formState.isSubmitted || Boolean(methods.formState.errors.questionIds);

    methods.setValue(
      "questionIds",
      selectedQuestions.map((question) => question.id),
      { shouldValidate: shouldValidateQuestionIds },
    );
    methods.setValue("totalScore", totalScore);
    const passScoreValue = methods.getValues("passScore");
    const shouldValidatePassScore =
      methods.formState.isSubmitted ||
      Boolean(methods.formState.errors.passScore) ||
      methods.formState.touchedFields.passScore;

    if (passScoreValue && shouldValidatePassScore) {
      void methods.trigger("passScore");
    }
  }, [methods, selectedQuestions, totalScore]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  React.useEffect(() => {
    setPage(1);
  }, [categoryId]);

  const availableQuestions = questionBankResult?.data || [];
  const totalAvailable = questionBankResult?.total || 0;
  const totalPages = Math.max(Math.ceil(totalAvailable / QUESTION_PAGE_SIZE), 1);

  const categoryOptions = React.useMemo(
    () =>
      (categoryListData?.data || []).map((category) => ({
        label: category.name || "",
        value: category.id,
      })),
    [categoryListData?.data],
  );

  const questionError = methods.formState.errors.questionIds?.message;

  const handleOpenQuestionDialog = () => {
    setIsQuestionDialogOpen(true);
  };

  const handleCloseQuestionDialog = () => {
    setIsQuestionDialogOpen(false);
  };

  const handleConfirmQuestions = (questions: QuestionBankDto[]) => {
    setSelectedQuestions(questions);
    setIsQuestionDialogOpen(false);
  };

  const handleSubmit: SubmitHandler<AssignmentBankFormValues> = (data) => {
    if (!organizationId) {
      enqueueSnackbar("Không tìm thấy tổ chức hiện tại", { variant: "error" });
      return;
    }

    const questions = selectedQuestions.map((question, index) => ({
      questionId: question.id,
      orderIndex: index + 1,
    }));

    const categoryIds = getCategoryIdsFromQuestions(selectedQuestions);

    const durationMinutes = data.isUnlimitedDuration ? null : Number(data.durationMinutes);

    updateAssignmentBank(
      {
        id: assignmentId,
        assignment: {
          name: data.name,
          description: data.description,
          durationMinutes,
          passScore: Number(data.passScore),
          shuffleQuestions: data.shuffleQuestions,
          shuffleAnswers: data.shuffleAnswers,
          hideCorrectAnswers: data.hideCorrectAnswers,
          questions,
          categoryIds,
        },
      },
      {
        onSuccess: () => {
          enqueueSnackbar("Cập nhật bài kiểm tra thành công", { variant: "success" });
          router.push(PATHS.ASSIGNMENTS.ROOT);
        },
        onError: (error) => {
          enqueueSnackbar(error.message || "Có lỗi xảy ra khi cập nhật bài kiểm tra", { variant: "error" });
        },
      },
    );
  };

  const handleCancel = () => {
    router.push(PATHS.ASSIGNMENTS.ROOT);
  };

  if (isLoadingAssignment) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (assignmentError) {
    return <Alert severity="error">Không thể tải dữ liệu bài kiểm tra</Alert>;
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleSubmit)} className="flex flex-col gap-6">
        <AssignmentBankFormLayout
          selectedCount={selectedQuestions.length}
          onOpenQuestionDialog={handleOpenQuestionDialog}
          onCreateQuestion={() => router.push(PATHS.ASSIGNMENTS.CREATE_QUESTION_BANK)}
          questionError={questionError}
          totalQuestions={totalQuestions}
          totalScore={totalScore}
        />
        <QuestionBankActions
          onCancel={handleCancel}
          isLoading={isUpdating}
          submitLabel="Xác nhận"
          cancelLabel="Hủy"
        />
      </form>
      <AssignmentBankQuestionDialog
        open={isQuestionDialogOpen}
        onClose={handleCloseQuestionDialog}
        onConfirm={handleConfirmQuestions}
        selectedQuestions={selectedQuestions}
        availableQuestions={availableQuestions}
        totalAvailable={totalAvailable}
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        categoryValue={categoryId}
        categoryOptions={categoryOptions}
        onCategoryChange={setCategoryId}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        isLoading={isLoadingQuestions}
      />
    </FormProvider>
  );
};

export default UpdateAssignment;
