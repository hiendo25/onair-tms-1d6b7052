"use client";
import React, {
  Activity,
  MouseEvent,
  PropsWithChildren,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  IconButton,
  styled,
  TableCell,
  TableCellProps,
  Tooltip,
  tooltipClasses,
  TooltipProps,
  Zoom,
} from "@mui/material";

import { DotHorizontalIcon, MinusIcon } from "@/shared/assets/icons";
import PlusIcon from "@/shared/assets/icons/PlusIcon";

import { TableRowStyled } from "./table-row-styled";
import { useStickyCell } from "./use-sticky-node";

type FieldKey<T> = keyof T | (string & {});

type TableCellActionMenuItem = {
  iconButton?: React.ReactNode;
  altText?: string;
  action?: () => void;
  loading?: boolean;
};
export type TableDataColumn<T> = TableCellProps & {
  id?: string;
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
  rowCount: number;
  indexRow: number;
  showRowCount?: boolean;
  asChild?: boolean;
  depth?: number;
  onRowClick?: (row: T, index: number) => void;
  onCellClick?: (column: FieldKey<T>, row: T, evt: MouseEvent<HTMLTableCellElement>) => void;
  cellActions?: (row: T, index: number) => TableCellActionMenuItem[];
}

const TableDataRow = <T extends { id?: number | string; children?: T[] } & Record<string, any>>({
  row,
  hoverRow,
  rowCount,
  indexRow,
  showRowCount,
  columns,
  onRowClick,
  onCellClick,
  cellActions,
  asChild = false,
  depth = 0,
}: TableRowDataProps<T>) => {
  const buttonActionRef = useRef<ButtonActionCellRef>(null);
  const getNodeIndex = useStickyCell([columns]);
  const [openChildRow, setOpenChildRow] = useState(false);
  const handleClickRow = useCallback(
    (row: T) => () => {
      onRowClick?.(row, indexRow);
    },
    [onRowClick, indexRow],
  );
  const handleClickCell = useCallback(
    (column: keyof T, row: T, evt: MouseEvent<HTMLTableCellElement>) => {
      onCellClick?.(column, row, evt);
    },
    [onCellClick],
  );

  const cellMenuItems = useMemo(() => {
    return cellActions?.(row, indexRow);
  }, [row, cellActions, indexRow]);

  const toggleOpenChildRow = useCallback(() => {
    setOpenChildRow((prev) => !prev);
  }, []);

  const hasChild = Boolean(row.children && row.children.length);
  return (
    <>
      <TableRowStyled
        className="table-data-row h-13"
        hover={hoverRow}
        onClick={handleClickRow(row)}
        onMouseEnter={() => {
          buttonActionRef.current?.onOpen();
        }}
        onMouseLeave={() => {
          buttonActionRef.current?.onClose();
        }}
      >
        {showRowCount && (
          <TableCell className="w-20" sx={{ padding: "6px 12px" }}>
            {!asChild ? rowCount : null}
          </TableCell>
        )}
        {columns.map(({ headerName, field, renderCell, id, ...restProps }, _index) => (
          <TableCell
            ref={getNodeIndex(restProps.fixed, _index)}
            key={field.toString()}
            onClick={(evt) => handleClickCell(field, row, evt)}
            {...restProps}
            sx={{ padding: "6px 12px" }}
          >
            {asChild && _index === 0 ? (
              <span className="h-1 inline-block" style={{ width: `${depth * 24}px` }} />
            ) : null}
            {hasChild && _index === 0 ? (
              <IconButton
                size="small"
                className="mr-2 bg-transparent border border-gray-500 w-4 h-4"
                onClick={toggleOpenChildRow}
              >
                {openChildRow ? <MinusIcon className="w-3 h-3" /> : <PlusIcon className="w-3 h-3" />}
              </IconButton>
            ) : null}

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
        {cellMenuItems && <ButtonActionCell ref={buttonActionRef} index={indexRow} items={cellMenuItems} />}
      </TableRowStyled>
      {row.children && row.children.length
        ? row.children.map((childRow, index) => (
            <Activity key={index} mode={openChildRow ? "visible" : "hidden"}>
              <TableDataRow
                key={index}
                row={childRow}
                hoverRow={hoverRow}
                rowCount={index + 1}
                indexRow={index}
                showRowCount={showRowCount}
                columns={columns}
                asChild={true}
                depth={depth + 1}
                onRowClick={onRowClick}
                onCellClick={onCellClick}
                cellActions={cellActions}
              />
            </Activity>
          ))
        : null}
    </>
  );
};
export default TableDataRow;

interface ButtonActionCellProps extends PropsWithChildren {
  index: number;
  items: TableCellActionMenuItem[];
}
interface ButtonActionCellRef {
  onOpen: () => void;
  onClose: () => void;
}

const ButtonActionCell = React.forwardRef<ButtonActionCellRef, ButtonActionCellProps>(
  ({ items }: ButtonActionCellProps, ref) => {
    const [open, setOpen] = useState(false);

    const handleOpen = () => {
      setOpen(true);
    };

    const handleClose = () => {
      setOpen(false);
    };

    useImperativeHandle(ref, () => ({
      onOpen: () => {
        handleOpen();
      },
      onClose: () => {
        handleClose();
      },
    }));

    return (
      <TableCell sx={{ padding: "6px 12px", position: "relative", width: 120, textAlign: "right" }}>
        <IconButton size="small" className="bg-transparent" onClick={handleOpen}>
          <DotHorizontalIcon className="w-4 h-4" width={16} height={16} />
        </IconButton>
        <Activity mode={open ? "visible" : "hidden"}>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-white">
            <div className="py-1 px-3 h-12 flex flex-col items-center justify-center">
              <div className="flex items-center gap-2">
                {items.map(({ action, altText, iconButton, loading }, _index) => (
                  <CellButton key={_index} altText={altText} loading={loading} onClick={action} icon={iconButton} />
                ))}
              </div>
            </div>
          </div>
        </Activity>
      </TableCell>
    );
  },
);

const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "#ffffff",
    color: theme.palette.grey[800],
    maxWidth: 120,
    fontSize: theme.typography.pxToRem(12),
    border: "1px solid",
    borderColor: theme.palette.grey[300],
  },
}));

const CellButton = ({
  altText,
  icon,
  loading,
  onClick,
}: {
  altText?: string;
  icon: React.ReactNode;
  loading?: boolean;
  onClick?: () => void;
}) => {
  return (
    <HtmlTooltip
      title={altText}
      placement="top"
      slots={{
        transition: Zoom,
      }}
    >
      <IconButton
        disableRipple
        size="small"
        loading={loading}
        {...(onClick ? { onClick } : undefined)}
        sx={{ bgcolor: "transparent" }}
      >
        {icon}
      </IconButton>
    </HtmlTooltip>
  );
};
