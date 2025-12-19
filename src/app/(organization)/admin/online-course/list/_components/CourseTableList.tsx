"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Alert, Box, Button, Divider, IconButton, InputAdornment, Stack, TextField } from "@mui/material";
import Link from "next/link";

import { PATHS } from "@/constants/path.constant";
// import { getColumnsCourse } from "./column-course";
import useDebounce from "@/hooks/useDebounce";
import { useDeleteCourseByIdMutation } from "@/modules/courses/operations/mutation";
import { useGetCourseListQueryV2 } from "@/modules/courses/operations/query";
import { useUserOrganization } from "@/modules/organization/store/OrganizationProvider";
import { usePermissions } from "@/modules/permission-wrapper";
import Can from "@/modules/permission-wrapper/components/Can";
import { GetCoursesQueryParams } from "@/repository/courses";
import { Edit02Icon, SearchIcon, Trash01Icon } from "@/shared/assets/icons";
import TableData, { TableDataProps } from "@/shared/ui/TableData";

import { columnsCourse, CourseRowItem } from "./column-course";
import DialogDeleteCourseConfirmation, { DialogDeleteCourseConfirmationRef } from "./DialogDeleteCourseConfirmation";

const PAGE_SIZE_OPTIONS = [20, 40, 60, 100];

interface CourseTableListProps {
  className?: string;
}
export default function CourseTableList({ className }: CourseTableListProps) {
  const dialogDeleteRef = useRef<DialogDeleteCourseConfirmationRef>(null);
  const { hasPermissions } = usePermissions();
  const canCreateOrDeleteCourse = hasPermissions([{ $or: "course:create" }, { $or: "course:delete" }]);
  console.log({ canCreateOrDeleteCourse });
  const {
    organization: { id: organizationId },
    type: employeeType,
    id: employeeId,
  } = useUserOrganization((state) => state.currentEmployee);

  const [queryParams, setQueryParams] = useState<GetCoursesQueryParams>({
    search: "",
    page: 1,
    pageSize: 20,
  });
  const searchTextDebounce = useDebounce(queryParams.search, 600);

  const {
    data: coursesData,
    isLoading,
    isError,
    refetch,
    isPending,
  } = useGetCourseListQueryV2({
    queryParams: {
      ...queryParams,
      search: searchTextDebounce,
      organizationId: organizationId,
      createdBy: employeeType !== "admin" ? employeeId : undefined,
    },
  });

  const { mutate: deleteCourse, isPending: isLoadingDelete } = useDeleteCourseByIdMutation();

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

  const handleDeleteCourse = (courseId: string, courseName: string) => () => {
    dialogDeleteRef.current?.open(
      {
        title: `Xóa "${courseName}"`,
        description: "Dữ liệu đã xóa không thể khôi phục, bạn vẫn muốn xóa",
      },
      {
        onOk: () => {
          deleteCourse(courseId);
        },
      },
    );
  };

  const mergeColumns: TableDataProps<CourseRowItem>["columns"] = useMemo(() => {
    return canCreateOrDeleteCourse
      ? [
          ...columnsCourse,
          {
            id: "action",
            field: "action",
            headerName: "Hành động",
            fixed: "right",
            width: 140,
            renderCell: (value, { id: courseId, title: courseName }) => {
              return (
                <>
                  <Can pers={["course:update"]}>
                    <Link href={PATHS.COURSES.EDIT(courseId)}>
                      <IconButton size="small" className="text-blue-600 bg-transparent hover:bg-blue-50">
                        <Edit02Icon className="w-4 h-4" />
                      </IconButton>
                    </Link>
                  </Can>
                  <Can pers={["course:delete"]}>
                    <IconButton
                      size="small"
                      className="text-red-600 bg-transparent hover:bg-red-50"
                      onClick={handleDeleteCourse(courseId, courseName ?? "")}
                    >
                      <Trash01Icon className="w-4 h-4" />
                    </IconButton>
                  </Can>
                </>
              );
            },
          },
        ]
      : columnsCourse;
  }, [canCreateOrDeleteCourse]);

  return (
    <Box>
      <div className="flex items-center justify-between mb-6">
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
        <Can pers={["course:create"]}>
          <Link href={PATHS.COURSES.CREATE}>
            <Button variant="contained" color="primary" size="large">
              Tạo môn học
            </Button>
          </Link>
        </Can>
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
            Không thể tải danh sách khóa học. Vui lòng kiểm tra lại kết nối.
          </Alert>
        ) : null}
        <TableData
          rows={coursesList}
          columns={mergeColumns}
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
      </Stack>
      <DialogDeleteCourseConfirmation ref={dialogDeleteRef} isLoading={isLoadingDelete} />
    </Box>
  );
}
