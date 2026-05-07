import { createFileRoute } from "@tanstack/react-router";
import { usePlans, usePlanMutations, type DBPlan } from "@/lib/data-hooks";
import { SimpleEntityPage, StatusBadge } from "@/components/admin/SimpleEntityPage";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/admin/plans")({
  head: () => ({ meta: [{ title: "Kế hoạch đào tạo — OnAir TMS" }] }),
  component: Page,
});
const TYPE = [{ value: "training", label: "Đào tạo" }, { value: "onboarding", label: "Onboarding" }, { value: "promotion", label: "Lên cấp" }];
const STATUS = [{ value: "draft", label: "Nháp" }, { value: "active", label: "Đang chạy" }, { value: "completed", label: "Hoàn thành" }];

function Page() {
  const { data: rows = [], isLoading } = usePlans();
  const m = usePlanMutations();
  return (
    <SimpleEntityPage<DBPlan>
      title="Quản lý kế hoạch đào tạo" breadcrumbs={[{ title: "Quản lý" }, { title: "Kế hoạch" }]}
      rows={rows} isLoading={isLoading} searchKeys={["title", "code"]}
      filters={[
        { key: "type", placeholder: "Loại", options: TYPE, match: (r, v) => r.type === v },
        { key: "status", placeholder: "Trạng thái", options: STATUS, match: (r, v) => r.status === v },
      ]}
      columns={[
        { key: "code", label: "Mã", render: (r) => <Badge variant="outline">{r.code}</Badge> },
        { key: "title", label: "Tên" }, { key: "type", label: "Loại" },
        { key: "target_count", label: "Mục tiêu" }, { key: "completed_count", label: "Hoàn thành" },
        { key: "status", label: "Trạng thái", render: (r) => <StatusBadge value={r.status} /> },
      ]}
      fields={[
        { key: "code", label: "Mã" }, { key: "title", label: "Tên" }, { key: "description", label: "Mô tả", type: "textarea" },
        { key: "type", label: "Loại", type: "select", options: TYPE },
        { key: "start_date", label: "Bắt đầu", type: "date" }, { key: "end_date", label: "Kết thúc", type: "date" },
        { key: "target_count", label: "Mục tiêu", type: "number" },
        { key: "status", label: "Trạng thái", type: "select", options: STATUS },
      ]}
      emptyValues={{ code: "", title: "", description: "", type: "training", target_count: 0, completed_count: 0, status: "draft" }}
      onCreate={(v) => m.create.mutateAsync(v)} onUpdate={(v) => m.update.mutateAsync(v)} onDelete={(id) => m.remove.mutateAsync(id)}
      onBulkInsert={(rs) => m.bulkInsert.mutateAsync(rs.map((r: any) => ({ ...r, target_count: Number(r.target_count) || 0, completed_count: 0, type: r.type || "training", status: r.status || "draft" })))}
      csvFilename="plans.csv"
    />
  );
}
