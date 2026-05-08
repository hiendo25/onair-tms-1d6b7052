import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { AiSpinner } from "@/components/ai/AiSpinner";
import { type SurveyInsight } from "@/lib/ai-mock";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_app/admin/surveys/$id/statistics")({
  head: () => ({ meta: [{ title: "Thống kê khảo sát — OnAir TMS" }] }),
  component: Stats,
});

function Stats() {
  const { id } = Route.useParams();
  const [data, setData] = useState<SurveyInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function analyze() {
    setLoading(true);
    setError(null);
    try {
      const { data: res, error: fnErr } = await supabase.functions.invoke("ai-survey-summary", { body: { surveyId: id } });
      if (fnErr) throw fnErr;
      setData(res as SurveyInsight);
    } catch (e) { setError(e instanceof Error ? e.message : "Có gì đó chưa đúng, thử lại nhé."); }
    finally { setLoading(false); }
  }

  return (
    <PageContainer title="Thống kê khảo sát" breadcrumbs={[{ title: "Khảo sát", path: "/admin/surveys" }, { title: `#${id}` }, { title: "Thống kê" }]}>
      <div className="grid gap-3 md:grid-cols-3 mb-4">
        {[["Phản hồi","128"],["Tỷ lệ","85%"],["Trung bình","4.2/5"]].map(([l,v])=>(
          <Card key={l}><CardContent className="p-4"><div className="text-xs text-muted-foreground">{l}</div><div className="text-lg font-semibold mt-1">{v}</div></CardContent></Card>
        ))}
      </div>

      <div className="flex justify-end mb-3">
        <Button onClick={analyze} disabled={loading} className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-95 text-white">
          <Sparkles className="h-4 w-4 mr-1.5" />
          {loading ? "Để mình xem qua nhé..." : "Tóm tắt phản hồi từ khảo sát này"}
        </Button>
      </div>

      {(loading || data || error) && (
        <Card className="mb-4 border-violet-200 bg-gradient-to-br from-violet-50 to-fuchsia-50">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-600" />
              <span className="font-semibold text-sm text-violet-900">Phân tích AI</span>
            </div>
            {loading && <AiSpinner label="Để mình xem qua nhé..." />}
            {error && !loading && (
              <div className="text-sm text-destructive flex items-center justify-between">
                <span>{error}</span>
                <Button size="sm" variant="outline" onClick={analyze}>Thử lại</Button>
              </div>
            )}
            {data && !loading && (
              <div className="space-y-4 text-sm">
                <div>
                  <div className="font-semibold mb-1">📊 Sentiment tổng quan</div>
                  <p className="leading-relaxed">{data.sentiment}</p>
                </div>
                <div>
                  <div className="font-semibold mb-1">⚠️ Top 3 vấn đề</div>
                  <ul className="space-y-1.5">
                    {data.top_issues.map((it, i) => <li key={i} className="flex gap-2"><span className="text-violet-600 font-bold">{i+1}.</span><span>{it}</span></li>)}
                  </ul>
                </div>
                <div>
                  <div className="font-semibold mb-1">💡 Gợi ý cải thiện</div>
                  <ul className="space-y-1.5">
                    {data.suggestions.map((it, i) => <li key={i} className="flex gap-2"><span className="text-emerald-600">✓</span><span>{it}</span></li>)}
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card><CardHeader><CardTitle>Câu hỏi 1: Đánh giá khóa học?</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {[["Rất tốt",65],["Tốt",80],["Bình thường",30],["Chưa tốt",10]].map(([l,v])=>(
            <div key={l as string}><div className="flex justify-between text-sm mb-1"><span>{l}</span><span>{v as number}</span></div><Progress value={v as number}/></div>
          ))}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
