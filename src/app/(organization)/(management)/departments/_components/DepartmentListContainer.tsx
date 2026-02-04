"use client";

import React, { useMemo, useRef, useState, useTransition } from "react";
import AddIcon from "@mui/icons-material/Add";
import { Box, Button, InputAdornment, Stack, TextField } from "@mui/material";
import { useRouter } from "next/navigation";

import { PATHS } from "@/constants/path.constant";
import { useOrganizationId } from "@/hooks/useOrganizationId";
import CreateRootDepartmentDrawer, {
  CreateRootDepartmentDrawerRef,
} from "@/modules/department/container/CreateRootDepartmentDrawer";
import UpdateRootDepartmentDrawer, {
  UpdateRootDepartmentDrawerRef,
} from "@/modules/department/container/UpdateRootDepartmentDrawer";
import { useGetDepartmentsQuery } from "@/modules/department/operations/query";
import { Edit02Icon, EyeIcon, SearchIcon } from "@/shared/assets/icons";
import TableData, { TableDataProps } from "@/shared/ui/TableData";

import { type DepartmentRecord, departmentRootColumns, groupColumns } from "./columns";
export default function DepartmentListContainer() {
  const router = useRouter();
  const createRootDepartmentDrawerRef = React.useRef<CreateRootDepartmentDrawerRef>(null);
  const updateRootDepartmentDrawerRef = React.useRef<UpdateRootDepartmentDrawerRef>(null);
  const actionRef = useRef<"view" | "edit">(null);

  const [isTransition, startTransition] = useTransition();
  const { organizationId, isLoading: isLoadingOrgId } = useOrganizationId();

  const [queryParams, setQueryParams] = useState({ page: 1, pageSize: 20 });
  const [searchInput, setSearchInput] = React.useState("");

  const {
    data: departmentsResult,
    isLoading,
    error,
  } = useGetDepartmentsQuery({
    ...queryParams,
    organizationId,
  });

  const departmentList = departmentsResult?.items || [];

  const handleChangePage = (newPage: number) => {
    setQueryParams((prev) => ({ ...prev, page: newPage }));
  };

  const handleChangePageSize = (newPageSize: number) => {
    setQueryParams((prev) => ({ ...prev, page: 1, pageSize: newPageSize }));
  };

  const handleCreateDepartment = () => {
    createRootDepartmentDrawerRef.current?.open();
  };

  const handleViewDetail = (branchId: string) => () => {
    startTransition(() => {
      router.push(PATHS.DEPARTMENTS.DETAIL(branchId));
      actionRef.current = "view";
    });
  };

  const handleEdit = (record: DepartmentRecord) => () => {
    updateRootDepartmentDrawerRef.current?.open({
      id: record.id,
      code: record?.code || "",
      name: record.name,
      status: record.status,
      managedById: record.managedBy?.id,
      branchId: record.branch?.id,
    });
  };

  return (
    <>
      <Box sx={{ py: 3 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ mb: 3 }}
          alignItems={{ xs: "stretch", sm: "center" }}
          justifyContent="space-between"
        >
          <TextField
            placeholder="Tìm kiếm..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ maxWidth: 300 }}
          />

          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateDepartment}
              disabled={!organizationId || isLoadingOrgId}
            >
              Tạo phòng ban
            </Button>
          </Stack>
        </Stack>
        <TableData
          loading={isLoading}
          rows={departmentList}
          hideChildrenRow
          bordered={false}
          showRowCount
          columns={departmentRootColumns}
          expandable={{
            expandedRowRender: (row) => {
              return row.children?.length ? (
                <TableData
                  rows={row.children}
                  bordered={false}
                  columns={groupColumns}
                  hidePagination
                  hideChildrenRow
                  disableHoverMenuAction
                />
              ) : undefined;
            },
          }}
          pagination={{
            total: departmentsResult?.total || 0,
            page: queryParams.page,
            pageSize: queryParams.pageSize,
            onChangePageSize: handleChangePageSize,
            onChangePage: handleChangePage,
          }}
          slots={{
            menuActions(row, index) {
              return [
                {
                  action: handleViewDetail(row.id),
                  loading: actionRef.current === "view" && isTransition,
                  iconButton: <EyeIcon className="w-4 h-4" />,
                  altText: "Xem chi tiết",
                },
                {
                  action: handleEdit(row),
                  iconButton: <Edit02Icon className="w-4 h-4" />,
                  altText: "Chỉnh sửa",
                },
              ];
            },
          }}
          minWidth={1200}
        />
      </Box>
      <CreateRootDepartmentDrawer ref={createRootDepartmentDrawerRef} />
      <UpdateRootDepartmentDrawer ref={updateRootDepartmentDrawerRef} />
    </>
  );
}
