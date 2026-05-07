import { useQuery } from "@tanstack/react-query";
import { Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/lib/org-context";

export function TimeToCompetencyCard() {
  const { orgId } = useOrg();

  const { data, isLoading } = useQuery({
    queryKey: ["time-to-competency", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const [empRes, pathRes] = await Promise.all([
        supabase.from("employees").select("id, name, branch, user_id, created_at").eq("org_id", orgId),
        supabase.from("user_learning_path_progress")
          .select("user_id, completed_at")
          .eq("org_id", orgId)
          .not("completed_at", "is", null),
      ]);

      const employees = empRes.data ?? [];
      const completionsByUid = new Map<string, string>();
      (pathRes.data ?? []).forEach((p) => {
        if (!p.user_id || !p.completed_at) return;
        // earliest completion (onboarding-like)
        const prev = completionsByUid.get(p.user_id);
        if (!prev || new Date(p.completed_at) < new Date(prev)) {
          completionsByUid.set(p.user_id, p.completed_at);
        }
      });

      const perBranch = new Map<string, number[]>();
      let allDays: number[] = [];
      employees.forEach((e) => {
        if (!e.user_id) return;
        const completed = completionsByUid.get(e.user_id);
        if (!completed || !e.created_at) return;
        const days = Math.max(0, Math.round(
          (new Date(completed).getTime() - new Date(e.created_at).getTime()) / (1000 * 60 * 60 * 24),
        ));
        const branch = e.branch || "—";
        if (!perBranch.has(branch)) perBranch.set(branch, []);
        perBranch.get(branch)!.push(days);
        allDays.push(days);
      });

      const rows = Array.from(perBranch.entries())
        .map(([branch, arr]) => ({
          branch,
          avg: Math.round(arr.reduce((s, n) => s + n, 0) / arr.length),
          count: arr.length,
        }))
        .sort((a, b) => a.avg - b.avg);

      const overall = allDays.length
        ? Math.round(allDays.reduce((s, n) => s + n, 0) / allDays.length)
        : null;

      return { rows, overall, total: allDays.length };
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-600" />
          Thời gian đạt năng lực (onboarding)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading || !data ? (
          <div className="text-sm text-muted-foreground py-6 text-center">Đang tải...</div>
        ) : data.overall == null ? (
          <div className="text-sm text-muted-foreground py-6 text-center">
            Chưa có dữ liệu hoàn thành lộ trình. Cần liên kết nhân viên với tài khoản học viên và đánh dấu hoàn thành lộ trình.
          </div>
        ) : (
          <>
            <div className="rounded-lg border bg-blue-50 p-3 text-sm">
              <span className="font-semibold text-blue-700">
                Nhân viên mới trung bình mất {data.overall} ngày để hoàn thành onboarding
              </span>
              <span className="text-blue-600 ml-2">· {data.total} nhân viên</span>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Chi nhánh</TableHead>
                  <TableHead className="text-right">Số ngày TB</TableHead>
                  <TableHead className="text-right">Số nhân viên</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.rows.map((r) => (
                  <TableRow key={r.branch} className="hover:bg-muted/40">
                    <TableCell className="font-medium">{r.branch}</TableCell>
                    <TableCell className="text-right tabular-nums font-semibold">{r.avg} ngày</TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">{r.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </CardContent>
    </Card>
  );
}
