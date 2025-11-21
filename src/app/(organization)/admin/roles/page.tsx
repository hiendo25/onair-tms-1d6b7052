"use client";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Box, Button, Chip, IconButton, NoSsr } from "@mui/material";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { DataGrid, GridColDef, GridPaginationModel, gridClasses } from "@mui/x-data-grid";
import { useRouter } from "next/navigation";
import React from "react";
import { PATHS } from "@/constants/path.contstants";
import { useGetRoleList } from "@/modules/roles/operations/query";
import PageContainer from "@/shared/ui/PageContainer";
import Link from "next/link";
import { useDialogs } from "@/hooks/useDialogs/useDialogs";
import { useDeleteRole } from "@/modules/roles/operations/mutation";
import { IMMUTABLE_ROLES } from "@/constants/roles.constant";

interface RoleData {
  id: string;
  title: string;
  code: string;
  description: string | null;
  user_count: number;
  created_at: string | null;
}

const INITIAL_PAGE_SIZE = 10;

const RolesPage = () => {
  const router = useRouter();
  const dialogs = useDialogs();

  const [paginationModel, setPaginationModel] = React.useState<GridPaginationModel>({
    page: 0,
    pageSize: INITIAL_PAGE_SIZE,
  });

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedRole, setSelectedRole] = React.useState<RoleData | null>(null);

  const { data, isLoading } = useGetRoleList({
    page: paginationModel.page,
    pageSize: paginationModel.pageSize,
  });

  const { mutate: deleteRoleMutate, isPending: isDeleting } = useDeleteRole();

  const open = Boolean(anchorEl);

  const handlePaginationModelChange = React.useCallback((model: GridPaginationModel) => {
    setPaginationModel(model);
  }, []);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, role: RoleData) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedRole(role);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRole(null);
  };

  const handleEdit = () => {
    if (!selectedRole) return;

    router.push(PATHS.ROLE.ROLES_ID(selectedRole.code));
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (!selectedRole) return;
    const confirmed = await dialogs.confirm(`Bạn có chắc chắn muốn xóa vai trò "${selectedRole.title}" không?`, {
      title: "Xác nhận xóa",
      okText: "Xóa",
      cancelText: "Hủy",
      severity: "error",
    });

    if (!confirmed) {
      handleMenuClose();
      return;
    }

    deleteRoleMutate(selectedRole.id, {
      onSuccess: () => {
        handleMenuClose();
      },
      onError: (error) => {
        alert(`Xóa vai trò thất bại: ${error}`);
      },
    });
  };

  const columns: GridColDef<RoleData>[] = [
    {
      field: "title",
      headerName: "Tên vai trò",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "code",
      headerName: "Mã vai trò",
      flex: 0.8,
      minWidth: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="medium"
          sx={{
            backgroundColor: "#0050FF29",
            borderRadius: "6px",
            "& .MuiChip-label": { color: "#0050FF", fontWeight: 600 },
          }}
        />
      ),
    },
    {
      field: "description",
      headerName: "Mô tả",
      flex: 1.5,
      minWidth: 200,
    },
    {
      field: "user_count",
      headerName: "Số lượng user",
      flex: 0.5,
      minWidth: 130,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Chip
          label={params.value || 0}
          size="medium"
          sx={{
            backgroundColor: "#263238",
            borderRadius: "6px",
            "& .MuiChip-label": { color: "white", fontWeight: 600 },
          }}
        />
      ),
    },
    {
      field: "actions",
      headerName: "",
      width: 60,
      align: "right",
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <IconButton size="small" onClick={(e) => handleMenuClick(e, params.row)} sx={{ ml: "auto" }}>
          <MoreVertIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  return (
    <PageContainer title="Quản lý vai trò & phân quyền" breadcrumbs={[{ title: "Quản lý vai trò & phân quyền" }]}>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
        <Button variant="contained" startIcon={<AddIcon />} LinkComponent={Link} href={PATHS.ROLE.CREATE}>
          Tạo vai trò
        </Button>
      </Box>

      <Box
        sx={{
          height: 600,
          width: "100%",
          backgroundColor: "white",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <NoSsr>
          <DataGrid
            rows={data?.items || []}
            rowCount={data?.itemCount || 0}
            columns={columns}
            loading={isLoading || isDeleting}
            disableRowSelectionOnClick
            disableColumnSorting
            disableColumnFilter
            disableColumnMenu
            paginationMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={handlePaginationModelChange}
            pageSizeOptions={[5, 10, 25, 50]}
            sx={{
              border: "none",
              [`& .${gridClasses.columnHeader}`]: {
                backgroundColor: "#F5F5F5",
                fontWeight: 600,
              },
              [`& .${gridClasses.columnHeader}, & .${gridClasses.cell}`]: {
                outline: "transparent",
              },
              [`& .${gridClasses.columnHeader}:focus-within, & .${gridClasses.cell}:focus-within`]: {
                outline: "none",
              },
              [`& .${gridClasses.row}:hover`]: {
                backgroundColor: "#F9FAFB",
                cursor: "pointer",
              },
            }}
            onRowClick={(params) => {
              router.push(`/roles/${params.row.code}`);
            }}
          />
        </NoSsr>
      </Box>

      {selectedRole && (
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          slotProps={{
            paper: {
              sx: {
                minWidth: 180,
                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
              },
            },
          }}
        >
          <MenuItem onClick={handleEdit}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Chỉnh sửa vai trò</ListItemText>
          </MenuItem>

          {!Object.values(IMMUTABLE_ROLES).includes(selectedRole?.code as IMMUTABLE_ROLES) && (
            <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Xoá vai trò</ListItemText>
            </MenuItem>
          )}
        </Menu>
      )}
    </PageContainer>
  );
};

export default RolesPage;
