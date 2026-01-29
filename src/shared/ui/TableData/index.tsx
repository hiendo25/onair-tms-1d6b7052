import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Box, Table, TableBody, TableContainer, TableHead, TablePaginationOwnProps, Typography } from "@mui/material";

import { EmptyBoxIcon } from "@/shared/assets/icons";

import TableDataHeader from "./TableDataHeader";
import { CustomTablePagination } from "./TableDataPagination/CustomTablePagination";
import TableRowDataProvider from "./TableDataProvider";
import TableDataRow, { TableRowDataProps } from "./TableDataRow";
import TableRowFixedWidth from "./TableRowFixedWith";

type TableActionMenuItem = {
  iconButton?: React.ReactNode;
  altText?: string;
  action?: () => void;
};
export type TableDataProps<T extends object> = {
  rowKey?: string;
  rows?: T[];
  columns: TableRowDataProps<T>["columns"];
  loading?: boolean;
  minWidth?: number;
  hoverRow?: boolean;
  stickyHeader?: boolean;
  showRowCount?: boolean;
  bordered?: boolean;
  ssr?: boolean;
  disableHoverMenuAction?: boolean;
  pagination?: {
    page?: number;
    pageSize?: number;
    total?: number;
    totalPages?: number;
    perPageOptions?: number[];
    onChangePage?: (page: number) => void;
    onChangePageSize?: (pageSize: number) => void;
  };
  onRowClick?: TableRowDataProps<T>["onRowClick"];
  onCellClick?: TableRowDataProps<T>["onCellClick"];
  slots?: {
    menuActions?: TableRowDataProps<T>["cellActions"];
  };
};

const initPagination = {
  page: 1,
  pageSize: 10,
  total: 0,
  totalPages: 1,
  perPageOptions: [10, 20, 30, 50],
};
type PaginationTable = Omit<Required<Exclude<typeof initPagination, undefined>>, "onPagination" | "onChangePageSize">;

const TableData = <T extends { id?: number | string; [key: string]: any }>({
  rowKey,
  rows,
  columns,
  minWidth,
  loading,
  hoverRow,
  bordered = true,
  pagination,
  stickyHeader,
  showRowCount,
  onRowClick,
  onCellClick,
  slots,
  ssr = true,
  disableHoverMenuAction = false,
}: TableDataProps<T>) => {
  const [tablePagination, setTablePagination] = useState<PaginationTable>(() => {
    return {
      page: pagination?.page ?? initPagination.page,
      pageSize: pagination?.pageSize ?? initPagination.pageSize,
      total: pagination?.total ?? rows?.length ?? initPagination.total,
      totalPages: pagination?.totalPages ?? initPagination.totalPages,
      perPageOptions: pagination?.perPageOptions ?? initPagination.perPageOptions,
    };
  });

  const { page, pageSize, total, perPageOptions } = tablePagination;

  const rowsList = useMemo(() => {
    if (!rows) return [];

    if (ssr) return rows;

    const from = (page - 1) * pageSize;
    const to = from + pageSize;

    return rows.slice(from, to);
  }, [pageSize, rows, page, ssr]);

  const onChangePage: TablePaginationOwnProps["onPageChange"] = (event, newPage) => {
    if (pagination?.onChangePage) {
      pagination?.onChangePage?.(newPage + 1);
      return;
    }
    setTablePagination((prev) => {
      return {
        ...prev,
        page: newPage + 1,
      };
    });
  };

  const onChangePageSize: TablePaginationOwnProps["onRowsPerPageChange"] = (evt) => {
    const newPageSize = parseInt(evt.target.value);

    if (pagination?.onChangePageSize) {
      pagination.onChangePageSize(newPageSize);
      return;
    }
    setTablePagination((prev) => {
      return {
        ...prev,
        pageSize: newPageSize,
      };
    });
  };
  const genRowKey = useCallback(
    (row: T): string | undefined => {
      const currentRowKey = rowKey ? row[rowKey] : row?.id;

      if (currentRowKey === null) return undefined;

      if (typeof currentRowKey === "string") {
        return currentRowKey;
      }
      return String(currentRowKey);
    },
    [rowKey],
  );

  const columnCount = useMemo(() => {
    let columnCount = columns.length;
    if (showRowCount) columnCount += 1;
    if (slots?.menuActions) columnCount += 1;
    return columnCount;
  }, [showRowCount, columns, slots?.menuActions]);

  useEffect(() => {
    if (!pagination) return;

    setTablePagination((prev) => ({ ...prev, ...pagination, page: pagination.page ?? prev.page }));
  }, [pagination]);

  return (
    <TableRowDataProvider<T>
      initState={{
        data: rows || [],
        pagination: {
          page: pagination?.page ?? initPagination.page,
          pageSize: pagination?.pageSize ?? initPagination.pageSize,
          total: pagination?.total ?? rows?.length ?? initPagination.total,
          totalPages: pagination?.totalPages ?? initPagination.totalPages,
          perPageOptions: pagination?.perPageOptions ?? initPagination.perPageOptions,
        },
      }}
    >
      <TableContainer
        component="div"
        sx={(theme) => ({
          marginTop: "0px !important",
          ...(bordered ? { border: "1px solid", borderColor: theme.palette.grey[300], borderRadius: "12px" } : {}),
        })}
        className="table-container shadow-none bg-transparent"
      >
        <Box
          component="div"
          className="container-wraper w-full overflow-x-auto"
          sx={{
            scrollbarWidth: "thin",
            scrollbarColor: "#eaeaea transparent",
            // scrollbarGutter: "stable",
          }}
        >
          <Table stickyHeader={stickyHeader} sx={{ minWidth: minWidth }} aria-label="sticky table">
            <TableHead>
              <TableDataHeader
                showRowCount={showRowCount}
                columns={columns}
                showCellAction={Boolean(slots?.menuActions)}
              />
            </TableHead>
            <TableBody>
              {loading && (
                <TableRowFixedWidth columnCount={columnCount}>
                  <Box component="div" className="flex items-center justify-center py-20">
                    <Typography component="p" className="text-sm">
                      Đang tải...
                    </Typography>
                  </Box>
                </TableRowFixedWidth>
              )}

              {!loading && !rowsList?.length && (
                <TableRowFixedWidth columnCount={columnCount}>
                  <Box component="div" className="flex items-center justify-center py-20">
                    <Box component="div" className="flex flex-col gap-3 items-center">
                      <EmptyBoxIcon className="w-20 h-20" />
                      <Typography component="p" className="opacity-60 text-sm">
                        Đang trống.
                      </Typography>
                    </Box>
                  </Box>
                </TableRowFixedWidth>
              )}

              {!loading &&
                rowsList.length > 0 &&
                rowsList.map((row, _index) => (
                  <TableDataRow
                    key={genRowKey(row) ?? String(_index)}
                    showRowCount={showRowCount}
                    rowCount={_index + 1 + (page - 1) * pageSize}
                    hoverRow={hoverRow}
                    indexRow={_index}
                    row={row}
                    columns={columns}
                    onRowClick={onRowClick}
                    onCellClick={onCellClick}
                    cellActions={slots?.menuActions}
                  />
                ))}
            </TableBody>
          </Table>
        </Box>
        <CustomTablePagination
          count={total}
          rowsPerPageOptions={perPageOptions}
          rowsPerPage={pageSize}
          onPageChange={onChangePage}
          onRowsPerPageChange={onChangePageSize}
          page={page - 1}
        />
      </TableContainer>
    </TableRowDataProvider>
  );
};

export default memo(TableData) as typeof TableData;
