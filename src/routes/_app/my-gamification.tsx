import { createFileRoute } from "@tanstack/react-router";
import { Trophy, Crown, Award, Star, Zap } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const LEADERBOARD = [
  { rank: 1, name: "Nguyễn Văn An", email: "an.nv@highlandscoffee.vn", xp: 2480, progress: 95, me: false },
  { rank: 2, name: "Trần Thị Mai", email: "mai.tt@highlandscoffee.vn", xp: 2210, progress: 88, me: false },
  { rank: 3, name: "Lê Hoàng Cường", email: "cuong.lh@highlandscoffee.vn", xp: 1985, progress: 80, me: true },
  { rank: 4, name: "Phạm Thuỳ Dung", email: "dung.pt@highlandscoffee.vn", xp: 1742, progress: 72, me: false },
  { rank: 5, name: "Hoàng Thị Hà", email: "ha.ht@highlandscoffee.vn", xp: 1620, progress: 65, me: false },
];

const LEVELS = [
  { name: "Tân binh", icon: Star, color: "bg-emerald-100 text-emerald-700", min: 0, achieved: true },
  { name: "Cần mẫn", icon: Award, color: "bg-blue-100 text-blue-700", min: 500, achieved: true },
  { name: "Cao thủ", icon: Trophy, color: "bg-amber-100 text-amber-700", min: 1500, achieved: true },
  { name: "Huyền thoại", icon: Crown, color: "bg-violet-100 text-violet-700", min: 3000, achieved: false },
];

export const Route = createFileRoute("/_app/my-gamification")({
  head: () => ({ meta: [{ title: "Điểm thưởng — OnAir TMS" }] }),
  component: () => (
    <PageContainer
      title="Điểm thưởng của bạn"
      breadcrumbs={[{ title: "Thưởng" }]}
    >
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white">
              <Zap className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-muted-foreground">Tổng điểm XP của bạn</div>
              <div className="text-3xl font-bold">1,985 XP</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Hạng hiện tại</div>
              <div className="text-lg font-semibold">Cao thủ</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
              <span>Tiến trình lên Huyền thoại</span>
              <span>1,985 / 3,000</span>
            </div>
            <Progress value={66} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="mb-4 text-base font-semibold">Danh hiệu của bạn</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {LEVELS.map(l => {
              const Icon = l.icon;
              return (
                <div key={l.name} className={`rounded-md border p-4 text-center ${l.achieved ? "" : "opacity-40"}`}>
                  <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${l.color}`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <div className="mt-2 font-medium">{l.name}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">Từ {l.min} XP</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="mb-4 text-base font-semibold">Bảng xếp hạng phòng ban</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Thứ hạng</TableHead>
                <TableHead>Tên học viên</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Điểm XP</TableHead>
                <TableHead className="w-[200px]">% Hoàn thành</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {LEADERBOARD.map(r => (
                <TableRow key={r.rank} className={r.me ? "bg-primary/5" : ""}>
                  <TableCell><span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-bold">{r.rank}</span></TableCell>
                  <TableCell className="font-medium">{r.name}{r.me && <span className="ml-2 text-xs text-primary">(Bạn)</span>}</TableCell>
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
    </PageContainer>
  ),
});
