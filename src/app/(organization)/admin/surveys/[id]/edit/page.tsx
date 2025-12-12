import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";

import { PATHS } from "@/constants/path.contstants";
import { surveysRepository } from "@/repository";
import PageContainer from "@/shared/ui/PageContainer";

import EditSurveyForm from "./_components/EditSurveyForm";

type EditSurveyPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
  { params, searchParams }: EditSurveyPageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { id } = await params;

  const { data: surveyDetail, error } = await surveysRepository.getSurveyById(id);

  return {
    title: surveyDetail?.title || "Sửa survey",
    description: surveyDetail?.description,
  };
}

export default async function EditSurveyPage({ params }: EditSurveyPageProps) {
  const { id } = await params;
  const { data: surveyDetail, error } = await surveysRepository.getSurveyById(id);

  if (error || !surveyDetail) {
    notFound();
  }

  console.log({ surveyDetail });
  return (
    <PageContainer
      title={surveyDetail.title}
      breadcrumbs={[
        { title: "Khảo sát", path: PATHS.SURVEYS.ROOT },
        { title: surveyDetail.title, path: PATHS.SURVEYS.EDIT(surveyDetail.id) },
        { title: "edit" },
      ]}
    >
      <div className="w-full max-w-[1080px] mx-auto">
        <EditSurveyForm data={surveyDetail} />
      </div>
    </PageContainer>
  );
}
