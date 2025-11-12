"use client";
import { useMemo, useState } from "react";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    InputAdornment,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { Pagination } from "@/shared/ui/Pagination";
import { useUserOrganization } from "@/modules/organization/store/UserOrganizationProvider";
import { redirect } from "next/navigation";
import { SearchIcon } from "@/shared/assets/icons";
import { GetElearningsQueryInput, useGetElearningQuery } from "@/modules/elearning/operations/query";
import ElearningListTable from "./ElearningListTable";
import { ElearningFilters } from "../../types/types";

const PAGE_SIZE = 12;
const initialFilters: ElearningFilters = {
    search: "",
};

interface ElearningTabProps {
    isActive: boolean;
}

export default function ELearningTab({ isActive }: ElearningTabProps) {
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState<ElearningFilters>(initialFilters);
    const { organization, ...rest } = useUserOrganization((state) => state.data);
    const isAdmin = rest.employeeType === "admin";
    const isHasAccess = rest.employeeType === "admin" || rest.employeeType === "teacher"
    const organizationId = isActive && isAdmin ? organization?.id : undefined;
    const employeeId = isActive && rest.employeeType === "teacher" ? rest.id : undefined;

    const queryInput = useMemo<GetElearningsQueryInput>(() => {
        const trimmedSearch = filters.search.trim();
        return {
            q: trimmedSearch ? trimmedSearch : undefined,
            page,
            limit: PAGE_SIZE,
            orderField: "created_at",
            orderBy: "desc",
            organizationId,
            employeeId,
        };
    }, [employeeId, filters.search, organizationId, page]);

    const shouldFetch = isHasAccess && isActive;
    const { data: elearningsResult, isLoading, isError, refetch } =
        useGetElearningQuery(queryInput, { enabled: shouldFetch });

    const elearnings = elearningsResult?.data ?? [];
    const totalElearnings = elearningsResult?.total ?? 0;

    const handleSearchChange = (value: string) => {
        setPage(1);
        setFilters((prev) => ({
            ...prev,
            search: value,
        }));
    };


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
                <Box>
                    <TextField
                        value={filters.search}
                        onChange={(event) => handleSearchChange(event.target.value)}
                        placeholder="Tìm kiếm..."
                        size="small"
                        fullWidth
                        slotProps={{
                            input: {
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />
                </Box>

                {isLoading ? (
                    <Stack
                        alignItems="center"
                        justifyContent="center"
                        sx={{ py: 6 }}
                        spacing={2}
                    >
                        <CircularProgress />
                        <Typography variant="body2" color="text.secondary">
                            Đang tải danh sách khóa học eLearning...
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
                        Không thể tải danh sách khóa học eLearning. Vui lòng kiểm tra lại kết nối.
                    </Alert>
                ) : null}

                {!isLoading && !isError ? (
                    elearnings.length === 0 ? (
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
                                Không có khóa học phù hợp
                            </Typography>
                            <Typography variant="body2">
                                Hãy thử điều chỉnh lại từ khóa tìm kiếm hoặc làm mới dữ liệu.
                            </Typography>
                        </Box>
                    ) : (
                        <ElearningListTable
                            elearnings={elearnings}
                            page={page}
                            pageSize={queryInput.limit ?? PAGE_SIZE}
                            isAdmin={isAdmin}
                        />
                    )
                ) : null}
            </Stack>
            {totalElearnings > 0 ? (
                <Box mt={2}>
                    <Pagination
                        onChange={handlePaginationChange}
                        total={totalElearnings}
                        take={queryInput.limit ?? PAGE_SIZE}
                        value={page}
                        name="Khóa học eLearning"
                    />
                </Box>
            ) : null}
        </Box>
    );
}
