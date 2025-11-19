import { ClassRoomPriorityDto } from "@/types/dto/classRooms/classRoom.dto";
import { RUNTIME_STATUS_COLOR_MAP } from "../../admin/class-room/list/utils/status";
import { ClassRoomRuntimeStatusFilter } from "@/repository/class-room";;

const SESSION_MODE_BADGE_LABEL = {
    online: "Trực tuyến (Live)",
    offline: "Trực tiếp (In-House)",
    mixed: "Kết hợp",
    pending: "Chưa xác định",
} as const;

const PALETTE_COLOR_TO_HEX: Record<"primary" | "error" | "secondary" | "default" | "info" | "success", string> = {
    primary: "#2065D1",
    error: "#FF5630",
    success: "#36B37E",
    info: "#00B8D9",
    secondary: "#637381",
    default: "#637381",
};

export const getSessionMode = (
    sessions: ClassRoomPriorityDto["class_sessions"],
) => {

    if (!sessions || sessions.length === 0) {
        return {
            label: SESSION_MODE_BADGE_LABEL.pending,
            isOnline: false,
        };
    }

    const hasOnline = sessions.some((session) => Boolean(session?.is_online));
    const hasOffline = sessions.some((session) => session?.is_online === false);

    if (hasOnline && hasOffline) {
        return {
            label: SESSION_MODE_BADGE_LABEL.mixed,
            isOnline: false,
        };
    }

    return {
        label: hasOnline ? SESSION_MODE_BADGE_LABEL.online : SESSION_MODE_BADGE_LABEL.offline,
        isOnline: hasOnline
    };
};



export const getRuntimeStatusColor = (status: ClassRoomRuntimeStatusFilter): string => {
    const paletteKey = RUNTIME_STATUS_COLOR_MAP[status] ?? RUNTIME_STATUS_COLOR_MAP[ClassRoomRuntimeStatusFilter.All];
    return PALETTE_COLOR_TO_HEX[paletteKey] ?? PALETTE_COLOR_TO_HEX.default;
};