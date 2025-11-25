import * as React from "react";
import { Box, Typography } from "@mui/material";
import PageContainer from "@/shared/ui/PageContainer";
import { PATHS } from "@/constants/path.contstants";
import { MOCK_PLAN_DETAILS } from "../_components/mock-data";
import PlanDetailView from "./_components/PlanDetailView";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PlanDetailPage({ params }: PageProps) {
  const { id } = await params;
  const planDetail = MOCK_PLAN_DETAILS[id];

  // Handle non-existent plan
  if (!planDetail) {
    return (
      <PageContainer
        title="Kế hoạch không tồn tại"
        breadcrumbs={[
          { title: "Kế hoạch đào tạo", path: PATHS.PLANS.ROOT },
          { title: "Chi tiết", path: PATHS.PLANS.DETAIL(id) },
        ]}
      >
        <Box sx={{ p: 3 }}>
          <Typography>Không tìm thấy kế hoạch đào tạo với ID: {id}</Typography>
        </Box>
      </PageContainer>
    );
  }

  return <PlanDetailView planDetail={planDetail} />;
}


