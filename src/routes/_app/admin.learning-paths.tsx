import { createFileRoute } from "@tanstack/react-router";
import { useLearningPaths, useLearningPathMutations, type DBLearningPath } from "@/lib/data-hooks";
import { SimpleEntityPage, StatusBadge } from "@/components/admin/SimpleEntityPage";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/admin/learning-paths")({
  head: () => ({ meta: [{ title: "Lộ trình học — OnAir TMS" }] }),
  component: Page,
});
const STATUS = [{ value: "draft", label: "Nháp" }, { value: "published", label: "Đã xuất bản" }];

function Page() {
  const { data: rows = [], isLoading } = useLearningPaths();
  const m = useLearningPathMutations();
  return (
    <SimpleEntityPage<DBLearningPath>
      title="Quản lý lộ trình học" breadcrumbs={[{ title: "Đào tạo" }, { title: "Lộ trình học" }]}
      rows={rows} isLoading={isLoading} searchKeys={["title", "code", "category"]}
      filters={[{ key: "status", placeholder: "Trạng thái", options: STATUS, match: (r, v) => r.status === v }]}
      columns={[
        { key: "code", label: "Mã", render: (r) => <Badge variant="outline">{r.code}</Badge> },
        { key: "title", label: "Tên" }, { key: "category", label: "Danh mục" },
        { key: "courses_count", label: "Khoá" }, { key: "duration_hours", label: "Giờ" },
        { key: "students_count", label: "HV" }, { key: "status", label: "Trạng thái", render: (r) => <StatusBadge value={r.status} /> },
      ]}
      fields={[
        { key: "code", label: "Mã" }, { key: "title", label: "Tên" }, { key: "description", label: "Mô tả", type: "textarea" },
        { key: "category", label: "Danh mục" }, { key: "courses_count", label: "Số khoá", type: "number" },
        { key: "duration_hours", label: "Giờ học", type: "number" }, { key: "status", label: "Trạng thái", type: "select", options: STATUS },
      ]}
      emptyValues={{ code: "", title: "", description: "", category: "", courses_count: 0, duration_hours: 0, students_count: 0, status: "draft" }}
      onCreate={(v) => m.create.mutateAsync(v)} onUpdate={(v) => m.update.mutateAsync(v)} onDelete={(id) => m.remove.mutateAsync(id)}
      onBulkInsert={(rs) => m.bulkInsert.mutateAsync(rs.map((r: any) => ({ ...r, courses_count: Number(r.courses_count) || 0, duration_hours: Number(r.duration_hours) || 0, students_count: 0, status: r.status || "draft" })))}
      csvFilename="learning_paths.csv"
    />
  );
}
