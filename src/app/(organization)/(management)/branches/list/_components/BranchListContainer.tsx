"use client";

import React, { useState, useTransition } from "react";
import AddIcon from "@mui/icons-material/Add";
import { Box, Button, InputAdornment, Stack, TextField } from "@mui/material";
import { useRouter } from "next/navigation";

import { PATHS } from "@/constants/path.constant";
import { useOrganizationId } from "@/hooks/useOrganizationId";
import CreateBranchDrawer, { CreateBranchDrawerRef } from "@/modules/branch/container/CreateBranchDrawer";
import UpdateBranchDrawer, { UpdateBranchDrawerRef } from "@/modules/branch/container/UpdateBranchDrawer";
import { useGetBranchesQuery } from "@/modules/branch/operations/query";
import { CloudUploadIcon, Edit02Icon, EyeIcon, SearchIcon, Trash01Icon } from "@/shared/assets/icons";
import TableData, { TableDataProps } from "@/shared/ui/TableData";

import { branchColumns, BranchRecord } from "./columns";

export default function BranchListContainer() {
  const router = useRouter();
  const createBranchDrawerRef = React.useRef<CreateBranchDrawerRef>(null);
  const updateBranchDrawerRef = React.useRef<UpdateBranchDrawerRef>(null);

  const [isTransitionViewDetail, startTransitionViewDetail] = useTransition();
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
    startTransitionViewDetail(() => {
      router.push(PATHS.BRANCHES.DETAIL(branchId));
    });
  };

  const handleEdit = (record: BranchRecord) => () => {
    updateBranchDrawerRef.current?.open({
      id: record.id,
      code: record?.code,
      name: record.name,
      address: record.address,
      status: record.status,
      managedById: record.managedBy?.id,
    });
  };

  return (
    <>
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
          {/* <Button
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              // onClick={handleImportBranches}
              disabled={!organizationId || isLoadingOrgId}
            >
              Import
            </Button> */}
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
        rows={branchesResult?.items}
        bordered={false}
        showRowCount
        columns={branchColumns}
        pagination={{
          total: branchesResult?.total,
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
                loading: isTransitionViewDetail,
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
      <CreateBranchDrawer ref={createBranchDrawerRef} />
      <UpdateBranchDrawer ref={updateBranchDrawerRef} />
    </>
  );
}
