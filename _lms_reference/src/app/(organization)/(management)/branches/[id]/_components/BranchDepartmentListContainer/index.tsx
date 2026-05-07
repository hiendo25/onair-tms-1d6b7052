"use client";

import React, { useRef, useState, useTransition } from "react";
import { Typography } from "@mui/material";
import { useRouter } from "next/navigation";

import { PATHS } from "@/constants/path.constant";
import { useGetDepartmentsQuery } from "@/modules/department/operations/query";
import { useUserOrganization } from "@/modules/organization";
import { EyeIcon } from "@/shared/assets/icons";
import TableData, { TableDataProps } from "@/shared/ui/TableData";

import { departmentRootColumns, groupColumns } from "./columns";

interface BranchDepartmentListContainerProps {
  branchId: string;
}
export default function BranchDepartmentListContainer({ branchId }: BranchDepartmentListContainerProps) {
  const router = useRouter();
  const actionRef = useRef<"view" | "edit">(null);

  const [queryParams, setQueryParams] = useState({ page: 1, pageSize: 20 });

  const [isTransition, startTransition] = useTransition();
  const organizationId = useUserOrganization((state) => state.currentOrganization.orgId);

  const {
    data: departmentsResult,
    isLoading,
    error,
  } = useGetDepartmentsQuery({
    ...queryParams,
    organizationId,
    branchIds: [branchId],
  });

  const departmentList = departmentsResult?.items || [];

  const handleChangePage = (newPage: number) => {
    setQueryParams((prev) => ({ ...prev, page: newPage }));
  };

  const handleChangePageSize = (newPageSize: number) => {
    setQueryParams((prev) => ({ ...prev, page: 1, pageSize: newPageSize }));
  };

  const handleViewDetail = (branchId: string) => () => {
    startTransition(() => {
      router.push(PATHS.DEPARTMENTS.DETAIL(branchId));
      actionRef.current = "view";
    });
  };

  return (
    <div className="section-content flex flex-col gap-6">
      <div className="section-content__header flex justify-between mb-3">
        <Typography component="h3" sx={{ fontSize: 18, fontWeight: 600 }}>
          Danh sách phòng ban
        </Typography>
      </div>
      <div className="section-content__body">
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
              ];
            },
          }}
          minWidth={1200}
        />
      </div>
    </div>
  );
}
