import { createFileRoute } from "@tanstack/react-router";
import { useSurveys, useSurveyMutations, type DBSurvey } from "@/lib/data-hooks";
import { SimpleEntityPage, StatusBadge } from "@/components/admin/SimpleEntityPage";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/admin/surveys")({
  head: () => ({ meta: [{ title: "Khảo sát — OnAir TMS" }] }),
  component: Page,
});
const TYPE = [{ value: "general", label: "Chung" }, { value: "engagement", label: "Hài lòng" }, { value: "training", label: "Đào tạo" }, { value: "feedback", label: "Phản hồi" }];
const STATUS = [{ value: "draft", label: "Nháp" }, { value: "active", label: "Đang chạy" }, { value: "completed", label: "Kết thúc" }];

function Page() {
  const { data: rows = [], isLoading } = useSurveys();
  const m = useSurveyMutations();
  return (
    <SimpleEntityPage<DBSurvey>
      title="Quản lý khảo sát" breadcrumbs={[{ title: "Khảo sát" }]}
      rows={rows} isLoading={isLoading} searchKeys={["title", "code"]}
      filters={[
        { key: "type", placeholder: "Loại", options: TYPE, match: (r, v) => r.type === v },
        { key: "status", placeholder: "Trạng thái", options: STATUS, match: (r, v) => r.status === v },
      ]}
      columns={[
        { key: "code", label: "Mã", render: (r) => <Badge variant="outline">{r.code}</Badge> },
        { key: "title", label: "Tên" }, { key: "type", label: "Loại" },
        { key: "responses_count", label: "Phản hồi" }, { key: "target_count", label: "Mục tiêu" },
        { key: "status", label: "Trạng thái", render: (r) => <StatusBadge value={r.status} /> },
      ]}
      fields={[
        { key: "code", label: "Mã" }, { key: "title", label: "Tên" }, { key: "description", label: "Mô tả", type: "textarea" },
        { key: "type", label: "Loại", type: "select", options: TYPE },
        { key: "target_count", label: "Mục tiêu", type: "number" },
        { key: "start_date", label: "Bắt đầu", type: "date" }, { key: "end_date", label: "Kết thúc", type: "date" },
        { key: "status", label: "Trạng thái", type: "select", options: STATUS },
      ]}
      emptyValues={{ code: "", title: "", description: "", type: "general", anonymous: false, responses_count: 0, target_count: 0, status: "draft" }}
      onCreate={(v) => m.create.mutateAsync(v)} onUpdate={(v) => m.update.mutateAsync(v)} onDelete={(id) => m.remove.mutateAsync(id)}
      onBulkInsert={(rs) => m.bulkInsert.mutateAsync(rs.map((r: any) => ({ ...r, target_count: Number(r.target_count) || 0, responses_count: 0, anonymous: false, type: r.type || "general", status: r.status || "draft" })))}
      csvFilename="surveys.csv"
    />
  );
}
