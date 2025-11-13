import GoogleMeetIcon from "@/shared/assets/icons/GoogleMeetIcon";
import MicrosoftTeamIcon from "@/shared/assets/icons/MicrosoftTeamIcon";
import ZoomIcon from "@/shared/assets/icons/ZoomIcon";
import { Constants, Database } from "@/types/supabase.types";

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