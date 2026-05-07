"use client";

import React, { useCallback, useDeferredValue, useMemo, useRef, useState, useTransition } from "react";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { Box, Button, ListItemText, Menu, MenuItem, Stack } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { unknown } from "zod";

import useDebounce from "@/hooks/useDebounce";
import { useDialogs } from "@/hooks/useDialogs/useDialogs";
import useNotifications from "@/hooks/useNotifications/useNotifications";
import { Employee } from "@/model/employee.model";
import { useDeleteEmployeeMutation } from "@/modules/employees/operations/mutation";
import { useGetEmployeesQuery } from "@/modules/employees/operations/query";
import { useUserOrganization } from "@/modules/organization";
import { CloudUploadIcon, Edit02Icon, Edit05Icon, EyeIcon, EyeOffIcon, Trash01Icon } from "@/shared/assets/icons";
import TableData, { TableDataProps } from "@/shared/ui/TableData";

import { employeeColumns } from "./columns";
import EmployeeFilter, { EmployeeFilterProps } from "./EmployeeFilter";
interface EmployeeListContainerProps {}
const EmployeeListContainer: React.FC<EmployeeListContainerProps> = () => {
  const router = useRouter();
  const dialogs = useDialogs();
  const notifications = useNotifications();
  const queryClient = useQueryClient();
  const actionRef = useRef<"delete" | "edit" | "view">(null);
  const recordEditRef = useRef<string>(null);
  const [isTransition, startTransition] = useTransition();

  const {
    organization: { id: organizationId },
  } = useUserOrganization((state) => state.currentEmployee);

  const [queryParams, setQueryParams] = useState<{
    page: number;
    limit: number;
    search: string;
    departmentId?: string;
    branchId?: string;
    status: Employee["status"] | "all";
  }>({
    page: 0,
    limit: 20,
    search: "",
    departmentId: undefined,
    branchId: undefined,
    status: "all",
  });

  const {
    data: employeesResult,
    isLoading,
    error,
  } = useGetEmployeesQuery({
    departmentId: queryParams.departmentId,
    limit: queryParams.limit,
    page: queryParams.page,
    branchId: queryParams.branchId,
    search: useDebounce(queryParams.search, 600),
    status: queryParams.status === "all" ? undefined : queryParams.status,
    organizationId: organizationId,
  });

  const { mutateAsync: deleteEmployee, isPending: isDeleting } = useDeleteEmployeeMutation();

  const employees = employeesResult?.data || [];
  const totalCount = employeesResult?.total || 0;
  const pageSize = employeesResult?.limit;

  const handleCreateEmployee = () => {
    router.push("/admin/employees/create");
  };

  const handleImportEmployees = () => {
    router.push("/admin/employees/import");
  };

  const handleViewDetail = useCallback(
    (recordId: string) => () => {
      actionRef.current = "view";
      recordEditRef.current = recordId;
      startTransition(() => {
        router.push(`/admin/employees/${recordId}/detail`);
      });
    },
    [],
  );

  const handleEdit = useCallback(
    (recordId: string) => () => {
      actionRef.current = "edit";
      recordEditRef.current = recordId;
      startTransition(() => {
        router.push(`/admin/employees/${recordId}/edit`);
      });
    },
    [],
  );

  const handleDelete = useCallback(
    (recordId: string) => async () => {
      const confirmed = await dialogs.confirm(
        "Bạn có chắc chắn muốn xóa nhân viên này không? Hành động này không thể hoàn tác.",
        {
          title: "Xác nhận xóa",
          okText: "Xóa",
          cancelText: "Hủy",
          severity: "error",
        },
      );

      if (!confirmed) return;

      try {
        await deleteEmployee(recordId);

        await queryClient.invalidateQueries({ queryKey: ["employees"] });

        notifications.show("Xóa nhân viên thành công!", {
          severity: "success",
          autoHideDuration: 3000,
        });
      } catch (error) {
        console.error("Error deleting employee:", error);
        notifications.show(error instanceof Error ? error.message : "Có lỗi xảy ra khi xóa nhân viên", {
          severity: "error",
          autoHideDuration: 5000,
        });
      }
    },
    [],
  );

  const handleChangePage = (newPage: number) => {
    setQueryParams((prev) => ({ ...prev, page: newPage }));
  };
  const handleChangePageSize = (newPageSize: number) => {
    setQueryParams((prev) => ({ ...prev, limit: newPageSize }));
  };

  const handleFilter: EmployeeFilterProps["onFilter"] = (type, values) => {
    setQueryParams((prev) => ({
      ...prev,
      search: values?.searchText ?? "",
      status: values.status,
      departmentId: values.departmentId,
      branchId: values.branchId,
      page: 0,
    }));
  };

  return (
    <Box sx={{ py: 3 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ mb: 3 }}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
      >
        <EmployeeFilter
          values={{
            branchId: queryParams.branchId,
            departmentId: queryParams.departmentId,
            searchText: queryParams.search,
            status: queryParams.status,
          }}
          onFilter={handleFilter}
        />
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<CloudUploadIcon />} onClick={handleImportEmployees}>
            Import người dùng
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateEmployee}>
            Tạo người dùng
          </Button>
        </Stack>
      </Stack>
      <TableData
        loading={isLoading}
        rows={employees}
        columns={employeeColumns}
        bordered={false}
        onCellClick={handleViewDetail}
        pagination={{
          total: totalCount,
          pageSize: pageSize || queryParams.limit,
          page: queryParams.page,
          onChangePage: handleChangePage,
          onChangePageSize: handleChangePageSize,
        }}
        disableHoverMenuAction
        slots={{
          menuActions(row, index) {
            return [
              {
                altText: "Chi tiết",
                iconButton: <EyeIcon className="w-4 h-4" />,
                action: handleViewDetail(row.id),
                loading: recordEditRef.current === row.id && isTransition && actionRef.current === "view",
              },
              {
                altText: "Chỉnh sửa",
                iconButton: <Edit02Icon className="w-4 h-4" />,
                action: handleEdit(row.id),
                loading: recordEditRef.current === row.id && isTransition && actionRef.current === "edit",
              },
              {
                altText: "Xóa tài khoản",
                iconButton: <Trash01Icon className="w-4 h-4" color="red" />,
                action: handleDelete(row.id),
                loading: recordEditRef.current === row.id && isTransition && actionRef.current === "delete",
              },
            ];
          },
        }}
      />
    </Box>
  );
};
export default EmployeeListContainer;
