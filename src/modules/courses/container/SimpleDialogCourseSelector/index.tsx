"use client";
import { forwardRef, memo, useCallback, useImperativeHandle, useMemo, useRef, useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import { useGetCourseListMinimalQuery } from "../../operations/query";
import { Alert, DialogContent, FilledInput, FilledInputProps } from "@mui/material";
import { SearchIcon } from "@/shared/assets/icons";
import { DataGrid, DataGridProps, GridRowSelectionModel } from "@mui/x-data-grid";
import useDebounce from "@/hooks/useDebounce";
import { columns } from "./columns";
import { GetCoursesListMinimalResponse } from "@/repository/courses";

export type SimpleDialogCourseSelectorRef = {
  openDialog: () => void;
  closeDialog: () => void;
};
export interface SimpleDialogCourseSelectorProps {
  disableMultipleSelect?: boolean;
  onOk?: (course: NonNullable<GetCoursesListMinimalResponse["data"]>) => void;
  value?: string[];
}
const SimpleDialogCourseSelector = forwardRef<SimpleDialogCourseSelectorRef, SimpleDialogCourseSelectorProps>(
  ({ onOk, value = [], disableMultipleSelect = false }, ref) => {
    const [openDialog, setOpenDialog] = useState(false);
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [searchTeacherName, setSearchTeacherName] = useState("");
    const searchDebouce = useDebounce(searchTeacherName, 600);
    const prevRowIdsSet = useRef<GridRowSelectionModel["ids"]>(null);
    const [selectedCourseList, setSelectedCourseList] = useState<NonNullable<GetCoursesListMinimalResponse["data"]>>(
      [],
    );
    const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>({
      ids: new Set(value),
      type: "include",
    });

    const { data: courseData, isPending } = useGetCourseListMinimalQuery({
      queryParams: {
        page: paginationModel.page + 1,
        pageSize: paginationModel.pageSize,
        excludes: value, // exclude teacher selected
        search: searchDebouce,
      },
      enabled: openDialog,
    });

    const courseList = useMemo(() => courseData?.data || [], [courseData?.data]);
    const rowCount = useMemo(() => courseData?.count || 0, [courseData?.count]);

    const handleClose = () => {
      //Reset State after close
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
      setRowSelectionModel((prev) => ({ ...prev, ids: new Set() }));
      prevRowIdsSet.current = new Set();
      setSelectedCourseList([]);
      setOpenDialog(false);
    };

    const handleClickOk = useCallback(() => {
      selectedCourseList && onOk?.(selectedCourseList);
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
          const teacher = courseList.find((tc) => tc.id === latestRowId);

          setSelectedCourseList(() => {
            return teacher ? [teacher] : [];
          });

          const updateRowModel = latestRowId ? new Set([latestRowId]) : new Set([]);

          /**
           * Store newIdsSet on every change
           */
          prevRowIdsSet.current = updateRowModel;

          setRowSelectionModel((prevModel) => ({
            ...prevModel,
            ids: updateRowModel,
          }));
        } else {
          const prevIdsSet = prevRowIdsSet.current || new Set();
          const addedRow = newRowSelectModel.ids.difference(prevIdsSet);
          const removeRow = prevIdsSet.difference(new Set(newRowSelectModel.ids));

          setSelectedCourseList((prev) => {
            /**
             * Get Teachers in newIdsSet of current Row Model
             */

            let updateList = prev ? [...prev] : [];

            if (addedRow.size > 0) {
              addedRow.forEach((rowId) => {
                const teacher = courseList.find((tc) => tc.id === rowId);
                updateList = teacher ? [...updateList, teacher] : [...updateList];
              });
            }
            if (removeRow.size > 0) {
              removeRow.forEach((rowId) => {
                updateList = [...updateList].filter((it) => it.id !== rowId);
              });
            }

            return updateList;
          });
          const updateRowModel =
            addedRow.size > 0 ? new Set([...prevIdsSet, ...newRowSelectModel.ids]) : newRowSelectModel.ids;

          /**
           * Store newIdsSet on every change
           */
          prevRowIdsSet.current = updateRowModel;

          setRowSelectionModel((prevModel) => ({
            ...prevModel,
            ids: updateRowModel,
          }));
        }
      },
      [courseList, disableMultipleSelect],
    );

    const isDisabledOkButton = Boolean(!selectedCourseList?.length);

    const handleSearchTeacherName: FilledInputProps["onChange"] = (evt) => {
      setSearchTeacherName(evt.target.value);
    };

    useImperativeHandle(ref, () => ({
      openDialog: () => {
        setOpenDialog(true);
      },
      closeDialog: () => {
        setOpenDialog(false);
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
            Chọn môn học
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
              rows={courseList}
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

export default memo(SimpleDialogCourseSelector);
