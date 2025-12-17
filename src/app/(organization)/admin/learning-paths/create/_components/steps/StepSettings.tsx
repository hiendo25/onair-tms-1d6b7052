"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckIcon from "@mui/icons-material/Check";
import { Box, Button, Card, CardContent, Stack, Typography } from "@mui/material";

interface StepSettingsProps {
  onSubmit: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

export default function StepSettings({ onSubmit, onBack, isLoading = false }: StepSettingsProps) {
  return (
    <Card sx={{ border: "1px solid", borderColor: "divider" }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
          Thiết lập
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Cài đặt và hoàn tất lộ trình học tập
        </Typography>

        <Box
          sx={{
            minHeight: 300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "grey.50",
            borderRadius: 2,
            border: "2px dashed",
            borderColor: "grey.300",
          }}
        >
          <Typography variant="h6" color="text.secondary">
            Thiết lập - Coming Soon
          </Typography>
        </Box>

        <Stack direction="row" spacing={2} sx={{ mt: 4, justifyContent: "space-between" }}>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={onBack} disabled={isLoading}>
            Quay lại
          </Button>
          <Button variant="contained" startIcon={<CheckIcon />} onClick={onSubmit} disabled={isLoading}>
            {isLoading ? "Đang xử lý..." : "Hoàn tất"}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

