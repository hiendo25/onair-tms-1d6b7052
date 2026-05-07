import { Chip, ChipOwnProps } from "@mui/material";

import { GetDepartmentsResponse } from "@/modules/department/type";
import { TableDataProps } from "@/shared/ui/TableData";
export type DepartmentRecord = NonNullable<GetDepartmentsResponse["data"]>["items"][number];
export type DepartmentRecordWithoutChild = Omit<DepartmentRecord, "children">;
export type GroupRecord = NonNullable<DepartmentRecord["children"]>[number];

export const departmentRootColumns: TableDataProps<DepartmentRecord>["columns"] = [
  {
    headerName: "Tên phòng ban",
    field: "name",
  },
  {
    headerName: "Mã",
    field: "code",
    width: 160,
    renderCell(value, { code }) {
      return code ? <Chip label={code} size="small" color="primary" variant="filled" /> : "-";
    },
  },
  {
    headerName: "Chi nhánh",
    field: "branch",
    width: 160,
    renderCell(value, row) {
      return row.branch?.name || "-";
    },
  },
  {
    headerName: "Trạng thái",
    field: "status",
    width: 160,
    renderCell(value, { status }) {
      const branchStatus: Record<
        NonNullable<DepartmentRecord["status"]>,
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
    headerName: "Người quản lý",
    field: "manager",
    width: 220,
    renderCell(value, row) {
      return row.managedBy?.fullName || "-";
    },
  },
];

export const groupColumns: TableDataProps<GroupRecord>["columns"] = [
  {
    headerName: "Tên nhóm",
    field: "name",
  },
  {
    headerName: "Mã",
    field: "code",
    width: 160,
    renderCell(value, { code }) {
      return code ? <Chip label={code} size="small" color="primary" variant="filled" /> : "-";
    },
  },
  {
    headerName: "Người quản lý",
    field: "manager",
    width: 220,
    renderCell(value, row) {
      return row.managedBy?.fullName || "-";
    },
  },
  {
    headerName: "Trạng thái",
    field: "status",
    width: 160,
    renderCell(value, { status }) {
      const branchStatus: Record<
        NonNullable<DepartmentRecord["status"]>,
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
];
