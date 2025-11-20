import PageContainer from "@/shared/ui/PageContainer";
import EditSurveyForm from "./_components/EditSurveyForm";
import { PATHS } from "@/constants/path.contstants";

interface EditSurveyPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditSurveyPage({ params }: EditSurveyPageProps) {
  const { id } = await params;

  return (
    <PageContainer
      title="Chỉnh sửa khảo sát"
      breadcrumbs={[
        { title: "Khảo sát", path: PATHS.SURVEYS.ROOT },
        { title: "Chỉnh sửa khảo sát" },
      ]}
    >
      <div className="max-w-[1200px]">
        <EditSurveyForm surveyId={id} />
      </div>
    </PageContainer>
  );
}

