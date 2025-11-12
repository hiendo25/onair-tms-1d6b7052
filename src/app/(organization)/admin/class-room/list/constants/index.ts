import { ClassRoomRuntimeStatusFilter, ClassRoomStatusFilter, ClassRoomTypeFilter, ClassSessionModeFilter } from "../types/types";

export const TABLE_HEAD_CLASS_ROOM = [
    { id: "stt", label: "STT", width: 72, align: "center" as const },
    { id: "name", label: "Tên lớp học", width: 300, align: "left" as const },
    { id: "type", label: "Loại lớp học", width: 200, align: "center" as const },
    { id: "students", label: "Học viên", width: 50, align: "center" as const },
    { id: "runtimeStatus", label: "Trạng thái diễn ra", width: 180, align: "center" as const },
    { id: "teachers", label: "Giảng viên", width: 100, align: "center" as const },
    { id: "status", label: "Trạng thái xuất bản", width: 180, align: "center" as const },
    { id: "time", label: "Thời gian", width: 150, align: "center" as const },
    { id: "action", label: "Hành động", width: 100, align: "center" as const },
];

export const TABLE_HEAD_ELEARNING = [
    { id: "stt", label: "STT", width: 72, align: "center" as const },
    { id: "name", label: "Tên lớp học", width: 300, align: "left" as const },
    { id: "type", label: "Loại lớp học", width: 200, align: "center" as const },
    { id: "students", label: "Học viên", width: 50, align: "center" as const },
    { id: "teachers", label: "Giảng viên", width: 100, align: "center" as const },
    { id: "action", label: "Hành động", width: 120, align: "center" as const },
];

export const RUNTIME_STATUS_OPTIONS = [
    { label: "Tất cả", value: ClassRoomRuntimeStatusFilter.All, display: true },
    { label: "Đang diễn ra", value: ClassRoomRuntimeStatusFilter.Ongoing, display: true },
    { label: "Diễn ra hôm nay", value: ClassRoomRuntimeStatusFilter.Today, display: true },
    { label: "Sắp diễn ra", value: ClassRoomRuntimeStatusFilter.Upcoming, display: true },
    { label: "Đã diễn ra", value: ClassRoomRuntimeStatusFilter.Past, display: true },
    { label: "Nháp", value: ClassRoomRuntimeStatusFilter.Draft, display: false },
];

export const PUBLICATION_STATUS_OPTIONS = [
    { label: "Tất cả", value: ClassRoomStatusFilter.All, display: true },
    { label: "Bản nháp", value: ClassRoomStatusFilter.Daft, display: true },
    { label: "Chờ kiểm duyệt", value: ClassRoomStatusFilter.Pending, display: true },
    { label: "Xuất bản", value: ClassRoomStatusFilter.Publish, display: true },
    { label: "Đang hoạt động", value: ClassRoomStatusFilter.Active, display: true },
    { label: "Bị tạm dừng", value: ClassRoomStatusFilter.Deactive, display: false },
    { label: "Đã xoá", value: ClassRoomStatusFilter.Deleted, display: false },
];

export const TYPE_OPTIONS = [
    { label: "Tất cả", value: ClassRoomTypeFilter.All, display: true },
    { label: "Đơn", value: ClassRoomTypeFilter.Single, display: true },
    { label: "Chuỗi", value: ClassRoomTypeFilter.Multiple, display: true },
];

export const SESSION_MODE_OPTIONS = [
    { label: "Tất cả", value: ClassSessionModeFilter.All, display: true },
    { label: "Online", value: ClassSessionModeFilter.Online, display: true },
    { label: "Offline", value: ClassSessionModeFilter.Offline, display: true },
];
