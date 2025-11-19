"use client";
import { alpha, Chip, ChipProps, IconButton, Menu, MenuItem, Typography } from "@mui/material";
import { GridColDef, GridMoreVertIcon } from "@mui/x-data-grid";
import { EmployeeTeacherTypeItem } from "@/model/employee.model";
import { GetCoursesResponse } from "@/repository/courses";
import { PATHS } from "@/constants/path.contstants";
type CourseRowItem = NonNullable<GetCoursesResponse["data"]>[number];
import PopupState, { bindMenu, bindTrigger } from "material-ui-popup-state";
export const columns: GridColDef<CourseRowItem>[] = [
  {
    field: "id",
    headerName: "STT",
    width: 80,
    renderCell: (params) => {
      return params.api.getRowIndexRelativeToVisibleRows(params.id) + 1;
    },
  },
  {
    field: "title",
    headerName: "Tên môn học",
    width: 320,
  },
  {
    field: "category",
    headerName: "Danh mục",
    renderCell: ({ row }) => {
      return (
        <div className="flex flex-wrap gap-2">
          {row.courses_categories.map((courseCat) => (
            <div key={courseCat.id}>{courseCat.categories.name}</div>
          ))}
        </div>
      );
    },
    width: 240,
  },
  {
    field: "status",
    headerName: "Trạng thái",
    width: 180,
    renderCell: ({ row }) => {
      const labelChip =
        row.status === "published"
          ? "Đã xuất bản"
          : row.status === "unpublished"
          ? "Đã hủy xuất bản"
          : row.status === "draft"
          ? "Bản nháp"
          : row.status === "deleted"
          ? "Đã xóa"
          : row.status === "pending"
          ? "Chờ duyệt"
          : "Unknown";

      const STATUS_COLOR_MAP: Record<string, ChipProps["color"]> = {
        published: "primary",
        unpublished: "default",
        draft: "warning",
        deleted: "error",
        pending: "info",
      } as const;

      const getChipColor = (status: string): ChipProps["color"] => {
        return STATUS_COLOR_MAP[status] ?? "default";
      };

      return (
        <Chip
          label={labelChip}
          color={getChipColor(status)}
          sx={(theme) => ({
            // backgroundColor: alpha(theme.palette.primary["main"], 0.2),
            color: theme.palette.primary["dark"],
            borderRadius: "0.375rem",
            borderColor: "transparent",
          })}
        />
      );
    },
  },
  {
    field: "owner",
    headerName: "Người tạo",
    width: 220,
    renderCell: ({ row }) => {
      return row.owner.profiles?.full_name;
    },
  },
  {
    field: "Hành động",
    renderCell: ({ row: { id: courseId } }) => {
      return (
        <PopupState variant="popover" popupId={`elearning-row-${courseId}`}>
          {(popupState) => (
            <>
              <IconButton {...bindTrigger(popupState)}>
                <GridMoreVertIcon />
              </IconButton>
              <Menu {...bindMenu(popupState)}>
                <MenuItem
                  href={PATHS.COURSES.EDIT(courseId)}
                  // disabled={!isAdmin}
                >
                  Chỉnh sửa
                </MenuItem>
              </Menu>
            </>
          )}
        </PopupState>
      );
    },
  },
];
