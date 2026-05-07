import { createFileRoute } from "@tanstack/react-router";
import { useGamifications, useGamificationMutations, type DBGamification } from "@/lib/data-hooks";
import { SimpleEntityPage } from "@/components/admin/SimpleEntityPage";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/admin/gamifications")({
  head: () => ({ meta: [{ title: "Gamification — OnAir TMS" }] }),
  component: Page,
});
const TYPE = [{ value: "badge", label: "Huy hiệu" }, { value: "level", label: "Cấp độ" }, { value: "leaderboard", label: "Bảng xếp hạng" }];

function Page() {
  const { data: rows = [], isLoading } = useGamifications();
  const m = useGamificationMutations();
  return (
    <SimpleEntityPage<DBGamification>
      title="Quản lý Gamification" breadcrumbs={[{ title: "Tương tác" }, { title: "Gamification" }]}
      rows={rows} isLoading={isLoading} searchKeys={["title", "code"]}
      filters={[{ key: "type", placeholder: "Loại", options: TYPE, match: (r, v) => r.type === v }]}
      columns={[
        { key: "code", label: "Mã", render: (r) => <Badge variant="outline">{r.code}</Badge> },
        { key: "title", label: "Tên" }, { key: "type", label: "Loại" }, { key: "points", label: "Điểm" },
        { key: "condition", label: "Điều kiện" },
        { key: "active", label: "Bật", render: (r) => <Badge className={r.active ? "bg-emerald-500" : "bg-muted text-muted-foreground"}>{r.active ? "Bật" : "Tắt"}</Badge> },
      ]}
      fields={[
        { key: "code", label: "Mã" }, { key: "title", label: "Tên" }, { key: "description", label: "Mô tả", type: "textarea" },
        { key: "type", label: "Loại", type: "select", options: TYPE },
        { key: "points", label: "Điểm thưởng", type: "number" },
        { key: "condition", label: "Điều kiện" },
      ]}
      emptyValues={{ code: "", title: "", description: "", type: "badge", points: 0, badge_url: "", condition: "", active: true }}
      onCreate={(v) => m.create.mutateAsync(v)} onUpdate={(v) => m.update.mutateAsync(v)} onDelete={(id) => m.remove.mutateAsync(id)}
      onBulkInsert={(rs) => m.bulkInsert.mutateAsync(rs.map((r: any) => ({ ...r, points: Number(r.points) || 0, active: true, badge_url: "", type: r.type || "badge" })))}
      csvFilename="gamifications.csv"
    />
  );
}
