"use client";

import { RoleParams, RolePermissionsParams } from "@/repository/roles";
import { Box, Grid, Typography } from "@mui/material";
import React, { useCallback } from "react";
import { useRolePermissionFormData } from "../../hooks/useRolePermissionForm";
import { RoleFormData } from "../../types";
import PermissionSelector from "./PermissionSelector";
import RoleBasicInfo from "./RoleBasicInfo";
import SelectedPermissionsSummary from "./SelectedPermissionsSummary";

export interface OnSubmitData {
  id: string;
  name: string;
  description: string;
  selectedPermissions: Set<string>;
}

interface RoleFormContainerProps {
  initialData: Partial<RoleFormData>;
  onSubmit?: (data: RoleParams & RolePermissionsParams) => void;
  isEditMode?: boolean;
  isSuperAdminRole?: boolean;
}

const RoleFormContainer: React.FC<RoleFormContainerProps> = ({
  initialData,
  onSubmit,
  isEditMode = false,
  isSuperAdminRole = false,
}) => {
  const {
    modules,
    selectedPermissions,
    getChanges,
    isFullySelected,
    isPartiallySelected,
    toggleAll,
    isPendingToggleAll,
    toggleAction,
    setSelectedPermissions,
    selectedPermissionsArray,
  } = useRolePermissionFormData(initialData);

  const onClickSave = useCallback(
    (data: { title: string; description: string }) => {
      const { created, deleted } = getChanges();

      onSubmit?.({
        id: initialData.id || "",
        roleId: initialData.id || "",
        title: data.title,
        description: data.description,
        permissionsToAdd: created,
        permissionsToRemove: deleted,
      });
    },
    [getChanges, onSubmit, initialData.id],
  );

  return (
    <Box width={"100%"}>
      <RoleBasicInfo
        isEditMode={isEditMode}
        onClickSave={onClickSave}
        initialName={initialData.name}
        initialDescription={initialData.description}
      />

      {!isSuperAdminRole ? (
        <Box sx={{ bgcolor: "white", borderRadius: 3, p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="h6" fontWeight={600}>
              Phân quyền cho vai trò
            </Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <PermissionSelector
                modules={modules}
                isFullySelected={isFullySelected}
                isPartiallySelected={isPartiallySelected}
                toggleAll={toggleAll}
                selectedPermissions={selectedPermissions}
                setSelectedPermissions={setSelectedPermissions}
                toggleAction={toggleAction}
                isPendingToggleAll={isPendingToggleAll}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <SelectedPermissionsSummary
                selectedPermissionsArray={selectedPermissionsArray}
                toggleAction={toggleAction}
                isPendingToggleAll={isPendingToggleAll}
              />
            </Grid>
          </Grid>
        </Box>
      ) : (
        <Box sx={{ mt: 3 }} alignSelf={'center'}>
          <Typography variant="body1" color="text.secondary" textAlign={'center'}>
            Vai trò Super Admin có toàn quyền truy cập hệ thống và không thể chỉnh sửa phân quyền.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default RoleFormContainer;
