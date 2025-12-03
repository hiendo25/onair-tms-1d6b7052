"use client";
import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { Box, CircularProgress, Alert } from "@mui/material";
import PageContainer from "@/shared/ui/PageContainer";
import EmployeeForm from "@/modules/employees/components/EmployeeForm";
import type { EmployeeFormData } from "@/modules/employees/components/EmployeeForm";
import { useGetEmployeeQuery } from "@/modules/employees/operations/query";
import { useUpdateEmployeeMutation } from "@/modules/employees/operations/mutation";
import useNotifications from "@/hooks/useNotifications/useNotifications";

const EditEmployeePage = () => {
  const router = useRouter();
  const params = useParams();
  const notifications = useNotifications();
  const employeeId = params.id as string;

  const { data: employee, isLoading, error } = useGetEmployeeQuery(employeeId);
  const { mutateAsync: updateEmployee, isPending } = useUpdateEmployeeMutation();

  const pageTitle = "Chỉnh sửa nhân viên";

  const defaultValues = React.useMemo(() => {
    if (!employee) return undefined;

    const departmentEmployment = employee.employments.find((emp) => emp.organization_units?.type === "department");
    const branchEmployment = employee.employments.find((emp) => emp.organization_units?.type === "branch");

    const managerRelationship = employee.managers_employees?.[0];

    return {
      email: employee.profiles?.email || "",
      full_name: employee.profiles?.full_name || "",
      phone_number: employee.profiles?.phone_number || "",
      gender: employee.profiles?.gender || "male",
      birthday: employee.profiles?.birthday || null,
      employee_code: employee.employee_code || "",
      department: departmentEmployment?.organization_unit_id || "",
      branch: branchEmployment?.organization_unit_id || "",
      manager_id: managerRelationship?.manager_id || "",
      position_id: employee.position_id || "",
      employee_type: employee.employee_type || undefined,
      start_date: employee.start_date || null,
      role_id: employee.role_ids?.[0] || "",
    };
  }, [employee]);

  const handleSubmit = async (formData: EmployeeFormData) => {
    try {
      await updateEmployee({
        id: employeeId,
        email: formData.email,
        full_name: formData.full_name,
        phone_number: formData.phone_number,
        gender: formData.gender,
        birthday: formData.birthday || null,
        employee_code: formData.employee_code,
        department: formData.department,
        branch: formData.branch,
        manager_id: formData.manager_id,
        position_id: formData.position_id,
        employee_type: formData.employee_type,
        start_date: formData.start_date || null,
      });

      notifications.show("Cập nhật nhân viên thành công!", {
        severity: "success",
        autoHideDuration: 3000,
      });

      router.push("/admin/employees");
    } catch (error) {
      notifications.show(error instanceof Error ? error.message : "Có lỗi xảy ra khi cập nhật nhân viên", {
        severity: "error",
        autoHideDuration: 5000,
      });
    }
  };

  if (isLoading) {
    return (
      <PageContainer
        title={pageTitle}
        breadcrumbs={[{ title: "Nhân viên", path: "/admin/employees" }, { title: pageTitle }]}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 400,
          }}
        >
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (error || !employee) {
    return (
      <PageContainer
        title={pageTitle}
        breadcrumbs={[{ title: "Nhân viên", path: "/admin/employees" }, { title: pageTitle }]}
      >
        <Box sx={{ py: 3 }}>
          <Alert severity="error">Không tìm thấy thông tin nhân viên hoặc có lỗi xảy ra</Alert>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={pageTitle}
      breadcrumbs={[{ title: "Nhân viên", path: "/admin/employees" }, { title: pageTitle }]}
    >
      <Box sx={{ py: 3 }}>
        <EmployeeForm mode="edit" defaultValues={defaultValues} onSubmit={handleSubmit} isSubmitting={isPending} />
      </Box>
    </PageContainer>
  );
};

export default EditEmployeePage;
