import React from "react";
import { Typography } from "@mui/material";
import dayjs from "dayjs";
import { Metadata, ResolvingMetadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { PATHS } from "@/constants/path.constant";
import { surveyResponseRepository } from "@/repository";
import PageContainer from "@/shared/ui/PageContainer";

type PageThankYouProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ responseId: string } & Record<string, any>>;
};

export async function generateMetadata(
  { params, searchParams }: PageThankYouProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  return {
    title: "Thank you",
    description: "Thank you",
  };
}
const PageThankYou: React.FC<PageThankYouProps> = async ({ params, searchParams }) => {
  const { id: surveyId } = await params;
  const { responseId } = await searchParams;

  const { data: responseData, error: responseError } = await surveyResponseRepository.getSurveyResponseById(responseId);

  console.log({ responseData });
  if (!responseData || responseError) {
    notFound();
  }

  const createdAt = dayjs(responseData.created_at);
  const current = dayjs();
  if (current.isAfter(createdAt.add(5, "minutes"))) {
    redirect(PATHS.DASHBOARD);
  }
  return (
    <PageContainer>
      <div className="mx-auto max-w-[850px] text-center">
        <Image
          src={"/assets/images/survey-success.png"}
          width={120}
          height={120}
          alt="survey success"
          className="inline-block mb-3"
        />
        <Typography variant="h3" gutterBottom>
          Khảo sát đã hoàn tất!
        </Typography>
        <Typography gutterBottom>
          Cảm ơn <span className="font-semibold">{responseData.employees.profiles?.full_name}</span> đã gửi khảo sát.
        </Typography>
        <hr className="my-6 text-gray-200 max-w-[220px] mx-auto" />
        <div>
          <Typography className="font-medium">{responseData.survey.title}</Typography>
          <Typography variant="body2" color="textSecondary">
            {createdAt.format("DD/MM/YYYY HH:mm")}
          </Typography>
        </div>
        <div className="h-6"></div>
        <Link href={PATHS.DASHBOARD} className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium">
          Trở lại trang chủ
        </Link>
      </div>
    </PageContainer>
  );
};
export default PageThankYou;
