"use client";
import { useCallback, useMemo, useState } from "react";
import { Alert, Box, Button, InputAdornment, Stack, TextField } from "@mui/material";
import { useUserOrganization } from "@/modules/organization/store/UserOrganizationProvider";
import { SearchIcon } from "@/shared/assets/icons";
import { useGetCourseListQuery } from "@/modules/courses/operations/query";
import Link from "next/link";
import { PATHS } from "@/constants/path.contstants";
import TableData, { TableDataProps } from "@/shared/ui/TableData";
import { columnsCourse } from "./column-course";
import useDebounce from "@/hooks/useDebounce";
import { GetCoursesQueryParams } from "@/repository/courses";

const PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [10, 20, 40, 100];
const PAGE = 1;

interface CourseTableListProps {
  className?: string;
}
export default function CourseTableList({ className }: CourseTableListProps) {
  const {
    organization: { id: organizationId },
    employeeType,
    id: employeeId,
  } = useUserOrganization((state) => state.data);

  const [queryParams, setQueryParams] = useState<GetCoursesQueryParams>({
    search: "",
    page: PAGE,
    pageSize: PAGE_SIZE,
  });
  const searchTextDebounce = useDebounce(queryParams.search, 600);

  const {
    data: coursesData,
    isLoading,
    isError,
    refetch,
    isPending,
  } = useGetCourseListQuery({
    queryParams: {
      ...queryParams,
      search: searchTextDebounce,
      organizationId: organizationId,
      createdBy: employeeType !== "admin" ? employeeId : undefined,
    },
  });

  const coursesList = useMemo(() => coursesData?.data || [], [coursesData]);
  const totalCourses = coursesData?.count ?? 0;

  const handleSearchChange = (value: string) => {
    setQueryParams((prev) => ({
      ...prev,
      search: value,
      page: 1,
    }));
  };

  const handleChangePagegination = (newPage: number) => {
    setQueryParams((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  const handleChangePageSize = (newPageSize: number) => {
    setQueryParams((prev) => ({
      ...prev,
      pageSize: newPageSize,
    }));
  };
  return (
    <Box bgcolor={"#fff"} borderRadius={2} p={2}>
      <div className="flex items-center justify-between gap-2 mb-3">
        <Box component="div" className="w-full max-w-[360px] block">
          <TextField
            value={queryParams.search}
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
        <Button variant="contained" color="primary" LinkComponent={Link} href={PATHS.COURSES.CREATE} size="large">
          Tạo môn học
        </Button>
      </div>

      <Stack spacing={3}>
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
        <Box
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            overflow: "hidden",
            backgroundColor: "#fff",
          }}
        >
          <TableData
            rows={coursesList}
            columns={columnsCourse}
            hoverRow
            loading={isLoading || isPending}
            showRowCount
            pagination={{
              page: queryParams.page,
              pageSize: queryParams.pageSize,
              total: totalCourses,
              perPageOptions: PAGE_SIZE_OPTIONS,
              onChangePage: handleChangePagegination,
              onChangePageSize: handleChangePageSize,
            }}
            minWidth={1200}
          />
        </Box>
      </Stack>
    </Box>
  );
}
