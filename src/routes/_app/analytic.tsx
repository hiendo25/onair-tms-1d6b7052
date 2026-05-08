import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Building2, LayoutGrid, Users, User, Search, Calendar, Download, Shield, GraduationCap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent } from "@/components/ui/card";
import { TeamInsightsCard } from "@/components/ai/TeamInsightsCard";
import { AiTrendCard } from "@/components/ai/AiTrendCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBranches, useDepartments, useEmployees } from "@/lib/data-hooks";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/lib/org-context";
import { useBranchReadiness, levelOf, levelLabel, levelClasses, scoreColor } from "@/lib/branch-readiness";
import { Badge } from "@/components/ui/badge";

function useBranchCompletion(orgId: string) {
  return useQuery({
    queryKey: ["branch-completion", orgId],
    queryFn: async () => {
      // Fetch all user_stats + employees for org, then group avg progress by branch
      const [{ data: stats }, { data: progress }] = await Promise.all([
        supabase.from("user_stats").select("user_id, branch").eq("org_id", orgId),
        supabase.from("course_enrollments").select("user_id, progress").eq("org_id", orgId),
      ]);
      const userBranch = new Map<string, string>();
      (stats ?? []).forEach((s: any) => userBranch.set(s.user_id, s.branch || ""));
      const branchAgg = new Map<string, { sum: number; n: number }>();
      (progress ?? []).forEach((p: any) => {
        const b = userBranch.get(p.user_id);
        if (!b) return;
        const cur = branchAgg.get(b) ?? { sum: 0, n: 0 };
        cur.sum += p.progress ?? 0;
        cur.n += 1;
        branchAgg.set(b, cur);
      });
      const map: Record<string, number> = {};
      branchAgg.forEach((v, k) => { map[k] = v.n ? Math.round(v.sum / v.n) : 0; });
      return map;
    },
  });
}

export const Route = createFileRoute("/_app/analytic")({
  head: () => ({ meta: [{ title: "Báo cáo tổ chức — OnAir TMS" }] }),
  component: ReportPage,
});

