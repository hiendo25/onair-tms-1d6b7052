import { NotificationType } from "@/model/notification.model";

const NOTIFICATION_OPTIONS: { label: string; value: NotificationType | "all"; count?: number }[] = [
  { value: "all", label: "Tất cả" },
  { value: "class_room", label: "Lớp học" },
  { value: "system", label: "Hệ thống" },
  // { value: "survey", label: "Khảo sát" },
] as const;
export { NOTIFICATION_OPTIONS };
