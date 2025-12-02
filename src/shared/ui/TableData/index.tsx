import { createContext, memo, useCallback, useContext, useLayoutEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  SxProps,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TablePagination,
  TablePaginationOwnProps,
  Typography,
} from "@mui/material";
import TableDataRow, { TableRowDataProps } from "./TableDataRow";
import TableDataHeader from "./TableDataHeader";
import TableRowFixedWidth from "./TableRowFixedWith";
import TableRowDataProvider from "./TableRowDataProvider";
import { EmptyBoxIcon } from "@/shared/assets/icons";

export type TableDataProps<T> = {
  rowKey?: string;
  rows?: T[];
  columns: TableRowDataProps<T>["columns"];
  loading?: boolean;
  minWidth?: number;
  hoverRow?: boolean;
  stickyHeader?: boolean;
  showRowCount?: boolean;
  bordered?: boolean;
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
};

const initPagination = {
  page: 1,
  pageSize: 10,
  total: 0,
  totalPages: 0,
  perPageOptions: [10, 20, 30, 50],
};
type PaginationTable = Omit<Required<Exclude<typeof initPagination, undefined>>, "onPagination" | "onChangePageSize">;

const TableData = <T extends { id: number | string; [key: string]: any }>({
  rowKey,
  rows,
  columns,
  minWidth,
  loading,
  hoverRow,
  bordered = true,
  pagination = initPagination,
  stickyHeader,
  showRowCount,
  onRowClick,
  onCellClick,
}: TableDataProps<T>) => {
  const [tablePagination, setTablePaginations] = useState<PaginationTable>(() => {
    return {
      ...initPagination,
      page: pagination?.page ? pagination?.page : initPagination.page,
      pageSize: pagination?.pageSize || initPagination.pageSize,
      total: pagination?.total || rows?.length || initPagination.total,
      totalPages: pagination?.totalPages || initPagination.totalPages,
      perPageOptions: pagination?.perPageOptions || initPagination.perPageOptions,
    };
  });
  const { page, pageSize, total, perPageOptions } = tablePagination;

  const rowsList = useMemo(() => {
    return rows?.slice(0, pageSize) || [];
  }, [pageSize, page, rows]);

  const onChangePage: TablePaginationOwnProps["onPageChange"] = (event, newPage) => {
    setTablePaginations((prev) => {
      pagination?.onChangePage?.(newPage + 1);
      return {
        ...prev,
        page: newPage + 1,
      };
    });
  };
  const onChangePageSize: TablePaginationOwnProps["onRowsPerPageChange"] = (evt) => {
    const newPageSize = parseInt(evt.target.value);
    setTablePaginations((prev) => {
      pagination?.onChangePageSize?.(newPageSize);
      return {
        ...prev,
        pageSize: newPageSize,
      };
    });
  };
  const genRowkey = useCallback(
    (row: T) => {
      const currentRowKey = row[rowKey || "id"];
      if (!currentRowKey) {
        console.error("Row key is not defined for row:", row);
      }
      if (typeof currentRowKey !== "string" && typeof currentRowKey !== "number") {
        console.error("Row key must be a string or number.", currentRowKey);
      }
      return currentRowKey.toString();
    },
    [rowKey],
  );
  const columnCount = useMemo(() => {
    return showRowCount ? columns.length + 1 : columns.length;
  }, [showRowCount]);

  useLayoutEffect(() => {
    if (!pagination) return;

    setTablePaginations((prev) => {
      let newPaginations = { ...prev };
      const { page, ...restPaginationUpdate } = pagination;
      if (page) {
        newPaginations = { ...newPaginations, page: page };
      }
      return { ...newPaginations, ...restPaginationUpdate };
    });
  }, [pagination?.page, pagination?.pageSize, pagination?.perPageOptions, pagination?.total, pagination?.totalPages]);

  return (
    <TableRowDataProvider>
      <TableContainer
        component="div"
        sx={(theme) => ({
          marginTop: "0px !important",
          ...(bordered ? { border: "1px solid", borderColor: theme.palette.grey[200] } : {}),
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
              <TableDataHeader showRowCount={showRowCount} columns={columns} />
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
                    key={genRowkey(row)}
                    showRowCount={showRowCount}
                    hoverRow={hoverRow}
                    indexRow={_index}
                    page={page}
                    pageSize={pageSize}
                    row={row}
                    columns={columns}
                    onRowClick={onRowClick}
                    onCellClick={onCellClick}
                  />
                ))}
            </TableBody>
          </Table>
        </Box>
        <TablePagination
          id="12"
          className="table-pagination"
          component="div"
          count={total}
          rowsPerPageOptions={perPageOptions}
          rowsPerPage={pageSize}
          onPageChange={onChangePage}
          onRowsPerPageChange={onChangePageSize}
          page={page - 1}
          slotProps={{
            select: {
              popoverTargetAction: "toggle",
              popoverTarget: "table-pagination",
              popover: "manual",
              MenuProps: {
                sx: (theme) => ({
                  ".MuiPaper-root": {
                    minWidth: "52px !important",
                  },
                  ".MuiList-root": {
                    padding: "6px",
                  },
                  ".MuiButtonBase-root": {
                    display: "inline-block",
                    textAlign: "center",

                    "&.Mui-selected": {
                      background: theme.palette.grey[200],
                      "&.Mui-focusVisible": {
                        background: theme.palette.grey[200],
                        outline: "none",
                      },
                    },
                  },
                }),
              },
            },
          }}
        />
      </TableContainer>
    </TableRowDataProvider>
  );
};

export default memo(TableData) as typeof TableData;
