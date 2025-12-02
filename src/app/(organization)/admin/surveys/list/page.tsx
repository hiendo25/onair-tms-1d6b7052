import * as React from "react";
import { Metadata, ResolvingMetadata } from "next";
import SurveyList from "@/app/(organization)/admin/surveys/_components/SurveyList";

type PageSurveyListProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
  { params, searchParams }: PageSurveyListProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  return {
    title: "Quản lý khảo sát",
    description: "Quản lý khảo sát",
  };
}

const PageSurveyList: React.FC<PageSurveyListProps> = () => {
  return <SurveyList />;
};
export default PageSurveyList;
