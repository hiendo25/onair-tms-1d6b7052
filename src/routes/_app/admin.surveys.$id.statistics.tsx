import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, Loader2 } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { AiSpinner } from "@/components/ai/AiSpinner";
import { supabase } from "@/integrations/supabase/client";

type SurveyInsight = { sentiment: string; top_issues: string[]; suggestions: string[] };

type QuestionStat = {
  id: string;
  question: string;
  type: string;
  order_index: number;
  options: string[];
  choiceCounts: Record<string, number>;
  totalAnswers: number;
};

export const Route = createFileRoute("/_app/admin/surveys/$id/statistics")({
  head: () => ({ meta: [{ title: "Thống kê khảo sát — OnAir TMS" }] }),
  component: Stats,
});

function useSurveyStats(surveyId: string) {
  return useQuery({
    queryKey: ["survey-stats", surveyId],
    queryFn: async () => {
      const [surveyRes, questionsRes, responsesRes] = await Promise.all([
        supabase.from("surveys").select("id, title, target_count, responses_count, status").eq("id", surveyId).single(),
        supabase.from("survey_questions").select("id, type, content, options, order_index").eq("survey_id", surveyId).order("order_index"),
        supabase.from("survey_responses").select("id").eq("survey_id", surveyId),
      ]);

      const survey = surveyRes.data;
      const questions = questionsRes.data ?? [];
      const responseCount = responsesRes.data?.length ?? 0;

      if (questions.length === 0) return { survey, responseCount, questionStats: [] };

      const qIds = questions.map((q) => q.id);
      const { data: answers } = await supabase
        .from("survey_answers")
        .select("question_id, value")
        .in("question_id", qIds);

      const allAnswers = answers ?? [];

      const questionStats: QuestionStat[] = questions.map((q) => {
        const qAnswers = allAnswers.filter((a) => a.question_id === q.id);
        const opts = Array.isArray(q.options) ? (q.options as string[]) : [];
        const choiceCounts: Record<string, number> = {};
        opts.forEach((o) => { choiceCounts[o] = 0; });
        qAnswers.forEach((a) => {
          if (a.value && choiceCounts[a.value] !== undefined) choiceCounts[a.value]++;
          else if (a.value) choiceCounts[a.value] = (choiceCounts[a.value] ?? 0) + 1;
        });
        return { id: q.id, question: q.content, type: q.type, order_index: q.order_index, options: opts, choiceCounts, totalAnswers: qAnswers.length };
      });

      return { survey, responseCount, questionStats };
    },
  });
}

function Stats() {
  const { id } = Route.useParams();
  const { data: stats, isLoading: loadingStats } = useSurveyStats(id);
  const [insight, setInsight] = useState<SurveyInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const responseCount = stats?.responseCount ?? 0;
  const targetCount = stats?.survey?.target_count ?? 0;
  const responseRate = targetCount > 0 ? Math.round((responseCount / targetCount) * 100) : null;

  async function analyze() {
    setLoading(true);
    setError(null);
    try {
      const { data: res, error: fnErr } = await supabase.functions.invoke("ai-survey-summary", { body: { surveyId: id } });
      if (fnErr) throw fnErr;
      setInsight(res as SurveyInsight);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Có gì đó chưa đúng, thử lại nhé.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageContainer
      title={stats?.survey?.title ?? "Thống kê khảo sát"}
      breadcrumbs={[{ title: "Khảo sát", path: "/admin/surveys" }, { title: stats?.survey?.title ?? `#${id}` }, { title: "Thống kê" }]}
    >
      {loadingStats ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <>
          <div className="grid gap-3 md:grid-cols-3 mb-4">
            <Card><CardContent className="p-4">
              <div className="text-xs text-muted-foreground">Phản hồi</div>
              <div className="text-2xl font-semibold mt-1">{responseCount}</div>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <div className="text-xs text-muted-foreground">Tỷ lệ phản hồi</div>
              <div className="text-2xl font-semibold mt-1">{responseRate !== null ? `${responseRate}%` : "—"}</div>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <div className="text-xs text-muted-foreground">Mục tiêu</div>
              <div className="text-2xl font-semibold mt-1">{targetCount > 0 ? targetCount : "—"}</div>
            </CardContent></Card>
          </div>

          <div className="flex justify-end mb-3">
            <Button
              onClick={analyze}
              disabled={loading}
              className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-95 text-white"
            >
              <Sparkles className="h-4 w-4 mr-1.5" />
              {loading ? "Đang phân tích..." : "Tóm tắt phản hồi bằng AI"}
            </Button>
          </div>

          {(loading || insight || error) && (
            <Card className="mb-4 border-violet-200 bg-gradient-to-br from-violet-50 to-fuchsia-50">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-violet-600" />
                  <span className="font-semibold text-sm text-violet-900">Phân tích AI</span>
                </div>
                {loading && <AiSpinner label="Đang phân tích phản hồi..." />}
                {error && !loading && (
                  <div className="text-sm text-destructive flex items-center justify-between">
                    <span>{error}</span>
                    <Button size="sm" variant="outline" onClick={analyze}>Thử lại</Button>
                  </div>
                )}
                {insight && !loading && (
                  <div className="space-y-4 text-sm">
                    <div>
                      <div className="font-semibold mb-1">📊 Sentiment tổng quan</div>
                      <p className="leading-relaxed">{insight.sentiment}</p>
                    </div>
                    <div>
                      <div className="font-semibold mb-1">⚠️ Top 3 vấn đề</div>
                      <ul className="space-y-1.5">
                        {insight.top_issues.map((it, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-violet-600 font-bold">{i + 1}.</span>
                            <span>{it}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="font-semibold mb-1">💡 Gợi ý cải thiện</div>
                      <ul className="space-y-1.5">
                        {insight.suggestions.map((it, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-emerald-600">✓</span>
                            <span>{it}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {(stats?.questionStats ?? []).length === 0 && responseCount === 0 && (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                Chưa có phản hồi nào cho khảo sát này.
              </CardContent>
            </Card>
          )}

          {(stats?.questionStats ?? []).map((q, idx) => (
            <Card key={q.id} className="mb-3">
              <CardHeader>
                <CardTitle className="text-base">Câu {idx + 1}: {q.question}</CardTitle>
              </CardHeader>
              {(q.type === "single" || q.type === "multiple") && q.options.length > 0 ? (
                <CardContent className="space-y-3">
                  {q.options.map((opt) => {
                    const count = q.choiceCounts[opt] ?? 0;
                    const pct = q.totalAnswers > 0 ? Math.round((count / q.totalAnswers) * 100) : 0;
                    return (
                      <div key={opt}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{opt}</span>
                          <span className="text-muted-foreground">{count} ({pct}%)</span>
                        </div>
                        <Progress value={pct} />
                      </div>
                    );
                  })}
                  <div className="text-xs text-muted-foreground pt-1">Tổng phản hồi câu này: {q.totalAnswers}</div>
                </CardContent>
              ) : (
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {q.totalAnswers > 0 ? `${q.totalAnswers} phản hồi (câu tự luận — xem chi tiết trong tab Submissions)` : "Chưa có phản hồi"}
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
        </>
      )}
    </PageContainer>
  );
}
