import { ClassRoomPriorityDto } from "@/types/dto/classRooms/classRoom.dto";
import { fDateTime } from "@/lib";
import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    Stack,
    Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { Image } from "@/shared/ui/Image";
import { ClassRoomRuntimeStatusFilter } from "../../admin/class-room/list/types/types";
import {
    CLASSROOM_RUNTIME_STATUS_LABEL,
    RUNTIME_STATUS_COLOR_MAP,
} from "../../admin/class-room/list/utils/status";

interface EnterClassRoomsDialogProps {
    open: boolean;
    onClose: () => void;
    sessions?: ClassRoomPriorityDto["class_sessions"];
    thumbnail?: string | null;
    classTitle?: string | null;
    onSelectSession: (sessionId: string) => void;
    actionLabel?: string;
}

const PALETTE_COLOR_TO_HEX: Record<
    "primary" | "error" | "secondary" | "default" | "info" | "success",
    string
> = {
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

const getRuntimeStatusDisplay = (
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

const JOINABLE_STATUSES: Set<ClassRoomRuntimeStatusFilter> = new Set([
    ClassRoomRuntimeStatusFilter.Ongoing,
    ClassRoomRuntimeStatusFilter.Today,
    ClassRoomRuntimeStatusFilter.Upcoming,
]);

const EnterClassRoomsDialog = ({
    open,
    onClose,
    sessions = [],
    thumbnail,
    classTitle,
    onSelectSession,
    actionLabel = "Tham gia",
}: EnterClassRoomsDialogProps) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="md"
        >
            <DialogTitle sx={{ px: 3, py: 2.5 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                    <Typography variant="h6" fontWeight={600}>
                        Vào lớp học
                    </Typography>
                    <IconButton aria-label="close-enter-classrooms-dialog" onClick={onClose} edge="end">
                        <CloseIcon />
                    </IconButton>
                </Stack>
            </DialogTitle>

            <DialogContent dividers sx={{ px: 3, py: 1.5 }}>
                <Stack spacing={2.5}>
                    {sessions.length === 0 ? (
                        <Box py={4} textAlign="center">
                            <Typography variant="body1" fontWeight={600} color="text.secondary">
                                Hiện chưa có buổi học nào cho lớp{" "}
                                <Typography component="span" fontWeight={700} color="text.primary">
                                    {classTitle ?? ""}
                                </Typography>
                            </Typography>
                        </Box>
                    ) : null}

                    {sessions.map((session, index) => {
                        const {
                            color: statusColor,
                            label: statusLabel,
                            resolvedStatus,
                        } = getRuntimeStatusDisplay(session.start_at, session.end_at);
                        const canJoin = JOINABLE_STATUSES.has(resolvedStatus) && Boolean(session.id);

                        return (
                            <Box key={session.id ?? index}>
                                <Stack
                                    direction={{ xs: "column", sm: "row" }}
                                    spacing={2}
                                    alignItems={{ xs: "flex-start", sm: "stretch" }}
                                >
                                    <Box
                                        sx={{
                                            width: { xs: "100%", sm: 152 },
                                            flexShrink: 0,
                                        }}
                                    >
                                        <Image
                                            src={thumbnail}
                                            alt={session.title ?? `Buổi học ${index + 1}`}
                                            ratio="16/9"
                                            className="rounded-lg"
                                        />
                                    </Box>

                                    <Stack flex={1} spacing={1}>
                                        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                                            <Chip
                                                size="small"
                                                label={`Lớp học ${index + 1}`}
                                                color="primary"
                                                variant="outlined"
                                            />
                                            <Stack direction="row" spacing={0.75} alignItems="center">
                                                <Box
                                                    sx={{
                                                        width: 6,
                                                        height: 6,
                                                        borderRadius: "50%",
                                                        backgroundColor: statusColor,
                                                    }}
                                                />
                                                <Typography
                                                    variant="body2"
                                                    sx={{ color: statusColor, fontWeight: 600 }}
                                                >
                                                    {statusLabel}
                                                </Typography>
                                            </Stack>
                                        </Stack>

                                        <Stack direction="row" alignItems="center" spacing={1} mt={0.5}>
                                            <AccessTimeIcon sx={{ width: 20, height: 20, color: "#637381" }} />
                                            <Typography variant="body2" color="text.secondary">
                                                {session.start_at ? fDateTime(session.start_at) : "--"}{" "}
                                                {session.end_at ? ` - ${fDateTime(session.end_at)}` : ""}
                                            </Typography>
                                        </Stack>

                                        <Typography variant="subtitle1" fontWeight={600}>
                                            {session.title ?? `Buổi học ${index + 1}`}
                                        </Typography>

                                    </Stack>

                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: { xs: "flex-start", sm: "center" },
                                            justifyContent: { xs: "flex-start", sm: "flex-end" },
                                            width: { xs: "100%", sm: 132 },
                                        }}
                                    >
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            disabled={!canJoin}
                                            onClick={() => canJoin && session.id && onSelectSession(session.id)}
                                            sx={{ minWidth: 120 }}
                                        >
                                            {actionLabel}
                                        </Button>
                                    </Box>
                                </Stack>

                                {index < sessions.length - 1 ? <Divider sx={{ mt: 2.5 }} /> : null}
                            </Box>
                        );
                    })}
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button variant="outlined" onClick={onClose}>
                    Đóng
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EnterClassRoomsDialog;
