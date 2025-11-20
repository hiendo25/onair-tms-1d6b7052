import * as React from "react";
import { notFound } from "next/navigation";
import { Box } from "@mui/material";
import PageContainer from "@/shared/ui/PageContainer";
import { MOCK_SURVEYS } from "@/constants/survey.constants";
import { MOCK_SURVEY_RESPONSES } from "@/constants/survey-statistics.constants";
import SurveyStatistics from "./_components/SurveyStatistics";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SurveyStatisticsPage({ params }: PageProps) {
  const { id } = await params;

  // Find survey from mock data
  const survey = MOCK_SURVEYS.find((s) => s.id === id);

  if (!survey) {
    notFound();
  }

  // Get responses for this survey
  const responses = MOCK_SURVEY_RESPONSES[id] || [];

  return (
    <PageContainer
      title="Thống kê khảo sát"
      breadcrumbs={[
        { title: "Quản trị", path: "/admin" },
        { title: "Khảo sát", path: "/admin/surveys" },
        { title: survey.name, path: `/admin/surveys/${id}` },
        { title: "Thống kê", path: `/admin/surveys/${id}/statistics` },
      ]}
    >
      <Box sx={{ py: 3 }}>
        <SurveyStatistics survey={survey} responses={responses} />
      </Box>
    </PageContainer>
  );
}

