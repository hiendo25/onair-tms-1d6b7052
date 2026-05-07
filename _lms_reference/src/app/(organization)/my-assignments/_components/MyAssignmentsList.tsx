"use client";

import * as React from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import {
  Alert,
  Box,
  Card,
  Chip,
  CircularProgress,
  FormControl,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

import { PATHS } from "@/constants/path.constant";
import useDebounce from "@/hooks/useDebounce";
import { fDateTime, FORMAT_DATE_TIME_CLEANER } from "@/lib";
import { useGetMyAssignmentsQuery } from "@/modules/assignment-management/operations/query";
import {
  getMyAssignmentDisplayStatus,
  getMyAssignmentResultLabel,
  getMyAssignmentResultStatus,
} from "@/modules/assignment-management/utils/my-assignment.utils";
import { useUserOrganization } from "@/modules/organization/store/OrganizationProvider";
import PageContainer from "@/shared/ui/PageContainer";
import TableData from "@/shared/ui/TableData";
import type { TableDataColumn } from "@/shared/ui/TableData/TableDataRow";
import type { MyAssignmentStatusFilter } from "@/types/dto/assignments";
import type { MyAssignmentDto } from "@/types/dto/assignments";

type StatusFilterUI = "all" | MyAssignmentStatusFilter;

type MyAssignmentRow = MyAssignmentDto & { id: string };

export default function MyAssignmentsList() {
  const router = useRouter();
  const { id: employeeId } = useUserOrganization((state) => state.currentEmployee);
  const currentOrg = useUserOrganization((state) => state.currentOrganization);

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);
  const [searchInput, setSearchInput] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<StatusFilterUI>("all");
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedAssignmentId, setSelectedAssignmentId] = React.useState<string | null>(null);

  const debouncedSearch = useDebounce(searchInput, 500);

  React.useEffect(() => {
    setPage(0);
  }, [debouncedSearch, statusFilter]);

  const {
    data: paginatedResult,
    isLoading,
    error,
  } = useGetMyAssignmentsQuery({
    page,
    limit: rowsPerPage,
    search: debouncedSearch,
    status: statusFilter !== "all" ? statusFilter : undefined,
    organizationId: currentOrg.orgId,
  });

  const handleChangePage = React.useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = React.useCallback((newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  }, []);

  const handleOpenMenu = React.useCallback((event: React.MouseEvent<HTMLElement>, assignmentId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedAssignmentId(assignmentId);
  }, []);

  const handleCloseMenu = React.useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleMenuExited = React.useCallback(() => {
    setSelectedAssignmentId(null);
  }, []);

  const handleSubmitAssignment = React.useCallback(() => {
    if (selectedAssignmentId && employeeId) {
      router.push(PATHS.MY_ASSIGNMENTS.SUBMIT(selectedAssignmentId, employeeId));
      setAnchorEl(null);
    }
  }, [selectedAssignmentId, employeeId, router]);

  const handleViewResult = React.useCallback(() => {
    if (selectedAssignmentId && employeeId) {
      router.push(PATHS.MY_ASSIGNMENTS.RESULT(selectedAssignmentId, employeeId));
      setAnchorEl(null);
    }
  }, [selectedAssignmentId, employeeId, router]);

  const getStatusChip = React.useCallback((row: MyAssignmentRow) => {
    const displayStatus = getMyAssignmentDisplayStatus(row);
    if (displayStatus === "in_progress") {
      return <Chip label="Đang làm" color="info" size="small" />;
    }
    if (displayStatus === "not_yet_started") {
      return <Chip label="Chưa tới giờ làm" color="secondary" size="small" />;
    }
    if (displayStatus === "graded") {
      return <Chip label="Đã chấm" color="success" size="small" />;
    }
    if (displayStatus === "submitted") {
      return <Chip label="Đã nộp" color="info" size="small" />;
    }
    return <Chip label="Chưa nộp" color="warning" size="small" />;
  }, []);

  const getResultChip = React.useCallback((row: MyAssignmentRow) => {
    const resultStatus = getMyAssignmentResultStatus(row);
    if (resultStatus === "none") {
      return (
        <Typography variant="body2" color="text.secondary">
          -
        </Typography>
      );
    }

    const label = getMyAssignmentResultLabel(resultStatus);
    const color = resultStatus === "pass" ? "success" : resultStatus === "late" ? "error" : "warning";

    return <Chip label={label} color={color} size="small" />;
  }, []);

  const assignments = React.useMemo(() => paginatedResult?.data || [], [paginatedResult?.data]);
  const rows = React.useMemo(
    () =>
      assignments.map((assignment) => ({
        ...assignment,
        id: assignment.assignment_id,
      })),
    [assignments],
  );
  const totalCount = paginatedResult?.total || 0;

  const selectedAssignment = React.useMemo(() => {
    return assignments?.find((a) => a.assignment_id === selectedAssignmentId);
  }, [assignments, selectedAssignmentId]);

  const submitLabel = selectedAssignment?.has_active_attempt
    ? "Tiếp tục làm"
    : selectedAssignment?.has_submitted
      ? "Làm lại"
      : "Làm bài";

  const columns = React.useMemo<TableDataColumn<MyAssignmentRow>[]>(
    () => [
      {
        id: "assignment_name",
        field: "assignment_name",
        headerName: "Tên bài kiểm tra",
        renderCell: (value) => (
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {value as string}
          </Typography>
        ),
      },
      {
        id: "assignment_description",
        field: "assignment_description",
        headerName: "Mô tả",
        sx: { width: 500 },
        renderCell: (value) => (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeSanitize]}
            className="line-clamp-1"
          >
            {(value as string) || "-"}
          </ReactMarkdown>
        ),
      },
      {
        id: "submitted_at",
        field: "submitted_at",
        headerName: "Ngày nộp",
        renderCell: (_value, row) => (
          <Typography variant="body2">{fDateTime(row.submitted_at, FORMAT_DATE_TIME_CLEANER)}</Typography>
        ),
      },
      {
        id: "status",
        field: "status",
        headerName: "Trạng thái",
        renderCell: (_value, row) => getStatusChip(row),
      },
      {
        id: "result",
        field: "result",
        headerName: "Kết quả",
        renderCell: (_value, row) => getResultChip(row),
      },
      {
        id: "score",
        field: "score",
        headerName: "Điểm",
        renderCell: (_value, row) =>
          row.status === "graded" && row.score !== null ? (
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {row.score}/{row.max_score}
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">
              -
            </Typography>
          ),
      },
      {
        id: "actions",
        field: "actions",
        headerName: "Thao tác",
        align: "right",
        renderCell: (_value, row) => (
          <IconButton
            size="small"
            onClick={(event) => {
              event.stopPropagation();
              handleOpenMenu(event, row.assignment_id);
            }}
          >
            <MoreVertIcon />
          </IconButton>
        ),
      },
    ],
    [getResultChip, getStatusChip, handleOpenMenu],
  );

  return (
    <PageContainer title="Bài kiểm tra của tôi" breadcrumbs={[{ title: "Bài kiểm tra của tôi" }]}>
      <Box sx={{ py: 3 }}>
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Danh sách bài kiểm tra được giao
          </Typography>

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <TextField
              placeholder="Tìm kiếm bài kiểm tra..."
              size="small"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{ maxWidth: 300 }}
            />

            <FormControl size="small" sx={{ maxWidth: 200 }}>
              <Select
                labelId="status-filter-label"
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilterUI)}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="in_progress">Chưa nộp</MenuItem>
                <MenuItem value="submitted">Đã nộp</MenuItem>
                <MenuItem value="graded">Đã chấm</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {isLoading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 400,
              }}
            >
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">
              {error instanceof Error ? error.message : "Không thể tải danh sách bài kiểm tra"}
            </Alert>
          ) : (
            <TableData<MyAssignmentRow>
              rows={rows}
              columns={columns}
              rowKey="id"
              loading={isLoading}
              hoverRow
              pagination={{
                page: page + 1,
                pageSize: rowsPerPage,
                total: totalCount,
                perPageOptions: [10, 25, 50, 100],
                onChangePage: (nextPage) => handleChangePage(nextPage - 1),
                onChangePageSize: handleChangeRowsPerPage,
              }}
            />
          )}
        </Card>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleCloseMenu}
          TransitionProps={{ onExited: handleMenuExited }}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <MenuItem onClick={handleSubmitAssignment} disabled={!selectedAssignment?.can_retry}>
            {submitLabel}
          </MenuItem>
          <MenuItem
            onClick={handleViewResult}
            disabled={!selectedAssignment?.has_submitted || selectedAssignment?.status !== "graded"}
          >
            Xem kết quả
          </MenuItem>
        </Menu>
      </Box>
    </PageContainer>
  );
}
