"use client";
import { useMemo, useState } from "react";
import dayjs from "dayjs";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Stack,
    Tab,
    Tabs,
    Typography,
} from "@mui/material";
import {
    ClassRoomFilters,
    ClassRoomRuntimeStatusFilter,
    ClassRoomStatusFilter,
    ClassRoomTypeFilter,
    ClassSessionModeFilter,
} from "../types/types";
import {
    GetClassRoomsQueryInput,
    useGetClassRoomsPriorityQuery,
} from "@/modules/class-room-management/operations/query";
import { Pagination } from "@/shared/ui/Pagination";
import ClassRoomListFilters from "./ClassRoomCourseFilters";
import { useUserOrganization } from "@/modules/organization/store/UserOrganizationProvider";
import ClassRoomListTable from "./ClassRoomListTable";
import { redirect } from "next/navigation";

const initialFilters: ClassRoomFilters = {
    type: ClassRoomTypeFilter.All,
    sessionMode: ClassSessionModeFilter.All,
    runtimeStatus: ClassRoomRuntimeStatusFilter.All,
    status: ClassRoomStatusFilter.All,
    search: "",
    startDate: null,
    endDate: null,
};

const PAGE_SIZE = 12;

interface ClassRoomTabProps {
    isActive: boolean;
}

export default function ClassRoomTab({ isActive }: ClassRoomTabProps) {
    const [filters, setFilters] = useState<ClassRoomFilters>(initialFilters);
    const [page, setPage] = useState(1);
    const { organization, ...rest } = useUserOrganization((state) => state.data);
    const isAdmin = rest.employeeType === "admin";
    const isHasAccess = rest.employeeType === "admin" || rest.employeeType === "teacher"
    const organizationId = isActive && isAdmin ? organization?.id : undefined;
    const employeeId = isActive && rest.employeeType === "teacher" ? rest.id : undefined;

    const queryInput = useMemo<GetClassRoomsQueryInput>(() => {
        const trimmedSearch = filters.search.trim();
        return {
            q: trimmedSearch ? trimmedSearch : undefined,
            from: filters.startDate
                ? dayjs(filters.startDate).startOf("day").toISOString()
                : undefined,
            to: filters.endDate
                ? dayjs(filters.endDate).endOf("day").toISOString()
                : undefined,
            runtimeStatus: filters.runtimeStatus,
            status: filters.status,
            type: filters.type,
            sessionMode: filters.sessionMode,
            page,
            limit: PAGE_SIZE,
            organizationId,
            employeeId,
            orderField: "created_at",
            orderBy: "desc"
        };
    }, [filters.search, filters.startDate, filters.endDate, filters.runtimeStatus, filters.status, filters.type, filters.sessionMode, page, organizationId, employeeId]);

    const { data: classRoomsResult, isLoading, isError, refetch } =
        useGetClassRoomsPriorityQuery(queryInput);

    const classRooms = classRoomsResult?.data ?? [];
    const totalClassRooms = classRoomsResult?.total ?? 0;

    const handleSearchChange = (value: string) => {
        setPage(1);
        setFilters((prev) => ({
            ...prev,
            search: value,
        }));
    };

    const handleDateChange = (
        field: "startDate" | "endDate",
        value: string | null,
    ) => {
        setPage(1);
        setFilters((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleRuntimeStatusChange = (runtimeStatus: ClassRoomRuntimeStatusFilter) => {
        setPage(1);
        setFilters((prev) => ({
            ...prev,
            runtimeStatus,
        }));
    }

    const handleStausChange = (status: ClassRoomStatusFilter) => {
        setPage(1);
        setFilters((prev) => ({
            ...prev,
            status,
        }));
    }

    const handleTypeChange = (type: ClassRoomTypeFilter) => {
        setPage(1);
        setFilters((prev) => ({
            ...prev,
            type,
        }));
    }

    const handleSessionModeChange = (mode: ClassSessionModeFilter) => {
        setPage(1);
        setFilters((prev) => ({
            ...prev,
            sessionMode: mode,
        }));
    }

    const handlePaginationChange = (nextPage: number) => {
        setPage(nextPage);
    };

    if (!isHasAccess) {
        redirect('/403');
    }

    return (
        <Box
            bgcolor={"#fff"}
            borderRadius={2}
            p={2}
        >
            <Stack spacing={3}>
                <ClassRoomListFilters
                    type={filters.type}
                    sessionMode={filters.sessionMode}
                    search={filters.search}
                    startDate={filters.startDate}
                    endDate={filters.endDate}
                    runtimeStatus={filters.runtimeStatus}
                    status={filters.status}
                    onSearchChange={handleSearchChange}
                    onDateChange={handleDateChange}
                    onRuntimeStatusChange={handleRuntimeStatusChange}
                    onStausChange={handleStausChange}
                    onTypeChange={handleTypeChange}
                    onSessionModeChange={handleSessionModeChange}
                />

                {isLoading ? (
                    <Stack
                        alignItems="center"
                        justifyContent="center"
                        sx={{ py: 6 }}
                        spacing={2}
                    >
                        <CircularProgress />
                        <Typography variant="body2" color="text.secondary">
                            Đang tải danh sách lớp học...
                        </Typography>
                    </Stack>
                ) : null}

                {isError ? (
                    <Alert
                        severity="error"
                        action={
                            <Button color="inherit" size="small" onClick={() => refetch()}>
                                Thử lại
                            </Button>
                        }
                    >
                        Không thể tải danh sách lớp học. Vui lòng kiểm tra lại kết nối.
                    </Alert>
                ) : null}

                {!isLoading && !isError ? (
                    classRooms.length === 0 ? (
                        <Box
                            sx={{
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
                                Không có lớp học phù hợp
                            </Typography>
                            <Typography variant="body2">
                                Hãy thử điều chỉnh lại bộ lọc hoặc làm mới dữ liệu.
                            </Typography>
                        </Box>
                    ) : (
                        <ClassRoomListTable
                            classRooms={classRooms}
                            page={queryInput.page ?? 1}
                            pageSize={queryInput.limit ?? PAGE_SIZE}
                            isAdmin={isAdmin}
                        />
                    )
                ) : null}
            </Stack>
            {totalClassRooms > 0 ? (
                <Box mt={2}>
                    <Pagination
                        onChange={handlePaginationChange}
                        total={totalClassRooms}
                        take={PAGE_SIZE}
                        value={page}
                        name="Lớp học"
                    />
                </Box>
            ) : null}
        </Box>
    );
}
