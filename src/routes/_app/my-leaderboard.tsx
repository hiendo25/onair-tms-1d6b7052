import { createFileRoute, Link } from "@tanstack/react-router";
import { Trophy, AlertCircle } from "lucide-react";
import { useState } from "react";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLeaderboard, useMyRank, type LeaderboardScope } from "@/lib/data-hooks";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_app/my-leaderboard")({
  head: () => ({ meta: [{ title: "Bảng xếp hạng — OnAir TMS" }] }),
  component: Page,
});

function Page() {
  const { user } = useAuth();
  const [scope, setScope] = useState<LeaderboardScope>("department");
  const lbQ = useLeaderboard(100, scope);
  const myRankQ = useMyRank(scope);
  const myInList = (lbQ.data ?? []).some((r) => r.user_id === user?.id);

  return (
    <PageContainer
      title="Bảng xếp hạng"
      breadcrumbs={[{ title: "Thưởng", path: "/my-gamification" }, { title: "Bảng xếp hạng" }]}
      actions={<Link to="/my-gamification"><Button variant="outline" size="sm">← Quay lại</Button></Link>}
    >
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Trophy className="h-4 w-4" />Xếp hạng theo điểm học tập
            </div>
            <Tabs value={scope} onValueChange={(v) => setScope(v as LeaderboardScope)}>
              <TabsList>
                <TabsTrigger value="department">Phòng ban</TabsTrigger>
                <TabsTrigger value="org">Toàn tổ chức</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          {scope === "department" && myRankQ.data && !myRankQ.data.department && (
            <Alert className="mb-4"><AlertDescription>Bạn chưa được gán vào phòng ban nào. Liên hệ quản trị viên để cập nhật.</AlertDescription></Alert>
          )}
          {lbQ.isLoading ? (
            <div className="space-y-2">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
          ) : lbQ.error ? (
            <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>Lỗi tải dữ liệu. <Button variant="link" size="sm" onClick={() => lbQ.refetch()}>Thử lại</Button></AlertDescription></Alert>
          ) : (lbQ.data ?? []).length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-12">Chưa có dữ liệu</div>
          ) : (
            <div className="space-y-1.5">
              {(lbQ.data ?? []).map((r) => {
                const me = r.user_id === user?.id;
                const top = r.rank <= 3;
                const medal = ["🥇", "🥈", "🥉"][r.rank - 1];
                return (
                  <div key={r.user_id} className={`flex items-center gap-3 rounded-md border p-3 ${me ? "border-primary bg-primary/5" : top ? "bg-amber-50/40" : ""}`}>
                    <div className="w-10 text-center text-lg font-bold">{medal || `#${r.rank}`}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {r.profile?.full_name || "—"}
                        {me && <span className="ml-2 text-xs text-primary">(Bạn)</span>}
                      </div>
                      {r.department && <div className="text-xs text-muted-foreground truncate">Phòng: {r.department}</div>}
                    </div>
                    <div className="font-mono font-semibold">{r.xp.toLocaleString()} điểm</div>
                  </div>
                );
              })}
              {!myInList && myRankQ.data && (() => {
                const ahead = (lbQ.data ?? []).filter((r) => r.xp > (myRankQ.data?.xp ?? 0)).sort((a, b) => a.xp - b.xp)[0];
                const gap = ahead ? Math.max(0, ahead.xp - myRankQ.data.xp + 1) : 0;
                const pct = ahead && ahead.xp > 0 ? Math.min(100, Math.round((myRankQ.data.xp / ahead.xp) * 100)) : 100;
                return (
                  <>
                    <div className="text-center text-xs text-muted-foreground py-2">···</div>
                    <div className="rounded-md border-2 border-primary bg-primary/5 p-3 space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 text-center font-bold text-primary">#{myRankQ.data.rank}</div>
                        <div className="flex-1 font-medium">Bạn</div>
                        <div className="font-mono font-semibold">{myRankQ.data.xp.toLocaleString()} điểm</div>
                      </div>
                      {ahead ? (
                        <>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-primary/20">
                            <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Còn <strong className="text-foreground">{gap.toLocaleString()}</strong> điểm để vượt #{ahead.rank}{ahead.profile?.full_name ? ` (${ahead.profile.full_name})` : ""}</span>
                            <span>{pct}%</span>
                          </div>
                        </>
                      ) : (
                        <div className="text-xs text-emerald-600 font-medium">🏆 Bạn đang đứng đầu!</div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
