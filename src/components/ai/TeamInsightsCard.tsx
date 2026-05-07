import { useEffect, useState } from "react";
import { AlertTriangle, Info, CheckCircle2, Sparkles, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AiSpinner } from "@/components/ai/AiSpinner";
import { aiTeamInsights, type TeamInsight } from "@/lib/ai-mock";

const ICONS = {
  warning: { Icon: AlertTriangle, cls: "bg-amber-100 text-amber-700" },
  info: { Icon: Info, cls: "bg-blue-100 text-blue-700" },
  success: { Icon: CheckCircle2, cls: "bg-emerald-100 text-emerald-700" },
} as const;

export function TeamInsightsCard({ title = "Điều cần chú ý tuần này" }: { title?: string }) {
  const [data, setData] = useState<TeamInsight[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const r = await aiTeamInsights();
      setData(r);
    } catch {
      setError("Có gì đó chưa đúng, thử lại nhé.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  return (
    <Card className="border-violet-200 bg-gradient-to-br from-violet-50/60 to-fuchsia-50/40">
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-600" />
            <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
          </div>
          <Button size="sm" variant="ghost" onClick={() => void load()} disabled={loading}>
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {loading && <AiSpinner label="Để mình xem qua nhé..." />}
        {error && !loading && (
          <div className="text-sm text-destructive flex items-center justify-between">
            <span>{error}</span>
            <Button size="sm" variant="outline" onClick={() => void load()}>Thử lại</Button>
          </div>
        )}
        {!loading && data && (
          <ul className="space-y-2">
            {data.map((it, i) => {
              const { Icon, cls } = ICONS[it.severity];
              return (
                <li key={i} className="flex gap-3 rounded-lg border bg-card p-3">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${cls}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm">{it.title}</div>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{it.detail}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
