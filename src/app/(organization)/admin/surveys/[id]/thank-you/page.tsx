import React from "react";
import { Typography } from "@mui/material";
import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";

import { PATHS } from "@/constants/path.constant";
import { surveysRepository } from "@/repository";
import PageContainer from "@/shared/ui/PageContainer";

type PageThankYouProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
  { params, searchParams }: PageThankYouProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { id } = await params;

  const { data: surveyDetail, error } = await surveysRepository.getSurveyById(id);

  return {
    title: surveyDetail?.title || "Làm khảo sát",
    description: surveyDetail?.description,
  };
}
const PageThankYou: React.FC<PageThankYouProps> = async ({ params }) => {
  const { id: surveyId } = await params;

  const { data: surveyDetail, error } = await surveysRepository.getSurveyById(surveyId);

  if (!surveyDetail || error) {
    notFound();
  }

  return (
    <PageContainer
      title={`Làm khảo sát: ${surveyDetail.title}`}
      breadcrumbs={[
        {
          title: "Danh sách khảo sát",
          path: PATHS.SURVEYS.LIST,
        },
        {
          title: surveyDetail.title,
        },
      ]}
    >
      <Typography component="div">{surveyDetail.description}</Typography>
      <div className="h-6"></div>
      <Typography component="h3" variant="h5" className="mb-6">
        Câu hỏi khảo sát
      </Typography>
    </PageContainer>
  );
};
export default PageThankYou;
