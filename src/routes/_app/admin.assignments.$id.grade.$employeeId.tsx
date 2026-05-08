import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, CheckCircle2, Loader2 } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AiSpinner } from "@/components/ai/AiSpinner";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/admin/assignments/$id/grade/$employeeId")({
  head: () => ({ meta: [{ title: "Chấm bài — OnAir TMS" }] }),
  component: GradePage,
});

type EssayItem = {
  questionId: string;
  question: string;
  answer: string;
  points: number;
};

function useGradeData(assignmentId: string, employeeId: string) {
  return useQuery({
    queryKey: ["grade-data", assignmentId, employeeId],
    queryFn: async () => {
      const [assignmentRes, empRes] = await Promise.all([
        supabase.from("assignments").select("id, title, code, pass_score, total_points, org_id").eq("id", assignmentId).single(),
        supabase.from("employees").select("id, name, employee_code, department, user_id").eq("id", employeeId).single(),
      ]);

      const assignment = assignmentRes.data;
      const emp = empRes.data;
      if (!assignment || !emp) return null;

      // Load essay questions for this assignment
      const { data: examQs } = await supabase
        .from("exam_questions")
        .select("question_id, points, sort_order")
        .eq("assignment_id", assignmentId)
        .order("sort_order");

      const questionIds = (examQs ?? []).map((q) => q.question_id);
      let essayItems: EssayItem[] = [];

      if (questionIds.length > 0) {
        const { data: questions } = await supabase
          .from("question_bank")
          .select("id, question, type, points")
          .in("id", questionIds)
          .eq("type", "essay");

        // Load exam attempt for this user+assignment to get answers
        let attemptAnswers: Record<string, string> = {};
        if (emp.user_id && questions && questions.length > 0) {
          const { data: examAssign } = await supabase
            .from("exam_assignments")
            .select("id")
            .eq("exam_id", assignmentId)
            .limit(1)
            .maybeSingle();

          if (examAssign) {
            const { data: attempt } = await supabase
              .from("exam_attempts")
              .select("answers")
              .eq("exam_assignment_id", examAssign.id)
              .eq("user_id", emp.user_id)
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle();

            if (attempt?.answers && typeof attempt.answers === "object") {
              attemptAnswers = attempt.answers as Record<string, string>;
            }
          }
        }

        essayItems = (questions ?? []).map((q) => ({
          questionId: q.id,
          question: q.question,
          answer: attemptAnswers[q.id] ?? "",
          points: examQs?.find((eq) => eq.question_id === q.id)?.points ?? q.points ?? 10,
        }));
      }

      // Load existing submission if any
      const { data: submission } = await supabase
        .from("assignment_submissions")
        .select("id, score, status")
        .eq("assignment_id", assignmentId)
        .eq("user_id", emp.user_id ?? "")
        .maybeSingle();

      return { assignment, emp, essayItems, submission };
    },
  });
}

