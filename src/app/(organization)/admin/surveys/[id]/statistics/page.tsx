import { Suspense } from "react";
import { notFound } from "next/navigation";

import { PATHS } from "@/constants/path.constant";
import { MOCK_SURVEYS } from "@/constants/survey.constant";
import { MOCK_SURVEY_RESPONSES } from "@/constants/survey-statistics.constant";
import { surveysRepository } from "@/repository";
import PageContainer from "@/shared/ui/PageContainer";

import SurveyStatistics from "./_components/SurveyStatistics";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SurveyStatisticsPage({ params }: PageProps) {
  const { id } = await params;

  const { data: surveyDetail, error } = await surveysRepository.getSurveyById(id);
  // Find survey from mock data
  const survey = MOCK_SURVEYS.find((s) => s.id === "1");

  if (!survey || !surveyDetail) {
    notFound();
  }

  // Get responses for this survey
  const responses = MOCK_SURVEY_RESPONSES["1"] || [];

  return (
    <PageContainer
      title={`Thống kê: ${surveyDetail.title}`}
      breadcrumbs={[
        { title: "Khảo sát", path: PATHS.SURVEYS.LIST },
        { title: surveyDetail.title },
        { title: "Thống kê" },
      ]}
    >
      <SurveyStatistics survey={survey} responses={responses} />
    </PageContainer>
  );
}
