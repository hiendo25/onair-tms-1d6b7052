"use client";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";

import { PATHS } from "@/constants/path.constant";
import ManageAssignmentForm, {
  ManageAssignmentFormProps,
  ManageAssignmentFormRef,
} from "@/modules/assignment-management/components/ManageAssignmentForm";
import { useCreateAssignmentMutation } from "@/modules/assignment-management/operations/mutation";
import { useUserOrganization } from "@/modules/organization";
import PageContainer from "@/shared/ui/PageContainer";

export default function CreateAssignmentPage() {
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const formAssignmentRef = useRef<ManageAssignmentFormRef>(null);
  const { mutate: createAssignment, isPending: isLoading } = useCreateAssignmentMutation();
  const organizationId = useUserOrganization((state) => state.currentOrganization.orgId);
  const handleCreateAssignment: ManageAssignmentFormProps["onSubmit"] = (formData) => {
    const payload = {
      ...formData,
      assignedEmployees: formData.assignedEmployees.map((emp) => emp.id),
      organizationId,
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
        { title: "Bài kiểm tra", path: PATHS.ASSIGNMENTS.ROOT },
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
