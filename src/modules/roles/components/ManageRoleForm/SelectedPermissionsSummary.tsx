"use client";

import { Box, Chip, Stack, Typography } from "@mui/material";
import React from "react";
import { UseRolePermissionsReturn } from "../../hooks/useRolePermissionForm";

interface SelectedPermissionsSummaryProps
  extends Pick<UseRolePermissionsReturn, "selectedPermissionsArray" | "toggleAction" | "isPendingToggleAll"> {}

const SelectedPermissionsSummary: React.FC<SelectedPermissionsSummaryProps> = ({
  selectedPermissionsArray,
  toggleAction,
  isPendingToggleAll,
}) => {
  return (
    <Box sx={{ borderRadius: 1, border: 1, borderColor: "grey.300", bgcolor: "grey.200" }}>
      <Typography variant="h6" fontWeight={600} sx={{ px: 2, py: 1 }}>
        Thông tin quyền đã chọn
      </Typography>

      <Stack
        spacing={2}
        sx={{
          bgcolor: "white",
          p: 2,
          borderBottomLeftRadius: 1,
          borderBottomRightRadius: 1,
        }}
      >
        {isPendingToggleAll || Object.entries(selectedPermissionsArray).length === 0 ? (
          <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
            Chưa có quyền nào được chọn
          </Typography>
        ) : (
          Object.entries(selectedPermissionsArray).map(([moduleName, permissions]) => (
            <Box key={moduleName}>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                {moduleName}
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {permissions.map((permission) => (
                  <Chip
                    key={permission.permCode}
                    label={permission.permLabel}
                    color="primary"
                    size="medium"
                    sx={{ borderRadius: 1.5 }}
                    onDelete={() => toggleAction(permission.moduleId, permission.permCode)}
                  />
                ))}
              </Box>
            </Box>
          ))
        )}
      </Stack>
    </Box>
  );
};

export default SelectedPermissionsSummary;
