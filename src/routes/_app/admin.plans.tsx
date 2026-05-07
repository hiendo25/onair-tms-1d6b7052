import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, MoreHorizontal } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useOrgData } from "@/lib/org-context";

export const Route = createFileRoute("/_app/admin/plans")({
  head: () => ({ meta: [{ title: "Kế hoạch đào tạo — OnAir TMS" }] }),
  component: PlansPage,
});

const STATUS_VARIANT = {
  draft: { label: "Nháp", className: "bg-slate-100 text-slate-700 hover:bg-slate-100" },
  approved: { label: "Đã duyệt", className: "bg-blue-100 text-blue-700 hover:bg-blue-100" },
  running: { label: "Đang chạy", className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" },
  completed: { label: "Hoàn thành", className: "bg-violet-100 text-violet-700 hover:bg-violet-100" },
} as const;

function PlansPage() {
  const data = useOrgData();
  return (
    <PageContainer
      title="Kế hoạch đào tạo"
      breadcrumbs={[{ title: "Kế hoạch đào tạo" }]}
      actions={
        <Button asChild size="sm">
          <Link to="/admin/plans/create"><Plus className="h-4 w-4" />Tạo kế hoạch</Link>
        </Button>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(["draft", "approved", "running", "completed"] as const).map((s) => {
          const count = data.plans.filter(p => p.status === s).length;
          return (
            <Card key={s} className="p-4">
              <div className="text-xs uppercase text-muted-foreground tracking-wide">{STATUS_VARIANT[s].label}</div>
              <div className="mt-1 text-2xl font-semibold">{count}</div>
            </Card>
          );
        })}
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên kế hoạch</TableHead>
              <TableHead>Năm / Quý</TableHead>
              <TableHead className="text-right">Khóa học</TableHead>
              <TableHead className="text-right">Học viên</TableHead>
              <TableHead className="text-right">Ngân sách</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.plans.map(p => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell>{p.year} / Q{p.quarter}</TableCell>
                <TableCell className="text-right">{p.totalCourses}</TableCell>
                <TableCell className="text-right">{p.totalLearners}</TableCell>
                <TableCell className="text-right font-mono text-sm">{p.budget}</TableCell>
                <TableCell><Badge className={STATUS_VARIANT[p.status].className}>{STATUS_VARIANT[p.status].label}</Badge></TableCell>
                <TableCell><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </PageContainer>
  );
}
