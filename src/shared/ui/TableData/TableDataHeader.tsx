import { useEffect, useRef } from "react";
import { TableCell } from "@mui/material";

import { TableRowStyled } from "./table-row-styled";
import { TableDataColumn } from "./TableDataRow";
import { useStickyCell } from "./use-sticky-node";
export interface TableRowDataProps<T> {
  showRowCount?: boolean;
  hoverRow?: boolean;
  columns: TableDataColumn<T>[];
}

const TableDataHeader = <T,>({ columns, showRowCount }: TableRowDataProps<T>) => {
  const getNodeIndex = useStickyCell([columns]);

  return (
    <TableRowStyled className="table-data-row table-data-row-header h-15">
      {showRowCount && (
        <TableCell className="w-20 table-cell-head font-semibold bg-gray-100" sx={{ padding: "8px 12px" }}>
          STT
        </TableCell>
      )}
      {columns.map(({ headerName, field, renderCell, fixed = undefined, ...restProps }, _index) => (
        <TableCell
          ref={getNodeIndex(fixed, _index)}
          key={field.toString()}
          className="table-cell-head font-semibold bg-gray-100"
          sx={{ padding: "8px 12px" }}
          {...restProps}
        >
          {headerName}
        </TableCell>
      ))}
    </TableRowStyled>
  );
};
export default TableDataHeader;
