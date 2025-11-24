"use client";
import { Chip, ChipProps, IconButton } from "@mui/material";
import { GetCoursesV2Response } from "@/repository/courses";
import { TableDataProps } from "@/shared/ui/TableData";
import dayjs from "dayjs";

export type CourseRowItem = NonNullable<GetCoursesV2Response["data"]>[number];

export const columnsCourse: TableDataProps<CourseRowItem>["columns"] = [
  {
    id: "title",
    field: "title",
    headerName: "Tên môn học",
    width: 320,
  },
  {
    id: "catgegory",
    headerName: "Danh mục",
    field: "category",
    width: 240,
    renderCell(value, row) {
      return (
        <div className="flex flex-wrap gap-2">
          {row.courses_categories.map((courseCat) => (
            <div key={courseCat.id}>{courseCat.categories.name}</div>
          ))}
        </div>
      );
    },
  },
  {
    id: "status",
    field: "status",
    headerName: "Trạng thái",
    width: 180,
    renderCell: (value, row) => {
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
        return STATUS_COLOR_MAP[status] || "default";
      };

      return (
        <>
          <Chip
            label={labelChip}
            color={getChipColor(row.status)}
            sx={(theme) => ({
              // backgroundColor: alpha(theme.palette.primary["main"], 0.2),
              // color: theme.palette.primary["dark"],
              // borderRadius: "0.275rem",
              // borderColor: "transparent",
            })}
          />
        </>
      );
    },
  },
  {
    id: "owner",
    field: "owner",
    headerName: "Người tạo",
    width: 220,
    renderCell: (value, row) => {
      return row.owner.profiles?.full_name;
    },
  },
  {
    id: "created",
    field: "created_at",
    headerName: "Ngày tạo",
    width: 220,
    renderCell: (value, row) => {
      return dayjs(row.created_at).format("HH:mm DD/MM/YYYY");
    },
  },
];
