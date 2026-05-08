import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { AiSpinner } from "@/components/ai/AiSpinner";
import { supabase } from "@/integrations/supabase/client";

type TextAnalysis = {
  sentiment: string;
  sentiment_summary: string;
  themes: { label: string; count: number; sample: string }[];
  key_insight: string;
  total_analyzed: number;
};

export const Route = createFileRoute("/_app/admin/surveys-results/$id")({
  head: () => ({ meta: [{ title: "Chi tiết kết quả khảo sát — OnAir TMS" }] }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const [textAnalysis, setTextAnalysis] = useState<Record<string, TextAnalysis | null>>({});
  const [analyzing, setAnalyzing] = useState<Record<string, boolean>>({});

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

  const { data, isLoading } = useQuery({
    queryKey: ["survey-detail-results", id],
    queryFn: async () => {
      const [survey, questions, responses, answers] = await Promise.all([
        supabase.from("surveys").select("*").eq("id", id).single(),
        supabase.from("survey_questions").select("*").eq("survey_id", id).order("order_index"),
        supabase.from("survey_responses").select("id").eq("survey_id", id),
        supabase.from("survey_answers").select("question_id,value").in(
          "question_id",
          (await supabase.from("survey_questions").select("id").eq("survey_id", id)).data?.map((q: any) => q.id) ?? ["00000000-0000-0000-0000-000000000000"]
        ),
      ]);
      return {
        survey: survey.data,
        questions: questions.data ?? [],
        responses: responses.data ?? [],
        answers: answers.data ?? [],
      };
    },
  });

  if (isLoading) return <PageContainer title="Đang tải..." breadcrumbs={[]}><Skeleton className="h-32" /></PageContainer>;
  if (!data?.survey) return <PageContainer title="Không tìm thấy" breadcrumbs={[]}><p>Khảo sát không tồn tại.</p></PageContainer>;

  const totalRespondents = data.responses.length;

  return (
    <PageContainer
      title={data.survey.title}
      breadcrumbs={[{ title: "Khảo sát", path: "/admin/surveys-results" }, { title: data.survey.title }]}
    >
      <div className="grid gap-3 md:grid-cols-3">
        <Card><CardContent className="p-4"><div className="text-xs text-slate-500">Tổng người tham gia</div><div className="text-2xl font-bold">{totalRespondents}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-slate-500">Tổng câu hỏi</div><div className="text-2xl font-bold">{data.questions.length}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-slate-500">Trạng thái</div><div className="text-sm font-medium mt-2"><Badge>{data.survey.status}</Badge></div></CardContent></Card>
      </div>

      {data.questions.length === 0 ? (
        <Card><CardContent className="p-6 text-center text-slate-500">Chưa có câu hỏi nào.</CardContent></Card>
      ) : data.questions.map((q: any, idx: number) => {
        const ans = data.answers.filter((a: any) => a.question_id === q.id);
        const answered = ans.length;
        const skipped = totalRespondents - answered;
        return (
          <Card key={q.id}>
            <CardHeader><CardTitle className="flex items-start gap-2 text-base">
              <span className="text-slate-400">{idx + 1}.</span>
              <span className="flex-1">{q.content}</span>
              <Badge variant="outline" className="text-xs">{q.type}</Badge>
            </CardTitle></CardHeader>
            <CardContent>
              <QuestionResults question={q} answers={ans} totalRespondents={totalRespondents} />
              {q.type === "essay" && ans.length > 0 && (
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
                          <span className="font-semibold text-sm text-violet-900">Phân tích AI — {textAnalysis[q.id]!.total_analyzed} câu trả lời</span>
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
              <div className="mt-3 text-xs text-slate-500 border-t pt-2">
                {answered} đã trả lời · {skipped} bỏ qua · {totalRespondents > 0 ? Math.round((answered / totalRespondents) * 100) : 0}% hoàn thành
              </div>
            </CardContent>
          </Card>
        );
      })}
    </PageContainer>
  );
}

function QuestionResults({ question, answers }: { question: any; answers: any[]; totalRespondents: number }) {
  const opts: string[] = Array.isArray(question.options) ? question.options : [];
  const correct = question.correct_answer;

  if (["single", "multiple", "yes_no", "dropdown", "vote"].includes(question.type)) {
    const choices = question.type === "yes_no" ? ["Yes", "No"] : opts;
    const counts: Record<string, number> = {};
    answers.forEach((a) => {
      const v = a.value;
      if (Array.isArray(v)) v.forEach((x) => { counts[x] = (counts[x] ?? 0) + 1; });
      else if (v != null) counts[String(v)] = (counts[String(v)] ?? 0) + 1;
    });
    const total = answers.length || 1;
    return (
      <div className="space-y-2">
        {choices.map((opt) => {
          const c = counts[opt] ?? 0;
          const pct = Math.round((c / total) * 100);
          const isCorrect = correct && (Array.isArray(correct) ? correct.includes(opt) : correct === opt);
          return (
            <div key={opt} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className={isCorrect ? "text-emerald-700 font-medium" : ""}>{opt} {isCorrect && "✓"}</span>
                <span className="text-slate-500">{c} ({pct}%)</span>
              </div>
              <Progress value={pct} className={isCorrect ? "[&>div]:bg-emerald-500" : ""} />
            </div>
          );
        })}
      </div>
    );
  }

  if (question.type === "rating") {
    const nums = answers.map((a) => Number(a.value)).filter((n) => !isNaN(n));
    const avg = nums.length ? (nums.reduce((s, n) => s + n, 0) / nums.length).toFixed(2) : "0";
    const min = nums.length ? Math.min(...nums) : 0;
    const max = nums.length ? Math.max(...nums) : 0;
    return (
      <div className="space-y-2">
        <div className="flex gap-4 text-sm"><span>Trung bình: <strong>{avg}</strong></span><span>Min: {min}</span><span>Max: {max}</span></div>
        <div className="text-2xl">{"★".repeat(Math.round(Number(avg)))}{"☆".repeat(5 - Math.round(Number(avg)))}</div>
      </div>
    );
  }

  if (question.type === "essay") {
    return (
      <ul className="space-y-2 max-h-60 overflow-auto">
        {answers.length === 0 && <li className="text-sm text-slate-500">Chưa có câu trả lời</li>}
        {answers.map((a, i) => (
          <li key={i} className="text-sm border-l-2 border-slate-200 pl-3 py-1">{String(a.value ?? "")}</li>
        ))}
      </ul>
    );
  }

  if (question.type === "sorting") {
    return <div className="text-sm text-slate-500">Tổng {answers.length} câu trả lời. (Hiển thị thứ hạng trung bình)</div>;
  }

  return <div className="text-sm text-slate-400">Loại câu hỏi chưa hỗ trợ hiển thị.</div>;
}
