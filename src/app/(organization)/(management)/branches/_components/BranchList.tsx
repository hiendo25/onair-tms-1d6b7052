"use client";

import React, { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import { Box, Button, InputAdornment, Stack, TextField } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { PATHS } from "@/constants/path.constant";
import { QUERY_KEYS } from "@/constants/query-key.constant";
import { useDialogs } from "@/hooks/useDialogs/useDialogs";
import useNotifications from "@/hooks/useNotifications/useNotifications";
import { useOrganizationId } from "@/hooks/useOrganizationId";
import CreateBranchDrawer, { CreateBranchDrawerRef } from "@/modules/branch/container/CreateBranchDrawer";
import UpdateBranchDrawer, { UpdateBranchDrawerRef } from "@/modules/branch/container/UpdateBranchDrawer";
import { useDeleteBranchMutation, useToggleBranchStatusMutation } from "@/modules/branch/operations/mutation";
import { useGetBranchesQuery } from "@/modules/branch/operations/query";
import { CloudUploadIcon, Edit02Icon, Edit05Icon, EyeIcon, SearchIcon, Trash01Icon } from "@/shared/assets/icons";
import { IOSSwitch } from "@/shared/ui/form/CustomSwitcher";
import TableData, { TableDataProps } from "@/shared/ui/TableData";

import { branchColumns, BranchRecord } from "./columns";
export default function BranchList() {
  const router = useRouter();
  const createBranchDrawerRef = React.useRef<CreateBranchDrawerRef>(null);
  const updateBranchDrawerRef = React.useRef<UpdateBranchDrawerRef>(null);

  const dialogs = useDialogs();
  const notifications = useNotifications();
  const queryClient = useQueryClient();
  const { organizationId, isLoading: isLoadingOrgId } = useOrganizationId();

  const [queryParams, setQueryParams] = useState({ page: 1, pageSize: 20 });
  const [searchInput, setSearchInput] = React.useState("");

  const {
    data: branchesResult,
    isLoading,
    error,
  } = useGetBranchesQuery({
    ...queryParams,
    organizationId,
  });

  const { mutateAsync: deleteBranch, isPending: isDeleting } = useDeleteBranchMutation();
  const { mutate: toggleStatus, isPending: isToggleStatus } = useToggleBranchStatusMutation();

  const branches = branchesResult?.items || [];
  const totalCount = branchesResult?.total || 0;

  const handleChangePage = (newPage: number) => {
    setQueryParams((prev) => ({ ...prev, page: newPage }));
  };

  const handleChangePageSize = (newPageSize: number) => {
    setQueryParams((prev) => ({ ...prev, page: 1, pageSize: newPageSize }));
  };

  const handleCreateBranch = () => {
    createBranchDrawerRef.current?.open();
  };

  const handleViewDetail = (branchId: string) => () => {
    router.push(PATHS.BRANCHES.DETAIL(branchId));
  };

  const handleToggleActiveBranch = (recordId: string, status: "active" | "inactive") => () => {
    toggleStatus(
      { id: recordId, status },
      {
        onSuccess(data, variables, onMutateResult, context) {
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_BRANCHES] });
        },
      },
    );
  };
  const handleEdit = (record: BranchRecord) => () => {
    updateBranchDrawerRef.current?.open({
      id: record.id,
      code: record?.code,
      name: record.name,
      address: record.address,
      parentId: record.parentId ?? undefined,
      status: record.status,
      managedById: record.managedBy?.id,
    });
  };

  const handleDelete = (recordId: string) => async () => {
    const confirmed = await dialogs.confirm(
      "Bạn có chắc chắn muốn xóa chi nhánh này không? Hành động này không thể hoàn tác.",
      {
        title: "Xác nhận xóa",
        okText: "Xóa",
        cancelText: "Hủy",
        severity: "error",
      },
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteBranch(recordId);

      await queryClient.invalidateQueries({ queryKey: ["branches"] });

      notifications.show("Xóa chi nhánh thành công!", {
        severity: "success",
        autoHideDuration: 3000,
      });
    } catch (error) {
      console.error("Error deleting branch:", error);
      notifications.show(error instanceof Error ? error.message : "Có lỗi xảy ra khi xóa chi nhánh", {
        severity: "error",
        autoHideDuration: 5000,
      });
    }
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
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              // onClick={handleImportBranches}
              disabled={!organizationId || isLoadingOrgId}
            >
              Import
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateBranch}
              disabled={!organizationId || isLoadingOrgId}
            >
              Tạo chi nhánh
            </Button>
          </Stack>
        </Stack>
        <TableData
          loading={isLoading}
          rows={branches}
          bordered={false}
          showRowCount
          columns={[
            ...branchColumns,
            {
              field: "status-action",
              headerName: "Kích hoạt",
              width: 100,
              renderCell(value, row) {
                if (row.status === "deleted") return;
                const newStatus = row.status === "active" ? "inactive" : "active";
                return (
                  <IOSSwitch
                    checked={row.status === "active"}
                    size="small"
                    onClick={handleToggleActiveBranch(row.id, newStatus)}
                  />
                );
              },
            },
          ]}
          pagination={{
            total: totalCount,
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
                  iconButton: <EyeIcon className="w-4 h-4" />,
                  altText: "Xem chi tiết",
                },
                {
                  action: handleEdit(row),
                  iconButton: <Edit02Icon className="w-4 h-4" />,
                  altText: "Chỉnh sửa",
                },
                // {
                //   action: handleDelete(row.id),
                //   iconButton: <Trash01Icon className="w-4 h-4 stroke-red-600" />,
                //   altText: "Xóa",
                // },
              ];
            },
          }}
          minWidth={1200}
        />
      </Box>
      <CreateBranchDrawer ref={createBranchDrawerRef} />
      <UpdateBranchDrawer ref={updateBranchDrawerRef} />
    </>
  );
}
