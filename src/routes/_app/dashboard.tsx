import { createFileRoute } from "@tanstack/react-router";
import {
  Users,
  BookOpen,
  ClipboardList,
  GraduationCap,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — OnAir LMS" }] }),
  component: Dashboard,
});

const stats = [
  { label: "Tổng học viên", value: "1,284", change: "+12.5%", trend: "up", icon: Users },
  { label: "Lớp học đang mở", value: "42", change: "+3", trend: "up", icon: GraduationCap },
  { label: "Khóa học", value: "186", change: "+8", trend: "up", icon: BookOpen },
  { label: "Bài KT đã gán", value: "327", change: "-4.2%", trend: "down", icon: ClipboardList },
];

const recentClasses = [
  { name: "Onboarding nhân viên Q4/2026", students: 28, progress: 72 },
  { name: "Kỹ năng mềm cấp quản lý", students: 14, progress: 45 },
  { name: "An toàn lao động cơ bản", students: 56, progress: 91 },
  { name: "Sales Excellence 2026", students: 22, progress: 38 },
];

const recentAssignments = [
  { title: "Bài KT cuối khóa Onboarding", submitted: 21, total: 28, status: "Đang chấm" },
  { title: "Quiz tuần 3 - Sales Excellence", submitted: 18, total: 22, status: "Đã chấm" },
  { title: "ATLĐ - Kiểm tra giữa kỳ", submitted: 56, total: 56, status: "Hoàn thành" },
];

function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tổng quan hoạt động đào tạo trong tổ chức.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          const TrendIcon = s.trend === "up" ? TrendingUp : TrendingDown;
          return (
            <Card key={s.label}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {s.label}
                    </p>
                    <p className="mt-2 text-2xl font-semibold">{s.value}</p>
                    <div className="mt-2 flex items-center gap-1 text-xs">
                      <TrendIcon
                        className={`h-3 w-3 ${
                          s.trend === "up" ? "text-emerald-600" : "text-rose-600"
                        }`}
                      />
                      <span
                        className={s.trend === "up" ? "text-emerald-600" : "text-rose-600"}
                      >
                        {s.change}
                      </span>
                      <span className="text-muted-foreground">so với tháng trước</span>
                    </div>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Lớp học gần đây</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentClasses.map((c) => (
              <div key={c.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{c.name}</span>
                  <span className="text-muted-foreground">{c.students} học viên</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={c.progress} className="h-1.5" />
                  <span className="text-xs text-muted-foreground w-10 text-right">
                    {c.progress}%
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bài kiểm tra mới nhất</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAssignments.map((a) => (
                <div
                  key={a.title}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{a.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {a.submitted}/{a.total} đã nộp
                    </p>
                  </div>
                  <Badge
                    variant={
                      a.status === "Hoàn thành"
                        ? "default"
                        : a.status === "Đã chấm"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {a.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
