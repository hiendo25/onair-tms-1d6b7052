import { createFileRoute } from "@tanstack/react-router";
import { Users, BookOpen, GraduationCap, Trophy } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/admin/analytic")({
  head: () => ({ meta: [{ title: "Báo cáo & phân tích — OnAir LMS" }] }),
  component: AnalyticPage,
});

const MONTHLY = [
  { m: "T1", learners: 120, completed: 78 },
  { m: "T2", learners: 145, completed: 92 },
  { m: "T3", learners: 187, completed: 124 },
  { m: "T4", learners: 210, completed: 156 },
  { m: "T5", learners: 245, completed: 188 },
  { m: "T6", learners: 268, completed: 201 },
];
const MAX = Math.max(...MONTHLY.map(d => d.learners));

const TOP_COURSES = [
  { name: "Tiếng Anh thương mại", learners: 432, share: 95 },
  { name: "Excel nâng cao", learners: 189, share: 70 },
  { name: "Sales Excellence 2026", learners: 22, share: 12 },
  { name: "Onboarding nhân viên", learners: 128, share: 55 },
  { name: "ATLĐ cơ bản", learners: 56, share: 28 },
];

const TOP_LEARNERS = [
  { name: "Lê Hoàng Cường", xp: 2480, badge: "🥇" },
  { name: "Phạm Thuỳ Dung", xp: 2210, badge: "🥈" },
  { name: "Hoàng Thị Hà", xp: 1985, badge: "🥉" },
  { name: "Bùi Thị Lan", xp: 1742, badge: "4" },
  { name: "Ngô Văn Minh", xp: 1620, badge: "5" },
];

function AnalyticPage() {
  const stats = [
    { label: "Học viên hoạt động", value: "847", icon: Users, color: "text-blue-600 bg-blue-100" },
    { label: "Khoá hoàn thành", value: "1,284", icon: GraduationCap, color: "text-emerald-600 bg-emerald-100" },
    { label: "Bài học đã hoàn thành", value: "12,450", icon: BookOpen, color: "text-amber-600 bg-amber-100" },
    { label: "Giờ học tích luỹ", value: "8,912h", icon: Trophy, color: "text-violet-600 bg-violet-100" },
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
