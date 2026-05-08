import { useState } from "react";
import { Sparkles, TrendingUp, TrendingDown, Minus, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AiSpinner } from "@/components/ai/AiSpinner";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/lib/org-context";

type MonthStat = { label: string; completed: number; passed: number; avgScore: string | null; totalSubs: number };
type BranchTrend = { name: string; months: number[] };
type TrendResult = {
  trend_direction: string;
  summary: string;
  key_findings: string[];
  anomalies: string[];
  forecast: string;
  monthlyData: MonthStat[];
  branchTrend: BranchTrend[];
};

const DIRECTION_CONFIG = {
  improving: { label: "Đang tốt lên", Icon: TrendingUp, cls: "bg-emerald-100 text-emerald-700" },
  stable: { label: "Ổn định", Icon: Minus, cls: "bg-blue-100 text-blue-700" },
  declining: { label: "Đang giảm", Icon: TrendingDown, cls: "bg-red-100 text-red-700" },
  mixed: { label: "Không đồng đều", Icon: TrendingUp, cls: "bg-amber-100 text-amber-700" },
};

function MiniSparkline({ values, max }: { values: number[]; max: number }) {
  if (!values.length) return null;
  const w = 60; const h = 24; const pad = 2;
  const xStep = (w - pad * 2) / Math.max(values.length - 1, 1);
  const yScale = (v: number) => h - pad - ((v / (max || 1)) * (h - pad * 2));
  const pts = values.map((v, i) => `${pad + i * xStep},${yScale(v)}`).join(" ");
  const last = values[values.length - 1];
  const prev = values[values.length - 2] ?? last;
  const color = last >= prev ? "#10b981" : "#ef4444";
  return (
    <svg width={w} height={h} className="shrink-0">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      {values.map((v, i) => <circle key={i} cx={pad + i * xStep} cy={yScale(v)} r="2" fill={color} />)}
    </svg>
  );
}

export function AiTrendCard() {
  const { orgId } = useOrg();
  const [result, setResult] = useState<TrendResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function analyze() {
    setLoading(true);
    setError(null);
    try {
      const { data: res, error: fnErr } = await supabase.functions.invoke("ai-trend-analysis", {
        body: { orgId },
      });
      if (fnErr) throw fnErr;
      setResult(res as TrendResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  }

  const dir = result ? (DIRECTION_CONFIG[result.trend_direction as keyof typeof DIRECTION_CONFIG] ?? DIRECTION_CONFIG.stable) : null;
  const maxCompleted = result ? Math.max(...result.monthlyData.map((m) => m.completed), 1) : 1;

  return (
    <Card className="border-violet-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-violet-600" />
            Phân tích xu hướng 3 tháng
          </CardTitle>
          <Button size="sm" onClick={analyze} disabled={loading}
            className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-95 text-white">
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            {loading ? "Đang phân tích..." : result ? "Cập nhật" : "Phân tích xu hướng"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && <AiSpinner label="Đang phân tích 3 tháng gần nhất..." />}
        {error && !loading && <p className="text-sm text-destructive">{error}</p>}

        {result && !loading && (
          <>
            {/* Direction badge + summary */}
            <div className="flex items-start gap-3">
              {dir && <Badge className={dir.cls}><dir.Icon className="h-3 w-3 mr-1" />{dir.label}</Badge>}
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">{result.summary}</p>
            </div>

            {/* Monthly mini chart */}
            <div className="grid grid-cols-3 gap-2">
              {result.monthlyData.map((m, i) => (
                <div key={i} className="rounded-lg border p-2.5 text-center">
                  <div className="text-[10px] text-muted-foreground mb-1">{m.label}</div>
                  <div className="text-xl font-bold">{m.completed}</div>
                  <div className="text-[10px] text-muted-foreground">khóa hoàn thành</div>
                  {m.avgScore && <div className="text-xs text-muted-foreground mt-0.5">ĐTB {m.avgScore}</div>}
                </div>
              ))}
            </div>

            {/* Branch sparklines */}
            {result.branchTrend.filter((b) => b.months.some((v) => v > 0)).length > 0 && (
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Xu hướng chi nhánh</div>
                <div className="space-y-1.5">
                  {result.branchTrend.filter((b) => b.months.some((v) => v > 0)).map((b) => {
                    const last = b.months[b.months.length - 1];
                    const first = b.months[0];
                    const delta = last - first;
                    return (
                      <div key={b.name} className="flex items-center gap-3">
                        <span className="text-sm flex-1 truncate">{b.name}</span>
                        <MiniSparkline values={b.months} max={100} />
                        <span className={`text-xs font-medium w-12 text-right ${delta > 0 ? "text-emerald-600" : delta < 0 ? "text-red-600" : "text-muted-foreground"}`}>
                          {delta > 0 ? "+" : ""}{delta}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Key findings */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <div className="text-xs font-semibold text-violet-700 uppercase tracking-wide mb-1.5">Phát hiện chính</div>
                <ul className="space-y-1.5">
                  {result.key_findings.map((f, i) => (
                    <li key={i} className="flex gap-2 text-sm"><span className="text-violet-500 shrink-0">•</span><span>{f}</span></li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-1 text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1.5">
                  <AlertCircle className="h-3 w-3" /> Bất thường
                </div>
                <ul className="space-y-1.5">
                  {result.anomalies.length ? result.anomalies.map((a, i) => (
                    <li key={i} className="flex gap-2 text-sm"><span className="text-amber-500 shrink-0">⚠</span><span>{a}</span></li>
                  )) : <li className="text-sm text-muted-foreground">Không phát hiện bất thường.</li>}
                </ul>
              </div>
            </div>

            {/* Forecast */}
            <div className="rounded-lg bg-violet-50 border border-violet-200 p-3">
              <div className="text-xs font-semibold text-violet-700 mb-1">🔮 Dự báo tháng tới</div>
              <p className="text-sm text-violet-900">{result.forecast}</p>
            </div>
          </>
        )}

        {!result && !loading && !error && (
          <p className="text-sm text-muted-foreground">
            AI sẽ phân tích dữ liệu 3 tháng gần nhất — nhận diện xu hướng hoàn thành, điểm bất thường theo chi nhánh, và dự báo tháng tới.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
