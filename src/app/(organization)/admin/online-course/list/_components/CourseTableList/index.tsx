"use client";
import { useCallback, useMemo, useState } from "react";
import { Alert, Box, Button, CircularProgress, InputAdornment, Stack, TextField, Typography } from "@mui/material";
import { useUserOrganization } from "@/modules/organization/store/UserOrganizationProvider";
import { SearchIcon } from "@/shared/assets/icons";
import { GetElearningsQueryInput } from "@/modules/elearning/operations/query";
import { useGetCourseListQuery } from "@/modules/courses/operations/query";
import Link from "next/link";
import { PATHS } from "@/constants/path.contstants";
import { DataGrid, DataGridProps } from "@mui/x-data-grid";
import { columns } from "./columns";

const PAGE_SIZE = 10;
const initialFilters = {
  search: "",
};

interface CourseTableListProps {
  className?: string;
}

export default function CourseTableList({ className }: CourseTableListProps) {
  const [page, setPage] = useState(1);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [filters, setFilters] = useState<typeof initialFilters>(initialFilters);
  const { organization, employeeType, ...rest } = useUserOrganization((state) => state.data);

  const employeeId = employeeType === "teacher" ? rest.id : undefined;

  const queryInput = useMemo<GetElearningsQueryInput>(() => {
    const trimmedSearch = filters.search.trim();
    return {
      q: trimmedSearch ? trimmedSearch : undefined,
      page,
      limit: PAGE_SIZE,
      orderField: "created_at",
      orderBy: "desc",
      organizationId: organization.id,
      employeeId,
    };
  }, [employeeId, filters.search, page]);

  const { data: course, isLoading, isError, refetch, isPending } = useGetCourseListQuery({ queryParams: queryInput });

  const coursesList = course?.data || [];
  const totalCourses = course?.count ?? 0;

  const handleSearchChange = (value: string) => {
    setPage(1);
    setFilters((prev) => ({
      ...prev,
      search: value,
    }));
  };

  const handlePaginationModelChange: Exclude<DataGridProps["onPaginationModelChange"], undefined> = useCallback(
    (paginationModel) => {
      setPaginationModel(paginationModel);
    },
    [],
  );

  return (
    <Box bgcolor={"#fff"} borderRadius={2} p={2}>
      <div className="flex items-center justify-between gap-2 mb-3">
        <Box component="div" className="w-full max-w-[360px] block">
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
        <Link href={PATHS.COURSES.CREATE}>
          <Button
            variant="contained"
            color="primary"
            sx={{
              minWidth: { xs: "100%", lg: 160 },
              flex: { xs: "1 1 100%", lg: "0 0 auto" },
              alignSelf: { xs: "stretch", lg: "center" },
              py: 1.1,
            }}
          >
            Tạo môn học
          </Button>
        </Link>
      </div>

      <Stack spacing={3}>
        {isLoading ? (
          <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }} spacing={2}>
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
          coursesList.length === 0 ? (
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
              <Typography variant="body2">Hãy thử điều chỉnh lại từ khóa tìm kiếm hoặc làm mới dữ liệu.</Typography>
            </Box>
          ) : (
            <Box
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                overflow: "hidden",
                backgroundColor: "#fff",
              }}
            >
              <DataGrid
                rows={coursesList}
                columns={columns}
                rowCount={totalCourses}
                loading={isPending}
                density="standard"
                pageSizeOptions={[10, 15, 20]}
                disableColumnSelector
                disableColumnSorting
                disableColumnResize
                disableRowSelectionOnClick
                disableColumnMenu
                paginationMode="server"
                paginationModel={paginationModel}
                onPaginationModelChange={isPending ? undefined : handlePaginationModelChange}
                sx={{
                  border: 0,
                  ".MuiDataGrid-columnHeaders": {
                    ".MuiDataGrid-columnHeaderCheckbox": {
                      pointerEvents: "none",
                    },
                  },
                }}
              />
            </Box>
          )
        ) : null}
      </Stack>
    </Box>
  );
}
