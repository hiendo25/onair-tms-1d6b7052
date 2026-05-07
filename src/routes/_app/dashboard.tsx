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

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — OnAir LMS" }] }),
  component: Dashboard,
});

const summaryCards = [
  { title: "Lớp đang diễn ra", value: "23", icon: GraduationCap, bg: "bg-pink-100", color: "text-pink-600" },
  { title: "Lớp sắp diễn ra", value: "14", icon: PlayCircle, bg: "bg-blue-100", color: "text-blue-600" },
  { title: "Lớp sắp hết hạn", value: "7", icon: Clock, bg: "bg-purple-100", color: "text-purple-600" },
  { title: "Lớp đã hoàn thành", value: "128", icon: Trophy, bg: "bg-amber-100", color: "text-amber-600" },
];

const courseRows = [
  { id: "1", label: "Chuỗi", name: "Onboarding Nhân viên Pha chế Q2/2025", tag: "Bắt buộc", mode: "Trực tiếp (Offline)", students: "284", lecturer: "Trần Thị Mai" },
  { id: "2", label: "Đơn", name: "An toàn vệ sinh thực phẩm tháng 5", tag: "Bắt buộc", mode: "Trực tuyến (Online)", students: "1.240", lecturer: "Vũ Minh Đức" },
  { id: "3", label: "Chuỗi", name: "Đào tạo Trưởng ca - Đợt 2/2025", tag: "Nâng cao", mode: "Hybrid", students: "124", lecturer: "Lý Thị Ngọc" },
  { id: "4", label: "Đơn", name: "Vận hành máy POS & thanh toán", tag: "Chất lượng", mode: "Trực tuyến (Online)", students: "467", lecturer: "Trần Thị Mai" },
];

const channelData = [
  { label: "Đào tạo tại cửa hàng", value: 72 },
  { label: "eLearning trên app", value: 88 },
  { label: "Lớp tập trung Hub", value: 41 },
];

const topCourses = [
  { title: "An toàn vệ sinh thực phẩm (VSATTP)", rating: 4.9 },
  { title: "Quy trình pha chế chuẩn Highlands", rating: 4.8 },
  { title: "Văn hoá thương hiệu Highlands Coffee", rating: 4.8 },
  { title: "Kỹ năng phục vụ khách hàng", rating: 4.7 },
  { title: "Quản lý ca & xếp lịch nhân sự", rating: 4.7 },
];

const lowCourses = [
  { title: "Báo cáo doanh thu cuối ca", rating: 3.6 },
  { title: "Kiểm kê nguyên liệu nâng cao", rating: 3.4 },
  { title: "Xử lý sự cố máy pha Espresso", rating: 3.3 },
  { title: "Quản trị tồn kho cửa hàng", rating: 3.1 },
  { title: "Báo cáo P&L cửa hàng", rating: 2.9 },
];

function Dashboard() {
  const [range, setRange] = useState("year");
  const completion = { completed: 1078, total: 1240 };
  const completionPct = Math.round((completion.completed / completion.total) * 100);

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
