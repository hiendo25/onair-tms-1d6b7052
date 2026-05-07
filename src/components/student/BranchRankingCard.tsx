import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Medal, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/lib/org-context";

export function BranchRankingCard({ branchName }: { branchName: string }) {
  const { orgId } = useOrg();

  const { data, isLoading } = useQuery({
    queryKey: ["branch-ranking", orgId, branchName],
    enabled: !!orgId,
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const uid = u.user?.id ?? null;

      // All users in same branch within org
      const stats = await supabase
        .from("user_stats")
        .select("user_id, display_name, branch")
        .eq("org_id", orgId)
        .eq("branch", branchName);
      const userIds = (stats.data ?? []).map((r) => r.user_id);
      if (userIds.length === 0) return { ranks: [], myRank: null, total: 0, myXp: 0 };

      const xpRes = await supabase
        .from("user_xp")
        .select("user_id, xp")
        .eq("org_id", orgId)
        .in("user_id", userIds);

      const xpMap = new Map((xpRes.data ?? []).map((r) => [r.user_id, r.xp ?? 0]));
      const nameMap = new Map((stats.data ?? []).map((r) => [r.user_id, r.display_name || "Học viên"]));

      const ordered = userIds
        .map((id) => ({ user_id: id, xp: xpMap.get(id) ?? 0, name: nameMap.get(id) ?? "Học viên" }))
        .sort((a, b) => b.xp - a.xp)
        .map((r, i) => ({ ...r, rank: i + 1, isMe: r.user_id === uid }));

      const me = ordered.find((r) => r.isMe) ?? null;
      return {
        ranks: ordered.slice(0, 5),
        myRank: me?.rank ?? null,
        total: ordered.length,
        myXp: me?.xp ?? 0,
      };
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Medal className="h-5 w-5 text-amber-500" />
          Xếp hạng tại {branchName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading || !data ? (
          <div className="text-sm text-muted-foreground py-4 text-center">Đang tải...</div>
        ) : data.total === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">Chưa có học viên nào trong chi nhánh.</p>
        ) : (
          <>
            {data.myRank && (
              <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm">
                <span className="font-semibold text-blue-700">
                  Bạn đang xếp thứ {data.myRank} trong {data.total} người tại {branchName}
                </span>
                <span className="text-blue-600 ml-2">· {data.myXp.toLocaleString()} XP</span>
              </div>
            )}
            <div className="space-y-1.5">
              {data.ranks.map((u) => (
                <div
                  key={u.user_id}
                  className={`flex items-center gap-3 rounded-lg p-2.5 ${
                    u.isMe ? "bg-blue-50 border border-blue-200" : ""
                  }`}
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-bold text-sm ${
                    u.rank === 1 ? "bg-amber-400 text-amber-900"
                      : u.rank === 2 ? "bg-slate-300 text-slate-800"
                        : u.rank === 3 ? "bg-orange-300 text-orange-900"
                          : "bg-slate-100 text-slate-600"
                  }`}>{u.rank}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate ${u.isMe ? "font-bold text-blue-700" : "font-medium"}`}>
                      {u.name} {u.isMe && <span className="text-xs">(bạn)</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-semibold text-amber-600">
                    <Flame className="h-3.5 w-3.5" />
                    {u.xp.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
