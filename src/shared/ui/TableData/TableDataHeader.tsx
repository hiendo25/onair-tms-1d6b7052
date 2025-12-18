import { useEffect, useRef } from "react";
import { TableCell } from "@mui/material";

import { TableRowStyled } from "./table-row-styled";
import { TableDataColumn } from "./TableDataRow";
export interface TableRowDataProps<T> {
  showRowCount?: boolean;
  hoverRow?: boolean;
  columns: TableDataColumn<T>[];
}

const TableDataHeader = <T,>({ columns, showRowCount }: TableRowDataProps<T>) => {
  const nodeListMap = useRef<
    Map<string, { index: number; node: HTMLTableCellElement; fixed: "left" | "right" | undefined }>
  >(new Map());
  const splitCellsRefs = (fixed: "left" | "right" | undefined, index: number) => (el: HTMLTableCellElement) => {
    nodeListMap.current.set(index.toString(), { index: index, node: el, fixed });
  };

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
    <TableRowStyled className="table-data-row table-data-row-header h-15">
      {showRowCount && (
        <TableCell className="w-20 table-cell-head font-semibold bg-gray-100" sx={{ padding: "8px 12px" }}>
          STT
        </TableCell>
      )}
      {columns.map(({ headerName, field, renderCell, fixed = undefined, ...restProps }, _index) => (
        <TableCell
          ref={splitCellsRefs(fixed, _index)}
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

const getClientInfo = (el: HTMLElement | Element) => {
  return {
    x: el.getBoundingClientRect().x,
    y: el.getBoundingClientRect().y,
    width: el.getBoundingClientRect().width,
    height: el.getBoundingClientRect().height,
  };
};
