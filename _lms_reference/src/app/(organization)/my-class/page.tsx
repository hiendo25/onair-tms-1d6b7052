import { Suspense } from "react";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";

import PageContainer from "@/shared/ui/PageContainer";

import MyClassSection from "./_components";

const MyClassSectionFallback = () => {
  return (
    <Box className="bg-white rounded-2xl p-4">
      <Stack alignItems="center" justifyContent="center" spacing={2} sx={{ py: 6 }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Đang tải lớp học của bạn...
        </Typography>
      </Stack>
    </Box>
  );
};

const MyClassPage = () => {
  return (
    <PageContainer
      title="Lớp học của tôi"
      breadcrumbs={[
        {
          title: "LMS",
          path: "/dashboard",
        },
        {
          title: "Lớp học của tôi",
        },
      ]}
    >
      <Suspense fallback={<MyClassSectionFallback />}>
        <MyClassSection />
      </Suspense>
    </PageContainer>
  );
};

export default MyClassPage;
