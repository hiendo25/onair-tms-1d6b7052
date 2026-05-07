import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageContainer } from "@/components/PageContainer";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Eye, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/lib/org-context";
import { exportCsv } from "@/lib/csv";

export const Route = createFileRoute("/_app/admin/surveys-results")({
  head: () => ({ meta: [{ title: "Kết quả khảo sát — OnAir TMS" }] }),
  component: Page,
});

function Page() {
  const { orgId } = useOrg();
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["survey-results", orgId],
    queryFn: async () => {
      const { data } = await supabase.from("training_plan_surveys")
        .select("*, plan:plans(id,title,code), survey:surveys(id,title,code,responses_count)")
        .eq("org_id", orgId);
      return data ?? [];
    },
  });
  const filtered = useMemo(() => rows.filter((r: any) => {
    const text = `${r.plan?.title} ${r.survey?.title}`.toLowerCase();
    if (q && !text.includes(q.toLowerCase())) return false;
    if (from && r.start_date && r.start_date < from) return false;
    if (to && r.end_date && r.end_date > to) return false;
    return true;
  }), [rows, q, from, to]);

  const exportXlsx = () => {
    exportCsv("survey-results.csv", filtered.map((r: any) => ({
      "Khảo sát": r.survey?.title ?? "",
      "Kế hoạch": r.plan?.title ?? "",
      "Bắt đầu": r.start_date ?? "",
      "Kết thúc": r.end_date ?? "",
      "Trạng thái": r.status ?? "",
      "Phản hồi": r.survey?.responses_count ?? 0,
    })));
  };

  return (
    <PageContainer
      title="Kết quả khảo sát"
      breadcrumbs={[{ title: "Khảo sát" }, { title: "Kết quả" }]}
      actions={<Button variant="outline" size="sm" onClick={exportXlsx}><Download className="h-4 w-4 mr-1" />Xuất Excel</Button>}
    >
      <Card className="p-4 space-y-3">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="relative md:col-span-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input placeholder="Tìm khảo sát hoặc kế hoạch..." className="pl-8" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
      </Card>
      <Card>
        <Table>
          <TableHeader><TableRow>
            <TableHead>Khảo sát</TableHead><TableHead>Kế hoạch</TableHead>
            <TableHead>Ngày gửi</TableHead><TableHead>Phản hồi</TableHead>
            <TableHead>Trạng thái</TableHead><TableHead className="text-right">Thao tác</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {isLoading ? [...Array(3)].map((_, i) => <TableRow key={i}>{[...Array(6)].map((_, j) => <TableCell key={j}><Skeleton className="h-4" /></TableCell>)}</TableRow>) :
            filtered.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-8 text-slate-500">Chưa có kết quả khảo sát</TableCell></TableRow> :
            filtered.map((r: any) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.survey?.title}</TableCell>
                <TableCell>{r.plan?.title}</TableCell>
                <TableCell>{r.start_date}</TableCell>
                <TableCell>{r.survey?.responses_count ?? 0}</TableCell>
                <TableCell><Badge variant="outline">{r.status}</Badge></TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" asChild><Link to="/admin/surveys-results/$id" params={{ id: r.survey_id }}><Eye className="h-4 w-4" /></Link></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </PageContainer>
  );
}
