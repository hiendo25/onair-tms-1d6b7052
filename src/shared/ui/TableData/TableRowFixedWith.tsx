import React, { PropsWithChildren, useEffect, useRef } from "react";
import { TableCell, TableRow } from "@mui/material";

export type TableRowFixedWidthProps = PropsWithChildren & {
  columnCount: number;
};

const TableRowFixedWidth: React.FC<TableRowFixedWidthProps> = ({ columnCount, children }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const contentNode = contentRef.current;
    if (!contentNode) return;

    const tableContainer = contentNode.closest(".table-container");
    const tableContainerWidth = tableContainer?.clientWidth;
    contentNode.style.width = `${tableContainerWidth}px`;
  }, []);

  return (
    <TableRow className="table-data-row">
      <TableCell colSpan={columnCount} className="p-0">
        <div ref={contentRef} className="sticky left-0">
          {children}
        </div>
      </TableCell>
    </TableRow>
  );
};
export default TableRowFixedWidth;
