"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Box, Button, CircularProgress, Stack } from "@mui/material";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";
import { FormProvider, SubmitHandler, useController, useForm } from "react-hook-form";

import { PATHS } from "@/constants/path.constant";
import {
  type AssignmentBankAssignFormValues,
  assignmentBankAssignSchema,
} from "@/modules/assignment-management/components/assignment-bank";
import { useAssignAssignmentBankMutation } from "@/modules/assignment-management/operations/mutation";
import {
  useGetAssignmentBankByIdQuery,
  useGetLatestAssignmentByBankIdQuery,
} from "@/modules/assignment-management/operations/query";
import { calculateAssignmentBankTotals } from "@/modules/assignment-management/utils/assignment-bank.utils";
import type { StudentSelectedItem } from "@/modules/class-room-management/store/class-room-store";
import { useUserOrganization } from "@/modules/organization";
import PageContainer from "@/shared/ui/PageContainer";

import AssignmentBankAssignConfigCard from "./AssignmentBankAssignConfigCard";
import AssignmentBankAssignEmployeeCard from "./AssignmentBankAssignEmployeeCard";
import AssignmentBankAssignInfoCard from "./AssignmentBankAssignInfoCard";

interface AssignmentBankAssignViewProps {
  assignmentId: string;
}

const DEFAULT_FORM_VALUES: AssignmentBankAssignFormValues = {
  startDate: "",
  endDate: "",
  attemptLimit: "",
  assignedEmployees: [],
};

const AssignmentBankAssignView = ({ assignmentId }: AssignmentBankAssignViewProps) => {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const currentOrganization = useUserOrganization((state) => state.currentOrganization);
  const organizationId = currentOrganization.orgId;
  const { mutate: assignAssignmentBank, isPending: isAssigning } = useAssignAssignmentBankMutation();

  const {
    data: assignment,
    isLoading,
    error,
  } = useGetAssignmentBankByIdQuery(assignmentId, organizationId);
  const { data: latestAssignment } = useGetLatestAssignmentByBankIdQuery(assignmentId, organizationId);

  const methods = useForm<AssignmentBankAssignFormValues>({
    resolver: zodResolver(assignmentBankAssignSchema),
    defaultValues: DEFAULT_FORM_VALUES,
  });

  const hasHydratedRef = React.useRef(false);

  const {
    field: { value: assignedEmployees = [], onChange },
    fieldState: { error: assignedEmployeesError },
  } = useController({ control: methods.control, name: "assignedEmployees" });

  const handleCancel = () => {
    router.push(PATHS.ASSIGNMENTS.ROOT);
  };

  const handleSubmit: SubmitHandler<AssignmentBankAssignFormValues> = (data) => {
    if (!organizationId) {
      enqueueSnackbar("Không tìm thấy tổ chức hiện tại", { variant: "error" });
      return;
    }

    assignAssignmentBank(
      {
        assignmentId: latestAssignment?.id,
        assignmentBankId: assignmentId,
        organizationId,
        startDate: data.startDate,
        endDate: data.endDate,
        attemptLimit: Number(data.attemptLimit),
        assignedEmployeeIds: data.assignedEmployees.map((employee) => employee.id),
      },
      {
        onSuccess: () => {
          enqueueSnackbar("Gán học viên thành công", { variant: "success" });
          router.push(PATHS.ASSIGNMENTS.ROOT);
        },
        onError: (error) => {
          enqueueSnackbar(error.message || "Có lỗi xảy ra khi gán bài kiểm tra", { variant: "error" });
        },
      },
    );
  };

  React.useEffect(() => {
    if (!latestAssignment || hasHydratedRef.current) {
      return;
    }

    const startDate = latestAssignment.available_from
      ? dayjs(latestAssignment.available_from).format("DD/MM/YYYY")
      : "";
    const endDate = latestAssignment.available_to ? dayjs(latestAssignment.available_to).format("DD/MM/YYYY") : "";
    const selectedEmployees: StudentSelectedItem[] = (latestAssignment.assignment_employees || [])
      .map((item) => item.employees)
      .filter((employee): employee is NonNullable<typeof employee> => Boolean(employee))
      .map((employee) => ({
        id: employee.id,
        email: employee.profiles?.email ?? "",
        fullName: employee.profiles?.full_name ?? "",
        employeeCode: employee.employee_code ?? "",
        avatar: employee.profiles?.avatar ?? null,
        employeeType: "student",
      }));

    methods.reset({
      startDate,
      endDate,
      attemptLimit: latestAssignment.attempt_limit?.toString() ?? "",
      assignedEmployees: selectedEmployees,
    });

    hasHydratedRef.current = true;
  }, [latestAssignment, methods]);

  if (isLoading) {
    return (
      <PageContainer
        title="Gán học viên"
        breadcrumbs={[{ title: "Bài kiểm tra", path: PATHS.ASSIGNMENTS.ROOT }]}
      >
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (error || !assignment) {
    return (
      <PageContainer
        title="Gán học viên"
        breadcrumbs={[{ title: "Bài kiểm tra", path: PATHS.ASSIGNMENTS.ROOT }]}
      >
        <Alert severity="error">Không thể tải dữ liệu bài kiểm tra</Alert>
      </PageContainer>
    );
  }

  const { totalQuestions, totalScore } = calculateAssignmentBankTotals(assignment);
  const durationLabel =
    assignment.duration_minutes !== null && assignment.duration_minutes !== undefined
      ? `${assignment.duration_minutes}`
      : "--";
  const passScoreValue = assignment.pass_score ?? null;
  const passScoreLabel =
    passScoreValue !== null && totalScore > 0
      ? `${passScoreValue}/${totalScore}`
      : passScoreValue !== null
        ? `${passScoreValue}`
        : "--";

  return (
    <PageContainer
      title="Gán học viên"
      breadcrumbs={[
        { title: "Bài kiểm tra", path: PATHS.ASSIGNMENTS.ROOT },
        { title: assignment.name },
      ]}
    >
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(handleSubmit)} className="flex flex-col gap-6">
          <AssignmentBankAssignInfoCard
            title={assignment.name}
            description={assignment.description}
            totalQuestions={totalQuestions}
            totalScore={totalScore}
            durationLabel={durationLabel}
            passScoreLabel={passScoreLabel}
          />
          <AssignmentBankAssignConfigCard />
          <AssignmentBankAssignEmployeeCard
            selectedEmployees={assignedEmployees as StudentSelectedItem[]}
            onChange={(employees) => onChange(employees)}
            errorMessage={assignedEmployeesError?.message}
          />
          <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ pt: 1 }}>
            <Button variant="text" onClick={handleCancel} disabled={isAssigning}>
              Hủy
            </Button>
            <Button type="submit" variant="contained" disabled={isAssigning}>
              Xác nhận
            </Button>
          </Stack>
        </form>
      </FormProvider>
    </PageContainer>
  );
};

export default AssignmentBankAssignView;