function ReportPage() {
  const { orgId } = useOrg();
  const { data: branches = [] } = useBranches();
  const { data: departments = [] } = useDepartments();
  const { data: employees = [] } = useEmployees();
  const { data: completionMap = {} } = useBranchCompletion(orgId);
  const { data: readiness = [] } = useBranchReadiness(orgId);
  const readinessByName = useMemo(() => {
    const m = new Map<string, number>();
    readiness.forEach((r) => m.set(r.branchName, r.score));
    return m;
  }, [readiness]);

  const [mode, setMode] = useState<"high" | "low">("high");
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const totalAdmins = employees.filter((e: any) => e.role === "admin" || e.position?.toLowerCase().includes("quản trị")).length || 7;
  const totalInstructors = employees.filter((e: any) => e.role === "instructor" || e.position?.toLowerCase().includes("giảng")).length || 16;
  const totalStudents = employees.length - totalAdmins - totalInstructors;

  const branchRows = useMemo(() => {
    return branches.map((b: any) => {
      const deps = departments.filter((d: any) => d.branch === b.name);
      const learners = employees.filter((e: any) => e.branch === b.name).length;
      const completion = completionMap[b.name] ?? 0;
      return {
        id: b.id,
        name: b.name,
        departments: deps.length,
        teams: 0,
        learners,
        completion,
      };
    });
  }, [branches, departments, employees, completionMap]);

  const filtered = branchRows.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()));
  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const paged = filtered.slice(start, start + pageSize);

  const sortedChart = [...branchRows].sort((a, b) => mode === "high" ? b.completion - a.completion : a.completion - b.completion).slice(0, 10);
  const maxPct = Math.max(100, ...sortedChart.map((b) => b.completion));

  const colorFor = (p: number) =>
    p >= 80 ? "bg-emerald-500" : p >= 50 ? "bg-amber-500" : "bg-red-500";

  const stats = [
    { value: branches.length, label: "Chi nhánh", Icon: Building2, bg: "bg-blue-50 text-blue-600" },
    { value: departments.length, label: "Phòng ban", Icon: LayoutGrid, bg: "bg-purple-50 text-purple-600" },
    { value: 2, label: "Đội nhóm", Icon: Users, bg: "bg-cyan-50 text-cyan-600" },
    { value: employees.length, label: "Người dùng", Icon: User, bg: "bg-orange-50 text-orange-600" },
  ];

  return (
    <PageContainer
      title="Báo cáo tổ chức"
      breadcrumbs={[{ title: "Báo cáo" }, { title: "Báo cáo tổ chức" }]}
      actions={
        <Button className="bg-primary">
          <Download className="h-4 w-4 mr-2" />
          Xuất excel
        </Button>
      }
    >
      {/* Tổng quan */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-700">Tổng quan</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <Card key={s.label}>
              <CardContent className="flex items-center gap-3 p-5">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.bg}`}>
                  <s.Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex justify-end gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" />{totalAdmins} Quản trị viên</span>
          <span className="flex items-center gap-1.5"><GraduationCap className="h-3.5 w-3.5" />{totalInstructors} Giảng viên</span>
          <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" />{Math.max(0, totalStudents)} Học viên</span>
        </div>
      </section>

      <TeamInsightsCard />

      <AiTrendCard />

      {/* Chart */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-sm font-semibold text-slate-700">Biểu đồ so sánh học tập top 10 chi nhánh</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>07/04/2026 - 07/05/2026</span>
            </div>
          </div>
          <div className="flex gap-1 rounded-full bg-slate-100 p-1 w-fit">
            <button
              onClick={() => setMode("high")}
              className={`px-4 py-1.5 text-sm rounded-full transition ${mode === "high" ? "bg-primary text-primary-foreground" : "text-slate-600"}`}
            >
              Cao nhất
            </button>
            <button
              onClick={() => setMode("low")}
              className={`px-4 py-1.5 text-sm rounded-full transition ${mode === "low" ? "bg-primary text-primary-foreground" : "text-slate-600"}`}
            >
              Thấp nhất
            </button>
          </div>

          <div className="relative h-72 pl-10 pr-2">
            {/* Y axis */}
            <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-xs text-muted-foreground">
              {[100, 80, 60, 40, 20, 0].map((v) => <span key={v}>{v}</span>)}
            </div>
            {/* Bars */}
            <div className="ml-2 h-full flex items-end justify-around gap-2 border-l border-b border-slate-200">
              {sortedChart.length === 0 ? (
                <div className="flex-1 text-center text-sm text-muted-foreground self-center">Chưa có đủ dữ liệu để đưa ra nhận xét, hãy tiếp tục học nhé</div>
              ) : sortedChart.map((b) => (
                <div key={b.id} className="flex-1 flex flex-col items-center justify-end h-full pb-6 relative">
                  <span className={`text-xs font-semibold mb-1 ${b.completion < 50 ? "text-red-600" : "text-slate-700"}`}>{b.completion}%</span>
                  <div
                    className={`w-6 rounded-t ${colorFor(b.completion)}`}
                    style={{ height: `${(b.completion / maxPct) * 90}%` }}
                  />
                  <span className="absolute bottom-0 text-[10px] text-muted-foreground truncate w-full text-center px-1">{b.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center gap-5 text-xs">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" />≥ 80% Tốt</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" />50-79% trung bình</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500" />&lt; 50 thấp</span>
          </div>
        </CardContent>
      </Card>

      {/* Branch list */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700">Danh sách chi nhánh</h2>
          <div className="relative max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-8"
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên chi nhánh</TableHead>
                <TableHead>Phòng ban</TableHead>
                <TableHead>Đội nhóm</TableHead>
                <TableHead>Học viên</TableHead>
                <TableHead>Tỉ lệ hoàn thành (%)</TableHead>
                <TableHead>Readiness Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Không có dữ liệu</TableCell></TableRow>
              ) : paged.map((b) => {
                const score = readinessByName.get(b.name);
                const lv = score != null ? levelOf(score) : null;
                return (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">{b.name}</TableCell>
                    <TableCell>{b.departments}</TableCell>
                    <TableCell>{b.teams}</TableCell>
                    <TableCell>{b.learners}</TableCell>
                    <TableCell className={b.completion < 50 ? "text-red-600 font-medium" : ""}>{b.completion}%</TableCell>
                    <TableCell>
                      {score == null ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold tabular-nums w-9">{score}%</span>
                          <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                            <div className={`h-full ${scoreColor(score)}`} style={{ width: `${score}%` }} />
                          </div>
                          {lv && <Badge variant="outline" className={`${levelClasses(lv)} text-[10px]`}>{levelLabel(lv)}</Badge>}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <div className="flex items-center justify-end gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Số hàng mỗi trang:</span>
              <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
                <SelectTrigger className="h-8 w-20"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[5, 10, 20, 50].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <span>{total === 0 ? "0" : `${start + 1}-${Math.min(start + pageSize, total)}`} trong {total}</span>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>‹</Button>
              <Button variant="outline" size="sm" disabled={start + pageSize >= total} onClick={() => setPage(page + 1)}>›</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
