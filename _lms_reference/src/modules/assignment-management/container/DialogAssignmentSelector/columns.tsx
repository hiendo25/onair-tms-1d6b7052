"use client";
import { Chip } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";

import { AssignmentBankDto } from "@/types/dto/assignment-bank";
export const columns: GridColDef<AssignmentBankDto>[] = [
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
      if (!categories?.length) return <div className="pl-2">--</div>;
      return categories.map((cat) => (
        <Chip key={cat.category_id} color="primary" variant="outlined" label={cat.categories?.name ?? "--"} />
      ));
    },
  },
  {
    field: "created_by",
    headerName: "Người tạo",
    width: 220,
    renderCell: ({ row: { createdBy, created_by } }) => {
      return createdBy?.profiles?.full_name ?? created_by ?? "--";
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
