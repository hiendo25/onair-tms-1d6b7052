"use client";

import * as React from "react";
import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";

import { PATHS } from "@/constants/path.constant";
import useDebounce from "@/hooks/useDebounce";
import { useDialogs } from "@/hooks/useDialogs/useDialogs";
import useNotifications from "@/hooks/useNotifications/useNotifications";
import { fDateTime, FORMAT_DATE_TIME_CLEANER } from "@/lib";
import { useDeleteLearningPathMutation } from "@/modules/learning-paths/operations/mutation";
import { useGetLearningPathsQuery } from "@/modules/learning-paths/operations/query";
import type { LearningPathWithCounts } from "@/repository/learning-paths";
import PageContainer from "@/shared/ui/PageContainer";
import TableData, { TableDataProps } from "@/shared/ui/TableData";

export default function LearningPathsContent() {
  const router = useRouter();
  const dialogs = useDialogs();
  const notifications = useNotifications();

  const [page, setPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [searchInput, setSearchInput] = React.useState("");
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedLearningPathId, setSelectedLearningPathId] = React.useState<string | null>(null);

  const debouncedSearch = useDebounce(searchInput, 400);

  const { data, isLoading } = useGetLearningPathsQuery({
    page,
    limit: rowsPerPage,
    search: debouncedSearch,
  });

  const learningPaths = data?.data || [];
  const totalCount = data?.total || 0;
  const menuOpen = Boolean(anchorEl);
  const isEmpty = !isLoading && learningPaths.length === 0;
  const hasFilter = !!debouncedSearch;

  const { mutateAsync: deleteLearningPath } = useDeleteLearningPathMutation();

  const handleCreateLearningPath = () => {
    router.push(PATHS.LEARNING_PATHS.CREATE);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setPage(1);
  };

  const handleChangePage = (newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(1);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, learningPathId: string) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedLearningPathId(learningPathId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedLearningPathId(null);
  };

  const handleEdit = () => {
    if (selectedLearningPathId) {
      router.push(PATHS.LEARNING_PATHS.EDIT(selectedLearningPathId));
    }
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (!selectedLearningPathId) return;

    const confirmed = await dialogs.confirm("Bạn có chắc chắn muốn xóa lộ trình học tập này?", {
      title: "Xác nhận xóa",
      okText: "Xóa",
      cancelText: "Hủy",
    });

    if (confirmed) {
      try {
        await deleteLearningPath(selectedLearningPathId);
        notifications.show("Xóa lộ trình học tập thành công!", {
          severity: "success",
        });
      } catch (error) {
        notifications.show(
          error instanceof Error ? error.message : "Có lỗi xảy ra khi xóa lộ trình học tập",
          {
            severity: "error",
          },
        );
      }
    }

    handleMenuClose();
  };

  const columns: TableDataProps<LearningPathWithCounts>["columns"] = [
    {
      id: "name",
      field: "name",
      headerName: "Tên lộ trình",
      width: 360,
      renderCell: (value, row) => (
        <Box>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              wordBreak: "break-word",
            }}
          >
            {value}
          </Typography>
          {row.description && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                wordBreak: "break-word",
              }}
            >
              {row.description}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: "phase_count",
      field: "phase_count",
      headerName: "Số giai đoạn",
      width: 140,
      renderCell: (value) => (
        <Typography variant="body2">{value || 0}</Typography>
      ),
    },
    {
      id: "employee_count",
      field: "employee_count",
      headerName: "Số học viên",
      width: 140,
      renderCell: (value) => (
        <Typography variant="body2">{value || 0}</Typography>
      ),
    },
    {
      id: "created_at",
      field: "created_at",
      headerName: "Ngày tạo",
      width: 180,
      renderCell: (value) => (
        <Typography variant="body2">
          {value ? fDateTime(value, FORMAT_DATE_TIME_CLEANER) : "—"}
        </Typography>
      ),
    },
    {
      id: "action",
      field: "action",
      headerName: "Hành động",
      width: 120,
      fixed: "right",
      renderCell: (_value, row) => (
        <IconButton disabled size="small" onClick={(e) => handleMenuOpen(e, row.id)}>
          <MoreVertIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  return (
    <PageContainer
      title="Lộ trình học tập"
      breadcrumbs={[{ title: "Lộ trình học tập", path: PATHS.LEARNING_PATHS.ROOT }]}
    >
      <Box
        sx={{
          background: "white",
          borderRadius: 2,
          p: { xs: 2.5, md: 3 },
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 18px 48px rgba(15, 23, 42, 0.08)",
        }}
      >
        {/* Header with search and create button */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ mb: 3 }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
        >
          <TextField
            placeholder="Tìm kiếm lộ trình học tập..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            size="small"
            sx={{ maxWidth: { sm: 400 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: searchInput && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleClearSearch}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateLearningPath}
          >
            Tạo lộ trình học tập
          </Button>
        </Stack>

        {/* Empty state */}
        {isEmpty && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 8,
            }}
          >
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {hasFilter
                ? "Không tìm thấy lộ trình học tập nào"
                : "Chưa có lộ trình học tập nào"}
            </Typography>
            {!hasFilter && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateLearningPath}
              >
                Tạo lộ trình học tập đầu tiên
              </Button>
            )}
          </Box>
        )}

        {/* Table */}
        {!isEmpty && (
          <TableData
            rows={learningPaths}
            columns={columns}
            hoverRow
            loading={isLoading}
            showRowCount
            pagination={{
              page,
              pageSize: rowsPerPage,
              total: totalCount,
              onChangePage: handleChangePage,
              onChangePageSize: handleChangeRowsPerPage,
            }}
          />
        )}

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <MenuItem onClick={handleEdit}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Chỉnh sửa</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleDelete}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText sx={{ color: "error.main" }}>Xóa</ListItemText>
          </MenuItem>
        </Menu>
      </Box>
    </PageContainer>
  );
}

