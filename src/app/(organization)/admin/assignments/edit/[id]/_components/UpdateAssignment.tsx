"use client";
import React, { useRef } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";

import { PATHS } from "@/constants/path.constant";
import ManageAssignmentForm, {
  ManageAssignmentFormProps,
  ManageAssignmentFormRef,
  TAB_KEYS_ASSIGNMENT,
} from "@/modules/assignment-management/components/ManageAssignmentForm";
import { useUpdateAssignmentMutation } from "@/modules/assignment-management/operations/mutation";
import { useGetAssignmentQuery } from "@/modules/assignment-management/operations/query";
import { useUserOrganization } from "@/modules/organization";
interface UpdateAssignmentProps {
  assignmentId: string;
}

const UpdateAssignment: React.FC<UpdateAssignmentProps> = ({ assignmentId }) => {
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const formAssignmentRef = useRef<ManageAssignmentFormRef>(null);
  const hasShownLockedWarningRef = useRef(false);
  const [isLockedWarningOpen, setIsLockedWarningOpen] = React.useState(false);
  const { mutate: updateAssignment, isPending: isUpdating } = useUpdateAssignmentMutation();
  const { data: assignmentData, isPending: isLoading } = useGetAssignmentQuery(assignmentId);

  const currentOrg = useUserOrganization((state) => state.currentOrganization);
  const submissionCount = assignmentData?.submissions?.[0]?.count ?? 0;
  const isAssignmentLocked = submissionCount > 0;

  React.useEffect(() => {
    if (isAssignmentLocked && !hasShownLockedWarningRef.current) {
      setIsLockedWarningOpen(true);
      hasShownLockedWarningRef.current = true;
    }
  }, [isAssignmentLocked]);

  const handleUpdateAssignment: ManageAssignmentFormProps["onSubmit"] = (formData) => {
    const payload = {
      ...formData,
      id: assignmentId,
      assignedEmployees: formData.assignedEmployees.map((emp) => emp.id),
      organizationId: currentOrg.orgId,
    };

    updateAssignment(payload, {
      onSuccess: (data) => {
        enqueueSnackbar("Cập nhật bài kiểm tra thành công", { variant: "success" });
        router.push(PATHS.ASSIGNMENTS.ROOT);
      },
      onError: (error) => {
        enqueueSnackbar(error.message || "Có lỗi xảy ra khi cập nhật bài kiểm tra", { variant: "error" });
      },
    });
  };

  // Convert AssignmentDto to form data format
  const defaultValues = assignmentData
    ? {
      name: assignmentData.name,
      description: assignmentData.description,
      assignmentCategories: assignmentData.assignment_categories.map((ac) => ac.category_id),
      questions: assignmentData.questions.map((q) => {
        const question: any = {
          type: q.type,
          label: q.label,
          score: q.score,
          attachments: q.attachments || undefined,
        };

        // Transform options based on question type
        if (q.type === "matching") {
          question.matchingData = q.options ? (q.options as any) : undefined;
        } else if (q.type === "order") {
          // Extract orderItems array from options object
          question.orderItems = q.options ? (q.options as any).orderItems : undefined;
        } else {
          question.options = q.options ? (q.options as any) : undefined;
        }

        return question;
      }),
      assignedEmployees: assignmentData.assignment_employees.map((ae) => ({
        id: ae.employee_id,
        fullName: ae.employees?.profiles?.full_name || "",
        email: ae.employees?.profiles?.email || "",
        employeeCode: ae.employees?.employee_code || "",
        avatar: ae.employees?.profiles?.avatar || null,
        employeeType: "student" as const,
      })),
    }
    : undefined;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Dialog open={isLockedWarningOpen} onClose={() => setIsLockedWarningOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Cảnh báo chỉnh sửa</DialogTitle>
        <DialogContent>
          <Typography>
            Bài kiểm tra đã có {submissionCount} học viên làm. Bạn chỉ có thể chỉnh sửa Thông tin chung.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => setIsLockedWarningOpen(false)}>
            Đã hiểu
          </Button>
        </DialogActions>
      </Dialog>
      <ManageAssignmentForm
        onSubmit={handleUpdateAssignment}
        ref={formAssignmentRef}
        isLoading={isUpdating}
        action="edit"
        value={defaultValues}
        disabledTabs={
          isAssignmentLocked
            ? [TAB_KEYS_ASSIGNMENT["assignTab-content"], TAB_KEYS_ASSIGNMENT["assignTab-settings"]]
            : []
        }
      />
    </>
  );
};

export default UpdateAssignment;
