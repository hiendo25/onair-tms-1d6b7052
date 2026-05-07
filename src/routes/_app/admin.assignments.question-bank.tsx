import { createFileRoute } from "@tanstack/react-router";
import { useQuestions, useQuestionMutations, type DBQuestion } from "@/lib/data-hooks";
import { SimpleEntityPage } from "@/components/admin/SimpleEntityPage";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/admin/assignments/question-bank")({
  head: () => ({ meta: [{ title: "Ngân hàng câu hỏi — OnAir TMS" }] }),
  component: Page,
});
const TYPE = [{ value: "single", label: "Một đáp án" }, { value: "multiple", label: "Nhiều đáp án" }, { value: "text", label: "Tự luận" }];
const DIFF = [{ value: "easy", label: "Dễ" }, { value: "medium", label: "Trung bình" }, { value: "hard", label: "Khó" }];

function Page() {
  const { data: rows = [], isLoading } = useQuestions();
  const m = useQuestionMutations();
  const cats = Array.from(new Set(rows.map((r) => r.category).filter(Boolean))).map((c) => ({ value: c, label: c }));
  return (
    <SimpleEntityPage<DBQuestion>
      title="Ngân hàng câu hỏi" breadcrumbs={[{ title: "Đào tạo" }, { title: "Bài tập" }, { title: "Ngân hàng câu hỏi" }]}
      rows={rows} isLoading={isLoading} searchKeys={["question", "category"]}
      filters={[
        { key: "type", placeholder: "Loại", options: TYPE, match: (r, v) => r.type === v },
        { key: "difficulty", placeholder: "Độ khó", options: DIFF, match: (r, v) => r.difficulty === v },
        { key: "category", placeholder: "Danh mục", options: cats, match: (r, v) => r.category === v },
      ]}
      columns={[
        { key: "question", label: "Câu hỏi", render: (r) => <span className="line-clamp-2 max-w-md">{r.question}</span> },
        { key: "type", label: "Loại" }, { key: "category", label: "Danh mục" },
        { key: "difficulty", label: "Độ khó", render: (r) => <Badge variant="outline">{r.difficulty}</Badge> },
        { key: "points", label: "Điểm" },
      ]}
      fields={[
        { key: "question", label: "Câu hỏi", type: "textarea" },
        { key: "type", label: "Loại", type: "select", options: TYPE },
        { key: "category", label: "Danh mục" },
        { key: "difficulty", label: "Độ khó", type: "select", options: DIFF },
        { key: "correct_answer", label: "Đáp án đúng" },
        { key: "points", label: "Điểm", type: "number" },
      ]}
      emptyValues={{ question: "", type: "single", category: "", difficulty: "medium", options: [], correct_answer: "", points: 1, tags: [] }}
      onCreate={(v) => m.create.mutateAsync(v)} onUpdate={(v) => m.update.mutateAsync(v)} onDelete={(id) => m.remove.mutateAsync(id)}
      csvFilename="question_bank.csv"
    />
  );
}
