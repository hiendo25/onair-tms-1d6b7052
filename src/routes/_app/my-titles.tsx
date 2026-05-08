import { createFileRoute, Link } from "@tanstack/react-router";
import { Crown, Lock, Check, AlertCircle } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGamifications, useMyTitle, useMyXp } from "@/lib/data-hooks";
import { useMemo } from "react";

export const Route = createFileRoute("/_app/my-titles")({
  head: () => ({ meta: [{ title: "Danh sách danh hiệu — OnAir TMS" }] }),
  component: Page,
});

function Page() {
  const xpQ = useMyXp();
  const myTitleQ = useMyTitle();
  const gamQ = useGamifications();

  const titles = useMemo(
    () => (gamQ.data ?? []).filter((g) => g.type === "title" && g.active).sort((a, b) => (a.xp_required || 0) - (b.xp_required || 0)),
    [gamQ.data]
  );
  const myXp = xpQ.data?.xp ?? 0;
  const currentId = myTitleQ.data?.title_id;

  return (
    <PageContainer
      title="Danh sách danh hiệu"
      breadcrumbs={[{ title: "Thưởng", href: "/my-gamification" }, { title: "Danh hiệu" }]}
      actions={<Link to="/my-gamification"><Button variant="outline" size="sm">← Quay lại</Button></Link>}
    >
      <Card>
        <CardContent className="p-6">
          <div className="text-sm text-muted-foreground mb-4">Điểm học tập hiện tại: <strong className="text-foreground">{myXp.toLocaleString()}</strong></div>
          {gamQ.isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32 w-full" />)}</div>
          ) : gamQ.error ? (
            <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>Lỗi tải dữ liệu</AlertDescription></Alert>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {titles.map((t) => {
                const earned = myXp >= (t.xp_required || 0);
                const isCurrent = t.id === currentId;
                return (
                  <div key={t.id} className={`rounded-lg border p-4 text-center transition ${isCurrent ? "border-primary bg-primary/5 shadow-md" : earned ? "border-amber-200 bg-amber-50/50" : "opacity-60"}`}>
                    <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full mb-2 ${earned ? "bg-gradient-to-br from-amber-100 to-amber-200" : "bg-muted"}`}>
                      {earned ? <Crown className={`h-8 w-8 ${earned ? "text-amber-600" : "text-muted-foreground"}`} /> : <Lock className="h-7 w-7 text-muted-foreground" />}
                    </div>
                    <div className="font-semibold">{t.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">{(t.xp_required || 0).toLocaleString()} điểm</div>
                    <div className="mt-2">
                      {isCurrent ? (
                        <Badge className="bg-primary">Danh hiệu hiện tại</Badge>
                      ) : earned ? (
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700"><Check className="h-3 w-3 mr-1" />Đã đạt</Badge>
                      ) : (
                        <Badge variant="outline">Cần {((t.xp_required || 0) - myXp).toLocaleString()} điểm</Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
