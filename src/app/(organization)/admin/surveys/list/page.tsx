import * as React from "react";
import { Metadata, ResolvingMetadata } from "next";

import SurveyListContainer from "@/app/(organization)/admin/surveys/_components/SurveyListContainer";
import { PATHS } from "@/constants/path.constant";
import PageContainer from "@/shared/ui/PageContainer";
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

const PageSurveyList: React.FC<PageSurveyListProps> = async () => {
  return (
    <PageContainer
      title="Danh sách khảo sát"
      breadcrumbs={[
        { title: "Khảo sát", path: PATHS.SURVEYS.LIST },
        { title: "Danh sách khảo sát", path: PATHS.SURVEYS.LIST },
      ]}
    >
      <SurveyListContainer />
    </PageContainer>
  );
};
export default PageSurveyList;

const sleep = async (timeout = 10000) => {
  return await new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("ok");
    }, timeout);
  });
};
