import { createFileRoute } from "@tanstack/react-router";
import { Trophy, Save, Plus, Crown, Award, Star } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_app/admin/gamifications")({
  head: () => ({ meta: [{ title: "Gamification — OnAir TMS" }] }),
  component: GamificationsPage,
});

const TRIGGERS = [
  { key: "course_completed", label: "Hoàn thành môn học", xp: 100, active: true },
  { key: "class_completed", label: "Hoàn thành lớp học", xp: 200, active: true },
  { key: "phase_completed", label: "Hoàn thành giai đoạn lộ trình học tập", xp: 150, active: true },
  { key: "learning_path_completed", label: "Hoàn thành lộ trình học tập", xp: 500, active: false },
];

const RANKING = [
  { rank: 1, name: "Nguyễn Văn A", email: "a@onair.com", xp: 2480, progress: 95 },
  { rank: 2, name: "Trần Thị B", email: "b@onair.com", xp: 2210, progress: 88 },
  { rank: 3, name: "Lê Văn C", email: "c@onair.com", xp: 1985, progress: 80 },
  { rank: 4, name: "Phạm Thị D", email: "d@onair.com", xp: 1742, progress: 72 },
  { rank: 5, name: "Hoàng Văn E", email: "e@onair.com", xp: 1620, progress: 65 },
];

const LEVELS = [
  { name: "Tân binh", icon: Star, color: "bg-emerald-100 text-emerald-700", xp: "0 - 500" },
  { name: "Cần mẫn", icon: Award, color: "bg-blue-100 text-blue-700", xp: "501 - 1500" },
  { name: "Cao thủ", icon: Trophy, color: "bg-amber-100 text-amber-700", xp: "1501 - 3000" },
  { name: "Huyền thoại", icon: Crown, color: "bg-violet-100 text-violet-700", xp: "3001+" },
];

function GamificationsPage() {
  return (
    <PageContainer title="Gamification" breadcrumbs={[{ title: "Gamification" }]}>
      <Tabs defaultValue="rules">
        <TabsList>
          <TabsTrigger value="rules">Cấu hình điểm thưởng</TabsTrigger>
          <TabsTrigger value="leaderboard">Bảng xếp hạng</TabsTrigger>
          <TabsTrigger value="ranks">Danh hiệu</TabsTrigger>
        </TabsList>

        <TabsContent value="rules">
          <Card>
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  <h2 className="text-base font-semibold">Cấu hình điểm thưởng</h2>
                </div>
                <Button size="sm"><Save className="h-4 w-4" />Lưu thay đổi</Button>
              </div>
              <div className="space-y-1">
                {TRIGGERS.map(t => (
                  <div key={t.key} className="flex items-center justify-between border-b py-3 last:border-0">
                    <div className="flex items-center gap-3">
                      <Switch defaultChecked={t.active} />
                      <span className="text-sm">{t.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input className="w-24 text-right" type="number" defaultValue={t.xp} />
                      <span className="text-sm text-muted-foreground">điểm</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard">
          <Card>
            <CardContent className="p-6">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div className="max-w-md">
                  <h2 className="text-base font-semibold">Bảng xếp hạng</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Xếp hạng dựa trên % hoàn thành để đảm bảo công bằng giữa các học viên có chương trình học khác nhau
                  </p>
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả phòng ban</SelectItem>
                    <SelectItem value="sales">Phòng Kinh doanh</SelectItem>
                    <SelectItem value="hr">Phòng Nhân sự</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Thứ hạng</TableHead>
                    <TableHead>Tên học viên</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="w-[120px] text-right">Điểm XP</TableHead>
                    <TableHead className="w-[200px]">% Hoàn thành</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {RANKING.map(r => (
                    <TableRow key={r.rank}>
                      <TableCell>
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-bold">{r.rank}</span>
                      </TableCell>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell className="text-muted-foreground">{r.email}</TableCell>
                      <TableCell className="text-right font-mono">{r.xp}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={r.progress} className="h-2" />
                          <span className="w-10 text-xs text-muted-foreground">{r.progress}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ranks">
          <Card>
            <CardContent className="p-6">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h2 className="text-base font-semibold">Quản lý danh hiệu</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Thiết lập danh hiệu tự động theo thành tích</p>
                </div>
                <Button size="sm"><Plus className="h-4 w-4" />Tạo danh hiệu mới</Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {LEVELS.map(l => {
                  const Icon = l.icon;
                  return (
                    <div key={l.name} className="rounded-md border p-4 text-center">
                      <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${l.color}`}>
                        <Icon className="h-7 w-7" />
                      </div>
                      <div className="mt-2 font-medium">{l.name}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">XP: {l.xp}</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
