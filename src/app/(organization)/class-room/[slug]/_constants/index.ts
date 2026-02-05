import GoogleMeetIcon from "@/shared/assets/icons/GoogleMeetIcon";
import MicrosoftTeamIcon from "@/shared/assets/icons/MicrosoftTeamIcon";
import ZoomIcon from "@/shared/assets/icons/ZoomIcon";
import { Constants } from "@/types/supabase.types";

export const ROOM_PROVIDERS = Constants.public.Enums.channel_provider.reduce(
  (acc, provider) => {
    let icon = null;
    switch (provider) {
      case "zoom":
        icon = ZoomIcon;
        break;
      case "google_meet":
        icon = GoogleMeetIcon;
        break;
      case "microsoft_teams":
        icon = MicrosoftTeamIcon;
        break;
      default:
        icon = null;
    }

    let label = "";
    switch (provider) {
      case "zoom":
        label = "Zoom";
        break;
      case "google_meet":
        label = "Google Meet";
        break;
      case "microsoft_teams":
        label = "Microsoft Teams";
        break;
      default:
        label = "Unknown";
    }
    acc[provider] = {
      label,
      icon,
    };
    return acc;
  },
  {} as Record<
    string,
    {
      label: string;
      icon: React.FC<React.SVGProps<SVGSVGElement>> | null;
    }
  >,
);

export const queryClassName = "scroll__to__view";

export const CLASSROOM_DETAIL_PAGE_TITLE = "Chi tiết lớp học";
export const CLASSROOM_DETAIL_BREADCRUMB_FALLBACK = "Chi tiết";
export const CLASSROOM_LIST_BREADCRUMB = {
  title: "Lớp học",
  path: "/class-room/list",
} as const;
export const MAIN_LAYOUT_CONTENT_SELECTOR = ".main-layout__content";
export const JOIN_HORIZONTAL_ZONE_CLASS = "join-horizontal-zone";
export const CLASSROOM_SCROLL_OFFSET_RATIO = -0.1;

export const CLASSROOM_DETAIL_TEXT = {
  EMPTY_INFO: "Chưa có thông tin",
  SCHEDULE_FALLBACK: "Thời gian chưa được cập nhật",
  WEEKLY_LABEL: "Lặp lại hàng tuần",
  EXAMS_EMPTY_TITLE: "Chưa có bài kiểm tra",
  EXAMS_EMPTY_DESCRIPTION: "Hiện chưa có bài kiểm tra cho lớp học này.",
  STUDENTS_EMPTY_TITLE: "Chưa có học viên",
  STUDENTS_EMPTY_DESCRIPTION: "Hiện chưa có học viên trong lớp học này.",
} as const;

export const CLASSROOM_STUDENT_STATUS_TEXT = {
  ATTENDANCE: {
    attended: "Đã điểm danh",
    absent: "Chưa điểm danh",
  },
  EXAM_RESULT: {
    passed: "Đạt",
    failed: "Chưa đạt",
    pending: "Chưa chấm",
    not_submitted: "Chưa nộp",
  },
  GRADING_STATUS: {
    graded: "Đã chấm",
    submitted: "Chưa chấm",
    not_submitted: "Chưa nộp",
  },
} as const;

export const CLASS_SESSION_TYPE = {
  OFFLINE: "offline",
  ONLINE: "online",
  LIVE: "live",
} as const;

export const CLASSROOM_DETAIL_TAB_KEYS = {
  OVERVIEW: "overview",
  SUBJECTS: "subjects",
  EXAMS: "exams",
  STUDENTS: "students",
} as const;

export const CLASSROOM_DETAIL_SECTION_TITLES = {
  OVERVIEW: "Thông tin chung",
  SUBJECTS: "Môn học",
  EXAMS: "Bài kiểm tra",
  STUDENTS: "Danh sách học viên",
} as const;

export const CLASSROOM_DETAIL_TAB_ITEMS = [
  { tabKey: CLASSROOM_DETAIL_TAB_KEYS.OVERVIEW, tabLabel: CLASSROOM_DETAIL_SECTION_TITLES.OVERVIEW },
  { tabKey: CLASSROOM_DETAIL_TAB_KEYS.SUBJECTS, tabLabel: CLASSROOM_DETAIL_SECTION_TITLES.SUBJECTS },
  { tabKey: CLASSROOM_DETAIL_TAB_KEYS.EXAMS, tabLabel: CLASSROOM_DETAIL_SECTION_TITLES.EXAMS },
  { tabKey: CLASSROOM_DETAIL_TAB_KEYS.STUDENTS, tabLabel: CLASSROOM_DETAIL_SECTION_TITLES.STUDENTS },
] as const;
