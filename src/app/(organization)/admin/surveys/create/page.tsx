import { Metadata, ResolvingMetadata } from "next";

import { PATHS } from "@/constants/path.constant";
import PageContainer from "@/shared/ui/PageContainer";

import CreateSurveyForm from "./_components/CreateSurveyForm";

type CreateSurveyPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
  { params, searchParams }: CreateSurveyPageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  return {
    title: "Tạo khảo sát",
    description: "Tạo khảo sát",
  };
}

export default async function CreateSurveyPage(props: CreateSurveyPageProps) {
  return (
    <PageContainer
      title="Tạo khảo sát"
      breadcrumbs={[{ title: "Khảo sát", path: PATHS.SURVEYS.LIST }, { title: "Tạo khảo sát" }]}
    >
      <CreateSurveyForm />
    </PageContainer>
  );
}
