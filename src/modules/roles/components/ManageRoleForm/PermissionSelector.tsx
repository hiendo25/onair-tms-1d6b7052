"use client";

import { TPermissionActions } from "@/constants/permission.constant";
import { Box, Checkbox, CircularProgress, FormControlLabel, Typography } from "@mui/material";
import React from "react";
import { UseRolePermissionsReturn } from "../../hooks/useRolePermissionForm";
import PermissionModuleItem from "./PermissionModuleItem";

interface PermissionSelectorProps
  extends Pick<
    UseRolePermissionsReturn,
    | "modules"
    | "isFullySelected"
    | "isPartiallySelected"
    | "toggleAll"
    | "selectedPermissions"
    | "toggleAction"
    | "setSelectedPermissions"
    | "isPendingToggleAll"
  > {
    disabled?: boolean;
  }

const PermissionSelector: React.FC<PermissionSelectorProps> = ({
  isFullySelected,
  isPartiallySelected,
  toggleAll,
  modules,
  selectedPermissions,
  toggleAction,
  setSelectedPermissions,
  isPendingToggleAll,
}) => {
  return (
    <Box
      sx={{
        bgcolor: "grey.200",
        borderRadius: 1,
        border: 1,
        borderColor: "grey.300",
      }}
    >
      <FormControlLabel
        control={
          <Checkbox
            checked={isFullySelected}
            indeterminate={isPartiallySelected && !isFullySelected}
            onChange={toggleAll}
            disabled={isPendingToggleAll}
          />
        }
        sx={{ ml: "7px", py: 1 }}
        label={<Typography variant="body1">Danh sách tính năng</Typography>}
      />

      {!isPendingToggleAll ? (
        Object.values(modules).map((module) => {
          return (
            <PermissionModuleItem
              key={module.id}
              moduleId={module.id}
              moduleName={module.name}
              availableActions={module.actions}
              selectedActions={new Set<TPermissionActions>(selectedPermissions.get(module.id) || [])}
              toggleAction={toggleAction}
              setSelectedPermissions={setSelectedPermissions}
            />
          );
        })
      ) : (
        <CircularProgress size={24} sx={{ display: "block", margin: "40px auto" }} />
      )}
    </Box>
  );
};

export default PermissionSelector;
