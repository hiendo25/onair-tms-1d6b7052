"use client";
import PageContainer from "@/shared/ui/PageContainer";
import ManageAssignmentForm, {
  ManageAssignmentFormProps,
  ManageAssignmentFormRef,
} from "@/modules/assignment-management/components/ManageAssignmentForm";
import { useCreateAssignmentMutation } from "@/modules/assignment-management/operations/mutation";
import { useRef } from "react";
import { useSnackbar } from "notistack";
import { useRouter } from "next/navigation";
import { PATHS } from "@/constants/path.contstants";

export default function CreateAssignmentPage() {
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const formAssignmentRef = useRef<ManageAssignmentFormRef>(null);
  const { mutate: createAssignment, isPending: isLoading } = useCreateAssignmentMutation();

  const handleCreateAssignment: ManageAssignmentFormProps["onSubmit"] = (formData) => {
    const payload = {
      ...formData,
      assignedEmployees: formData.assignedEmployees.map((emp) => emp.id),
    };

    createAssignment(payload, {
      onSuccess: (data) => {
        enqueueSnackbar("Tạo bài kiểm tra thành công", { variant: "success" });
        router.push(PATHS.ASSIGNMENTS.ROOT);
      },
      onError: (error) => {
        enqueueSnackbar(error.message || "Có lỗi xảy ra khi tạo bài kiểm tra", { variant: "error" });
      },
    });
  };

  return (
    <PageContainer
      title="Tạo bài kiểm tra"
      breadcrumbs={[
        { title: "Bài kiểm tra", path: "/assignments" },
        {
          title: "Tạo bài kiểm tra",
        },
      ]}
    >
      <div className="max-w-[1200px]">
        <ManageAssignmentForm onSubmit={handleCreateAssignment} ref={formAssignmentRef} isLoading={isLoading} />
      </div>
    </PageContainer>
  );
}

