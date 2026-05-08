import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, Loader2 } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AiSpinner } from "@/components/ai/AiSpinner";
import { supabase } from "@/integrations/supabase/client";

type SurveyInsight = { sentiment: string; top_issues: string[]; suggestions: string[] };
type TextAnalysis = {
  sentiment: string;
  sentiment_summary: string;
  themes: { label: string; count: number; sample: string }[];
  key_insight: string;
  total_analyzed: number;
};

export const Route = createFileRoute("/_app/admin/surveys/$id/statistics")({
  head: () => ({ meta: [{ title: "Thống kê khảo sát — OnAir TMS" }] }),
  component: Stats,
});

function useStats(surveyId: string) {
  return useQuery({
    queryKey: ["survey-stats", surveyId],
    queryFn: async () => {
      const [surveyRes, questionsRes, responsesRes] = await Promise.all([
        supabase.from("surveys").select("id,title,target_count,responses_count,status,anonymous").eq("id", surveyId).single(),
        supabase.from("survey_questions").select("id,type,content,options,order_index").eq("survey_id", surveyId).order("order_index"),
        supabase.from("survey_responses").select("id").eq("survey_id", surveyId),
      ]);

      const survey = surveyRes.data;
      const questions = questionsRes.data ?? [];
      const responseCount = responsesRes.data?.length ?? 0;

      if (questions.length === 0) return { survey, responseCount, questionStats: [] };

      const qIds = questions.map((q) => q.id);
      const { data: answers } = await supabase
        .from("survey_answers")
        .select("question_id,value")
        .in("question_id", qIds);

      const allAnswers = answers ?? [];

      const questionStats = questions.map((q) => {
        const qAnswers = allAnswers.filter((a) => a.question_id === q.id);
        const opts: string[] = Array.isArray(q.options) ? (q.options as string[]) : [];
        const counts: Record<string, number> = {};
        opts.forEach((o) => { counts[o] = 0; });
        qAnswers.forEach((a) => {
          const v = a.value;
          if (Array.isArray(v)) (v as string[]).forEach((x) => { counts[x] = (counts[x] ?? 0) + 1; });
          else if (v != null) counts[String(v)] = (counts[String(v)] ?? 0) + 1;
        });
        return { id: q.id, content: q.content, type: q.type as string, order_index: q.order_index, opts, counts, answers: qAnswers };
      });

      return { survey, responseCount, questionStats };
    },
  });
}

