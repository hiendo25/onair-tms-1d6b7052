import { Chip, ChipOwnProps } from "@mui/material";
import dayjs from "dayjs";

import { GetBranchesResponse } from "@/modules/branch/type";
import { TableDataProps } from "@/shared/ui/TableData";
export type BranchRecord = NonNullable<GetBranchesResponse["data"]>["items"][number];
export const branchColumns: TableDataProps<BranchRecord>["columns"] = [
  {
    headerName: "Tên chi nhánh",
    field: "name",
  },
  {
    headerName: "Mã chi nhánh",
    field: "code",
    width: 160,
    renderCell(value, row) {
      return <Chip label={row.code} size="small" color="primary" variant="filled" />;
    },
  },
  {
    headerName: "Trạng thái",
    field: "status",
    width: 160,
    renderCell(value, { status }) {
      const branchStatus: Record<
        NonNullable<BranchRecord["status"]>,
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
    headerName: "Địa điểm",
    field: "address",
    width: 220,
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
