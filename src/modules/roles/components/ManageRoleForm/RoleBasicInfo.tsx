"use client";

import { Box, Button, Grid, TextField, Typography } from "@mui/material";
import React from "react";

interface RoleBasicInfoProps {
  isEditMode: boolean;
  onClickSave: (data: { title: string; description: string }) => void;
  initialName?: string;
  initialDescription?: string;
}

const RoleBasicInfo: React.FC<RoleBasicInfoProps> = ({
  isEditMode,
  onClickSave,
  initialDescription = "",
  initialName = "",
}) => {
  const [title, setTitle] = React.useState(initialName);
  const [description, setDescription] = React.useState(initialDescription);

  return (
    <Box sx={{  borderRadius: 3, p: 3, mb: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" fontWeight={600}>
          Thông tin vai trò
        </Typography>

        <Button variant="contained" onClick={() => onClickSave({ title, description })} size="large">
          {isEditMode ? "Cập nhật" : "Lưu vai trò"}
        </Button>
      </Box>
      <Grid container spacing={2} mt={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Tên vai trò"
            placeholder="Manager MKT"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Mô tả"
            placeholder="Quản lý dự án và task phòng ban MKT"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default React.memo(RoleBasicInfo, (prevProps, nextProps) => {
  return (
    prevProps.initialName === nextProps.initialName &&
    prevProps.initialDescription === nextProps.initialDescription &&
    prevProps.isEditMode === nextProps.isEditMode
  );
});
