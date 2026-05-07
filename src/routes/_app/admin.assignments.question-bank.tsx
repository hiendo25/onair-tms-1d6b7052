import { createFileRoute } from "@tanstack/react-router";
import { useQuestions, useQuestionMutations, type DBQuestion } from "@/lib/data-hooks";
import { SimpleEntityPage } from "@/components/admin/SimpleEntityPage";
import { Badge } from "@/components/ui/badge";
import { questionSchema, type QuestionForm } from "@/lib/admin-schemas";
import { QUESTION_TYPE, DIFFICULTY } from "@/lib/admin-options";
import type { FieldDef } from "@/components/admin/EntityFormDialog";

export const Route = createFileRoute("/_app/admin/assignments/question-bank")({
  head: () => ({ meta: [{ title: "Ngân hàng câu hỏi — OnAir TMS" }] }),
  component: Page,
});

const formFields: FieldDef<QuestionForm>[] = [
  { name: "question", label: "Nội dung câu hỏi", type: "textarea", required: true, rows: 4 },
  { name: "type", label: "Loại câu hỏi", type: "select", required: true, options: QUESTION_TYPE },
  { name: "category", label: "Danh mục", type: "text", placeholder: "VD: Kiến thức sản phẩm" },
  { name: "difficulty", label: "Độ khó", type: "select", required: true, options: DIFFICULTY },
  { name: "correct_answer", label: "Đáp án đúng", type: "text", placeholder: "Áp dụng cho câu Đúng/Sai hoặc Tự luận mẫu" },
  { name: "points", label: "Điểm", type: "number", required: true, placeholder: "VD: 1" },
];
const empty: Partial<DBQuestion> = { question: "", type: "single", category: "", difficulty: "medium", options: [], correct_answer: "", points: 1, tags: [] };

function Page() {
  const { data: rows = [], isLoading } = useQuestions();
  const m = useQuestionMutations();
  const cats = Array.from(new Set(rows.map((r) => r.category).filter(Boolean))).map((c) => ({ value: c, label: c }));
  return (
    <SimpleEntityPage<DBQuestion>
      title="Ngân hàng câu hỏi" breadcrumbs={[{ title: "Đào tạo" }, { title: "Bài kiểm tra" }, { title: "Ngân hàng câu hỏi" }]}
      rows={rows} isLoading={isLoading} searchKeys={["question", "category"]}
      filters={[
        { key: "type", placeholder: "Loại câu hỏi", options: QUESTION_TYPE, match: (r, v) => r.type === v },
        { key: "difficulty", placeholder: "Độ khó", options: DIFFICULTY, match: (r, v) => r.difficulty === v },
        { key: "category", placeholder: "Danh mục", options: cats, match: (r, v) => r.category === v },
      ]}
      columns={[
        { key: "question", label: "Câu hỏi", render: (r) => <span className="line-clamp-2 max-w-md">{r.question}</span> },
        { key: "type", label: "Loại" }, { key: "category", label: "Danh mục" },
        { key: "difficulty", label: "Độ khó", render: (r) => <Badge variant="outline">{r.difficulty}</Badge> },
        { key: "points", label: "Điểm" },
      ]}
      fields={[]}
      schema={questionSchema}
      formFields={formFields}
      entityLabel="câu hỏi"
      emptyValues={empty}
      onCreate={(v) => m.create.mutateAsync(v)} onUpdate={(v) => m.update.mutateAsync(v)} onDelete={(id) => m.remove.mutateAsync(id)}
      csvFilename="question_bank.csv"
    />
  );
}
