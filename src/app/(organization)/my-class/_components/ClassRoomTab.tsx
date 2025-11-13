"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import {
    Box,
    CircularProgress,
    Grid,
    InputAdornment,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import ClassRoomStatusTabs from "./ClassRoomStatusTabs";
import {
    useCountStatusClassRoomsQuery,
    useGetClassRoomsByEmployeeId,
} from "@/modules/class-room-management/operations/query";
import {
    ClassRoomRuntimeStatusFilter,
    ClassRoomTypeFilter,
    ClassSessionModeFilter,
} from "../../admin/class-room/list/types/types";
import SearchIcon from "@mui/icons-material/Search";
import { SelectOption } from "@/shared/ui/form/SelectOption";
import { useUserOrganization } from "@/modules/organization/store/UserOrganizationProvider";
import { Pagination } from "@/shared/ui/Pagination";
import {
    CLASSROOM_RUNTIME_STATUS_LABEL,
    getColorClassRoomRuntimeStatus,
    getStatusAndLabelBtnJoin,
    RUNTIME_STATUS_COLOR_MAP
} from "../../admin/class-room/list/utils/status";
import { ClassRoomPriorityDto } from "@/types/dto/classRooms/classRoom.dto";
import { SESSION_MODE_OPTIONS, TYPE_OPTIONS } from "../../admin/class-room/list/constants";
import ClassRoomCard from "./ClassRoomCard";

const PAGE_SIZE = 12;

interface IClassRoomTab {
    isActive: boolean;
}

const SESSION_MODE_BADGE_LABEL = {
    online: "Trực tuyến (Live)",
    offline: "Trực tiếp (In-House)",
    mixed: "Kết hợp",
    pending: "Chưa xác định",
} as const;

