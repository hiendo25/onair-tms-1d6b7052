"use client";

import * as React from "react";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import SearchIcon from "@mui/icons-material/Search";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  FormControl,
  InputAdornment,
  MenuItem,
  Pagination,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";

import { PATHS } from "@/constants/path.constant";
import useDebounce from "@/hooks/useDebounce";
import { fDate, FORMAT_DATE_DAY } from "@/lib";
import { useGetAssignedAssignmentsQuery } from "@/modules/assignment-management/operations/query";
import { useUserOrganization } from "@/modules/organization";
import SearchTextField from "@/shared/ui/filters/SearchTextField";
import SelectOption from "@/shared/ui/filters/SelectOption";
import PageContainer from "@/shared/ui/PageContainer";
import ProgressBar from "@/shared/ui/ProgressBar";
import type {
  AssignedAssignmentItemDto,
  AssignedAssignmentsSummaryDto,
  AssignmentAssignedStatusFilter,
} from "@/types/dto/assignments";

const PAGE_SIZE = 10;

const STATUS_OPTIONS: Array<{ value: "all" | AssignmentAssignedStatusFilter; label: string }> = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "not_started", label: "Chưa bắt đầu" },
  { value: "in_progress", label: "Đang làm" },
  { value: "completed", label: "Hoàn thành" },
];

const formatNumber = (value: number) => new Intl.NumberFormat("vi-VN").format(value);
const SummaryCard = ({
  title,
  value,
  icon,
  accentColor,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  accentColor: string;
}) => (
  <Card
    sx={{
      p: 2.5,
      borderRadius: 2,
      boxShadow: "0px 10px 30px rgba(15, 23, 42, 0.08)",
    }}
  >
    <Stack direction="row" spacing={2} alignItems="center">
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: 3,
          backgroundColor: "#E8F1FF",
          color: accentColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </Box>
      <Stack spacing={0.5}>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="h5" fontWeight={700}>
          {value}
        </Typography>
      </Stack>
    </Stack>
  </Card>
);

const AssignedAssignmentRow = ({
  assignment,
  index,
  onViewDetail,
}: {
  assignment: AssignedAssignmentItemDto;
  index: number;
  onViewDetail: (assignmentId: string) => void;
}) => {
  const categoryLabel = assignment.categories[0]?.name || "Chưa phân loại";
  const dueDateLabel = fDate(assignment.available_to, FORMAT_DATE_DAY);

  return (
    <Box
      sx={{
        px: { xs: 2, md: 3 },
        py: 2,
        borderRadius: 3,
        backgroundColor: "grey.50",
        border: "1px solid",
        borderColor: "grey.100",
      }}
    >
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }}>
        <Stack direction="row" spacing={2} alignItems="flex-start" flex={1}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              backgroundColor: "#F2F4F7",
              color: "text.secondary",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            {index}
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              {assignment.assignment_name}
            </Typography>
            <Typography variant="body2" color="text.secondary" className="line-clamp-2">
              {assignment.assignment_description || "Chưa có mô tả"}
            </Typography>
            <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
              <Chip
                label={categoryLabel}
                size="small"
                sx={{ backgroundColor: "#F2F4F7", fontWeight: 500 }}
              />
              <Chip
                label={`Hạn nộp: ${dueDateLabel}`}
                size="small"
                sx={{ backgroundColor: "#F2F4F7", fontWeight: 500 }}
              />
            </Stack>
          </Box>
        </Stack>

        <Box sx={{ width: { xs: "100%", md: 360 } }}>
          <ProgressBar value={assignment.completion_percentage} height={12} />
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5, textAlign: "right" }}>
            Hoàn thành {assignment.completed_count}/{assignment.assigned_count}
          </Typography>
        </Box>

        <Button
          variant="text"
          onClick={() => onViewDetail(assignment.assignment_id)}
          sx={{ fontWeight: 600, textTransform: "none" }}
        >
          Xem chi tiết
        </Button>
      </Stack>
    </Box>
  );
};

