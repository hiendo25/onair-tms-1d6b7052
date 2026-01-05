import { Typography } from "@mui/material";
import { notFound } from "next/navigation";

import { PATHS } from "@/constants/path.constant";
import { surveysRepository } from "@/repository";
import PageContainer from "@/shared/ui/PageContainer";

import ResponseStatistics from "./_components/ResponseStatistics";
import SurveyStatisticProvider from "./_components/SurveyStatisticProvider";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SurveyStatisticsPage({ params }: PageProps) {
  const { id: surveyId } = await params;

  const { data: surveyDetailData, error: ErrorSurveyDetail } = await surveysRepository.getSurveyResponsesById(surveyId);

  if (!surveyDetailData || ErrorSurveyDetail) {
    notFound();
  }

  const sortedQuestions = surveyDetailData.questions.sort((a, b) => a.priority - b.priority);

  return (
    <PageContainer
      title={`Thống kê: ${surveyDetailData.title}`}
      breadcrumbs={[
        { title: "Khảo sát", path: PATHS.SURVEYS.LIST },
        { title: surveyDetailData.title },
        { title: "Thống kê" },
      ]}
    >
      <SurveyStatisticProvider data={{ questions: sortedQuestions, responses: surveyDetailData.responses }}>
        <Typography variant="h6" gutterBottom>
          {`Tổng số phản hồi: ${surveyDetailData.responseCount[0]?.count}`}
        </Typography>
        <ResponseStatistics />
      </SurveyStatisticProvider>
    </PageContainer>
  );
}
