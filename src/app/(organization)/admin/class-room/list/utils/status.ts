import { ClassRoomRuntimeStatusFilter, ClassRoomStatusFilter, ClassRoomTypeFilter } from "../types/types";

export const RUNTIME_STATUS_COLOR_MAP: Record<
  ClassRoomRuntimeStatusFilter,
  "primary" | "error" | "secondary" | "default" | "info" | "success"
> = {
  [ClassRoomRuntimeStatusFilter.All]: "default",
  [ClassRoomRuntimeStatusFilter.Ongoing]: "error",
  [ClassRoomRuntimeStatusFilter.Today]: "primary",
  [ClassRoomRuntimeStatusFilter.Upcoming]: "success",
  [ClassRoomRuntimeStatusFilter.Past]: "default",
  [ClassRoomRuntimeStatusFilter.Draft]: "info",
};

const STATUS_COLOR_MAP: Record<
  ClassRoomStatusFilter,
  "primary" | "error" | "secondary" | "default" | "info" | "success"
> = {
  [ClassRoomStatusFilter.All]: "default",
  [ClassRoomStatusFilter.Active]: "error",
  [ClassRoomStatusFilter.Daft]: "default",
  [ClassRoomStatusFilter.Deactive]: "success",
  [ClassRoomStatusFilter.Deleted]: "default",
  [ClassRoomStatusFilter.Pending]: "info",
  [ClassRoomStatusFilter.Publish]: "success",
};


export const STATUS_ORDER: ClassRoomRuntimeStatusFilter[] = [
  ClassRoomRuntimeStatusFilter.All,
  ClassRoomRuntimeStatusFilter.Ongoing,
  ClassRoomRuntimeStatusFilter.Today,
  ClassRoomRuntimeStatusFilter.Upcoming,
  ClassRoomRuntimeStatusFilter.Past,
  ClassRoomRuntimeStatusFilter.Draft,
];

export const CLASSROOM_RUNTIME_STATUS_LABEL: Record<ClassRoomRuntimeStatusFilter, string> = {
  [ClassRoomRuntimeStatusFilter.All]: "Tất cả",
  [ClassRoomRuntimeStatusFilter.Ongoing]: "Đang diễn ra",
  [ClassRoomRuntimeStatusFilter.Today]: "Diễn ra hôm nay",
  [ClassRoomRuntimeStatusFilter.Upcoming]: "Sắp diễn ra",
  [ClassRoomRuntimeStatusFilter.Past]: "Đã diễn ra",
  [ClassRoomRuntimeStatusFilter.Draft]: "Bản nháp",
};

export const CLASSROOM_TYPE_LABEL: Record<ClassRoomTypeFilter, string> = {
  [ClassRoomTypeFilter.All]: "Tất cả",
  [ClassRoomTypeFilter.Multiple]: "Chuỗi",
  [ClassRoomTypeFilter.Single]: "Đơn",
};

export const CLASSROOM_STATUS_LABEL: Record<ClassRoomStatusFilter, string> = {
  [ClassRoomStatusFilter.All]: "Tất cả",
  [ClassRoomStatusFilter.Active]: "Hoạt động",
  [ClassRoomStatusFilter.Daft]: "Bản nháp",
  [ClassRoomStatusFilter.Deactive]: "Vô hiệu hóa",
  [ClassRoomStatusFilter.Deleted]: "Đã xóa",
  [ClassRoomStatusFilter.Pending]: "Chờ kiểm duyệt",
  [ClassRoomStatusFilter.Publish]: "Xuất bản",
};

export const getClassRoomTypeLabel = (status: ClassRoomTypeFilter) =>
  CLASSROOM_TYPE_LABEL[status] ?? CLASSROOM_TYPE_LABEL[ClassRoomTypeFilter.All];

export const getClassRoomStatusLabel = (status: ClassRoomStatusFilter) =>
  CLASSROOM_STATUS_LABEL[status] ?? CLASSROOM_STATUS_LABEL[ClassRoomStatusFilter.All];

export const getColorClassRoomStatus = (status: ClassRoomStatusFilter) =>
  STATUS_COLOR_MAP[status] ?? STATUS_COLOR_MAP[ClassRoomStatusFilter.All];

export const getClassRoomRuntimeStatusLabel = (status: ClassRoomRuntimeStatusFilter) =>
  CLASSROOM_RUNTIME_STATUS_LABEL[status] ?? CLASSROOM_RUNTIME_STATUS_LABEL[ClassRoomRuntimeStatusFilter.All];

export const getColorClassRoomRuntimeStatus = (status: ClassRoomRuntimeStatusFilter) =>
  RUNTIME_STATUS_COLOR_MAP[status] ?? RUNTIME_STATUS_COLOR_MAP[ClassRoomRuntimeStatusFilter.All];

export const getStatusAndLabelBtnJoin = (status: ClassRoomRuntimeStatusFilter, isOnline: boolean): { label: string, disabled: boolean } => {
  switch (status) {
    case ClassRoomRuntimeStatusFilter.Draft:
      return {
        label: "Đăng tải",
        disabled: false,
      }
    case ClassRoomRuntimeStatusFilter.Upcoming:
    case ClassRoomRuntimeStatusFilter.Today:
    case ClassRoomRuntimeStatusFilter.Ongoing:
      if (isOnline) {
        return {
          label: "Vào lớp học",
          disabled: false,
        }
      } else {
        return {
          label: "Quét mã QR",
          disabled: false,
        }
      }
    case ClassRoomRuntimeStatusFilter.Past:
      return {
        label: "Đã diễn ra",
        disabled: true,
      }
    default:
      return {
        label: "Mặc định",
        disabled: false,
      }
  }
} 