export default function AssignmentAssignedList() {
  const router = useRouter();
  const currentOrganization = useUserOrganization((state) => state.currentOrganization);

  const [page, setPage] = React.useState(1);
  const [searchInput, setSearchInput] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"all" | AssignmentAssignedStatusFilter>("all");

  const debouncedSearch = useDebounce(searchInput, 500);

  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  const { data, isLoading, error } = useGetAssignedAssignmentsQuery({
    page: page - 1,
    limit: PAGE_SIZE,
    search: debouncedSearch,
    status: statusFilter === "all" ? undefined : statusFilter,
    organizationId: currentOrganization.orgId,
  });

  const assignments = data?.data ?? [];
  const totalCount = data?.total ?? 0;
  const summary: AssignedAssignmentsSummaryDto = data?.summary ?? { total_assigned: 0, total_completed: 0 };
  const totalPages = Math.max(Math.ceil(totalCount / PAGE_SIZE), 1);

  const displayFrom = totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const displayTo = Math.min(page * PAGE_SIZE, totalCount);

  const handleViewDetail = React.useCallback(
    (assignmentId: string) => {
      router.push(PATHS.ASSIGNMENTS.STUDENTS(assignmentId));
    },
    [router],
  );

  return (
    <PageContainer
      title="Danh sách bài gán"
      breadcrumbs={[
        { title: "Bài kiểm tra", path: PATHS.ASSIGNMENTS.ROOT },
        { title: "Danh sách bài gán" },
      ]}
    >
      <Box sx={{ py: 3 }}>
        <Stack spacing={3}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <SummaryCard
              title="Tổng bài gán"
              value={formatNumber(summary.total_assigned)}
              icon={<HelpOutlineOutlinedIcon fontSize="medium" />}
              accentColor="#1D4ED8"
            />
            <SummaryCard
              title="Hoàn thành"
              value={formatNumber(summary.total_completed)}
              icon={<TaskAltOutlinedIcon fontSize="medium" />}
              accentColor="#1D4ED8"
            />
          </Stack>

          <Card sx={{ p: { xs: 2, md: 3 }, boxShadow: "0px 10px 30px rgba(15, 23, 42, 0.08)", borderRadius: 2 }}>
            <Stack spacing={3}>
              <Stack
                sx={{
                  display: "grid",
                  gap: 2,
                  width: "100%",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "1fr 1fr",
                    lg: "minmax(240px, 320px) 240px",
                  },
                }}
              >
                <SearchTextField value={searchInput} onChange={setSearchInput} placeholder="Tìm kiếm" />
                <SelectOption
                  value={statusFilter}
                  onChange={(value) => setStatusFilter(value as "all" | AssignmentAssignedStatusFilter)}
                  options={STATUS_OPTIONS}
                />
              </Stack>

              {isLoading ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: 320,
                  }}
                >
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Alert severity="error">Có lỗi xảy ra khi tải danh sách bài gán</Alert>
              ) : assignments.length === 0 ? (
                <Box sx={{ py: 10, textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary">
                    Không tìm thấy bài gán nào
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={2}>
                  {assignments.map((assignment, index) => (
                    <AssignedAssignmentRow
                      key={assignment.assignment_id}
                      assignment={assignment}
                      index={(page - 1) * PAGE_SIZE + index + 1}
                      onViewDetail={handleViewDetail}
                    />
                  ))}
                </Stack>
              )}

              <Stack
                direction={{ xs: "column", sm: "row" }}
                alignItems={{ xs: "flex-start", sm: "center" }}
                justifyContent="space-between"
                spacing={2}
              >
                <Typography variant="caption" color="text.secondary">
                  Hiển thị {displayFrom}-{displayTo} trên {totalCount}
                </Typography>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  color="primary"
                  shape="rounded"
                />
              </Stack>
            </Stack>
          </Card>
        </Stack>
      </Box>
    </PageContainer>
  );
}
