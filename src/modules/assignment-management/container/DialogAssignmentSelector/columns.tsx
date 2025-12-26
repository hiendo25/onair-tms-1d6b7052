"use client";
import { alpha, Chip, Typography } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";

import { EmployeeTeacherTypeItem } from "@/model/employee.model";
import { GetAssignmentsV2Response } from "@/repository/assignments";
import { AssignmentDto } from "@/types/dto/assignments";
export const columns: GridColDef<NonNullable<GetAssignmentsV2Response["data"]>[number]>[] = [
  {
    field: "id",
    headerName: "ID",
    width: 50,
    renderCell: (params) => {
      return params.api.getRowIndexRelativeToVisibleRows(params.id) + 1;
    },
  },
  {
    field: "assignment_name",
    headerName: "Tên bài kiểm tra",
    flex: 1,
    renderCell: ({ row }) => {
      return row.name;
    },
  },
  {
    field: "identity_code",
    headerName: "Danh mục",
    width: 180,
    renderCell: ({ row: { assignment_categories: categories } }) => {
      if (!categories.length) return <div className="pl-2">--</div>;
      return categories.map((cat) => (
        <Chip key={cat.category_id} color="primary" variant="outlined" label={cat.categories.name} />
      ));
    },
  },
  {
    field: "created_by",
    headerName: "Người tạo",
    width: 220,
    renderCell: ({ row: { createdBy } }) => {
      return createdBy.profiles?.full_name;
    },
  },
  // {
  //   field: "categories",
  //   headerName: "Chủ đề",
  //   renderCell: ({ row }) => {
  //     return row.courses_categories.map((cat) => <span key={cat.id}>{cat.categories.name}</span>);
  //   },
  //   width: 240,
  // },
];
