"use client";

import { PATHS } from "@/constants/path.constant";
import PageContainer from "@/shared/ui/PageContainer";

import AssignmentBankCreateForm from "./_components/AssignmentBankCreateForm";

export default function CreateAssignmentPage() {
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
      <div>
        <AssignmentBankCreateForm />
      </div>
    </PageContainer>
  );
}
