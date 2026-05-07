import { createFileRoute } from "@tanstack/react-router";
import { Trophy, Award, Flame, Star, Crown } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const ME = { name: "Bạn", xp: 1620, rank: 5, level: 8, nextLevelXp: 2000, streak: 12 };

const RANKING = [
  { rank: 1, name: "Lê Hoàng Cường", xp: 2480, me: false },
  { rank: 2, name: "Phạm Thuỳ Dung", xp: 2210, me: false },
  { rank: 3, name: "Hoàng Thị Hà", xp: 1985, me: false },
  { rank: 4, name: "Bùi Thị Lan", xp: 1742, me: false },
  { rank: 5, name: "Bạn", xp: 1620, me: true },
  { rank: 6, name: "Đỗ Quang Huy", xp: 1480, me: false },
  { rank: 7, name: "Trần Thị Bích", xp: 1325, me: false },
];

const MY_BADGES = [
  { name: "Tân binh", earned: true, color: "bg-emerald-100 text-emerald-700" },
  { name: "Cần mẫn", earned: true, color: "bg-blue-100 text-blue-700" },
  { name: "Cao thủ", earned: false, color: "bg-amber-100 text-amber-700" },
  { name: "Huyền thoại", earned: false, color: "bg-violet-100 text-violet-700" },
];

export const Route = createFileRoute("/_app/my-gamification")({
  head: () => ({ meta: [{ title: "Thưởng học tập — OnAir LMS" }] }),
  component: () => (
    <PageContainer
      title="Thưởng học tập"
      breadcrumbs={[{ title: "Học tập" }, { title: "Thưởng học tập" }]}
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 overflow-hidden">
          <div className="bg-gradient-to-br from-primary to-primary/70 p-6 text-primary-foreground">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm opacity-90">Cấp độ hiện tại</div>
                <div className="mt-1 text-4xl font-bold">Level {ME.level}</div>
              </div>
              <Crown className="h-16 w-16 opacity-50" />
            </div>
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs">
                <span>{ME.xp} XP</span>
                <span>{ME.nextLevelXp} XP</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/30">
                <div className="h-full rounded-full bg-white" style={{ width: `${(ME.xp / ME.nextLevelXp) * 100}%` }} />
              </div>
            </div>
          </div>
          <CardContent className="grid grid-cols-3 divide-x p-0">
            <div className="p-4 text-center">
              <Trophy className="mx-auto h-5 w-5 text-amber-500" />
              <div className="mt-1 text-lg font-semibold">#{ME.rank}</div>
              <div className="text-xs text-muted-foreground">Xếp hạng</div>
            </div>
            <div className="p-4 text-center">
              <Star className="mx-auto h-5 w-5 text-violet-500" />
              <div className="mt-1 text-lg font-semibold">{ME.xp.toLocaleString("vi-VN")}</div>
              <div className="text-xs text-muted-foreground">Tổng XP</div>
            </div>
            <div className="p-4 text-center">
              <Flame className="mx-auto h-5 w-5 text-rose-500" />
              <div className="mt-1 text-lg font-semibold">{ME.streak} ngày</div>
              <div className="text-xs text-muted-foreground">Streak</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Huy hiệu của bạn</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {MY_BADGES.map(b => (
              <div key={b.name} className={`rounded-md border p-3 text-center ${b.earned ? "" : "opacity-40"}`}>
                <div className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full ${b.color}`}>
                  <Award className="h-5 w-5" />
                </div>
                <div className="mt-1 text-xs font-medium">{b.name}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Bảng xếp hạng tổ chức</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {RANKING.map(r => (
            <div key={r.rank} className={`flex items-center justify-between rounded-md border p-3 ${r.me ? "border-primary bg-primary/5" : ""}`}>
              <div className="flex items-center gap-3">
                <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                  r.rank === 1 ? "bg-amber-100 text-amber-700" :
                  r.rank === 2 ? "bg-slate-200 text-slate-700" :
                  r.rank === 3 ? "bg-orange-100 text-orange-700" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {r.rank}
                </span>
                <span className={`text-sm ${r.me ? "font-semibold" : ""}`}>{r.name}{r.me && <Badge variant="outline" className="ml-2 text-[10px]">Bạn</Badge>}</span>
              </div>
              <span className="font-mono text-sm">{r.xp.toLocaleString("vi-VN")} XP</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </PageContainer>
  ),
});
