import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, BookOpen, Clock, Star, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/lib/org-context";

type WeekMetrics = {
  lessons: number;
  hours: number;
  avgScore: number; // 0..10
};

async function fetchWeek(uid: string, orgId: string, fromIso: string, toIso: string): Promise<WeekMetrics> {
  const [actRes, subRes] = await Promise.all([
    supabase.from("learning_activity")
      .select("action, created_at, metadata")
      .eq("user_id", uid).eq("org_id", orgId)
      .gte("created_at", fromIso).lt("created_at", toIso),
    supabase.from("assignment_submissions")
      .select("score, submitted_at, status")
      .eq("user_id", uid).eq("org_id", orgId)
      .gte("submitted_at", fromIso).lt("submitted_at", toIso),
  ]);

  const acts = actRes.data ?? [];
  const lessons = acts.filter((a) => a.action === "lesson_complete" || a.action === "course_complete").length;
  // Estimate hours: 0.5h per lesson_complete, 0.25h per quiz_submit
  const hours = Math.round(
    (acts.filter((a) => a.action === "lesson_complete").length * 0.5
      + acts.filter((a) => a.action === "quiz_submit").length * 0.25) * 10,
  ) / 10;

  const scores = (subRes.data ?? [])
    .map((s) => (typeof s.score === "number" ? Number(s.score) : null))
    .filter((x): x is number => x != null);
  const avgScore = scores.length ? Math.round((scores.reduce((s, n) => s + n, 0) / scores.length) * 10) / 10 : 0;

  return { lessons, hours, avgScore };
}

export function WeeklyLearningSummary() {
  const { orgId } = useOrg();

  const { data, isLoading } = useQuery({
    queryKey: ["weekly-summary", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const uid = u.user?.id;
      if (!uid) return null;

      const now = new Date();
      const startOfThisWeek = new Date(now);
      const day = startOfThisWeek.getDay() || 7; // Mon-based
      startOfThisWeek.setHours(0, 0, 0, 0);
      startOfThisWeek.setDate(startOfThisWeek.getDate() - (day - 1));
      const startOfLastWeek = new Date(startOfThisWeek);
      startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

      const [thisW, lastW] = await Promise.all([
        fetchWeek(uid, orgId, startOfThisWeek.toISOString(), new Date(now.getTime() + 1000).toISOString()),
        fetchWeek(uid, orgId, startOfLastWeek.toISOString(), startOfThisWeek.toISOString()),
      ]);

      return { thisW, lastW };
    },
  });

  const items = [
    { label: "Bài hoàn thành", icon: BookOpen, key: "lessons" as const, suffix: "" },
    { label: "Giờ học", icon: Clock, key: "hours" as const, suffix: "h" },
    { label: "Điểm trung bình", icon: Star, key: "avgScore" as const, suffix: "/10" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-blue-600" />
          Tóm tắt học tập tuần này
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading || !data ? (
          <div className="text-sm text-muted-foreground py-4 text-center">Đang tải...</div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            {items.map((it) => {
              const cur = data.thisW[it.key];
              const prev = data.lastW[it.key];
              const delta = cur - prev;
              const pct = prev > 0 ? Math.round((delta / prev) * 100) : (cur > 0 ? 100 : 0);
              const Icon = it.icon;
              const Trend = delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;
              const trendColor = delta > 0 ? "text-emerald-600" : delta < 0 ? "text-red-600" : "text-muted-foreground";
              return (
                <div key={it.key} className="rounded-lg border bg-white p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="text-xs text-muted-foreground">{it.label}</div>
                  </div>
                  <div className="text-2xl font-bold tabular-nums">{cur}{it.suffix}</div>
                  <div className={`mt-1 text-xs flex items-center gap-1 ${trendColor}`}>
                    <Trend className="h-3 w-3" />
                    {delta === 0
                      ? "Bằng tuần trước"
                      : `${delta > 0 ? "+" : ""}${pct}% so với tuần trước`}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
