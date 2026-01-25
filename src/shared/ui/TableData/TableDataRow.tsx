import React, { MouseEvent, useCallback } from "react";
import { TableCell, TableCellProps } from "@mui/material";

import { TableRowStyled } from "./table-row-styled";
import { useStickyCell } from "./use-sticky-node";

type FieldKey<T> = keyof T | (string & {});

export type TableDataColumn<T> = TableCellProps & {
  id: string;
  field: FieldKey<T>;
  headerName?: React.ReactNode;
  editable?: boolean;
  fixed?: "left" | "right";
  renderCell?: (value: T[keyof T], row: T) => React.ReactNode | string;
};
export interface TableRowDataProps<T> {
  row: T;
  hoverRow?: boolean;
  columns: TableDataColumn<T>[];
  page?: number;
  pageSize: number;
  indexRow: number;
  showRowCount?: boolean;
  onRowClick?: (row: T) => void;
  onCellClick?: (column: FieldKey<T>, row: T, evt: MouseEvent<HTMLTableCellElement>) => void;
}

const TableDataRow = <T extends { id: number | string } & Record<string, any>>({
  row,
  hoverRow,
  page = 1,
  pageSize,
  indexRow,
  showRowCount,
  columns,
  onRowClick,
  onCellClick,
}: TableRowDataProps<T>) => {
  const getNodeIndex = useStickyCell([columns]);

  const handleClickRow = useCallback(
    (row: T) => () => {
      onRowClick?.(row);
    },
    [onRowClick],
  );
  const handleClickCell = useCallback(
    (column: keyof T, row: T, evt: MouseEvent<HTMLTableCellElement>) => {
      onCellClick?.(column, row, evt);
    },
    [onCellClick],
  );

  return (
    <TableRowStyled className="table-data-row h-14" hover={hoverRow} onClick={handleClickRow(row)}>
      {showRowCount && (
        <TableCell className="w-20" sx={{ padding: "8px 12px" }}>
          {indexRow + 1 + (page - 1) * pageSize}
        </TableCell>
      )}
      {columns.map(({ headerName, field, renderCell, id, ...restProps }, _index) => (
        <TableCell
          ref={getNodeIndex(restProps.fixed, _index)}
          key={field.toString()}
          onClick={(evt) => handleClickCell(field, row, evt)}
          {...restProps}
          sx={{ padding: "8px 12px" }}
        >
          {renderCell
            ? renderCell(row[field], row)
            : typeof row[field] === "string" ||
              typeof row[field] === "number" ||
              typeof row[field] === "bigint" ||
              typeof row[field] === "boolean"
            ? row[field]
            : row[field]}
        </TableCell>
      ))}
    </TableRowStyled>
  );
};
export default TableDataRow;
