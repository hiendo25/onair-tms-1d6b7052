"use client";
import { forwardRef, memo, useCallback, useImperativeHandle, useMemo, useRef, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { Alert, DialogContent, FilledInput, FilledInputProps } from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { DataGrid, DataGridProps, GridRowSelectionModel } from "@mui/x-data-grid";

import useDebounce from "@/hooks/useDebounce";
import { EmployeeTeacherTypeItem } from "@/model/employee.model";
import { SearchIcon } from "@/shared/assets/icons";
import { useGetTeachersQuery } from "../../hooks/useGetTeacher";

import { columns } from "./columns";

export type SimpleDialogTeacherSelectorRef = {
  openDialog: (variable?: { value?: string[] }, options?: { onOk: (data: EmployeeTeacherTypeItem[]) => void }) => void;
  closeDialog: () => void;
};
export interface SimpleDialogTeacherSelectorProps {
  disableMultipleSelect?: boolean;
  onOk?: (data: EmployeeTeacherTypeItem[]) => void;
  values?: string[];
}
const SimpleDialogTeacherSelector = forwardRef<SimpleDialogTeacherSelectorRef, SimpleDialogTeacherSelectorProps>(
  ({ onOk, values = [], disableMultipleSelect = false }, ref) => {
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogConfirm, setDialogConfirm] = useState<(data: EmployeeTeacherTypeItem[]) => void>();
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [searchTeacherName, setSearchTeacherName] = useState("");
    const [selectTeacherList, setSelectTeacherList] = useState<EmployeeTeacherTypeItem[]>([]);
    const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel | undefined>({
      ids: new Set(values),
      type: "include",
    });

    const prevRowIdsSet = useRef<GridRowSelectionModel["ids"]>(null);

    const searchDebouce = useDebounce(searchTeacherName, 600);
    const { data: teachersData, isPending } = useGetTeachersQuery({
      queryParams: {
        page: paginationModel.page + 1,
        pageSize: paginationModel.pageSize,
        exclude: values, // exclude teacher selected
        search: searchDebouce,
      },
      enabled: openDialog,
    });

    const teacherList = useMemo(() => teachersData?.data || [], [teachersData?.data]);
    const rowCount = useMemo(() => teachersData?.count || 0, [teachersData?.count]);

    const handleClose = () => {
      //Reset State after close
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
      setRowSelectionModel((prev) => (prev ? { ...prev, ids: new Set() } : { ids: new Set(), type: "include" }));
      prevRowIdsSet.current = new Set();
      setSelectTeacherList([]);
      setOpenDialog(false);
    };

    const handleClickOk = useCallback(() => {
      if (selectTeacherList) onOk?.(selectTeacherList), dialogConfirm?.(selectTeacherList);

      handleClose();
    }, [rowSelectionModel]);

    const handlePaginationModelChange: Exclude<DataGridProps["onPaginationModelChange"], undefined> = useCallback(
      (paginationModel) => {
        setPaginationModel(paginationModel);
      },
      [],
    );

    const handleRowSelectModelChange: Exclude<DataGridProps["onRowSelectionModelChange"], undefined> = useCallback(
      (newRowSelectModel, details) => {
        /**
         *  multipleRowsSelection occur when change pagination.
         * return to prevent set Empty empty RowModel Selection
         */
        if (details.reason === "multipleRowsSelection") return;

        if (disableMultipleSelect) {
          const prevIdsSet = prevRowIdsSet.current || new Set();

          const rowIds = [...newRowSelectModel.ids];
          const latestRowId = rowIds[rowIds.length - 1];
          console.log(newRowSelectModel);
          const teacher = teacherList.find((tc) => tc.id === latestRowId);

          setSelectTeacherList(() => {
            return teacher ? [teacher] : [];
          });

          const updateRowModel = latestRowId ? new Set([latestRowId]) : new Set([]);

          /**
           * Store newIdsSet on every change
           */
          prevRowIdsSet.current = updateRowModel;

          setRowSelectionModel((prevModel) =>
            prevModel
              ? {
                  ...prevModel,
                  ids: updateRowModel,
                }
              : { ids: updateRowModel, type: "include" },
          );
        } else {
          const prevIdsSet = prevRowIdsSet.current || new Set();
          const addedRow = newRowSelectModel.ids.difference(prevIdsSet);
          const removeRow = prevIdsSet.difference(new Set(newRowSelectModel.ids));

          setSelectTeacherList((prevTeachers) => {
            /**
             * Get Teachers in newIdsSet of current Row Model
             */

            let updateTeacherList = [...prevTeachers];

            if (addedRow.size > 0) {
              addedRow.forEach((rowId) => {
                const teacher = teacherList.find((tc) => tc.id === rowId);
                updateTeacherList = teacher ? [...updateTeacherList, teacher] : [...updateTeacherList];
              });
            }
            if (removeRow.size > 0) {
              removeRow.forEach((rowId) => {
                updateTeacherList = [...updateTeacherList].filter((it) => it.id !== rowId);
              });
            }

            return updateTeacherList;
          });
          const updateRowModel =
            addedRow.size > 0 ? new Set([...prevIdsSet, ...newRowSelectModel.ids]) : newRowSelectModel.ids;

          /**
           * Store newIdsSet on every change
           */
          prevRowIdsSet.current = updateRowModel;

          setRowSelectionModel((prevModel) =>
            prevModel
              ? {
                  ...prevModel,
                  ids: updateRowModel,
                }
              : { ids: updateRowModel, type: "include" },
          );
        }
      },
      [teacherList, disableMultipleSelect],
    );

    const isDisabledOkButton = Boolean(!selectTeacherList.length);

    const handleSearchTeacherName: FilledInputProps["onChange"] = (evt) => {
      setSearchTeacherName(evt.target.value);
    };

    useImperativeHandle(ref, () => ({
      openDialog: (variables, options) => {
        setOpenDialog(true);
        const confirmFn = options?.onOk;
        const values = variables?.value;
        if (confirmFn) setDialogConfirm(() => confirmFn);
        if (values) setRowSelectionModel({ ids: new Set(values), type: "include" });
      },
      closeDialog: () => {
        setOpenDialog(false);
        setRowSelectionModel(undefined);
      },
    }));
    return (
      <Dialog open={openDialog} fullWidth maxWidth="md">
        <Toolbar
          sx={(theme) => ({
            minHeight: 48,
            borderBottom: "1px solid",
            borderColor: theme.palette.grey[300],
            [theme.breakpoints.up("md")]: {
              paddingInline: "1rem",
              minHeight: 60,
            },
          })}
        >
          <Typography sx={{ flex: 1 }} variant="h6" component="div">
            Chỉ định giảng viên phụ trách
          </Typography>
          <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close" className="-mr-3">
            <CloseIcon />
          </IconButton>
        </Toolbar>

        <DialogContent
          sx={(theme) => ({
            paddingInline: "1rem",
          })}
        >
          <div className="header mb-6">
            <FilledInput
              placeholder="Tìm kiếm..."
              value={searchTeacherName}
              onChange={handleSearchTeacherName}
              endAdornment={<SearchIcon />}
              size="small"
              sx={{ minWidth: 280 }}
            />
          </div>
          <div>
            <DataGrid
              rows={teacherList}
              columns={columns}
              rowCount={rowCount}
              loading={isPending}
              density="standard"
              pageSizeOptions={[10, 15, 20]}
              checkboxSelection
              disableColumnSelector
              disableColumnSorting
              disableColumnResize
              disableRowSelectionOnClick
              disableColumnMenu
              paginationMode="server"
              onRowSelectionModelChange={handleRowSelectModelChange}
              rowSelectionModel={rowSelectionModel}
              paginationModel={paginationModel}
              onPaginationModelChange={isPending ? undefined : handlePaginationModelChange}
              sx={{
                border: 0,
                ".MuiDataGrid-columnHeaders": {
                  ".MuiDataGrid-columnHeaderCheckbox": {
                    pointerEvents: "none",
                  },
                },
              }}
            />
          </div>
        </DialogContent>
        <Toolbar
          sx={(theme) => ({
            minHeight: 48,
            borderTop: "1px solid",
            borderColor: theme.palette.grey[300],
            justifyContent: "end",
            [theme.breakpoints.up("md")]: {
              paddingInline: "1rem",
              minHeight: 60,
            },
          })}
        >
          <div className="flex items-center gap-2">
            <Button autoFocus color="inherit" variant="outlined" onClick={handleClose} sx={{ minWidth: 96 }}>
              Huỷ
            </Button>
            <Button autoFocus onClick={handleClickOk} sx={{ minWidth: 96 }} disabled={isDisabledOkButton}>
              Xác nhận
            </Button>
          </div>
        </Toolbar>
      </Dialog>
    );
  },
);

export default memo(SimpleDialogTeacherSelector);
