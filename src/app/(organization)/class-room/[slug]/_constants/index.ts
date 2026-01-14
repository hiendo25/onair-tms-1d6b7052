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
} as const;

export const CLASS_SESSION_TYPE = {
  OFFLINE: "offline",
  ONLINE: "online",
  LIVE: "live",
} as const;
