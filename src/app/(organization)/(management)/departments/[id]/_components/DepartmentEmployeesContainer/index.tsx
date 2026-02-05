"use client";
import React, { useState, useTransition } from "react";
import { Typography } from "@mui/material";
import { useRouter } from "next/navigation";

import { PATHS } from "@/constants/path.constant";
import { useGetEmployeesV2Query } from "@/modules/employees/operations/query";
import { EyeIcon } from "@/shared/assets/icons";
import TableData from "@/shared/ui/TableData";

import { employeeColumns } from "./columns";
interface DepartmentEmployeesContainerProps {
  departmentId: string;
}
const DepartmentEmployeesContainer: React.FC<DepartmentEmployeesContainerProps> = ({ departmentId }) => {
  const [isTransitionView, setTransitionView] = useTransition();
  const [queryParams, setQueryParams] = useState({ page: 1, pageSize: 20 });
  const { data, isPending } = useGetEmployeesV2Query({
    departmentId,
    page: queryParams.page,
    pageSize: queryParams.pageSize,
  });
  console.log({ data });
  const router = useRouter();
  const onChangePage = (page: number) => {
    setQueryParams((prev) => ({ ...prev, page }));
  };

  const onChangePageSize = (pageSize: number) => {
    setQueryParams((prev) => ({ ...prev, page: 1, pageSize }));
  };

  const handleViewDetail = (rowId: string) => () => {
    setTransitionView(() => {
      router.push(PATHS.EMPLOYEES.EMPLOYEES_DETAIL(rowId));
    });
  };
  return (
    <div className="section-content flex flex-col gap-6">
      <div className="section-content__header flex justify-between mb-3">
        <Typography component="h3" sx={{ fontSize: 18, fontWeight: 600 }}>
          Danh sách người dùng
        </Typography>
      </div>
      <div className="section-content__body">
        <TableData
          rows={data?.data}
          columns={employeeColumns}
          showRowCount
          bordered={false}
          loading={isPending}
          // onRowClick={handleEmployeeClick}
          slots={{
            menuActions(row, index) {
              return [
                {
                  action: handleViewDetail(row.id),
                  loading: isTransitionView,
                  iconButton: <EyeIcon className="w-4 h-4" />,
                  altText: "Xem chi tiết",
                },
              ];
            },
          }}
          pagination={{
            page: data?.page ?? 1,
            pageSize: data?.pageSize || queryParams.pageSize,
            total: data?.total,
            onChangePage,
            onChangePageSize,
          }}
        />
      </div>
    </div>
  );
};
export default DepartmentEmployeesContainer;
