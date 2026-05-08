import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, Loader2, User, BookOpen, ClipboardCheck, TrendingUp, Edit, ArrowLeft } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AiSpinner } from "@/components/ai/AiSpinner";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/lib/org-context";

export const Route = createFileRoute("/_app/admin/employees/$id/detail")({
  head: () => ({ meta: [{ title: "Chi tiết nhân viên — OnAir TMS" }] }),
  component: EmployeeDetail,
});

type EmployeeInsight = {
  summary: string;
  performance_level: "excellent" | "good" | "average" | "needs_improvement";
  strengths: string[];
  gaps: string[];
  next_steps: string[];
};

const PERF_LABEL: Record<string, { label: string; cls: string }> = {
  excellent: { label: "Xuất sắc", cls: "bg-emerald-100 text-emerald-700" },
  good: { label: "Tốt", cls: "bg-blue-100 text-blue-700" },
  average: { label: "Trung bình", cls: "bg-yellow-100 text-yellow-700" },
  needs_improvement: { label: "Cần cải thiện", cls: "bg-red-100 text-red-700" },
};

function useEmployeeDetail(employeeId: string, orgId: string) {
  return useQuery({
    queryKey: ["employee-detail", employeeId, orgId],
    queryFn: async () => {
      const { data: emp } = await supabase
        .from("employees")
        .select("*")
        .eq("id", employeeId)
        .single();
      if (!emp) return null;

      const userId = emp.user_id;
      const [progressRes, subsRes, certsRes, requiredRes] = await Promise.all([
        userId
          ? supabase.from("course_enrollments").select("course_id, status, progress, updated_at").eq("user_id", userId).eq("org_id", orgId)
          : Promise.resolve({ data: [] }),
        userId
          ? supabase.from("assignment_submissions").select("score, status, submitted_at").eq("user_id", userId)
          : Promise.resolve({ data: [] }),
        userId
          ? supabase.from("employee_certificates").select("id, issued_at").eq("employee_id", employeeId)
          : Promise.resolve({ data: [] }),
        supabase.from("online_courses").select("id").eq("org_id", orgId).eq("is_required", true),
      ]);

      const progress = progressRes.data ?? [];
      const subs = subsRes.data ?? [];
      const certs = certsRes.data ?? [];
      const requiredIds = new Set((requiredRes.data ?? []).map((r: { id: string }) => r.id));

      const completedCount = progress.filter((p) => p.status === "completed" || (p.progress ?? 0) >= 100).length;
      const reqCompleted = progress.filter((p) => requiredIds.has(p.course_id) && (p.status === "completed" || (p.progress ?? 0) >= 100)).length;
      const avgScore = subs.length ? subs.reduce((s, sub) => s + (sub.score ?? 0), 0) / subs.length : null;
      const passedCount = subs.filter((s) => s.status === "passed").length;

      return {
        emp,
        stats: {
          totalCourses: progress.length,
          completedCount,
          reqCompleted,
          reqTotal: requiredIds.size,
          avgScore: avgScore !== null ? Math.round(avgScore * 10) / 10 : null,
          passedCount,
          totalSubs: subs.length,
          certsCount: certs.length,
        },
        recentProgress: progress
          .sort((a, b) => new Date(b.updated_at ?? 0).getTime() - new Date(a.updated_at ?? 0).getTime())
          .slice(0, 5),
      };
    },
  });
}

