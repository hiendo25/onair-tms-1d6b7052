import React, { MouseEvent, useCallback, useEffect, useRef } from "react";
import { TableCell, TableCellProps, TableRow } from "@mui/material";

import { TableRowStyled } from "./table-row-styled";
import { getClientInfo } from "./utils";

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

const TableDataRow = <T extends { id: number | string; [key: string]: any }>({
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
  const nodeListMap = useRef<
    Map<string, { index: number; node: HTMLTableCellElement; fixed: "left" | "right" | undefined }>
  >(new Map());
  const splitCellsRefs = (fixed: "left" | "right" | undefined, index: number) => (el: HTMLTableCellElement) => {
    nodeListMap.current.set(index.toString(), { index: index, node: el, fixed });
  };

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

  useEffect(() => {
    const nodeListArr = [...nodeListMap.current];
    let leftPosition = 0;
    nodeListArr.forEach(([nodeIndex, nodeItem], _index) => {
      if (nodeItem.fixed === "left") {
        nodeItem.node.style.left = leftPosition + "px";
        nodeItem.node.style.right = "auto";
        nodeItem.node.classList.add("fixed-left");
        nodeItem.node.style.background = "rgb(255 255 255)";
        nodeItem.node.style.zIndex = `${(_index + 1) * 10}`;
        const { width } = getClientInfo(nodeItem.node);
        leftPosition += width;
      }
    });

    let rightPosition = 0;

    const nodeListRevert = [...nodeListArr].reverse();

    nodeListRevert.forEach(([nodeIndex, nodeItem], _index) => {
      if (nodeItem.fixed === "right") {
        nodeItem.node.style.right = rightPosition + "px";
        nodeItem.node.style.left = "auto";
        nodeItem.node.classList.add("fixed-right");
        nodeItem.node.style.background = "rgb(255 255 255)";
        nodeItem.node.style.zIndex = `${_index}`;

        const { width } = getClientInfo(nodeItem.node);
        rightPosition += width;
      }
    });
  }, [columns, nodeListMap]);

  return (
    <TableRowStyled className="table-data-row h-14" hover={hoverRow} onClick={handleClickRow(row)}>
      {showRowCount && (
        <TableCell className="w-20" sx={{ padding: "8px 12px" }}>
          {indexRow + 1 + (page - 1) * pageSize}
        </TableCell>
      )}
      {columns.map(({ headerName, field, renderCell, id, ...restProps }, _index) => (
        <TableCell
          ref={splitCellsRefs(restProps.fixed, _index)}
          key={field.toString()}
          onClick={(evt) => handleClickCell(field, row, evt)}
          {...restProps}
          sx={() => ({
            padding: "8px 12px",
          })}
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
