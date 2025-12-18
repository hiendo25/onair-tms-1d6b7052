import { styled, TablePagination, TablePaginationOwnProps } from "@mui/material";

export const CustomTablePagination = styled((props: TablePaginationOwnProps) => (
  <TablePagination
    {...props}
    component="div"
    size="small"
    slotProps={{
      select: {
        sx: {
          marginRight: 2,
          fontSize: "0.75rem",
        },
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
      actions: {
        firstButton: {
          sx: {
            bgcolor: "red",
          },
        },
        previousButton: {
          sx: {
            width: "28px !important",
            height: "28px !important",
          },
        },
        nextButton: {
          sx: {
            width: "28px !important",
            height: "28px !important",
          },
        },
      },
    }}
  />
))(() => ({
  ".MuiTablePagination-actions": {
    marginLeft: "12px",
    marginRight: "16px",
  },
  ".MuiTablePagination-selectLabel": {
    fontSize: "0.75rem",
  },
  ".MuiTablePagination-displayedRows": {
    fontSize: "0.75rem",
  },
}));
