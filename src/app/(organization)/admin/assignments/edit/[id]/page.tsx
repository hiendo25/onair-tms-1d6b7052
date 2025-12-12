import PageContainer from "@/shared/ui/PageContainer";
import UpdateAssignment from "./_components/UpdateAssignment";
import { PATHS } from "@/constants/path.constant";

interface EditAssignmentPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditAssignmentPage({ params }: EditAssignmentPageProps) {
  const { id } = await params;

  return (
    <PageContainer
      title="Chỉnh sửa bài kiểm tra"
      breadcrumbs={[
        { title: "Bài kiểm tra", path: PATHS.ASSIGNMENTS.ROOT },
        {
          title: "Chỉnh sửa bài kiểm tra",
        },
      ]}
    >
      <div className="max-w-[1200px]">
        <UpdateAssignment assignmentId={id} />
      </div>
    </PageContainer>
  );
}
