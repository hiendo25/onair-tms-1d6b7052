"use client";
import { alpha, Chip, Typography } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import { EmployeeTeacherTypeItem } from "@/model/employee.model";
export const columns: GridColDef<EmployeeTeacherTypeItem>[] = [
  {
    field: "id",
    headerName: "ID",
    width: 50,
    renderCell: (params) => {
      return params.api.getRowIndexRelativeToVisibleRows(params.id) + 1;
    },
  },
  {
    field: "identity_code",
    headerName: "Mã giảng viên",
    width: 140,
    renderCell: ({ row }) => {
      return (
        <Chip
          label={row.employee_code}
          color="primary"
          sx={(theme) => ({
            backgroundColor: alpha(theme.palette.primary["main"], 0.2),
            color: theme.palette.primary["dark"],
            borderRadius: "0.375rem",
            borderColor: "transparent",
          })}
        />
      );
    },
  },
  {
    field: "fullName",
    headerName: "Họ và tên",
    renderCell: ({ row }) => {
      return row.profiles?.full_name;
    },
    width: 180,
  },
  {
    field: "department",
    headerName: "Phòng ban",
    width: 220,
    renderCell: ({ row }) => {
      return row.employments[0]?.organization_units?.name;
    },
  },
  {
    field: "branch",
    headerName: "Chi nhánh",
    width: 220,
    renderCell: ({ row }) => {
      return row.employments[0]?.organization_units?.branch ? row.employments[0]?.organization_units?.branch.name : "-";
    },
  },
];
