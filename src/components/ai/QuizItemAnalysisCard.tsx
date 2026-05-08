import { useState } from "react";
import { Sparkles, AlertTriangle, Lightbulb } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AiSpinner } from "@/components/ai/AiSpinner";
import { supabase } from "@/integrations/supabase/client";

type Result = {
  overview: string;
  problem_questions: { question: string; issue: string; suggestion: string }[];
  recommendations: string[];
  stats?: { total_attempts: number; avg_score: number; pass_rate: number };
};

export function QuizItemAnalysisCard({ assignmentId }: { assignmentId: string }) {
  const [data, setData] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      const { data: res, error: fnErr } = await supabase.functions.invoke("ai-quiz-item-analysis", { body: { assignmentId } });
      if (fnErr) throw fnErr;
      setData(res as Result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Có lỗi, thử lại nhé.");
    } finally { setLoading(false); }
  }

  return (
    <Card className="border-violet-200 bg-gradient-to-br from-violet-50/60 to-fuchsia-50/40">
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-600" />
            <span className="text-sm font-semibold">Phân tích chất lượng câu hỏi (AI)</span>
          </div>
          <Button size="sm" onClick={run} disabled={loading} className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-95 text-white">
            {loading ? "Đang phân tích..." : data ? "Phân tích lại" : "Phân tích ngay"}
          </Button>
        </div>

        {loading && <AiSpinner label="AI đang xem qua các lượt làm bài..." />}
        {error && !loading && (
          <div className="text-sm text-destructive flex items-center justify-between">
            <span>{error}</span>
            <Button size="sm" variant="outline" onClick={run}>Thử lại</Button>
          </div>
        )}

        {data && !loading && (
          <div className="space-y-4 text-sm">
            {data.stats && (
              <div className="flex flex-wrap gap-3 text-xs">
                <Badge variant="outline">Lượt làm: {data.stats.total_attempts}</Badge>
                <Badge variant="outline">Điểm TB: {data.stats.avg_score}</Badge>
                <Badge variant="outline">Tỷ lệ đạt: {Math.round(data.stats.pass_rate * 100)}%</Badge>
              </div>
            )}
            <div>
              <div className="font-semibold mb-1">📋 Tổng quan</div>
              <p className="leading-relaxed">{data.overview}</p>
            </div>
            {data.problem_questions.length > 0 && (
              <div>
                <div className="font-semibold mb-2 flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5 text-amber-600" />Câu hỏi cần xem lại</div>
                <ul className="space-y-2">
                  {data.problem_questions.map((p, i) => (
                    <li key={i} className="rounded-lg border bg-card p-3">
                      <div className="font-medium text-sm">{p.question}</div>
                      <div className="text-xs text-amber-700 mt-1">⚠️ {p.issue}</div>
                      <div className="text-xs text-emerald-700 mt-1">💡 {p.suggestion}</div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {data.recommendations.length > 0 && (
              <div>
                <div className="font-semibold mb-1 flex items-center gap-1.5"><Lightbulb className="h-3.5 w-3.5 text-emerald-600" />Đề xuất chung</div>
                <ul className="space-y-1.5">
                  {data.recommendations.map((r, i) => (
                    <li key={i} className="flex gap-2"><span className="text-emerald-600">✓</span><span>{r}</span></li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
