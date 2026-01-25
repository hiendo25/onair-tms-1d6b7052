"use client";
import { alpha,Chip, Typography } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";

import { EmployeeTeacherTypeItem } from "@/model/employee.model";
import { GetCoursesResponse } from "@/repository/courses";
export const columns: GridColDef<NonNullable<GetCoursesResponse["data"]>[number]>[] = [
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
    headerName: "Tên môn học",
    width: 320,
    renderCell: ({ row }) => {
      return row.title;
    },
  },
  {
    field: "categories",
    headerName: "Chủ đề",
    renderCell: ({ row }) => {
      return row.courses_categories.map((cat) => <span key={cat.id}>{cat.categories.name}</span>);
    },
    width: 240,
  },
];
