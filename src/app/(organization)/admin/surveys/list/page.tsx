import * as React from "react";
import { Metadata, ResolvingMetadata } from "next";

import SurveyListContainer from "@/app/(organization)/admin/surveys/_components/SurveyListContainer";
import { PATHS } from "@/constants/path.constant";
import PageContainer from "@/shared/ui/PageContainer";
import TableDataSkeleton from "@/shared/ui/TableData/TableDataSkeleton";
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
      <React.Suspense fallback={<TableDataSkeleton rowCount={6} />}>
        <SurveyListContainer />
      </React.Suspense>
    </PageContainer>
  );
};
export default PageSurveyList;
