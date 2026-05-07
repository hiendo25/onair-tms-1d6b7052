import { memo } from "react";
import { TableCell } from "@mui/material";

import { TableRowStyled } from "./table-row-styled";
import { TableDataColumn } from "./TableDataRow";
import { useStickyCell } from "./use-sticky-node";

export interface TableRowDataProps<T> {
  showRowCount?: boolean;
  hoverRow?: boolean;
  columns: TableDataColumn<T>[];
  showCellAction?: boolean;
  showExpandAble?: boolean;
}

const TableDataHeader = <T,>({ columns, showRowCount, showCellAction, showExpandAble }: TableRowDataProps<T>) => {
  const getNodeIndex = useStickyCell([columns]);

  return (
    <TableRowStyled className="table-data-row table-data-row-header h-12">
      {showExpandAble && <TableCell className="w-14 bg-gray-100" sx={{ padding: "6px 12px" }}></TableCell>}
      {showRowCount && (
        <TableCell className="w-20 table-cell-head font-semibold bg-gray-100" sx={{ padding: "6px 12px" }}>
          STT
        </TableCell>
      )}
      {columns.map(({ headerName, field, renderCell, fixed = undefined, ...restProps }, _index) => (
        <TableCell
          ref={getNodeIndex(fixed, _index)}
          key={field.toString()}
          className="table-cell-head font-semibold bg-gray-100"
          sx={{ padding: "6px 12px" }}
          {...restProps}
        >
          {headerName}
        </TableCell>
      ))}
      {showCellAction && (
        <TableCell className="table-cell-head font-semibold bg-gray-100" sx={{ padding: "6px 12px" }}></TableCell>
      )}
    </TableRowStyled>
  );
};
export default memo(TableDataHeader) as typeof TableDataHeader;
