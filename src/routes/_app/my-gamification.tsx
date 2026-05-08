import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Trophy, Crown, Sparkles, Zap, Gift, AlertCircle, Loader2 } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useGamifications, useLeaderboard, useMyRank, useMyXp, useMyTitle, useRewards, useRedeemReward } from "@/lib/data-hooks";
import { useAuth } from "@/lib/auth-context";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { DBReward } from "@/lib/data-hooks";

export const Route = createFileRoute("/_app/my-gamification")({
  head: () => ({ meta: [{ title: "Thưởng học tập — OnAir TMS" }] }),
  component: Page,
});

function Page() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const xpQ = useMyXp();
  const titleQ = useMyTitle();
  const gamQ = useGamifications();
  const lbQ = useLeaderboard(10, "department");
  const myRankQ = useMyRank("department");
  const rewardsQ = useRewards();
  const redeem = useRedeemReward();

  const [confirmReward, setConfirmReward] = useState<DBReward | null>(null);
  const [shortReward, setShortReward] = useState<DBReward | null>(null);

  const titles = useMemo(
    () => (gamQ.data ?? []).filter((g) => g.type === "title" && g.active).sort((a, b) => (a.xp_required || 0) - (b.xp_required || 0)),
    [gamQ.data]
  );
  const learningPoint = xpQ.data?.xp ?? 0;
  const redeemPoint = xpQ.data?.redeem_point ?? 0;
  const currentTitle = useMemo(
    () => (gamQ.data ?? []).find((g) => g.id === titleQ.data?.title_id) ?? titles[0],
    [gamQ.data, titleQ.data, titles]
  );
  const nextTitle = useMemo(() => titles.find((t) => (t.xp_required || 0) > learningPoint), [titles, learningPoint]);
  const isMax = !nextTitle && titles.length > 0;
  const progressPct = nextTitle ? Math.min(100, Math.round((learningPoint / (nextTitle.xp_required || 1)) * 100)) : 100;
  const pointsLeft = nextTitle ? Math.max(0, (nextTitle.xp_required || 0) - learningPoint) : 0;

  const top3 = (lbQ.data ?? []).slice(0, 3);
  const myInTop = top3.some((r) => r.user_id === user?.id);

  const handleRewardClick = (r: DBReward) => {
    if (r.expired_at && new Date(r.expired_at) <= new Date()) {
      toast.error("Phần thưởng đã hết hạn");
      return;
    }
    if (redeemPoint < r.required_point) {
      setShortReward(r);
      return;
    }
    setConfirmReward(r);
  };

  const handleConfirmRedeem = async () => {
    if (!confirmReward) return;
    try {
      await redeem.mutateAsync(confirmReward.id);
      toast.success("Đổi thưởng thành công!");
      setConfirmReward(null);
    } catch (e: any) {
      const msg = e?.message ?? "redeem_failed";
      const map: Record<string, string> = {
        insufficient_points: "Không đủ điểm",
        reward_expired: "Phần thưởng đã hết hạn",
        out_of_stock: "Đã hết hàng",
        reward_inactive: "Phần thưởng không còn hiệu lực",
      };
      toast.error(map[msg] || "Đổi thưởng thất bại, vui lòng thử lại");
    }
  };

  return (
    <PageContainer title="Điểm thưởng của bạn" breadcrumbs={[{ title: "Thưởng" }]}>
      <div className="grid gap-4 lg:grid-cols-3">
        {/* 3.1 Khối điểm & tiến độ */}
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            {xpQ.isLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : xpQ.error ? (
              <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>Không tải được điểm. <Button variant="link" size="sm" onClick={() => xpQ.refetch()}>Thử lại</Button></AlertDescription></Alert>
            ) : (
              <>
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md">
                    <Zap className="h-7 w-7" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground">Điểm học tập</div>
                    <div className="text-3xl font-bold">{learningPoint.toLocaleString()} điểm</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground flex items-center gap-1 justify-end"><Gift className="h-3 w-3" />Điểm đổi thưởng</div>
                    <div className="text-2xl font-bold text-amber-600">{redeemPoint.toLocaleString()}</div>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                    <span>{isMax ? "Đã đạt danh hiệu cao nhất" : nextTitle ? <>Tiến trình lên <strong className="text-foreground">"{nextTitle.title}"</strong></> : "Chưa cấu hình danh hiệu"}</span>
                    <span>{progressPct}%</span>
                  </div>
                  <Progress value={progressPct} className="h-2" />
                  <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    {isMax ? <>Bạn đã đạt mức cao nhất 🎉</> : nextTitle ? <>Còn <strong className="text-foreground">{pointsLeft.toLocaleString()}</strong> điểm để đạt <strong className="text-foreground">"{nextTitle.title}"</strong></> : null}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* 3.2 Danh hiệu hiện tại */}
        <Card className="cursor-pointer transition hover:shadow-md" onClick={() => navigate({ to: "/my-titles" })}>
          <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
            <div className="text-xs text-muted-foreground mb-2">Danh hiệu hiện tại</div>
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-amber-200 mb-2">
              <Crown className="h-8 w-8 text-amber-600" />
            </div>
            <div className="text-lg font-bold">{currentTitle?.title || "Chưa có"}</div>
            <Link to="/my-titles" className="mt-2 text-xs text-primary hover:underline">Xem tất cả danh hiệu →</Link>
          </CardContent>
        </Card>
      </div>

      {/* 3.3 Bảng xếp hạng preview — Top 3 + thứ hạng của tôi */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold flex items-center gap-2"><Trophy className="h-4 w-4" />Bảng xếp hạng (Top 3)</h3>
            <Link to="/my-leaderboard"><Button variant="outline" size="sm">Xem toàn bộ →</Button></Link>
          </div>
          {lbQ.isLoading ? (
            <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : lbQ.error ? (
            <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>Lỗi tải bảng xếp hạng. <Button variant="link" size="sm" onClick={() => lbQ.refetch()}>Thử lại</Button></AlertDescription></Alert>
          ) : top3.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-8">Chưa có dữ liệu xếp hạng</div>
          ) : (
            <>
              <div className="space-y-2">
                {top3.map((r) => {
                  const me = r.user_id === user?.id;
                  const medals = ["🥇", "🥈", "🥉"];
                  return (
                    <div key={r.user_id} className={`flex items-center gap-3 rounded-md border p-3 ${me ? "border-primary bg-primary/5" : "bg-amber-50/40"}`}>
                      <div className="text-2xl w-8 text-center">{medals[r.rank - 1]}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{r.profile?.full_name || "—"}{me && <span className="ml-2 text-xs text-primary">(Bạn)</span>}</div>
                        {r.department && <div className="text-xs text-muted-foreground truncate">Phòng: {r.department}</div>}
                      </div>
                      <div className="font-mono font-semibold">{r.xp.toLocaleString()} điểm</div>
                    </div>
                  );
                })}
              </div>
              {!myInTop && (
                <>
                  <div className="text-center text-xs text-muted-foreground py-2">···</div>
                  {myRankQ.data ? (
                    <div className="flex items-center gap-3 rounded-md border-2 border-primary bg-primary/5 p-3">
                      <div className="w-8 text-center font-bold text-primary">#{myRankQ.data.rank}</div>
                      <div className="flex-1 font-medium">Bạn</div>
                      <div className="font-mono font-semibold">{myRankQ.data.xp.toLocaleString()} điểm</div>
                    </div>
                  ) : (
                    <div className="text-center text-xs text-muted-foreground">Chưa có thứ hạng của bạn</div>
                  )}
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* 3.4 Danh sách phần thưởng */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold flex items-center gap-2"><Gift className="h-4 w-4" />Phần thưởng</h3>
            <span className="text-xs text-muted-foreground">Bạn có <strong className="text-amber-600">{redeemPoint.toLocaleString()}</strong> điểm đổi thưởng</span>
          </div>
          {rewardsQ.isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-48 w-full" />)}</div>
          ) : rewardsQ.error ? (
            <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>Lỗi tải phần thưởng. <Button variant="link" size="sm" onClick={() => rewardsQ.refetch()}>Thử lại</Button></AlertDescription></Alert>
          ) : (rewardsQ.data ?? []).length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-12 border-2 border-dashed rounded-md">
              <Gift className="h-10 w-10 mx-auto mb-2 opacity-30" />
              Chưa có phần thưởng nào
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(rewardsQ.data ?? []).map((r) => {
                const expired = r.expired_at && new Date(r.expired_at) <= new Date();
                const enough = redeemPoint >= r.required_point;
                const enabled = !expired && enough && (r.stock === null || r.stock > 0);
                return (
                  <div key={r.id} className="rounded-lg border overflow-hidden flex flex-col">
                    <div className="aspect-video bg-muted flex items-center justify-center overflow-hidden">
                      {r.image_url ? <img src={r.image_url} alt={r.name} className="w-full h-full object-cover" /> : <Gift className="h-12 w-12 text-muted-foreground/30" />}
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="font-semibold mb-1">{r.name}</div>
                      <div className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">{r.description}</div>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary" className="font-mono">{r.required_point.toLocaleString()} điểm</Badge>
                        {r.expired_at && <span className="text-xs text-muted-foreground">HSD: {new Date(r.expired_at).toLocaleDateString("vi-VN")}</span>}
                      </div>
                      <Button size="sm" disabled={!enabled} onClick={() => handleRewardClick(r)}>
                        {expired ? "Đã hết hạn" : !enough ? `Thiếu ${(r.required_point - redeemPoint).toLocaleString()} điểm` : "Đổi ngay"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 6. Xác nhận đổi thưởng */}
      <Dialog open={!!confirmReward} onOpenChange={(o) => !o && setConfirmReward(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận đổi thưởng</DialogTitle>
            <DialogDescription>Bạn có chắc chắn muốn đổi phần thưởng này?</DialogDescription>
          </DialogHeader>
          {confirmReward && (
            <div className="space-y-3">
              <div className="rounded-md border p-4">
                <div className="font-semibold">{confirmReward.name}</div>
                <div className="text-sm text-muted-foreground mt-1">{confirmReward.description}</div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span>Điểm cần</span>
                  <strong className="text-amber-600">{confirmReward.required_point.toLocaleString()} điểm</strong>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Điểm hiện tại</span>
                  <strong>{redeemPoint.toLocaleString()} điểm</strong>
                </div>
                <div className="flex items-center justify-between text-sm border-t mt-2 pt-2">
                  <span>Sau khi đổi</span>
                  <strong>{(redeemPoint - confirmReward.required_point).toLocaleString()} điểm</strong>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmReward(null)} disabled={redeem.isPending}>Huỷ</Button>
            <Button onClick={handleConfirmRedeem} disabled={redeem.isPending}>
              {redeem.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Xác nhận đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 7. Không đủ điểm */}
      <Dialog open={!!shortReward} onOpenChange={(o) => !o && setShortReward(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><AlertCircle className="h-5 w-5 text-amber-500" />Không đủ điểm</DialogTitle>
            <DialogDescription>
              Bạn cần thêm <strong className="text-amber-600">{shortReward ? (shortReward.required_point - redeemPoint).toLocaleString() : 0}</strong> điểm nữa để đổi <strong>{shortReward?.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShortReward(null)}>Đóng</Button>
            <Button onClick={() => { setShortReward(null); navigate({ to: "/my-class" }); }}>Đi học ngay</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
