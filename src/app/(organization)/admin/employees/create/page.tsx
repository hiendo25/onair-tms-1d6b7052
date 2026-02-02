"use client";
import * as React from "react";
import { Box } from "@mui/material";
import { useRouter } from "next/navigation";

import useNotifications from "@/hooks/useNotifications/useNotifications";
import type { EmployeeFormData } from "@/modules/employees/components/EmployeeForm";
import EmployeeForm from "@/modules/employees/components/EmployeeForm";
import { useCreateEmployeeMutation } from "@/modules/employees/operations/mutation";
// import type { CreateEmployeeDto } from "@/types/dto/employees";
import { CreateEmployeePayload } from "@/modules/employees/types/create-employee.type";
import { useUserOrganization } from "@/modules/organization";
import PageContainer from "@/shared/ui/PageContainer";

const CreateEmployeePage = () => {
  const pageTitle = "Tạo nhân viên";
  const router = useRouter();
  const notifications = useNotifications();
  const { mutate: createEmployee, isPending } = useCreateEmployeeMutation();

  const handleSubmit = async (data: EmployeeFormData) => {
    const payload: CreateEmployeePayload = {
      email: data.email,
      fullName: data.full_name,
      phoneNumber: data.phone_number,
      gender: data.gender,
      dateOfBirth: data.birthday ?? undefined,
      branchId: data.branch,
      departmentId: data.department,
      code: data.employee_code,
      managerId: data.manager_id,
      // position_id: data.position_id,
      type: data.employee_type,
      startAt: data.start_date,
      roleId: data.role_id,
    };

    createEmployee(payload, {
      onSuccess: () => {
        notifications.show("Tạo nhân viên thành công!", {
          severity: "success",
          autoHideDuration: 3000,
        });
        // Navigate to employees list page
        router.push("/admin/employees");
      },
    });
  };

  return (
    <PageContainer
      title={pageTitle}
      breadcrumbs={[{ title: "Nhân viên", path: "/admin/employees" }, { title: pageTitle }]}
    >
      <Box sx={{ py: 3 }}>
        <EmployeeForm mode="create" onSubmit={handleSubmit} isSubmitting={isPending} />
      </Box>
    </PageContainer>
  );
};

export default CreateEmployeePage;
