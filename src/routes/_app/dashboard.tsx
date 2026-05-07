import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { GraduationCap, PlayCircle, Clock, Trophy, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useOrgData } from "@/lib/org-context";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — OnAir TMS" }] }),
  component: Dashboard,
});

function Dashboard() {
  const data = useOrgData();
  const [range, setRange] = useState("year");
  const stats = data.stats;
  const summaryCards = [
    { title: "Lớp đang diễn ra", value: String(stats.activeClasses), icon: GraduationCap, bg: "bg-pink-100", color: "text-pink-600" },
    { title: "Lớp sắp diễn ra", value: String(stats.upcomingClasses), icon: PlayCircle, bg: "bg-blue-100", color: "text-blue-600" },
    { title: "Lớp sắp hết hạn", value: String(stats.expiringClasses), icon: Clock, bg: "bg-purple-100", color: "text-purple-600" },
    { title: "Lớp đã hoàn thành", value: String(stats.completedClasses), icon: Trophy, bg: "bg-amber-100", color: "text-amber-600" },
  ];
  const courseRows = data.classrooms.slice(0, 4).map((c, i) => ({
    id: c.id,
    label: i % 2 === 0 ? "Chuỗi" : "Đơn",
    name: c.name,
    tag: "Bắt buộc",
    mode: c.type === "online" ? "Trực tuyến (Online)" : c.type === "offline" ? "Trực tiếp (Offline)" : "Hybrid",
    students: String(c.students),
    lecturer: c.teacher,
  }));
  const topCourses = [...data.courses].sort((a, b) => b.rating - a.rating).slice(0, 5).map(c => ({ title: c.title, rating: c.rating }));
  const lowCourses = [...data.courses].sort((a, b) => a.rating - b.rating).slice(0, 5).map(c => ({ title: c.title, rating: c.rating }));
  const channelData = [
    { label: "Đào tạo tại cửa hàng", value: 72 },
    { label: "eLearning trên app", value: stats.completionRate },
    { label: "Lớp tập trung Hub", value: 41 },
  ];
  const completion = { completed: Math.round(stats.totalEmployees * stats.completionRate / 100), total: stats.totalEmployees };
  const completionPct = stats.completionRate;

  return (
    <div className="p-6 space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.title} className={s.bg + " border-0"}>
              <CardContent className="p-5 flex items-center gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-white ${s.color} shadow-soft`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-foreground/70">{s.title}</p>
                  <p className="text-2xl font-extrabold">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Lớp học gần nhất</CardTitle>
            <Tabs value={range} onValueChange={setRange}>
              <TabsList>
                <TabsTrigger value="year">Năm</TabsTrigger>
                <TabsTrigger value="month">Tháng</TabsTrigger>
                <TabsTrigger value="week">Tuần</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Loại</TableHead>
                  <TableHead>Tên lớp học</TableHead>
                  <TableHead>Hình thức</TableHead>
                  <TableHead>Học viên</TableHead>
                  <TableHead>Giảng viên</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courseRows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell><Badge variant="outline">{r.label}</Badge></TableCell>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell>{r.mode}</TableCell>
                    <TableCell>{r.students}</TableCell>
                    <TableCell>{r.lecturer}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Lịch học</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Lịch sự kiện sắp tới của tổ chức.</p>
            <div className="mt-4 space-y-2 text-sm">
              {courseRows.slice(0, 3).map((r) => (
                <div key={r.id} className="rounded-md border p-2">
                  <p className="font-medium truncate">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.lecturer}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Tỉ lệ tham gia theo kênh</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {channelData.map((c) => (
              <div key={c.label} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{c.label}</span>
                  <span className="font-medium">{c.value}%</span>
                </div>
                <Progress value={c.value} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Tỉ lệ hoàn thành</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold">{completionPct}%</div>
              <div className="text-sm text-muted-foreground">
                {completion.completed}/{completion.total} khóa hoàn thành
              </div>
            </div>
            <Progress value={completionPct} className="mt-4 h-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Top khóa học đánh giá cao</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {topCourses.map((c) => (
              <div key={c.title} className="flex items-center justify-between text-sm">
                <span>{c.title}</span>
                <span className="flex items-center gap-1 font-medium"><Star className="h-3 w-3 fill-amber-500 text-amber-500" />{c.rating}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Khóa học đánh giá thấp</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {lowCourses.map((c) => (
              <div key={c.title} className="flex items-center justify-between text-sm">
                <span>{c.title}</span>
                <span className="flex items-center gap-1 font-medium"><Star className="h-3 w-3 fill-amber-500 text-amber-500" />{c.rating}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
