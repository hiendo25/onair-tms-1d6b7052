"use client";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  Box,
  Button,
  Chip,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useRouter } from "next/navigation";
import React from "react";
import { PATHS } from "@/constants/path.contstants";
import { useGetRoleList } from "@/modules/roles/operations/query";
import PageContainer from "@/shared/ui/PageContainer";
import Link from "next/link";
import { useDialogs } from "@/hooks/useDialogs/useDialogs";
import { useDeleteRole } from "@/modules/roles/operations/mutation";
import { IMMUTABLE_ROLES } from "@/constants/roles.constant";
import PopupState, { bindMenu, bindTrigger } from "material-ui-popup-state";

interface RoleData {
  id: string;
  title: string;
  code: string;
  description: string | null;
  user_count: number;
  created_at: string | null;
}

const formatOrder = (index: number) => index.toString().padStart(2, "0");

const RolesPage = () => {
  const router = useRouter();
  const dialogs = useDialogs();

  const { data, isLoading } = useGetRoleList({
    page: 0,
    pageSize: 1000,
  });

  const { mutate: deleteRoleMutate, isPending: isDeleting } = useDeleteRole();

  const handleEdit = (role: RoleData) => {
    router.push(PATHS.ROLE.ROLES_ID(role.code));
  };

  const handleDelete = async (role: RoleData) => {
    const confirmed = await dialogs.confirm(`Bạn có chắc chắn muốn xóa vai trò "${role.title}" không?`, {
      title: "Xác nhận xóa",
      okText: "Xóa",
      cancelText: "Hủy",
      severity: "error",
    });

    if (!confirmed) {
      return;
    }

    deleteRoleMutate(role.id, {
      onSuccess: () => {},
      onError: (error) => {
        alert(`Xóa vai trò thất bại: ${error}`);
      },
    });
  };

  return (
    <PageContainer title="Quản lý vai trò & phân quyền" breadcrumbs={[{ title: "Quản lý vai trò & phân quyền" }]}>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
        <Button variant="contained" startIcon={<AddIcon />} LinkComponent={Link} href={PATHS.ROLE.CREATE}>
          Tạo vai trò
        </Button>
      </Box>

      <Box
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          overflow: "hidden",
          backgroundColor: "#fff",
        }}
      >
        <TableContainer>
          <Table
            aria-label="Danh sách vai trò"
            sx={{
              tableLayout: "fixed",
              "& .MuiTableCell-root": {
                py: 2,
                px: 2,
              },
            }}
          >
            <TableHead
              sx={{
                backgroundColor: grey[100],
                "& .MuiTableCell-head": {
                  fontWeight: 600,
                  fontSize: 13,
                  letterSpacing: 0.2,
                  color: grey[700],
                },
              }}
            >
              <TableRow>
                <TableCell sx={{ width: "80px" }} align="center">
                  STT
                </TableCell>
                <TableCell sx={{ width: "200px" }} align="left">
                  Tên vai trò
                </TableCell>
                <TableCell sx={{ width: "150px" }} align="center">
                  Mã vai trò
                </TableCell>
                <TableCell sx={{ width: "auto" }} align="left">
                  Mô tả
                </TableCell>
                <TableCell sx={{ width: "150px" }} align="center">
                  Số lượng user
                </TableCell>
                <TableCell
                  sx={{
                    width: "80px",
                    position: "sticky",
                    right: 0,
                    backgroundColor: grey[100],
                    zIndex: 2,
                  }}
                  align="center"
                >
                  Thao tác
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody
              sx={{
                "& .MuiTableCell-root": {
                  borderBottomColor: grey[200],
                  verticalAlign: "middle",
                },
              }}
            >
              {isLoading || isDeleting ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <Typography>Đang tải...</Typography>
                  </TableCell>
                </TableRow>
              ) : data?.items && data.items.length > 0 ? (
                data.items.map((role, index) => {
                  const order = formatOrder(index + 1);
                  const isImmutable = Object.values(IMMUTABLE_ROLES).includes(role.code as IMMUTABLE_ROLES);

                  return (
                    <TableRow
                      key={role.id}
                      sx={{
                        "&:last-child td": { borderBottom: "none" },
                        "&:hover": {
                          backgroundColor: grey[50],
                        },
                      }}
                    >
                      <TableCell align="center" sx={{ fontWeight: 600 }}>
                        {order}
                      </TableCell>
                      <TableCell align="left">
                        <Tooltip title={role.title}>
                          <Typography variant="subtitle2" fontWeight={600} className="line-clamp-2">
                            {role.title || "--"}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={role.code}
                          size="medium"
                          sx={{
                            backgroundColor: "#0050FF29",
                            borderRadius: "6px",
                            "& .MuiChip-label": { color: "#0050FF", fontWeight: 600 },
                          }}
                        />
                      </TableCell>
                      <TableCell align="left">
                        <Typography variant="body2" className="line-clamp-2">
                          {role.description || "--"}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={role.user_count || 0}
                          size="medium"
                          sx={{
                            backgroundColor: "#263238",
                            borderRadius: "6px",
                            "& .MuiChip-label": { color: "white", fontWeight: 600 },
                          }}
                        />
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          position: "sticky",
                          right: 0,
                          backgroundColor: "#fff",
                          zIndex: 1,
                          boxShadow: "-8px 0 12px rgba(0,0,0,0.04)",
                        }}
                      >
                        <PopupState variant="popover" popupId={`role-menu-${role.id}`}>
                          {(popupState) => (
                            <>
                              <IconButton {...bindTrigger(popupState)}>
                                <MoreVertIcon />
                              </IconButton>
                              <Menu {...bindMenu(popupState)}>
                                <MenuItem
                                  onClick={() => {
                                    handleEdit(role);
                                    popupState.close();
                                  }}
                                >
                                  <ListItemIcon>
                                    <EditIcon fontSize="small" />
                                  </ListItemIcon>
                                  <ListItemText>Chỉnh sửa vai trò</ListItemText>
                                </MenuItem>
                                {!isImmutable && (
                                  <MenuItem
                                    onClick={() => {
                                      handleDelete(role);
                                      popupState.close();
                                    }}
                                    sx={{ color: "error.main" }}
                                  >
                                    <ListItemIcon>
                                      <DeleteIcon fontSize="small" color="error" />
                                    </ListItemIcon>
                                    <ListItemText>Xoá vai trò</ListItemText>
                                  </MenuItem>
                                )}
                              </Menu>
                            </>
                          )}
                        </PopupState>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <Typography>Không có dữ liệu</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </PageContainer>
  );
};

export default RolesPage;
