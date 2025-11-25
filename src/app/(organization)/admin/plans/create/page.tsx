import PageContainer from "@/shared/ui/PageContainer";
import CreatePlanForm from "./_components/CreatePlanForm";
import { PATHS } from "@/constants/path.contstants";

export default async function CreatePlanPage() {
  return (
    <PageContainer
      title="Tạo kế hoạch đào tạo"
      breadcrumbs={[
        { title: "Kế hoạch đào tạo", path: PATHS.PLANS.ROOT },
        { title: "Tạo kế hoạch đào tạo" },
      ]}
    >
      <div className="max-w-[1400px]">
        <CreatePlanForm />
      </div>
    </PageContainer>
  );
}

