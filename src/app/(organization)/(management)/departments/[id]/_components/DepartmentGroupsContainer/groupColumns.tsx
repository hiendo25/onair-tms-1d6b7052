import { Chip, ChipOwnProps } from "@mui/material";

import dayjs from "@/lib/dayjs";
import { GetDepartmentGroupsResponse } from "@/modules/department/type";
import { TableDataProps } from "@/shared/ui/TableData";

export type DepartmentGroupRecord = NonNullable<GetDepartmentGroupsResponse["data"]>["items"][number];

export const groupColumns: TableDataProps<DepartmentGroupRecord>["columns"] = [
  {
    field: "name",
    headerName: "Tên nhóm",
  },
  {
    headerName: "Mã",
    field: "code",

    renderCell(value, { code }) {
      return code ? <Chip label={code} size="small" color="primary" variant="filled" /> : "-";
    },
  },
  {
    field: "managedBy",
    headerName: "Người quản lý",
    renderCell(value, { managedBy }) {
      return managedBy?.fullName;
    },
  },
  {
    headerName: "Trạng thái",
    field: "status",
    width: 160,
    renderCell(value, { status }) {
      const branchStatus: Record<
        NonNullable<DepartmentGroupRecord["status"]>,
        { color: ChipOwnProps["color"]; text: string }
      > = {
        active: {
          color: "success",
          text: "Hoạt động",
        },
        inactive: {
          color: "default",
          text: "Không hoạt động",
        },
        deleted: {
          color: "error",
          text: "Đã xóa",
        },
      };
      if (!status) {
        return <Chip label="Không xác định" color="default" variant="filled" />;
      }
      return <Chip label={branchStatus[status].text} color={branchStatus[status].color} variant="filled" />;
    },
  },
  {
    field: "createdAt",
    headerName: "Ngày tạo",
    renderCell(value, { createdAt }) {
      return dayjs(createdAt).format("DD/MM/YYYY HH:mm");
    },
  },
];
