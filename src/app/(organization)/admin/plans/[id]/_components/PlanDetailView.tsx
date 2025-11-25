"use client";

import * as React from "react";
import { Box } from "@mui/material";
import PageContainer from "@/shared/ui/PageContainer";
import { PATHS } from "@/constants/path.contstants";
import { PlanDetail } from "../../_components/mock-data";
import PlanInfoCards from "./PlanInfoCards";
import PlanStatistics from "./PlanStatistics";
import ProgramAccordion from "./ProgramAccordion";

interface PlanDetailViewProps {
  planDetail: PlanDetail;
}

export default function PlanDetailView({ planDetail }: PlanDetailViewProps) {
  return (
    <PageContainer
      title={planDetail.name}
      breadcrumbs={[
        { title: "Kế hoạch đào tạo", path: PATHS.PLANS.ROOT },
        { title: planDetail.name, path: PATHS.PLANS.DETAIL(planDetail.id) },
      ]}
    >
      <Box>
        {/* Plan Information Cards */}
        <PlanInfoCards
          budget={planDetail.budget}
          approver={planDetail.approver}
          startDate={planDetail.startDate}
          objective={planDetail.objective}
        />

        {/* Statistics Section */}
        <PlanStatistics
          programsCount={planDetail.programsCount}
          topicsCount={planDetail.topicsCount}
          coursesCount={planDetail.coursesCount}
          instructorsCount={planDetail.instructorsCount}
        />

        {/* Program List Section */}
        <ProgramAccordion
          programs={planDetail.programs}
          programsCount={planDetail.programsCount}
        />
      </Box>
    </PageContainer>
  );
}