const getSessionMode = (
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
const PALETTE_COLOR_TO_HEX: Record<"primary" | "error" | "secondary" | "default" | "info" | "success", string> = {
    primary: "#2065D1",
    error: "#FF5630",
    success: "#36B37E",
    info: "#00B8D9",
    secondary: "#637381",
    default: "#637381",
};

const getRuntimeStatusColor = (status: ClassRoomRuntimeStatusFilter): string => {
    const paletteKey = RUNTIME_STATUS_COLOR_MAP[status] ?? RUNTIME_STATUS_COLOR_MAP[ClassRoomRuntimeStatusFilter.All];
    return PALETTE_COLOR_TO_HEX[paletteKey] ?? PALETTE_COLOR_TO_HEX.default;
};

const ClassRoomTab = ({ isActive }: IClassRoomTab) => {
    const userOrganization = useUserOrganization((state) => state.data);
    const employeeId = isActive && userOrganization?.id ? userOrganization?.id : undefined;

    const [search, setSearch] = useState("");
    const [runtimeStatus, setRuntimeStatus] = useState<ClassRoomRuntimeStatusFilter>(ClassRoomRuntimeStatusFilter.All);
    const [selectedType, setSelectedType] = useState<ClassRoomTypeFilter>(ClassRoomTypeFilter.All);
    const [selectedSessionMode, setSelectedSessionMode] = useState<ClassSessionModeFilter>(ClassSessionModeFilter.All);
    const [page, setPage] = useState(1);

    const classRoomQueryInput = useMemo(() => {
        const trimmedSearch = search.trim();
        return {
            employeeId,
            page,
            limit: PAGE_SIZE,
            q: trimmedSearch ? trimmedSearch : undefined,
            runtimeStatus,
            type: selectedType,
            sessionMode: selectedSessionMode,
            orderField: "created_at" as const,
            orderBy: "desc" as const,
        };
    }, [employeeId, page, runtimeStatus, search, selectedSessionMode, selectedType]);

    const { data: classRoomsResult, isLoading } = useGetClassRoomsByEmployeeId(classRoomQueryInput);

    const classRooms = classRoomsResult?.data ?? [];
    const totalClassRooms = classRoomsResult?.total ?? 0;
    const take = classRoomsResult?.limit ?? PAGE_SIZE;
    const totalPages = Math.max(1, Math.ceil(totalClassRooms / take));

    useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages);
        }
    }, [page, totalPages]);

    const statusCountInput = useMemo(
        () => ({
            employeeId,
            q: classRoomQueryInput.q,
            from: undefined,
            to: undefined,
            type: selectedType,
            sessionMode: selectedSessionMode,
        }),
        [employeeId, classRoomQueryInput.q, selectedSessionMode, selectedType],
    );

    const { data: runtimeStatusCounts } = useCountStatusClassRoomsQuery(statusCountInput);

    const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
        setSearch(event.target.value);
        setPage(1);
    };

    const handleStatusChange = (status: ClassRoomRuntimeStatusFilter) => {
        setRuntimeStatus(status);
        setPage(1);
    };

    const handleTypeFilterChange = (value: string) => {
        setSelectedType(value as ClassRoomTypeFilter);
        setPage(1);
    };

    const handleSessionModeChange = (value: string) => {
        setSelectedSessionMode(value as ClassSessionModeFilter);
        setPage(1);
    };

    const handlePaginationChange = (nextPage: number) => {
        setPage(nextPage);
    };

    const showEmptyState = !isLoading && totalClassRooms === 0;

    return (
        <Box className="bg-white rounded-2xl p-4">
            <Stack direction="row" justifyContent="space-between" flexWrap="wrap" gap={2}>
                <TextField
                    placeholder="Tìm kiếm..."
                    value={search}
                    onChange={handleSearchChange}
                    slotProps={{
                        input: {
                            endAdornment: (
                                <InputAdornment position="end">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        },
                    }}
                    size="small"
                    className="max-w-[223px]"
                />

                <Stack direction="row" spacing={0.5}>
                    <SelectOption
                        inputLabel="Loại lớp học"
                        onChange={handleTypeFilterChange}
                        value={selectedType}
                        size="small"
                        options={TYPE_OPTIONS}
                        className="block w-[130px]"
                    />

                    <SelectOption
                        inputLabel="Hình thức"
                        onChange={handleSessionModeChange}
                        value={selectedSessionMode}
                        size="small"
                        options={SESSION_MODE_OPTIONS}
                        className="block w-[130px]"
                    />
                </Stack>
            </Stack>

            <Stack
                mt={2}
                direction={{ xs: "column", md: "row" }}
                spacing={2}
                alignItems={{ xs: "stretch", md: "center" }}
            >
                <Box flex={1} sx={{ minWidth: 0 }}>
                    <ClassRoomStatusTabs
                        value={runtimeStatus}
                        onChange={handleStatusChange}
                        counts={runtimeStatusCounts ?? []}
                    />
                </Box>
            </Stack>

            {isLoading ? (
                <Stack
                    alignItems="center"
                    justifyContent="center"
                    spacing={2}
                    sx={{ py: 6 }}
                >
                    <CircularProgress />
                    <Typography variant="body2" color="text.secondary">
                        Đang tải lớp học của bạn...
                    </Typography>
                </Stack>
            ) : null}

            {showEmptyState ? (
                <Box
                    sx={{
                        mt: 4,
                        py: 6,
                        px: 3,
                        border: "1px dashed",
                        borderColor: "divider",
                        borderRadius: 3,
                        textAlign: "center",
                        color: "text.secondary",
                    }}
                >
                    <Typography variant="h6" gutterBottom>
                        Không tìm thấy lớp học phù hợp
                    </Typography>
                    <Typography variant="body2">
                        Hãy thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác.
                    </Typography>
                </Box>
            ) : null}

            {!isLoading && classRooms.length > 0 ? (
                <Grid container columns={12} spacing={2} mt={4}>
                    {classRooms.map((item) => {
                        const runtimeStatusKey =
                            (item.runtime_status as ClassRoomRuntimeStatusFilter) ?? ClassRoomRuntimeStatusFilter.All;
                        const runtimeStatusLabel =
                            CLASSROOM_RUNTIME_STATUS_LABEL[runtimeStatusKey] ?? item.runtime_status ?? "Chưa xác định";
                        const runtimeStatusColor = getRuntimeStatusColor(runtimeStatusKey)
                        const { label: sessionModeLabel, isOnline } = getSessionMode(item.class_sessions);
                        const participantCount = item.studentCount?.[0]?.count ?? 0;
                        const { label: actionLabel, disabled: actionDisabled } =
                            getStatusAndLabelBtnJoin(runtimeStatusKey, isOnline);

                        return (
                            <Grid key={item.id ?? item.slug} size={{ xs: 12, md: 6, lg: 3 }}>
                                <ClassRoomCard
                                    isOnline={isOnline}
                                    actionDisabled={actionDisabled}
                                    actionLabel={actionLabel}
                                    end_at={item.end_at!}
                                    start_at={item.start_at!}
                                    participantCount={participantCount}
                                    runtimeStatusColor={runtimeStatusColor!}
                                    runtimeStatusLabel={runtimeStatusLabel}
                                    sessionModeLabel={sessionModeLabel}
                                    thumbnail={item.thumbnail_url ?? ""}
                                    title={item.title!}
                                    slug={item.slug ?? ""}
                                    classRoomId={item.id ?? undefined}
                                    roomType={(item.room_type as ClassRoomTypeFilter) ?? ClassRoomTypeFilter.Single}
                                    sessions={item.class_sessions ?? []}
                                />
                            </Grid>
                        );
                    })}
                </Grid>
            ) : null}

            {!isLoading && totalClassRooms > 0 ? (
                <Pagination
                    onChange={handlePaginationChange}
                    total={totalClassRooms}
                    take={take}
                    value={page}
                    name="Lớp học"
                    sx={{ mt: 4 }}
                />
            ) : null}
        </Box>
    );
};

export default ClassRoomTab;
