import { createFileRoute } from "@tanstack/react-router";
import { useAssignments, useAssignmentMutations, type DBAssignment } from "@/lib/data-hooks";
import { SimpleEntityPage, StatusBadge } from "@/components/admin/SimpleEntityPage";
import { Badge } from "@/components/ui/badge";
import { assignmentSchema, type AssignmentForm } from "@/lib/admin-schemas";
import { ASSIGNMENT_TYPE, ASSIGNMENT_STATUS, CODE_NOTE } from "@/lib/admin-options";
import type { FieldDef } from "@/components/admin/EntityFormDialog";

export const Route = createFileRoute("/_app/admin/assignments/")({
  head: () => ({ meta: [{ title: "Bài tập — OnAir TMS" }] }),
  component: Page,
});

const formFields: FieldDef<AssignmentForm>[] = [
  { name: "title", label: "Tên bài kiểm tra", type: "text", required: true },
  { name: "code", label: "Mã bài kiểm tra", type: "text", required: true, placeholder: "VD: QZ-001", note: CODE_NOTE },
  { name: "description", label: "Mô tả", type: "textarea", rows: 3 },
  { name: "type", label: "Loại bài", type: "select", required: true, options: ASSIGNMENT_TYPE },
  { name: "total_questions", label: "Số câu hỏi", type: "number" },
  { name: "deadline", label: "Hạn nộp", type: "date" },
  { name: "status", label: "Trạng thái", type: "select", required: true, options: ASSIGNMENT_STATUS },
];
const empty: Partial<DBAssignment> = { code: "", title: "", description: "", type: "quiz", total_questions: 0, assigned_count: 0, completed_count: 0, deadline: "", status: "draft" };

function Page() {
  const { data: rows = [], isLoading } = useAssignments();
  const m = useAssignmentMutations();
  return (
    <SimpleEntityPage<DBAssignment>
      title="Quản lý bài kiểm tra" breadcrumbs={[{ title: "Đào tạo" }, { title: "Bài kiểm tra" }]}
      rows={rows} isLoading={isLoading} searchKeys={["title", "code"]}
      filters={[
        { key: "type", placeholder: "Loại", options: ASSIGNMENT_TYPE, match: (r, v) => r.type === v },
        { key: "status", placeholder: "Trạng thái", options: ASSIGNMENT_STATUS, match: (r, v) => r.status === v },
      ]}
      columns={[
        { key: "code", label: "Mã", render: (r) => <Badge variant="outline">{r.code}</Badge> },
        { key: "title", label: "Tên" }, { key: "type", label: "Loại" }, { key: "total_questions", label: "Câu hỏi" },
        { key: "assigned_count", label: "Giao" }, { key: "completed_count", label: "Hoàn thành" },
        { key: "status", label: "Trạng thái", render: (r) => <StatusBadge value={r.status} /> },
      ]}
      fields={[]}
      schema={assignmentSchema}
      formFields={formFields}
      entityLabel="bài kiểm tra"
      emptyValues={empty}
      onCreate={(v) => m.create.mutateAsync(v)} onUpdate={(v) => m.update.mutateAsync(v)} onDelete={(id) => m.remove.mutateAsync(id)}
      onBulkInsert={(rs) => m.bulkInsert.mutateAsync(rs.map((r: any) => ({ ...r, total_questions: Number(r.total_questions) || 0, assigned_count: 0, completed_count: 0, type: r.type || "quiz", status: r.status || "draft" })))}
      csvFilename="assignments.csv"
    />
  );
}
