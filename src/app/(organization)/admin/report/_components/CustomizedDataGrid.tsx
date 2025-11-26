"use client";
import * as React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { columns, rows } from "./data/gridData";
import { useGetStudentsQuery } from "@/modules/student/operation/query";
import { GetStudentsResponse } from "@/repository/employee";

export default function CustomizedDataGrid() {
  const { data, isPending } = useGetStudentsQuery({});
  console.log(data);
  const studentList = React.useMemo(() => data?.data, []);
  return (
    <DataGrid
      rows={studentList}
      columns={columns}
      getRowClassName={(params) => (params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd")}
      initialState={{
        pagination: { paginationModel: { pageSize: 20 } },
      }}
      pageSizeOptions={[10, 20, 50]}
      disableColumnResize
      disableRowSelectionOnClick
      disableColumnSelector
      disableMultipleRowSelection
      density="compact"
      loading={isPending}
      slotProps={{
        filterPanel: {
          filterFormProps: {
            logicOperatorInputProps: {
              variant: "outlined",
              size: "small",
            },
            columnInputProps: {
              variant: "outlined",
              size: "small",
              sx: { mt: "auto" },
            },
            operatorInputProps: {
              variant: "outlined",
              size: "small",
              sx: { mt: "auto" },
            },
            valueInputProps: {
              InputComponentProps: {
                variant: "outlined",
                size: "small",
              },
            },
          },
        },
      }}
    />
  );
}
