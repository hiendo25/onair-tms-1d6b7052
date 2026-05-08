import { useState } from "react";
import { Sparkles, AlertTriangle, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AiSpinner } from "@/components/ai/AiSpinner";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/lib/org-context";

type AtRisk = {
  employee_id: string;
  name: string;
  department: string;
  branch: string;
  employee_code: string;
  risk_score: number;
  inactive_days: number;
  avg_progress: number;
  fail_count: number;
};

type DropoutResult = {
  at_risk: AtRisk[];
  summary: string;
  interventions: string[];
};

function riskBadge(score: number) {
  if (score >= 70) return <Badge className="bg-red-100 text-red-700">Cao</Badge>;
  if (score >= 50) return <Badge className="bg-amber-100 text-amber-700">Trung bình</Badge>;
  return <Badge className="bg-yellow-100 text-yellow-700">Thấp</Badge>;
}

export function DropoutRiskCard() {
  const { orgId } = useOrg();
  const [result, setResult] = useState<DropoutResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function analyze() {
    setLoading(true);
    setError(null);
    try {
      const { data: res, error: fnErr } = await supabase.functions.invoke("ai-dropout-risk", {
        body: { orgId },
      });
      if (fnErr) throw fnErr;
      setResult(res as DropoutResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-amber-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Cảnh báo dropout
          </CardTitle>
          <Button
            size="sm"
            onClick={analyze}
            disabled={loading}
            className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-95 text-white"
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            {loading ? "Đang phân tích..." : result ? "Cập nhật" : "Phân tích"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && <AiSpinner label="Đang quét dữ liệu học tập..." />}
        {error && !loading && <p className="text-sm text-destructive">{error}</p>}

        {result && !loading && (
          <>
            <p className="text-sm text-muted-foreground leading-relaxed">{result.summary}</p>

            {result.at_risk.length === 0 ? (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700">
                ✓ Không có nhân viên nào trong nguy hiểm.
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Users className="h-4 w-4 text-amber-600" />
                  {result.at_risk.length} nhân viên có nguy cơ
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {result.at_risk.map((e) => (
                    <div key={e.employee_id} className="rounded-md border p-2.5 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm truncate">{e.name}</span>
                          {riskBadge(e.risk_score)}
                        </div>
                        <div className="text-xs text-muted-foreground">{e.department} · {e.branch}</div>
                        <div className="mt-1.5 space-y-0.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Tiến độ TB</span>
                            <span>{e.avg_progress}%</span>
                          </div>
                          <Progress value={e.avg_progress} className="h-1" />
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {e.inactive_days < 999 ? `Không hoạt động ${e.inactive_days} ngày` : "Chưa bắt đầu học"}
                          {e.fail_count > 0 && ` · Fail ${e.fail_count} bài`}
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-amber-600 shrink-0">{e.risk_score}</div>
                    </div>
                  ))}
                </div>

                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Gợi ý can thiệp</div>
                  <ul className="space-y-1">
                    {result.interventions.map((it, i) => (
                      <li key={i} className="flex gap-2 text-sm">
                        <span className="text-violet-600 font-bold shrink-0">{i + 1}.</span>
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </>
        )}

        {!result && !loading && !error && (
          <p className="text-sm text-muted-foreground">
            AI sẽ quét toàn bộ nhân viên — phát hiện ai không hoạt động 7+ ngày, tiến độ thấp hoặc fail nhiều bài — và gợi ý can thiệp kịp thời.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
