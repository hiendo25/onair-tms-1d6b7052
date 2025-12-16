import { PATHS } from "@/constants/path.constant";
import PageContainer from "@/shared/ui/PageContainer";

import CreateSurveyForm from "./_components/CreateSurveyForm";

export default async function CreateSurveyPage() {
  return (
    <PageContainer
      title="Tạo khảo sát"
      breadcrumbs={[{ title: "Khảo sát", path: PATHS.SURVEYS.ROOT }, { title: "Tạo khảo sát" }]}
    >
      <div className="w-full max-w-[1080px] mx-auto">
        <CreateSurveyForm />
      </div>
    </PageContainer>
  );
}
