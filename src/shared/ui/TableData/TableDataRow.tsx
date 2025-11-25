import { EventHandler, MouseEvent, MouseEventHandler, useCallback, useEffect, useRef } from "react";
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
  const nodeListLeft = useRef<HTMLTableCellElement[]>([]);
  const nodeListRight = useRef<HTMLTableCellElement[]>([]);
  const isMounted = useRef(false);

  const splitCellsRefs = (fixed?: "left" | "right") => (el: HTMLTableCellElement) => {
    if (!fixed) return;
    fixed === "left" && nodeListLeft.current.push(el);
    fixed === "right" && nodeListRight.current.push(el);
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
    const nodesLeft = [...nodeListLeft.current];
    nodesLeft.forEach((cellNode, _index) => {
      let leftPosition = 0;
      for (let i = 0; i < _index; i++) {
        const node = nodesLeft[i];
        if (node) {
          const { width } = getClientInfo(node);
          leftPosition += width;
        }
      }

      cellNode.style.left = leftPosition + "px";
      cellNode.classList.add("fixed-left");
      cellNode.style.background = "#fff";
    });

    const nodelistRightReverse = [...nodeListRight.current].reverse();

    nodelistRightReverse.forEach((cellNode, _index) => {
      let rightPosition = 0;
      for (let i = 0; i < _index; i++) {
        const el = nodelistRightReverse[i];
        if (el) {
          const { width } = getClientInfo(el);
          rightPosition += width;
        }
      }

      cellNode.style.right = rightPosition + "px";
      cellNode.classList.add("fixed-right");
      cellNode.style.background = "#fff";
    });
  }, []);

  return (
    <TableRowStyled className="table-data-row h-14" hover={hoverRow} onClick={handleClickRow(row)}>
      {showRowCount && (
        <TableCell className="w-20" sx={{ padding: "8px 12px" }}>
          {indexRow + 1 + (page - 1) * pageSize}
        </TableCell>
      )}
      {columns.map(({ headerName, field, renderCell, id, ...restProps }, _index) => (
        <TableCell
          ref={splitCellsRefs(restProps.fixed)}
          key={field.toString()}
          onClick={(evt) => handleClickCell(field, row, evt)}
          {...restProps}
          sx={{
            padding: "8px 12px",
          }}
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
