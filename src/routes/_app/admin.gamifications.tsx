import { createFileRoute } from "@tanstack/react-router";
import { Star, Trophy, Award, Zap, Flame } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/admin/gamifications")({
  head: () => ({ meta: [{ title: "Gamification — OnAir LMS" }] }),
  component: GamificationsPage,
});

const RULES = [
  { icon: Zap, title: "Hoàn thành 1 bài học", points: 10, enabled: true },
  { icon: Trophy, title: "Hoàn thành 1 khoá học", points: 100, enabled: true },
  { icon: Star, title: "Đạt điểm tuyệt đối bài KT", points: 50, enabled: true },
  { icon: Flame, title: "Đăng nhập 7 ngày liên tiếp", points: 30, enabled: false },
  { icon: Award, title: "Đứng top 3 lớp", points: 200, enabled: true },
];

const BADGES = [
  { name: "Tân binh", color: "bg-emerald-100 text-emerald-700", desc: "Hoàn thành khoá học đầu tiên" },
  { name: "Cần mẫn", color: "bg-blue-100 text-blue-700", desc: "Học 7 ngày liên tiếp" },
  { name: "Cao thủ", color: "bg-amber-100 text-amber-700", desc: "Đạt 1000 điểm" },
  { name: "Huyền thoại", color: "bg-violet-100 text-violet-700", desc: "Đứng top 1 quý" },
];

function GamificationsPage() {
  return (
    <PageContainer
      title="Cấu hình Gamification"
      breadcrumbs={[{ title: "Gamification" }]}
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Tổng XP đã trao</div>
            <div className="mt-1 text-2xl font-semibold">128,420</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Huy hiệu đang dùng</div>
            <div className="mt-1 text-2xl font-semibold">12</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Học viên có XP</div>
            <div className="mt-1 text-2xl font-semibold">847</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Quy tắc tính điểm</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {RULES.map((r, i) => {
            const Icon = r.icon;
            return (
              <div key={i} className="flex items-center justify-between rounded-md border p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{r.title}</div>
                    <div className="text-xs text-muted-foreground">+{r.points} XP mỗi lần</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground">Điểm</Label>
                    <Input className="w-20" type="number" defaultValue={r.points} />
                  </div>
                  <Switch defaultChecked={r.enabled} />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Huy hiệu</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {BADGES.map(b => (
            <div key={b.name} className="rounded-md border p-4 text-center">
              <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${b.color}`}>
                <Award className="h-7 w-7" />
              </div>
              <div className="mt-2 font-medium">{b.name}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{b.desc}</div>
              <Badge variant="outline" className="mt-2 text-[10px]">Đang dùng</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
