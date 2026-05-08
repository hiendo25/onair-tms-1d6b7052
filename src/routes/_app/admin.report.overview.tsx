import { createFileRoute } from "@tanstack/react-router";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { TeamInsightsCard } from "@/components/ai/TeamInsightsCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLeaderboard } from "@/lib/data-hooks";

export const Route = createFileRoute("/_app/admin/report/overview")({
  head: () => ({ meta: [{ title: "Báo cáo tổng quan — OnAir TMS" }] }),
  component: ReportOverview,
});

function ReportOverview() {
  const { data: rows = [] } = useLeaderboard();
  return (
    <PageContainer title="Báo cáo tổng quan" breadcrumbs={[{ title: "Báo cáo" }, { title: "Tổng quan" }]}>
      <TeamInsightsCard />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5 text-amber-500" />Bảng xếp hạng tổ chức</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Hạng</TableHead>
                <TableHead>Học viên</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Điểm XP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Chưa có dữ liệu xếp hạng</TableCell></TableRow>}
              {rows.map(r => (
                <TableRow key={r.user_id}>
                  <TableCell><span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-bold">{r.rank}</span></TableCell>
                  <TableCell className="font-medium">{r.profile?.full_name || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{r.profile?.email}</TableCell>
                  <TableCell className="text-right font-mono">{r.xp.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
