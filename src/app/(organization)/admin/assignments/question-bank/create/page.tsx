import { PATHS } from "@/constants/path.constant";
import PageContainer from "@/shared/ui/PageContainer";

import QuestionBankCreateForm from "./_components/QuestionBankCreateForm";

const QuestionBankCreatePage = async () => {
  return (
    <PageContainer
      title="Tạo câu hỏi"
      breadcrumbs={[
        { title: "Bài kiểm tra", path: PATHS.ASSIGNMENTS.ROOT },
        { title: "Ngân hàng câu hỏi", path: PATHS.ASSIGNMENTS.QUESTION_BANK },
        { title: "Tạo câu hỏi" },
      ]}
    >
      <div>
        <QuestionBankCreateForm />
      </div>
    </PageContainer>
  );
};

export default QuestionBankCreatePage;
