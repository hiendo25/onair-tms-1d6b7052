import { createFileRoute } from "@tanstack/react-router";
import { usePlans, usePlanMutations, type DBPlan } from "@/lib/data-hooks";
import { SimpleEntityPage, StatusBadge } from "@/components/admin/SimpleEntityPage";
import { Badge } from "@/components/ui/badge";
import { planSchema, type PlanForm } from "@/lib/admin-schemas";
import { PLAN_TYPE, PLAN_STATUS, CODE_NOTE } from "@/lib/admin-options";
import type { FieldDef } from "@/components/admin/EntityFormDialog";

export const Route = createFileRoute("/_app/admin/plans")({
  head: () => ({ meta: [{ title: "Kế hoạch đào tạo — OnAir TMS" }] }),
  component: Page,
});

const formFields: FieldDef<PlanForm>[] = [
  { name: "title", label: "Tên kế hoạch", type: "text", required: true },
  { name: "code", label: "Mã kế hoạch", type: "text", required: true, note: CODE_NOTE },
  { name: "description", label: "Mô tả", type: "textarea", rows: 3 },
  { name: "type", label: "Loại kế hoạch", type: "select", required: true, options: PLAN_TYPE },
  { name: "start_date", label: "Ngày bắt đầu", type: "date" },
  { name: "end_date", label: "Ngày kết thúc", type: "date" },
  { name: "target_count", label: "Số lượng mục tiêu", type: "number" },
  { name: "status", label: "Trạng thái", type: "select", required: true, options: PLAN_STATUS },
];
const empty: Partial<DBPlan> = { code: "", title: "", description: "", type: "training", target_count: 0, completed_count: 0, start_date: "", end_date: "", status: "draft" };

function Page() {
  const { data: rows = [], isLoading } = usePlans();
  const m = usePlanMutations();
  return (
    <SimpleEntityPage<DBPlan>
      title="Quản lý kế hoạch đào tạo" breadcrumbs={[{ title: "Quản lý" }, { title: "Kế hoạch" }]}
      rows={rows} isLoading={isLoading} searchKeys={["title", "code"]}
      filters={[
        { key: "type", placeholder: "Loại", options: PLAN_TYPE, match: (r, v) => r.type === v },
        { key: "status", placeholder: "Trạng thái", options: PLAN_STATUS, match: (r, v) => r.status === v },
      ]}
      columns={[
        { key: "code", label: "Mã", render: (r) => <Badge variant="outline">{r.code}</Badge> },
        { key: "title", label: "Tên" }, { key: "type", label: "Loại" },
        { key: "target_count", label: "Mục tiêu" }, { key: "completed_count", label: "Hoàn thành" },
        { key: "status", label: "Trạng thái", render: (r) => <StatusBadge value={r.status} /> },
      ]}
      fields={[]}
      schema={planSchema}
      formFields={formFields}
      entityLabel="kế hoạch"
      emptyValues={empty}
      onCreate={(v) => m.create.mutateAsync(v)} onUpdate={(v) => m.update.mutateAsync(v)} onDelete={(id) => m.remove.mutateAsync(id)}
      onBulkInsert={(rs) => m.bulkInsert.mutateAsync(rs.map((r: any) => ({ ...r, target_count: Number(r.target_count) || 0, completed_count: 0, type: r.type || "training", status: r.status || "draft" })))}
      csvFilename="plans.csv"
    />
  );
}