function Stats() {
  const { id } = Route.useParams();
  const { data: stats, isLoading } = useStats(id);
  const [insight, setInsight] = useState<SurveyInsight | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [insightError, setInsightError] = useState<string | null>(null);
  const [textAnalysis, setTextAnalysis] = useState<Record<string, TextAnalysis | null>>({});
  const [analyzing, setAnalyzing] = useState<Record<string, boolean>>({});

  const responseCount = stats?.responseCount ?? 0;
  const targetCount = stats?.survey?.target_count ?? 0;
  const responseRate = targetCount > 0 ? Math.round((responseCount / targetCount) * 100) : null;

  async function summarize() {
    setInsightLoading(true);
    setInsightError(null);
    try {
      const { data: res, error: fnErr } = await supabase.functions.invoke("ai-survey-summary", { body: { surveyId: id } });
      if (fnErr) throw fnErr;
      setInsight(res as SurveyInsight);
    } catch (e) {
      setInsightError(e instanceof Error ? e.message : "Có lỗi xảy ra, thử lại nhé.");
    } finally {
      setInsightLoading(false);
    }
  }

  async function analyzeEssay(questionId: string, questionContent: string) {
    setAnalyzing((p) => ({ ...p, [questionId]: true }));
    try {
      const { data: res, error: fnErr } = await supabase.functions.invoke("ai-survey-text-analysis", {
        body: { surveyId: id, questionId, questionContent },
      });
      if (fnErr) throw fnErr;
      setTextAnalysis((p) => ({ ...p, [questionId]: res as TextAnalysis }));
    } catch {
      setTextAnalysis((p) => ({ ...p, [questionId]: null }));
    } finally {
      setAnalyzing((p) => ({ ...p, [questionId]: false }));
    }
  }

  return (
    <PageContainer
      title={stats?.survey?.title ?? "Thống kê khảo sát"}
      breadcrumbs={[{ title: "Khảo sát", path: "/admin/surveys" }, { title: stats?.survey?.title ?? `#${id}` }, { title: "Thống kê" }]}
    >
      {isLoading ? (
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
              <div className="text-xs text-muted-foreground">Trạng thái</div>
              <div className="mt-2"><Badge>{stats?.survey?.status ?? "—"}</Badge>{stats?.survey?.anonymous && <Badge variant="secondary" className="ml-2">Ẩn danh</Badge>}</div>
            </CardContent></Card>
          </div>

          <div className="flex justify-end mb-3">
            <Button
              onClick={summarize}
              disabled={insightLoading}
              className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-95 text-white"
            >
              <Sparkles className="h-4 w-4 mr-1.5" />
              {insightLoading ? "Đang phân tích..." : "Tóm tắt phản hồi bằng AI"}
            </Button>
          </div>

          {(insightLoading || insight || insightError) && (
            <Card className="mb-4 border-violet-200 bg-gradient-to-br from-violet-50 to-fuchsia-50">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-violet-600" />
                  <span className="font-semibold text-sm text-violet-900">Phân tích AI</span>
                </div>
                {insightLoading && <AiSpinner label="Đang phân tích phản hồi..." />}
                {insightError && !insightLoading && (
                  <div className="text-sm text-destructive flex items-center justify-between">
                    <span>{insightError}</span>
                    <Button size="sm" variant="outline" onClick={summarize}>Thử lại</Button>
                  </div>
                )}
                {insight && !insightLoading && (
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

          {(stats?.questionStats ?? []).map((q, idx) => {
            const answered = q.answers.length;
            const skipped = responseCount - answered;
            return (
              <Card key={q.id} className="mb-3">
                <CardHeader>
                  <CardTitle className="flex items-start gap-2 text-base">
                    <span className="text-muted-foreground">{idx + 1}.</span>
                    <span className="flex-1">{q.content}</span>
                    <Badge variant="outline" className="text-xs shrink-0">{q.type}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <QuestionResults q={q} totalRespondents={responseCount} />

                  {q.type === "essay" && answered > 0 && (
                    <div className="mt-3 pt-3 border-t space-y-3">
                      <Button
                        size="sm"
                        onClick={() => analyzeEssay(q.id, q.content)}
                        disabled={analyzing[q.id]}
                        className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-95 text-white"
                      >
                        <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                        {analyzing[q.id] ? "Đang phân tích..." : textAnalysis[q.id] ? "Phân tích lại" : "Phân tích câu trả lời bằng AI"}
                      </Button>
                      {analyzing[q.id] && <AiSpinner label="Đang phân tích các câu trả lời..." />}
                      {textAnalysis[q.id] && !analyzing[q.id] && (
                        <Card className="border-violet-200 bg-gradient-to-br from-violet-50 to-fuchsia-50">
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-center gap-2">
                              <Sparkles className="h-4 w-4 text-violet-600" />
                              <span className="font-semibold text-sm text-violet-900">
                                Phân tích AI — {textAnalysis[q.id]!.total_analyzed} câu trả lời
                              </span>
                              <Badge className={
                                textAnalysis[q.id]!.sentiment === "positive" ? "bg-emerald-100 text-emerald-700" :
                                textAnalysis[q.id]!.sentiment === "negative" ? "bg-red-100 text-red-700" :
                                "bg-slate-100 text-slate-700"
                              }>{textAnalysis[q.id]!.sentiment}</Badge>
                            </div>
                            <p className="text-sm">{textAnalysis[q.id]!.sentiment_summary}</p>
                            <div>
                              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Chủ đề chính</div>
                              <div className="space-y-2">
                                {textAnalysis[q.id]!.themes.map((t, ti) => (
                                  <div key={ti} className="rounded-md border bg-white p-2.5">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-sm font-medium">{t.label}</span>
                                      <Badge variant="outline" className="text-xs">~{t.count} người</Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground italic">"{t.sample}"</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="rounded-md bg-violet-100 p-3">
                              <div className="text-xs font-semibold text-violet-700 mb-1">💡 Insight chính</div>
                              <p className="text-sm text-violet-900">{textAnalysis[q.id]!.key_insight}</p>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}

                  <div className="mt-3 text-xs text-muted-foreground border-t pt-2">
                    {answered} đã trả lời · {skipped} bỏ qua · {responseCount > 0 ? Math.round((answered / responseCount) * 100) : 0}% hoàn thành
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </>
      )}
    </PageContainer>
  );
}

type QStat = {
  id: string; content: string; type: string; opts: string[];
  counts: Record<string, number>;
  answers: { question_id: string; value: unknown }[];
};

function QuestionResults({ q, totalRespondents }: { q: QStat; totalRespondents: number }) {
  if (["single", "multiple", "yes_no", "dropdown", "vote"].includes(q.type)) {
    const choices = q.type === "yes_no" ? ["yes", "no"] : q.opts;
    const labels: Record<string, string> = q.type === "yes_no" ? { yes: "Có", no: "Không" } : {};
    const total = q.answers.length || 1;
    return (
      <div className="space-y-2">
        {choices.map((opt) => {
          const c = q.counts[opt] ?? 0;
          const pct = Math.round((c / total) * 100);
          return (
            <div key={opt}>
              <div className="flex justify-between text-sm mb-1">
                <span>{labels[opt] ?? opt}</span>
                <span className="text-muted-foreground">{c} ({pct}%)</span>
              </div>
              <Progress value={pct} />
            </div>
          );
        })}
      </div>
    );
  }

  if (q.type === "rating") {
    const nums = q.answers.map((a) => Number(a.value)).filter((n) => !isNaN(n));
    const avg = nums.length ? (nums.reduce((s, n) => s + n, 0) / nums.length).toFixed(2) : "0";
    return (
      <div className="space-y-2">
        <div className="flex gap-4 text-sm">
          <span>Trung bình: <strong>{avg}</strong></span>
          <span>Min: {nums.length ? Math.min(...nums) : 0}</span>
          <span>Max: {nums.length ? Math.max(...nums) : 0}</span>
        </div>
        <div className="text-2xl">{"★".repeat(Math.round(Number(avg)))}{"☆".repeat(5 - Math.round(Number(avg)))}</div>
      </div>
    );
  }

  if (q.type === "essay") {
    return (
      <ul className="space-y-2 max-h-60 overflow-auto">
        {q.answers.length === 0 && <li className="text-sm text-muted-foreground">Chưa có câu trả lời</li>}
        {q.answers.map((a, i) => (
          <li key={i} className="text-sm border-l-2 border-muted pl-3 py-1">{String(a.value ?? "")}</li>
        ))}
      </ul>
    );
  }

  if (q.type === "sorting") {
    return <div className="text-sm text-muted-foreground">Tổng {q.answers.length} câu trả lời (thứ hạng trung bình).</div>;
  }

  return <div className="text-sm text-muted-foreground">Loại câu hỏi chưa hỗ trợ hiển thị.</div>;
}
