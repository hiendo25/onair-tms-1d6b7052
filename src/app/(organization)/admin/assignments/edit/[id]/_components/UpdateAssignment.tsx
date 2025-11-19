"use client";
import ManageAssignmentForm, {
  ManageAssignmentFormProps,
  ManageAssignmentFormRef,
} from "@/modules/assignment-management/components/ManageAssignmentForm";
import { useUpdateAssignmentMutation } from "@/modules/assignment-management/operations/mutation";
import { useGetAssignmentQuery } from "@/modules/assignment-management/operations/query";
import { useRef } from "react";
import { useSnackbar } from "notistack";
import { useRouter } from "next/navigation";
import { PATHS } from "@/constants/path.contstants";

interface UpdateAssignmentProps {
  assignmentId: string;
}

const UpdateAssignment: React.FC<UpdateAssignmentProps> = ({ assignmentId }) => {
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const formAssignmentRef = useRef<ManageAssignmentFormRef>(null);
  const { mutate: updateAssignment, isPending: isUpdating } = useUpdateAssignmentMutation();
  const { data: assignmentData, isPending: isLoading } = useGetAssignmentQuery(assignmentId);

  const handleUpdateAssignment: ManageAssignmentFormProps["onSubmit"] = (formData) => {
    const payload = {
      ...formData,
      id: assignmentId,
      assignedEmployees: formData.assignedEmployees.map((emp) => emp.id),
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
        questions: assignmentData.questions.map((q) => ({
          type: q.type,
          label: q.label,
          score: q.score,
          options: q.options ? (q.options as any) : undefined,
          attachments: q.attachments || undefined,
        })),
        assignedEmployees: assignmentData.assignment_employees.map((ae) => ({
          id: ae.employee_id,
          fullName: ae.employees?.profiles?.full_name || "",
          email: ae.employees?.profiles?.email || "",
          employeeCode: ae.employees?.employee_code || "",
          avatar: ae.employees?.profiles?.avatar || null,
          empoyeeType: "student" as const,
        })),
      }
    : undefined;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <ManageAssignmentForm
      onSubmit={handleUpdateAssignment}
      ref={formAssignmentRef}
      isLoading={isUpdating}
      action="edit"
      value={defaultValues}
    />
  );
};

export default UpdateAssignment;

