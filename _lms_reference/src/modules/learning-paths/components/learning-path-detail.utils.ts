import { fDateTime, FORMAT_DATE_TIME_CLEANER } from "@/lib";
import type {
  EmployeeLearningPathWithDetails,
  LearningPathMetadata,
  PhaseClassRoomWithDetails,
  PhaseWithClassRooms,
} from "@/repository/learning-paths";

export const DEFAULT_COMPLETION_CRITERIA = 80;
export const DEFAULT_DEADLINE_HOURS = 48;

const ASSIGNMENT_MODE_LABELS: Record<LearningPathMetadata["assignmentMode"], string> = {
  auto: "Gán tự động",
  manual: "Gán thủ công",
};

export const SECTION_CARD_SX = {
  borderRadius: 2,
  borderColor: "divider",
  boxShadow: "0 16px 40px rgba(15, 23, 42, 0.08)",
};

export interface SettingsItem {
  id: string;
  label: string;
}

export const getSettingsItems = (metadata: LearningPathMetadata | null): SettingsItem[] => {
  const completionCriteria = metadata?.completionCriteria ?? DEFAULT_COMPLETION_CRITERIA;
  const deadlineHours = metadata?.deadlineHours ?? DEFAULT_DEADLINE_HOURS;

  const deadlineLabel =
    metadata?.deadlineType === "hours"
      ? `Hoàn thành trong ${deadlineHours} giờ`
      : "Không giới hạn thời gian";

  return [
    {
      id: "",
      label: metadata?.sequentialLearning ? "Học tuần tự theo thời gian" : "Không yêu cầu học tuần tự",
    },
    {
      id: "completion",
      label: `Hoàn thành tối thiểu ${completionCriteria}% lộ trình`,
    },
    {
      id: "deadline",
      label: deadlineLabel,
    },
    {
      id: "retake",
      label: metadata?.allowRetake
        ? "Học viên có thể học lại lộ trình sau khi đã hoàn thành"
        : "Không cho phép học lại lộ trình sau khi hoàn thành",
    },
  ];
};

export const getEmployeeSearchValue = (employeeItem: EmployeeLearningPathWithDetails): string => {
  const profile = employeeItem.employee.profiles;
  return [
    employeeItem.employee.employee_code,
    employeeItem.employee.employee_type ?? "",
    profile.full_name,
    profile.email,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
};

export const getAssignmentModeLabel = (metadata: LearningPathMetadata | null): string => {
  if (!metadata) return "Gán tự động";
  return ASSIGNMENT_MODE_LABELS[metadata.assignmentMode];
};

export const getPhaseLabel = (phase: PhaseWithClassRooms, index: number): string => {
  const orderIndex = phase.order_index ?? index + 1;
  return `Giai đoạn ${orderIndex}`;
};

export const getClassRoomTitle = (classRoomItem: PhaseClassRoomWithDetails): string => {
  return classRoomItem.class_room.title || "Lớp học chưa đặt tên";
};

export const formatSessionTime = (startAt?: string | null, endAt?: string | null): string => {
  const startLabel = startAt ? fDateTime(startAt, FORMAT_DATE_TIME_CLEANER) : null;
  const endLabel = endAt ? fDateTime(endAt, FORMAT_DATE_TIME_CLEANER) : null;

  if (startLabel && endLabel) {
    return `${startLabel} - ${endLabel}`;
  }

  return startLabel || endLabel || "Chưa có lịch học";
};
