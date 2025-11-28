import { ClassRoomPriorityDto } from "@/types/dto/classRooms/classRoom.dto";
import { CLASSROOM_RUNTIME_STATUS_LABEL, RUNTIME_STATUS_COLOR_MAP } from "../../admin/class-room/list/utils/status";
import { ClassRoomRuntimeStatusFilter } from "@/repository/class-room/type";;

const SESSION_MODE_BADGE_LABEL = {
    online: "Online",
    offline: "Offline",
    live: "Live",
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

const isSameDay = (dateA: Date, dateB: Date) => {
    return (
        dateA.getFullYear() === dateB.getFullYear() &&
        dateA.getMonth() === dateB.getMonth() &&
        dateA.getDate() === dateB.getDate()
    );
};
export const getSessionMode = (
    sessions: ClassRoomPriorityDto["class_sessions"],
) => {

    if (!sessions || sessions.length === 0) {
        return {
            label: SESSION_MODE_BADGE_LABEL.pending,
            sessionType: null,
            isOnline: false,
        };
    }

    return {
        label: SESSION_MODE_BADGE_LABEL[sessions?.[0]?.session_type || 'live'],
        sessionType: sessions?.[0]?.session_type,
        isOnline: sessions?.[0]?.session_type === 'live' || sessions?.[0]?.session_type === 'online'
    };
};



export const getRuntimeStatusColor = (status: ClassRoomRuntimeStatusFilter): string => {
    const paletteKey = RUNTIME_STATUS_COLOR_MAP[status] ?? RUNTIME_STATUS_COLOR_MAP[ClassRoomRuntimeStatusFilter.All];
    return PALETTE_COLOR_TO_HEX[paletteKey] ?? PALETTE_COLOR_TO_HEX.default;
};



const resolveRuntimeStatusByTime = (
    startAt?: string | null,
    endAt?: string | null,
): ClassRoomRuntimeStatusFilter => {
    const startDate = startAt ? new Date(startAt) : null;
    const endDate = endAt ? new Date(endAt) : null;

    if (!startDate && !endDate) {
        return ClassRoomRuntimeStatusFilter.All;
    }

    const now = new Date();
    const effectiveEnd = endDate ?? startDate;

    if (effectiveEnd && effectiveEnd.getTime() < now.getTime()) {
        return ClassRoomRuntimeStatusFilter.Past;
    }

    if (startDate && startDate.getTime() <= now.getTime() && effectiveEnd && effectiveEnd.getTime() >= now.getTime()) {
        return ClassRoomRuntimeStatusFilter.Ongoing;
    }

    if (startDate) {
        if (isSameDay(startDate, now)) {
            return ClassRoomRuntimeStatusFilter.Today;
        }

        if (startDate.getTime() > now.getTime()) {
            return ClassRoomRuntimeStatusFilter.Upcoming;
        }
    }

    return ClassRoomRuntimeStatusFilter.All;
};

export const getRuntimeStatusDisplay = (
    startAt?: string | null,
    endAt?: string | null,
) => {
    const resolvedStatus = resolveRuntimeStatusByTime(startAt, endAt);
    const palette = RUNTIME_STATUS_COLOR_MAP[resolvedStatus] ?? RUNTIME_STATUS_COLOR_MAP[ClassRoomRuntimeStatusFilter.All];
    const color = PALETTE_COLOR_TO_HEX[palette!] ?? PALETTE_COLOR_TO_HEX.default;
    const label =
        CLASSROOM_RUNTIME_STATUS_LABEL[resolvedStatus] ?? CLASSROOM_RUNTIME_STATUS_LABEL[ClassRoomRuntimeStatusFilter.All];

    return { color, label, resolvedStatus };
};