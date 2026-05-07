import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { GraduationCap, PlayCircle, Clock, Trophy, Users, ChevronLeft, ChevronRight } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip,
  PieChart, Pie, Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOrgData } from "@/lib/org-context";
import { PageContainer } from "@/components/PageContainer";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — OnAir TMS" }] }),
  component: Dashboard,
});

function Dashboard() {
  const data = useOrgData();
  const stats = data.stats;

  const summaryCards = [
    { title: "Lớp học đang diễn ra", value: stats.activeClasses, icon: GraduationCap, bg: "bg-pink-100", iconColor: "text-pink-500" },
    { title: "Lớp học sắp diễn ra", value: stats.upcomingClasses, icon: PlayCircle, bg: "bg-blue-100", iconColor: "text-blue-500" },
    { title: "Lớp học sắp hết hạn", value: stats.expiringClasses, icon: Clock, bg: "bg-slate-100", iconColor: "text-slate-500" },
    { title: "Lớp học đã diễn ra", value: stats.completedClasses, icon: Trophy, bg: "bg-amber-100", iconColor: "text-amber-500" },
  ];

  return (
    <PageContainer title="Dashboard" breadcrumbs={[{ title: "Dashboard" }]}>
      {/* Top stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.title} className={`${s.bg} border-0 shadow-sm`}>
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-white ${s.iconColor}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-700">{s.title}</p>
                  <p className="text-2xl font-extrabold text-slate-900">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Middle row: table + calendar */}
      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <ClassesThisMonth data={data} />
        <CalendarWidget />
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <ParticipationChart />
        <CompletionChart total={stats.totalEmployees} completionRate={stats.completionRate} />
      </div>

      {/* Top/Low courses */}
      <div className="grid gap-4 lg:grid-cols-2">
        <RatingList title="Top lớp học đánh giá cao nhất" courses={data.courses} variant="top" />
        <RatingList title="Top lớp học đánh giá thấp nhất" courses={data.courses} variant="low" />
      </div>
    </PageContainer>
  );
}

