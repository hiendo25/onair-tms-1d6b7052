import { createFileRoute } from "@tanstack/react-router";
import { Users, BookOpen, GraduationCap, Trophy } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useOrgData } from "@/lib/org-context";

export const Route = createFileRoute("/_app/analytic")({
  head: () => ({ meta: [{ title: "Báo cáo & phân tích — OnAir TMS" }] }),
  component: AnalyticPage,
});

function AnalyticPage() {
  const data = useOrgData();
  const s = data.stats;
  const base = s.totalEmployees;
  const factors = [0.74, 0.84, 0.95, 0.97, 1.0, 1.02];
  const compFactor = s.completionRate / 100;
  const MONTHLY = ["T1","T2","T3","T4","T5","T6"].map((m, i) => ({
    m,
    learners: Math.round(base * factors[i]),
    completed: Math.round(base * factors[i] * compFactor),
  }));
  const MAX = Math.max(...MONTHLY.map(d => d.learners));

  const sortedCourses = [...data.courses].sort((a, b) => b.enrolled - a.enrolled).slice(0, 5);
  const topEnroll = sortedCourses[0]?.enrolled || 1;
  const TOP_COURSES = sortedCourses.map(c => ({ name: c.title, learners: c.enrolled, share: Math.round((c.enrolled / topEnroll) * 100) }));

  const TOP_LEARNERS = data.employees.slice(0, 5).map((e, i) => ({
    name: `${e.name} - ${e.position}`,
    xp: 2500 - i * 230,
    badge: ["🥇","🥈","🥉","4","5"][i],
  }));

  const stats = [
    { label: "Nhân viên hoạt động", value: s.totalEmployees.toLocaleString("vi-VN"), icon: Users, color: "text-blue-600 bg-blue-100" },
    { label: "Khoá hoàn thành tháng này", value: Math.round(s.totalEmployees * compFactor).toLocaleString("vi-VN"), icon: GraduationCap, color: "text-emerald-600 bg-emerald-100" },
    { label: "Chứng chỉ cấp tháng này", value: String(s.certsThisMonth), icon: BookOpen, color: "text-amber-600 bg-amber-100" },
    { label: "Giờ học tích luỹ", value: s.totalHours, icon: Trophy, color: "text-violet-600 bg-violet-100" },
  ];

  return (
    <PageContainer
      title="Analytic"
      breadcrumbs={[{ title: "Báo cáo" }, { title: "Analytic" }]}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(s => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="flex items-center gap-3 p-5">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</div>
                  <div className="text-xl font-semibold">{s.value}</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Học viên & Hoàn thành theo tháng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-56 items-stretch justify-between gap-3">
              {MONTHLY.map(d => (
                <div key={d.m} className="flex flex-1 flex-col items-center">
                  <div className="flex flex-1 w-full items-end gap-1">
                    <div
                      className="flex-1 rounded-t bg-primary transition-all"
                      style={{ height: `${(d.learners / MAX) * 100}%` }}
                    />
                    <div
                      className="flex-1 rounded-t bg-primary/40"
                      style={{ height: `${(d.completed / MAX) * 100}%` }}
                    />
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{d.m}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-center gap-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-primary" />Tham gia học</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-primary/40" />Đã hoàn thành</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Top học viên</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {TOP_LEARNERS.map((l, i) => (
              <div key={l.name} className="flex items-center justify-between rounded-md border p-2.5">
                <div className="flex items-center gap-3">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${i < 3 ? "" : "bg-muted text-muted-foreground"}`}>
                    {l.badge}
                  </span>
                  <span className="text-sm font-medium">{l.name}</span>
                </div>
                <Badge variant="outline" className="font-mono">{l.xp} XP</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Khoá học có tỉ lệ tham gia cao nhất</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {TOP_COURSES.map(c => (
            <div key={c.name}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-medium">{c.name}</span>
                <span className="text-muted-foreground">{c.learners} học viên</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${c.share}%` }} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
