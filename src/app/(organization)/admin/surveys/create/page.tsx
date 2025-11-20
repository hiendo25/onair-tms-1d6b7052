import PageContainer from "@/shared/ui/PageContainer";
import CreateSurveyForm from "./_components/CreateSurveyForm";
import { PATHS } from "@/constants/path.contstants";

export default async function CreateSurveyPage() {
  return (
    <PageContainer
      title="Tạo khảo sát"
      breadcrumbs={[
        { title: "Khảo sát", path: PATHS.SURVEYS.ROOT },
        { title: "Tạo khảo sát" },
      ]}
    >
      <div className="max-w-[1200px]">
        <CreateSurveyForm />
      </div>
    </PageContainer>
  );
}