function ClassesThisMonth({ data }: { data: ReturnType<typeof useOrgData> }) {
  const rows = data.classrooms.slice(0, 3);
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-base">Lớp học trong tháng</CardTitle>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="outline"><Link to="/admin/surveys/create">Tạo khảo sát</Link></Button>
          <Button asChild size="sm" variant="outline"><Link to="/admin/online-course/create">Tạo môn học</Link></Button>
          <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white"><Link to="/admin/class-room/create">Tạo lớp học</Link></Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên lớp học</TableHead>
              <TableHead>Loại lớp học</TableHead>
              <TableHead>Học viên</TableHead>
              <TableHead>Thời gian diễn ra</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((c, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {c.type === "online" ? "Online - Đơn" : c.type === "hybrid" ? "Hybrid" : "Offline - Đơn"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1 text-sm">
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    {c.students}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  00:00, {5 + i} tháng 5, 2026
                  <br />
                  00:00, {8 + i} tháng 5, 2026
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function CalendarWidget() {
  const today = new Date();
  const [view, setView] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const monthName = view.toLocaleDateString("vi-VN", { month: "long", year: "numeric" });
  const firstDay = (view.getDay() + 6) % 7; // Mon=0
  const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
  const prevDays = new Date(view.getFullYear(), view.getMonth(), 0).getDate();
  const cells: { day: number; outside: boolean; isToday: boolean }[] = [];
  for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: prevDays - i, outside: true, isToday: false });
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = d === today.getDate() && view.getMonth() === today.getMonth() && view.getFullYear() === today.getFullYear();
    cells.push({ day: d, outside: false, isToday });
  }
  while (cells.length % 7 !== 0) cells.push({ day: cells.length - daysInMonth - firstDay + 1, outside: true, isToday: false });
  const weekHeaders = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
  const dateLabel = today.toLocaleDateString("vi-VN");

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm capitalize">{monthName}</CardTitle>
        <div className="flex gap-1">
          <button className="h-6 w-6 rounded hover:bg-muted flex items-center justify-center" onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}><ChevronLeft className="h-3.5 w-3.5" /></button>
          <button className="h-6 w-6 rounded hover:bg-muted flex items-center justify-center" onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}><ChevronRight className="h-3.5 w-3.5" /></button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {weekHeaders.map((h) => <div key={h} className="text-muted-foreground py-1 font-medium">{h}</div>)}
          {cells.map((c, i) => (
            <div key={i} className={`py-1.5 rounded-full text-sm ${c.outside ? "text-muted-foreground/40" : "text-foreground"} ${c.isToday ? "bg-blue-600 text-white font-semibold" : ""}`}>
              {c.day}
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t">
          <p className="text-sm font-medium mb-2">Lớp học trong ngày {dateLabel}</p>
          <p className="text-xs text-muted-foreground">Không có lớp học nào trong ngày đã chọn.</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ParticipationChart() {
  const [range, setRange] = useState("year");
  const series: Record<string, { name: string; value: number; fill: string }[]> = {
    year: [
      { name: "Online", value: 65, fill: "#bfdbfe" },
      { name: "Offline", value: 78, fill: "#3b82f6" },
      { name: "eLearning", value: 92, fill: "#1e40af" },
    ],
    month: [
      { name: "Online", value: 48, fill: "#bfdbfe" },
      { name: "Offline", value: 64, fill: "#3b82f6" },
      { name: "eLearning", value: 81, fill: "#1e40af" },
    ],
    week: [
      { name: "Online", value: 32, fill: "#bfdbfe" },
      { name: "Offline", value: 55, fill: "#3b82f6" },
      { name: "eLearning", value: 73, fill: "#1e40af" },
    ],
  };
  const d = series[range];
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Tỷ lệ tham gia lớp học</CardTitle>
        <Tabs value={range} onValueChange={setRange}>
          <TabsList>
            <TabsTrigger value="year">Năm</TabsTrigger>
            <TabsTrigger value="month">Tháng</TabsTrigger>
            <TabsTrigger value="week">Tuần</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground text-right mb-2">Cập nhật theo {range === "year" ? "năm" : range === "month" ? "tháng" : "tuần"}</p>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={d}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} />
            <YAxis tickFormatter={(v) => `${v}%`} tickLine={false} axisLine={false} domain={[0, 100]} />
            <Tooltip />
            <Bar dataKey="value" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-4 text-xs mt-2">
          {d.map((s) => (
            <span key={s.name} className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: s.fill }} />
              {s.name}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function CompletionChart({ total, completionRate }: { total: number; completionRate: number }) {
  const [range, setRange] = useState("year");
  const completed = Math.round(total * completionRate / 100);
  const remaining = total - completed;
  const data = [
    { name: "Hoàn thành", value: completed, fill: "#3b82f6" },
    { name: "Chưa hoàn thành", value: remaining, fill: "#e5e7eb" },
  ];
  const completedPct = Math.round((completed / total) * 100);
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Tỷ lệ hoàn thành lớp học</CardTitle>
        <Tabs value={range} onValueChange={setRange}>
          <TabsList>
            <TabsTrigger value="year">Năm</TabsTrigger>
            <TabsTrigger value="month">Tháng</TabsTrigger>
            <TabsTrigger value="week">Tuần</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={70} outerRadius={100} startAngle={90} endAngle={-270} paddingAngle={2} dataKey="value">
                {data.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xs text-muted-foreground">Tổng số học viên</span>
            <span className="text-2xl font-bold">{total}</span>
          </div>
        </div>
        <div className="mt-2 space-y-1.5 text-sm">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-blue-600" />Số học viên hoàn thành</span>
            <span className="font-medium">{completed} Học viên · {completedPct}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-slate-300" />Số học viên chưa hoàn thành</span>
            <span className="font-medium">{remaining} Học viên · {100 - completedPct}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RatingList({ title, courses, variant }: { title: string; courses: { title: string; rating: number }[]; variant: "top" | "low" }) {
  const sorted = useMemo(() => [...courses].sort((a, b) => variant === "top" ? b.rating - a.rating : a.rating - b.rating).slice(0, 5), [courses, variant]);
  const barColor = variant === "top" ? "bg-blue-500" : "bg-rose-400";
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">{title}</CardTitle>
        <Tabs defaultValue="week">
          <TabsList>
            <TabsTrigger value="year">Năm</TabsTrigger>
            <TabsTrigger value="month">Tháng</TabsTrigger>
            <TabsTrigger value="week">Tuần</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="space-y-3">
        {sorted.map((c) => (
          <div key={c.title} className="grid grid-cols-[1fr_auto] gap-2 items-center text-sm">
            <span className="truncate">{c.title}</span>
            <span className="font-medium tabular-nums">{c.rating.toFixed(1)}/5</span>
            <div className="col-span-2 h-1.5 rounded-full bg-muted overflow-hidden">
              <div className={`h-full ${barColor}`} style={{ width: `${(c.rating / 5) * 100}%` }} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
