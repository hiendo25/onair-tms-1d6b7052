"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { SearchIcon } from "@/shared/assets/icons";
import { Pagination } from "@/shared/ui/Pagination";
import { useUserOrganization } from "@/modules/organization/store/UserOrganizationProvider";
import {
  GetMyElearningCoursesInput,
  useGetMyElearningCoursesQuery,
} from "@/modules/elearning/operations/query";
import type {
  ElearningAssignedCourseDto,
} from "@/types/dto/elearning/elearning.dto";
import ElearningCourseCard from "./ElearningCourseCard";

const PAGE_SIZE = 9;

interface MyClassElearningTabProps {
  isActive: boolean;
}

const ELearningTab = ({ isActive }: MyClassElearningTabProps) => {
  const userOrganization = useUserOrganization((state) => state.data);
  const studentId = userOrganization?.id;

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const queryInput = useMemo<GetMyElearningCoursesInput>(() => {
    const trimmedSearch = search.trim();
    return {
      studentId,
      page,
      limit: PAGE_SIZE,
      search: trimmedSearch ? trimmedSearch : undefined,
    };
  }, [studentId, page, search]);

  const shouldFetch = Boolean(studentId) && isActive;
  const {
    data: assignmentsResult,
    isLoading,
    isError,
    refetch,
  } = useGetMyElearningCoursesQuery(queryInput, { enabled: shouldFetch });

  const assignments = (assignmentsResult?.data ?? []).filter(
    (item) => item.course,
  ) as ElearningAssignedCourseDto[];
  const totalAssignments = assignmentsResult?.total ?? 0;

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
  };

  if (!studentId) {
    return (
      <Alert severity="warning">
        Không tìm thấy thông tin nhân viên. Vui lòng đăng nhập lại.
      </Alert>
    );
  }

  return (
    <Stack spacing={3} className="bg-white rounded-2xl p-4">
      <TextField
        placeholder="Tìm kiếm môn học eLearning..."
        value={search}
        onChange={handleSearchChange}
        size="small"
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

      {isError ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Thử lại
            </Button>
          }
        >
          Không thể tải danh sách môn học eLearning. Vui lòng thử lại sau.
        </Alert>
      ) : null}

      {isLoading ? (
        <Stack alignItems="center" spacing={2} sx={{ py: 6 }}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">
            Đang tải danh sách môn học eLearning...
          </Typography>
        </Stack>
      ) : assignments.length === 0 ? (
        <Box
          sx={{
            border: "1px dashed",
            borderColor: "divider",
            borderRadius: 3,
            py: 6,
            textAlign: "center",
            color: "text.secondary",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Bạn chưa được ghi danh vào môn học nào
          </Typography>
          <Typography variant="body2">
            Khi được thêm vào khóa học eLearning, thông tin sẽ xuất hiện tại đây.
          </Typography>
        </Box>
      ) : (
        <Grid container columns={12} spacing={2} mt={4}>
          {assignments.map((assignment) => (
            <Grid key={assignment.assignmentId} size={{ xs: 12, md: 6, lg: 3 }}
            >
              <ElearningCourseCard assignment={assignment} />
            </Grid>
          ))}
        </Grid>
      )}

      {totalAssignments > 0 ? (
        <Pagination
          onChange={handlePageChange}
          total={totalAssignments}
          take={queryInput.limit ?? PAGE_SIZE}
          value={page}
          name="Môn học eLearning"
        />
      ) : null}
    </Stack>
  );
};

export default ELearningTab;