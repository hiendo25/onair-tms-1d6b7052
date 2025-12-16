"use client";

import * as React from "react";
import { Box } from "@mui/material";

import { PATHS } from "@/constants/path.constant";
import { PlanDetailDto } from "@/modules/plans/types";
import PageContainer from "@/shared/ui/PageContainer";

import PlanApprovalActions from "./PlanApprovalActions";
import PlanInfoCards from "./PlanInfoCards";
import PlanStatistics from "./PlanStatistics";
import ProgramAccordion from "./ProgramAccordion";

interface PlanDetailViewProps {
  planDetail: PlanDetailDto;
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
        <PlanApprovalActions
          planId={planDetail.id}
          planName={planDetail.name}
          status={planDetail.status}
          approver={planDetail.approver}
        />
        {/* Plan Information Cards */}
        <PlanInfoCards
          budget={planDetail.budget}
          approver={planDetail.approver}
          createdAt={planDetail.createdAt}
          objective={planDetail.objective}
          status={planDetail.status}
        />

        {/* Statistics Section */}
        <PlanStatistics
          programsCount={planDetail.programsCount}
          topicsCount={planDetail.topicsCount}
          coursesCount={planDetail.coursesCount}
          instructorsCount={planDetail.instructorsCount}
        />

        {/* Program List Section */}
        <ProgramAccordion programs={planDetail.programs} programsCount={planDetail.programsCount} />
      </Box>
    </PageContainer>
  );
}
