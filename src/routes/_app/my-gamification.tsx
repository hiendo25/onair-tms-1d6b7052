import { createFileRoute } from "@tanstack/react-router";
import { Trophy, Crown, Award, Zap, Medal } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useGamifications, useLeaderboard, useMyXp, useMyTitle, useMyBadges } from "@/lib/data-hooks";
import { useAuth } from "@/lib/auth-context";
import { useMemo } from "react";

export const Route = createFileRoute("/_app/my-gamification")({
  head: () => ({ meta: [{ title: "Điểm thưởng — OnAir TMS" }] }),
  component: Page,
});

function Page() {
  const { user } = useAuth();
  const { data: xp } = useMyXp();
  const { data: myTitle } = useMyTitle();
  const { data: myBadges = [] } = useMyBadges();
  const { data: gam = [] } = useGamifications();
  const { data: leaderboard = [] } = useLeaderboard();

  const titles = useMemo(() => gam.filter(g => g.type === "title" && g.active).sort((a, b) => (a.xp_required || 0) - (b.xp_required || 0)), [gam]);
  const badges = useMemo(() => gam.filter(g => g.type === "badge" && g.active), [gam]);
  const myXp = xp?.xp ?? 0;
  const currentTitle = useMemo(() => gam.find(g => g.id === myTitle?.title_id), [gam, myTitle]);
  const nextTitle = useMemo(() => titles.find(t => (t.xp_required || 0) > myXp), [titles, myXp]);
  const earnedSet = useMemo(() => new Set(myBadges.map(b => b.badge_id)), [myBadges]);

  const progressPct = nextTitle ? Math.min(100, Math.round((myXp / (nextTitle.xp_required || 1)) * 100)) : 100;

  return (
    <PageContainer title="Điểm thưởng của bạn" breadcrumbs={[{ title: "Thưởng" }]}>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white">
              <Zap className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-muted-foreground">Tổng điểm XP của bạn</div>
              <div className="text-3xl font-bold">{myXp.toLocaleString()} XP</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Danh hiệu hiện tại</div>
              <div className="text-lg font-semibold flex items-center gap-1 justify-end"><Crown className="h-4 w-4 text-amber-500" />{currentTitle?.title || "Chưa có"}</div>
            </div>
          </div>
          {nextTitle && (
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                <span>Tiến trình lên "{nextTitle.title}"</span>
                <span>{myXp.toLocaleString()} / {(nextTitle.xp_required || 0).toLocaleString()}</span>
              </div>
              <Progress value={progressPct} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="mb-4 text-base font-semibold">Huy hiệu của bạn ({earnedSet.size}/{badges.length})</h3>
          {badges.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-6">Chưa có huy hiệu nào trong hệ thống</div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {badges.map(b => {
                const earned = earnedSet.has(b.id);
                return (
                  <div key={b.id} className={`rounded-md border p-4 text-center ${earned ? "" : "opacity-40"}`}>
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                      <Medal className="h-7 w-7" />
                    </div>
                    <div className="mt-2 font-medium">{b.title}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{b.description}</div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="mb-4 text-base font-semibold flex items-center gap-2"><Trophy className="h-4 w-4" />Bảng xếp hạng</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Hạng</TableHead>
                <TableHead>Học viên</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Điểm XP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboard.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Chưa có dữ liệu</TableCell></TableRow>}
              {leaderboard.map(r => {
                const me = r.user_id === user?.id;
                return (
                  <TableRow key={r.user_id} className={me ? "bg-primary/5" : ""}>
                    <TableCell><span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-bold">{r.rank}</span></TableCell>
                    <TableCell className="font-medium">{r.profile?.full_name || "—"}{me && <span className="ml-2 text-xs text-primary">(Bạn)</span>}</TableCell>
                    <TableCell className="text-muted-foreground">{r.profile?.email}</TableCell>
                    <TableCell className="text-right font-mono">{r.xp}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
