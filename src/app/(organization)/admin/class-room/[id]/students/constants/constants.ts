export const STUDENT_TABLE_HEAD = [
  { id: "name", label: "Họ và tên", width: 240, align: "left" as const },
  { id: "email", label: "Email", width: 220, align: "left" as const },
  { id: "phone", label: "Số điện thoại", width: 160, align: "left" as const },
  { id: "branch", label: "Chi nhánh", width: 160, align: "left" as const },
  { id: "department", label: "Phòng ban", width: 160, align: "left" as const },
  { id: "assignedAt", label: "Thời gian gán", width: 160, align: "center" as const },
  // { id: "attendance", label: "Điểm danh", width: 140, align: "center" as const },
  // { id: "checkIn", label: "Thời gian vào lớp", width: 140, align: "center" as const },
  // { id: "checkOut", label: "Thời gian kết thúc", width: 140, align: "center" as const },
  { id: "action", label: "Hành động", width: 140, align: "center" as const },
];

export const ATTENDANCE_LABELS: Record<
  NonNullable<"attended" | "absent" | "pending">,
  string
> = {
  attended: "Tham gia",
  absent: "Vắng mặt",
  pending: "Chưa xác định",
};


export const ATTENDANCE_OPTIONS = [
  { label: "Tất cả", value: "all", display: true },
  { label: "Tham gia", value: "attended", display: true },
  { label: "Vắng mặt", value: "absent", display: true },
  { label: "Chưa xác định", value: "pending", display: true },
];