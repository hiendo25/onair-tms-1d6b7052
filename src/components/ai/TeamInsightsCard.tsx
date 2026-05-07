import { useEffect, useMemo, useState } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { AlertTriangle, Info, CheckCircle2, Sparkles, RefreshCw, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AiSpinner } from "@/components/ai/AiSpinner";
import { aiTeamInsights, aiStudentActionInsights, type ActionableInsight } from "@/lib/ai-mock";

const ICONS = {
  warning: { Icon: AlertTriangle, cls: "bg-amber-100 text-amber-700" },
  info: { Icon: Info, cls: "bg-blue-100 text-blue-700" },
  success: { Icon: CheckCircle2, cls: "bg-emerald-100 text-emerald-700" },
} as const;

const SEVERITY_RANK = { warning: 0, info: 1, success: 2 } as const;

export function TeamInsightsCard({
  title = "Điều cần chú ý tuần này",
  variant = "team",
  insights,
  loading: loadingProp,
}: {
  title?: string;
  variant?: "team" | "student";
  insights?: ActionableInsight[];
  loading?: boolean;
}) {
  const router = useRouter();
  const knownPaths = useMemo(() => {
    const rbp = (router as unknown as { routesByPath?: Record<string, unknown> }).routesByPath ?? {};
    return new Set(Object.keys(rbp));
  }, [router]);
  const externalMode = insights !== undefined || loadingProp !== undefined;
  const [data, setData] = useState<ActionableInsight[] | null>(externalMode ? null : null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (externalMode) return;
    setLoading(true);
    setError(null);
    try {
      const r = variant === "student" ? await aiStudentActionInsights() : await aiTeamInsights();
      const sorted = [...r].sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]).slice(0, 3);
      setData(sorted);
    } catch {
      setError("Có gì đó chưa đúng, thử lại nhé.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [variant, externalMode]);

  const effLoading = externalMode ? !!loadingProp : loading;
  const effData = externalMode
    ? (insights
        ? [...insights].sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]).slice(0, 3)
        : null)
    : data;

  const positive = !effLoading && effData && effData.every((i) => i.severity === "success");

  return (
    <Card className="border-violet-200 bg-gradient-to-br from-violet-50/60 to-fuchsia-50/40">
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-600" />
            <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
          </div>
          {!externalMode && (
            <Button size="sm" variant="ghost" onClick={() => void load()} disabled={loading}>
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            </Button>
          )}
        </div>

        {effLoading && <AiSpinner label="Để mình xem qua nhé..." />}
        {error && !effLoading && (
          <div className="text-sm text-destructive flex items-center justify-between">
            <span>{error}</span>
            <Button size="sm" variant="outline" onClick={() => void load()}>Thử lại</Button>
          </div>
        )}
        {!effLoading && effData && effData.length === 0 && (
          <p className="text-sm text-muted-foreground">
            {variant === "student"
              ? "Mọi thứ đang trong tầm kiểm soát — hãy thử khóa nâng cao tiếp theo nhé!"
              : "Chưa có đủ dữ liệu để đưa ra nhận xét."}
          </p>
        )}
        {!effLoading && effData && effData.length > 0 && (
          <ul className="space-y-2">
            {positive && variant === "student" && (
              <li className="rounded-lg border bg-emerald-50/60 p-3 text-sm text-emerald-800">
                Tuần này bạn đang làm rất tốt — hãy thử khóa nâng cao tiếp theo nhé!
              </li>
            )}
            {effData.map((it, i) => {
              const { Icon, cls } = ICONS[it.severity];
              return (
                <li key={i} className="flex flex-col gap-2 rounded-lg border bg-card p-3 sm:flex-row sm:items-center">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${cls}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-sm">{it.title}</div>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{it.detail}</p>
                  </div>
                  <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shrink-0">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <Link
                      to={it.to as any}
                      search={it.search as any}
                      onClick={(e) => {
                        if (!knownPaths.has(it.to)) {
                          e.preventDefault();
                          toast.error("Trang này chưa có sẵn, mình sẽ bổ sung sau nhé.");
                          // eslint-disable-next-line no-console
                          console.warn("[TeamInsightsCard] Missing route:", it.to);
                        }
                      }}
                    >
                      {it.ctaLabel}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
