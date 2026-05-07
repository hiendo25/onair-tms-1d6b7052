import React from "react";

import { useTableData } from "../TableDataProvider";

import { CustomTablePagination } from "./CustomTablePagination";
interface TableDataPaginationProps {}
const TableDataPagination: React.FC<TableDataPaginationProps> = () => {
  const { total, perPageOptions, pageSize, page } = useTableData((state) => state.pagination);
  const onChangePage = useTableData((state) => state.onChangePage);

  const onChangePageSize = () => {};
  return (
    <CustomTablePagination
      count={total}
      rowsPerPageOptions={perPageOptions}
      rowsPerPage={pageSize}
      onPageChange={(evt, page) => onChangePage(page)}
      onRowsPerPageChange={onChangePageSize}
      page={page - 1}
    />
  );
};
export default TableDataPagination;
