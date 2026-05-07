"use client";

import { Box, CircularProgress, Typography } from "@mui/material";

import { PATHS } from "@/constants/path.constant";
import { useGetPlanDetailQuery } from "@/modules/plans/operations/query";
import PageContainer from "@/shared/ui/PageContainer";

import PlanDetailView from "./PlanDetailView";

interface Props {
  id: string;
}

export default function PlanDetailPage({ id }: Props) {
  const { data, isLoading, isError, error } = useGetPlanDetailQuery(id);

  if (isLoading) {
    return (
      <PageContainer
        title="Đang tải kế hoạch"
        breadcrumbs={[
          { title: "Kế hoạch đào tạo", path: PATHS.PLANS.ROOT },
          { title: "Chi tiết", path: PATHS.PLANS.DETAIL(id) },
        ]}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 3 }}>
          <CircularProgress size={24} />
          <Typography>Đang tải dữ liệu...</Typography>
        </Box>
      </PageContainer>
    );
  }

  if (isError || !data) {
    return (
      <PageContainer
        title="Kế hoạch không tồn tại"
        breadcrumbs={[
          { title: "Kế hoạch đào tạo", path: PATHS.PLANS.ROOT },
          { title: "Chi tiết", path: PATHS.PLANS.DETAIL(id) },
        ]}
      >
        <Box sx={{ p: 3 }}>
          <Typography>{error instanceof Error ? error.message : "Không tìm thấy kế hoạch đào tạo"}</Typography>
        </Box>
      </PageContainer>
    );
  }

  return <PlanDetailView planDetail={data} />;
}
