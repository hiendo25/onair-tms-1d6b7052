import { PATHS } from "@/constants/path.constant";
import PageContainer from "@/shared/ui/PageContainer";

import QuestionBankEditForm from "./_components/QuestionBankEditForm";

type QuestionBankEditPageProps = {
  params: Promise<{ id: string }>;
};

const QuestionBankEditPage = async ({ params }: QuestionBankEditPageProps) => {
  const { id } = await params;

  return (
    <PageContainer
      title="Chỉnh sửa câu hỏi"
      breadcrumbs={[
        { title: "Bài kiểm tra", path: PATHS.ASSIGNMENTS.ROOT },
        { title: "Ngân hàng câu hỏi", path: PATHS.ASSIGNMENTS.QUESTION_BANK },
        { title: "Chỉnh sửa câu hỏi" },
      ]}
    >
      <div>
        <QuestionBankEditForm questionId={id} />
      </div>
    </PageContainer>
  );
};

export default QuestionBankEditPage;
