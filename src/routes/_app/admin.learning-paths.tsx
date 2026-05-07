import { createFileRoute } from "@tanstack/react-router";
import { useLearningPaths, useLearningPathMutations, type DBLearningPath } from "@/lib/data-hooks";
import { SimpleEntityPage, StatusBadge } from "@/components/admin/SimpleEntityPage";
import { Badge } from "@/components/ui/badge";
import { learningPathSchema, type LearningPathForm } from "@/lib/admin-schemas";
import { PATH_STATUS, CODE_NOTE } from "@/lib/admin-options";
import type { FieldDef } from "@/components/admin/EntityFormDialog";

export const Route = createFileRoute("/_app/admin/learning-paths")({
  head: () => ({ meta: [{ title: "Lộ trình học — OnAir TMS" }] }),
  component: Page,
});

const formFields: FieldDef<LearningPathForm>[] = [
  { name: "title", label: "Tên lộ trình học tập", type: "text", required: true, placeholder: "VD: Lộ trình quản lý cấp trung" },
  { name: "code", label: "Mã lộ trình", type: "text", required: true, placeholder: "VD: LP-MGR", note: CODE_NOTE },
  { name: "description", label: "Mô tả", type: "textarea", rows: 3 },
  { name: "category", label: "Danh mục", type: "text" },
  { name: "duration_hours", label: "Thời lượng (giờ)", type: "number" },
  { name: "status", label: "Trạng thái", type: "select", required: true, options: PATH_STATUS },
];
const empty: Partial<DBLearningPath> = { code: "", title: "", description: "", category: "", courses_count: 0, duration_hours: 0, students_count: 0, status: "draft" };

function Page() {
  const { data: rows = [], isLoading } = useLearningPaths();
  const m = useLearningPathMutations();
  return (
    <SimpleEntityPage<DBLearningPath>
      title="Quản lý lộ trình học" breadcrumbs={[{ title: "Đào tạo" }, { title: "Lộ trình học" }]}
      rows={rows} isLoading={isLoading} searchKeys={["title", "code", "category"]}
      filters={[{ key: "status", placeholder: "Trạng thái", options: PATH_STATUS, match: (r, v) => r.status === v }]}
      columns={[
        { key: "code", label: "Mã", render: (r) => <Badge variant="outline">{r.code}</Badge> },
        { key: "title", label: "Tên" }, { key: "category", label: "Danh mục" },
        { key: "courses_count", label: "Khoá" }, { key: "duration_hours", label: "Giờ" },
        { key: "students_count", label: "HV" }, { key: "status", label: "Trạng thái", render: (r) => <StatusBadge value={r.status} /> },
      ]}
      fields={[]}
      schema={learningPathSchema}
      formFields={formFields}
      entityLabel="lộ trình"
      emptyValues={empty}
      onCreate={(v) => m.create.mutateAsync(v)} onUpdate={(v) => m.update.mutateAsync(v)} onDelete={(id) => m.remove.mutateAsync(id)}
      onBulkInsert={(rs) => m.bulkInsert.mutateAsync(rs.map((r: any) => ({ ...r, courses_count: Number(r.courses_count) || 0, duration_hours: Number(r.duration_hours) || 0, students_count: 0, status: r.status || "draft" })))}
      csvFilename="learning_paths.csv"
    />
  );
}
