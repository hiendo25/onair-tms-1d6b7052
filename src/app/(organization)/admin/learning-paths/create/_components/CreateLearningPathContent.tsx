"use client";

import { Box, Typography } from "@mui/material";

import { PATHS } from "@/constants/path.constant";
import PageContainer from "@/shared/ui/PageContainer";

export default function CreateLearningPathContent() {
  return (
    <PageContainer
      title="Tạo lộ trình học tập"
      breadcrumbs={[
        { title: "Lộ trình học tập", path: PATHS.LEARNING_PATHS.ROOT },
        { title: "Tạo lộ trình học tập" },
      ]}
    >
      <Box
        sx={{
          background: "white",
          borderRadius: 2,
          p: { xs: 2.5, md: 3 },
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 18px 48px rgba(15, 23, 42, 0.08)",
          minHeight: "400px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="h5" color="text.secondary">
          Create Learning Path - Coming Soon
        </Typography>
      </Box>
    </PageContainer>
  );
}

