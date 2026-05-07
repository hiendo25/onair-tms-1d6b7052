import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Users, BookOpen, GraduationCap, Building2, ArrowRight, ClipboardCheck } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TeamInsightsCard } from "@/components/ai/TeamInsightsCard";
import { BranchReadinessSection } from "@/components/admin/BranchReadinessSection";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/lib/org-context";
import { getUserRole } from "@/lib/roles";

export const Route = createFileRoute("/_app/admin/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard quản trị — OnAir TMS" }] }),
  beforeLoad: async () => {
    const { role } = await getUserRole();
    if (role && role !== "admin") throw redirect({ to: "/student/dashboard" });
  },
  component: AdminDashboard,
});

function useAdminStats(orgId: string) {
  return useQuery({
    queryKey: ["admin-dashboard", orgId],
    queryFn: async () => {
      const [emp, courses, branches, assignments, classrooms] = await Promise.all([
        supabase.from("employees").select("id", { count: "exact", head: true }).eq("org_id", orgId),
        supabase.from("online_courses").select("id, title, students_count, status", { count: "exact" }).eq("org_id", orgId),
        supabase.from("branches").select("id", { count: "exact", head: true }).eq("org_id", orgId),
        supabase.from("assignments").select("id", { count: "exact", head: true }).eq("org_id", orgId),
        supabase.from("classrooms")
          .select("id, title, instructor, location, start_date, end_date, status, students_count, capacity")
          .eq("org_id", orgId)
          .order("start_date", { ascending: true })
          .limit(8),
      ]);
      return {
        employees: emp.count ?? 0,
        coursesCount: courses.count ?? 0,
        publishedCourses: (courses.data ?? []).filter((c) => c.status === "published").length,
        branches: branches.count ?? 0,
        assignments: assignments.count ?? 0,
        classrooms: classrooms.data ?? [],
      };
    },
  });
}

function AdminDashboard() {
  const { orgId, org } = useOrg();
  const { data, isLoading } = useAdminStats(orgId);

  const stats = [
    { label: "Người dùng", value: data?.employees ?? 0, Icon: Users, bg: "bg-blue-50 text-blue-600" },
    { label: "Khoá học", value: data?.coursesCount ?? 0, sub: `${data?.publishedCourses ?? 0} đã xuất bản`, Icon: BookOpen, bg: "bg-emerald-50 text-emerald-600" },
    { label: "Bài kiểm tra", value: data?.assignments ?? 0, Icon: ClipboardCheck, bg: "bg-violet-50 text-violet-600" },
    { label: "Chi nhánh", value: data?.branches ?? 0, Icon: Building2, bg: "bg-orange-50 text-orange-600" },
  ];

  const now = new Date();
  const monthClasses = (data?.classrooms ?? []).filter((c) => {
    if (!c.start_date) return false;
    const d = new Date(c.start_date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  return (
    <PageContainer
      title={`Xin chào, ${org.short}`}
      description="Tổng quan hệ thống đào tạo"
      breadcrumbs={[{ title: "Dashboard" }]}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-3 p-5">
              <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${s.bg}`}>
                <s.Icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-bold">{isLoading ? "—" : s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
                {s.sub && <div className="text-[11px] text-muted-foreground mt-0.5">{s.sub}</div>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="text-base flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-primary" />
              Lớp học trong tháng
            </CardTitle>
            <Button asChild size="sm" variant="ghost">
              <Link to="/admin/class-room">Xem tất cả <ArrowRight className="h-3 w-3 ml-1" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoading && <div className="text-sm text-muted-foreground py-6 text-center">Đang tải...</div>}
            {!isLoading && monthClasses.length === 0 && (
              <div className="text-sm text-muted-foreground py-6 text-center">Tháng này chưa có lớp học nào.</div>
            )}
            {monthClasses.map((c) => (
              <div key={c.id} className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/40 transition">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm truncate">{c.title}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {c.instructor || "—"} · {c.location || "—"}
                  </div>
                </div>
                <div className="text-right text-xs">
                  <div className="font-semibold">{c.start_date ? new Date(c.start_date).toLocaleDateString("vi-VN") : "—"}</div>
                  <Badge variant="outline" className="mt-0.5 text-[10px]">
                    {c.students_count}/{c.capacity}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              {now.toLocaleDateString("vi-VN", { month: "long", year: "numeric" })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MiniCalendar highlightDays={monthClasses.map((c) => new Date(c.start_date as string).getDate())} />
          </CardContent>
        </Card>
      </div>

      <TeamInsightsCard />
    </PageContainer>
  );
}

function MiniCalendar({ highlightDays }: { highlightDays: number[] }) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = now.getDate();
  const set = new Set(highlightDays);
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="grid grid-cols-7 gap-1 text-center text-xs">
      {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((w) => (
        <div key={w} className="font-semibold text-muted-foreground py-1">{w}</div>
      ))}
      {cells.map((d, i) => {
        if (d === null) return <div key={i} />;
        const isToday = d === today;
        const isHighlight = set.has(d);
        return (
          <div
            key={i}
            className={`aspect-square flex items-center justify-center rounded-md ${
              isToday
                ? "bg-primary text-primary-foreground font-bold"
                : isHighlight
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-slate-600 hover:bg-muted"
            }`}
          >
            {d}
          </div>
        );
      })}
    </div>
  );
}
