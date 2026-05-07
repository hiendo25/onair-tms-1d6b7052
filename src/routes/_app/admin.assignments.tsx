import { createFileRoute } from "@tanstack/react-router";
import { useAssignments, useAssignmentMutations, type DBAssignment } from "@/lib/data-hooks";
import { SimpleEntityPage, StatusBadge } from "@/components/admin/SimpleEntityPage";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/admin/assignments")({
  head: () => ({ meta: [{ title: "Bài tập — OnAir TMS" }] }),
  component: Page,
});
const TYPE = [{ value: "quiz", label: "Quiz" }, { value: "exam", label: "Thi" }, { value: "homework", label: "Bài tập về nhà" }];
const STATUS = [{ value: "draft", label: "Nháp" }, { value: "active", label: "Đang chạy" }, { value: "completed", label: "Kết thúc" }];

function Page() {
  const { data: rows = [], isLoading } = useAssignments();
  const m = useAssignmentMutations();
  return (
    <SimpleEntityPage<DBAssignment>
      title="Quản lý bài tập" breadcrumbs={[{ title: "Đào tạo" }, { title: "Bài tập" }]}
      rows={rows} isLoading={isLoading} searchKeys={["title", "code"]}
      filters={[
        { key: "type", placeholder: "Loại", options: TYPE, match: (r, v) => r.type === v },
        { key: "status", placeholder: "Trạng thái", options: STATUS, match: (r, v) => r.status === v },
      ]}
      columns={[
        { key: "code", label: "Mã", render: (r) => <Badge variant="outline">{r.code}</Badge> },
        { key: "title", label: "Tên" }, { key: "type", label: "Loại" }, { key: "total_questions", label: "Câu hỏi" },
        { key: "assigned_count", label: "Giao" }, { key: "completed_count", label: "Hoàn thành" },
        { key: "status", label: "Trạng thái", render: (r) => <StatusBadge value={r.status} /> },
      ]}
      fields={[
        { key: "code", label: "Mã" }, { key: "title", label: "Tên" }, { key: "description", label: "Mô tả", type: "textarea" },
        { key: "type", label: "Loại", type: "select", options: TYPE },
        { key: "total_questions", label: "Số câu hỏi", type: "number" },
        { key: "status", label: "Trạng thái", type: "select", options: STATUS },
      ]}
      emptyValues={{ code: "", title: "", description: "", type: "quiz", total_questions: 0, assigned_count: 0, completed_count: 0, status: "draft" }}
      onCreate={(v) => m.create.mutateAsync(v)} onUpdate={(v) => m.update.mutateAsync(v)} onDelete={(id) => m.remove.mutateAsync(id)}
      onBulkInsert={(rs) => m.bulkInsert.mutateAsync(rs.map((r: any) => ({ ...r, total_questions: Number(r.total_questions) || 0, assigned_count: 0, completed_count: 0, type: r.type || "quiz", status: r.status || "draft" })))}
      csvFilename="assignments.csv"
    />
  );
}
