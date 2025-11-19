
import { Chip, ChipProps, IconButton, Menu, MenuItem } from "@mui/material";
import { GridColDef, GridMoreVertIcon } from "@mui/x-data-grid";
import { PATHS } from "@/constants/path.contstants";
import PopupState, { bindMenu, bindTrigger } from "material-ui-popup-state";
import { CourseDto } from "@/types/dto/courses/course.dto";
import Link from "next/link";

type ColumnFactoryOptions = {
  isAdmin: boolean;
  onDelete: (courseId: CourseDto["id"]) => void;
};

export const getColumns = ({ isAdmin, onDelete }: ColumnFactoryOptions): GridColDef<CourseDto>[] => [
  {
    field: "id",
    headerName: "STT",
    renderCell: (params) => {
      return params.api.getRowIndexRelativeToVisibleRows(params.id) + 1;
    },
  },
  {
    field: "title",
    headerName: "Tên môn học",
    flex: 1,
  },
  {
    field: "status",
    headerName: "Trạng thái",
    flex: 1,
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
        published: "success",
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
          color={getChipColor(row.status)}
          sx={(theme) => ({
            color: theme.palette.primary["dark"],
            borderRadius: "0.375rem",
            borderColor: "transparent",
          })}
        />
      );
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
                <MenuItem disabled={!isAdmin}>
                  <Link href={PATHS.COURSES.EDIT(courseId)}>
                    Chỉnh sửa
                  </Link>
                </MenuItem>
                <MenuItem
                  disabled={!isAdmin}
                  onClick={() => {
                    popupState.close();
                    onDelete(courseId);
                  }}
                >
                  Xóa
                </MenuItem>
              </Menu>
            </>
          )}
        </PopupState>
      );
    },
  },
];