function EmployeeDetail() {
  const { id } = Route.useParams();
  const { orgId } = useOrg();
  const { data, isLoading } = useEmployeeDetail(id, orgId);
  const [insight, setInsight] = useState<EmployeeInsight | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  async function analyze() {
    setAiLoading(true);
    setAiError(null);
    setInsight(null);
    try {
      const { data: res, error: fnErr } = await supabase.functions.invoke("ai-employee-insight", {
        body: { employeeId: id, orgId },
      });
      if (fnErr) throw fnErr;
      setInsight(res as EmployeeInsight);
    } catch (e) {
      setAiError(e instanceof Error ? e.message : "Có lỗi xảy ra, thử lại nhé.");
    } finally {
      setAiLoading(false);
    }
  }

  if (isLoading) {
    return (
      <PageContainer title="Chi tiết nhân viên" breadcrumbs={[{ title: "Nhân viên", path: "/admin/employees" }, { title: "..." }]}>
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      </PageContainer>
    );
  }

  if (!data) {
    return (
      <PageContainer title="Không tìm thấy" breadcrumbs={[{ title: "Nhân viên", path: "/admin/employees" }]}>
        <p className="text-muted-foreground">Không tìm thấy nhân viên.</p>
      </PageContainer>
    );
  }

  const { emp, stats } = data;
  const perf = insight ? PERF_LABEL[insight.performance_level] : null;

  return (
    <PageContainer
      title={emp.name}
      breadcrumbs={[{ title: "Nhân viên", path: "/admin/employees" }, { title: emp.name }]}
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        {/* Left column */}
        <div className="space-y-4">
          {/* Profile card */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-500 flex items-center justify-center text-white font-bold text-xl shrink-0">
                  {emp.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-semibold text-lg">{emp.name}</h2>
                    <Badge variant="outline">{emp.employee_code}</Badge>
                    {emp.status === "active"
                      ? <Badge className="bg-emerald-100 text-emerald-700">Đang làm việc</Badge>
                      : <Badge variant="secondary">{emp.status}</Badge>}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {[emp.position, emp.department, emp.branch].filter(Boolean).join(" · ")}
                  </div>
                  {emp.email && <div className="text-sm text-muted-foreground">{emp.email}</div>}
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link to="/admin/employees/$id/edit" params={{ id }}><Edit className="h-3.5 w-3.5 mr-1" />Sửa</Link>
                </Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                {[
                  { label: "Phòng ban", value: emp.department ?? "—" },
                  { label: "Chi nhánh", value: emp.branch ?? "—" },
                  { label: "Loại HĐ", value: emp.type ?? "—" },
                  { label: "Ngày vào làm", value: emp.joined_at ? new Date(emp.joined_at).toLocaleDateString("vi-VN") : "—" },
                ].map((item) => (
                  <div key={item.label} className="rounded-lg bg-muted/50 p-2.5">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{item.label}</div>
                    <div className="font-medium text-sm mt-0.5 truncate">{item.value}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Learning stats */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: BookOpen, label: "Khóa học", value: `${stats.completedCount}/${stats.totalCourses}`, sub: "hoàn thành", color: "text-blue-600" },
              { icon: ClipboardCheck, label: "Khóa bắt buộc", value: `${stats.reqCompleted}/${stats.reqTotal}`, sub: "hoàn thành", color: stats.reqCompleted < stats.reqTotal ? "text-red-600" : "text-emerald-600" },
              { icon: TrendingUp, label: "Điểm TB", value: stats.avgScore !== null ? `${stats.avgScore}/10` : "—", sub: `${stats.passedCount}/${stats.totalSubs} đạt`, color: "text-violet-600" },
              { icon: User, label: "Chứng chỉ", value: String(stats.certsCount), sub: "đã cấp", color: "text-amber-600" },
            ].map((item) => (
              <Card key={item.label}>
                <CardContent className="p-4 flex items-center gap-3">
                  <item.icon className={`h-8 w-8 ${item.color} shrink-0`} />
                  <div>
                    <div className="text-xs text-muted-foreground">{item.label}</div>
                    <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
                    <div className="text-[10px] text-muted-foreground">{item.sub}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Required courses progress */}
          {stats.reqTotal > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Tiến độ khóa bắt buộc</CardTitle></CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span>{stats.reqCompleted} / {stats.reqTotal} hoàn thành</span>
                    <span className="text-muted-foreground">{stats.reqTotal > 0 ? Math.round((stats.reqCompleted / stats.reqTotal) * 100) : 0}%</span>
                  </div>
                  <Progress value={stats.reqTotal > 0 ? (stats.reqCompleted / stats.reqTotal) * 100 : 0} />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column — AI insight */}
        <div className="space-y-3">
          <Card className="border-violet-200">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-violet-600" />
                  <span className="font-semibold text-sm">Phân tích AI</span>
                </div>
                {insight && perf && (
                  <Badge className={perf.cls}>{perf.label}</Badge>
                )}
              </div>

              {!insight && !aiLoading && !aiError && (
                <p className="text-sm text-muted-foreground">AI sẽ phân tích hiệu suất học tập, chỉ ra điểm mạnh, khoảng trống kỹ năng và gợi ý bước tiếp theo.</p>
              )}

              {aiLoading && <AiSpinner label="Đang phân tích hồ sơ..." />}

              {aiError && !aiLoading && (
                <div className="text-sm text-destructive">{aiError}</div>
              )}

              {insight && !aiLoading && (
                <div className="space-y-4 text-sm">
                  <p className="leading-relaxed">{insight.summary}</p>
                  <div>
                    <div className="font-semibold mb-1.5 text-emerald-700">✓ Điểm mạnh</div>
                    <ul className="space-y-1">
                      {insight.strengths.map((s, i) => <li key={i} className="flex gap-2"><span className="text-emerald-600 shrink-0">•</span><span>{s}</span></li>)}
                    </ul>
                  </div>
                  <div>
                    <div className="font-semibold mb-1.5 text-amber-700">⚠ Cần cải thiện</div>
                    <ul className="space-y-1">
                      {insight.gaps.map((g, i) => <li key={i} className="flex gap-2"><span className="text-amber-600 shrink-0">•</span><span>{g}</span></li>)}
                    </ul>
                  </div>
                  <div>
                    <div className="font-semibold mb-1.5 text-violet-700">→ Bước tiếp theo</div>
                    <ul className="space-y-1">
                      {insight.next_steps.map((n, i) => <li key={i} className="flex gap-2"><span className="text-violet-600 font-bold shrink-0">{i + 1}.</span><span>{n}</span></li>)}
                    </ul>
                  </div>
                </div>
              )}

              <Button
                className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-95 text-white"
                onClick={analyze}
                disabled={aiLoading}
              >
                <Sparkles className="h-4 w-4 mr-1.5" />
                {aiLoading ? "Đang phân tích..." : insight ? "Phân tích lại" : "Phân tích bằng AI"}
              </Button>
            </CardContent>
          </Card>

          <Button asChild variant="outline" className="w-full">
            <Link to="/admin/employees"><ArrowLeft className="h-4 w-4 mr-1.5" />Quay lại danh sách</Link>
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