function GradePage() {
  const { id, employeeId } = Route.useParams();
  const { data, isLoading, error } = useGradeData(id, employeeId);

  const [scores, setScores] = useState<Record<string, number>>({});
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});
  const [aiResults, setAiResults] = useState<Record<string, { score: number; feedback: string }>>({});
  const [loadingAi, setLoadingAi] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  async function suggestGrade(item: EssayItem) {
    if (!item.answer.trim()) { toast.error("Học viên chưa có bài làm để chấm."); return; }
    setLoadingAi((prev) => ({ ...prev, [item.questionId]: true }));
    setAiResults((prev) => ({ ...prev, [item.questionId]: undefined as any }));
    try {
      const { data: res, error: fnErr } = await supabase.functions.invoke("ai-essay-grade", {
        body: { question: item.question, answer: item.answer },
      });
      if (fnErr) throw fnErr;
      const result = res as { score: number; feedback: string };
      // Normalize score to item's max points scale
      const scaledScore = Math.round((result.score / 10) * item.points * 2) / 2;
      setAiResults((prev) => ({ ...prev, [item.questionId]: { score: scaledScore, feedback: result.feedback } }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Có lỗi khi gọi AI, thử lại nhé.");
    } finally {
      setLoadingAi((prev) => ({ ...prev, [item.questionId]: false }));
    }
  }

  function acceptAi(qid: string) {
    const r = aiResults[qid];
    if (!r) return;
    setScores((prev) => ({ ...prev, [qid]: r.score }));
    setFeedbacks((prev) => ({ ...prev, [qid]: r.feedback }));
    toast.success("Đã áp dụng gợi ý của AI.");
  }

  async function saveGrade() {
    if (!data) return;
    const { emp, assignment, essayItems, submission } = data;
    if (!emp.user_id) { toast.error("Học viên chưa có tài khoản."); return; }

    setSaving(true);
    try {
      const totalScore = essayItems.reduce((sum, item) => sum + (scores[item.questionId] ?? 0), 0);
      const maxScore = essayItems.reduce((sum, item) => sum + item.points, 0) || assignment.total_points || 10;
      const normalizedScore = maxScore > 0 ? Math.round((totalScore / maxScore) * 10 * 10) / 10 : 0;
      const passed = normalizedScore >= (assignment.pass_score ?? 5);

      if (submission?.id) {
        await supabase.from("assignment_submissions").update({
          score: normalizedScore,
          status: passed ? "passed" : "failed",
        }).eq("id", submission.id);
      } else {
        await supabase.from("assignment_submissions").insert({
          assignment_id: id,
          assignment_title: assignment.title ?? "",
          org_id: assignment.org_id,
          user_id: emp.user_id,
          score: normalizedScore,
          status: passed ? "passed" : "failed",
          submitted_at: new Date().toISOString(),
        });
      }
      toast.success(`Đã lưu kết quả — ${normalizedScore}/10 (${passed ? "Đạt" : "Không đạt"})`);
    } catch (e) {
      toast.error("Lưu thất bại, thử lại nhé.");
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) {
    return (
      <PageContainer title="Chấm bài" breadcrumbs={[{ title: "Bài kiểm tra", path: "/admin/assignments" }, { title: "..." }]}>
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      </PageContainer>
    );
  }

  if (error || !data) {
    return (
      <PageContainer title="Không tìm thấy" breadcrumbs={[{ title: "Bài kiểm tra", path: "/admin/assignments" }]}>
        <p className="text-muted-foreground">Không tìm thấy dữ liệu chấm bài.</p>
      </PageContainer>
    );
  }

  const { assignment, emp, essayItems } = data;
  const totalScore = essayItems.reduce((sum, item) => sum + (scores[item.questionId] ?? 0), 0);
  const maxScore = essayItems.reduce((sum, item) => sum + item.points, 0);

  return (
    <PageContainer
      title="Chấm bài kiểm tra"
      breadcrumbs={[
        { title: "Bài kiểm tra", path: "/admin/assignments" },
        { title: assignment.title, path: `/admin/assignments/${id}` },
        { title: emp.name },
      ]}
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div className="space-y-4">
          {/* Student info */}
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex-1">
                <div className="font-semibold">{emp.name}</div>
                <div className="text-sm text-muted-foreground">{emp.employee_code} · {emp.department}</div>
              </div>
              <Badge variant="outline">{assignment.code}</Badge>
            </CardContent>
          </Card>

          {essayItems.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground text-sm">
                Bài kiểm tra này không có câu hỏi tự luận, hoặc học viên chưa nộp bài.
              </CardContent>
            </Card>
          ) : (
            essayItems.map((item, idx) => (
              <Card key={item.questionId}>
                <CardHeader>
                  <CardTitle className="text-base">Câu {idx + 1} ({item.points} điểm)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm font-medium mb-1">Câu hỏi:</div>
                    <p className="text-sm text-muted-foreground">{item.question}</p>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-1">Bài làm:</div>
                    <p className="rounded-md border bg-muted/30 p-3 text-sm whitespace-pre-line min-h-[80px]">
                      {item.answer || <span className="italic text-muted-foreground">Học viên chưa trả lời câu này</span>}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <span className="text-xs text-muted-foreground">Trainer có thể nhờ AI gợi ý điểm rồi tùy chỉnh.</span>
                    <Button
                      size="sm"
                      onClick={() => suggestGrade(item)}
                      disabled={loadingAi[item.questionId] || !item.answer}
                      className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-95 text-white"
                    >
                      <Sparkles className="h-4 w-4 mr-1.5" />
                      {loadingAi[item.questionId] ? "Đang chấm..." : "AI gợi ý điểm"}
                    </Button>
                  </div>

                  {(loadingAi[item.questionId] || aiResults[item.questionId]) && (
                    <Card className="border-violet-200 bg-gradient-to-br from-violet-50 to-fuchsia-50">
                      <CardContent className="p-4">
                        {loadingAi[item.questionId] && <AiSpinner label="Đang phân tích bài làm..." />}
                        {aiResults[item.questionId] && !loadingAi[item.questionId] && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Sparkles className="h-4 w-4 text-violet-600" />
                              <span className="font-semibold text-sm text-violet-900">Gợi ý của AI</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-muted-foreground">Điểm gợi ý: </span>
                              <span className="text-2xl font-bold text-violet-700">{aiResults[item.questionId].score}</span>
                              <span className="text-muted-foreground"> / {item.points}</span>
                            </div>
                            <p className="text-sm leading-relaxed">{aiResults[item.questionId].feedback}</p>
                            <Button size="sm" onClick={() => acceptAi(item.questionId)} variant="outline" className="border-violet-300">
                              <CheckCircle2 className="h-4 w-4 mr-1.5" /> Áp dụng gợi ý
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  <div className="grid grid-cols-[140px_1fr] items-center gap-3">
                    <Label>Điểm (/{item.points})</Label>
                    <Input
                      type="number" min={0} max={item.points} step={0.5}
                      value={scores[item.questionId] ?? 0}
                      onChange={(e) => setScores((prev) => ({ ...prev, [item.questionId]: Number(e.target.value) }))}
                      className="w-28"
                    />
                  </div>
                  <div className="grid grid-cols-[140px_1fr] items-start gap-3">
                    <Label className="pt-2">Nhận xét</Label>
                    <Textarea
                      rows={3}
                      placeholder="Nhập nhận xét..."
                      value={feedbacks[item.questionId] ?? ""}
                      onChange={(e) => setFeedbacks((prev) => ({ ...prev, [item.questionId]: e.target.value }))}
                    />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="space-y-3">
          <Card>
            <CardContent className="space-y-4 p-5">
              <div>
                <div className="text-sm text-muted-foreground">Tổng điểm</div>
                <div className="text-3xl font-bold mt-1">
                  {totalScore} / {maxScore || assignment.total_points || "—"}
                </div>
                {maxScore > 0 && (
                  <div className="text-sm text-muted-foreground mt-1">
                    = {Math.round((totalScore / maxScore) * 10 * 10) / 10} / 10
                    {" · "}
                    <span className={(totalScore / maxScore) * 10 >= (assignment.pass_score ?? 5) ? "text-emerald-600 font-medium" : "text-destructive font-medium"}>
                      {(totalScore / maxScore) * 10 >= (assignment.pass_score ?? 5) ? "Đạt" : "Không đạt"}
                    </span>
                  </div>
                )}
              </div>
              <Button className="w-full" onClick={saveGrade} disabled={saving || essayItems.length === 0}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Lưu kết quả chấm
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to="/admin/assignments/$id/students" params={{ id }}>Quay lại danh sách</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-xs text-muted-foreground space-y-1">
              <div>Điểm đạt yêu cầu: <span className="font-medium text-foreground">{assignment.pass_score ?? "—"}/10</span></div>
              <div>Tổng điểm tối đa: <span className="font-medium text-foreground">{assignment.total_points ?? "—"}</span></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
