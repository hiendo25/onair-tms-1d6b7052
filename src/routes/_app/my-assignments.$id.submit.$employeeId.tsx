import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Clock, AlertTriangle } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  useExamAssignments, useExamAttempts, useExamAttemptMutations,
} from "@/lib/data-hooks";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/my-assignments/$id/submit/$employeeId")({
  head: () => ({ meta: [{ title: "Làm bài kiểm tra — OnAir TMS" }] }),
  component: Page,
});

type SnapQ = { id: string; title: string; type: string; options: string[]; correct_answers: string[]; points: number; sort_order: number };

function Page() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const uid = user?.id;
  const { data: assigns = [] } = useExamAssignments();
  const { data: attempts = [] } = useExamAttempts();
  const m = useExamAttemptMutations();
  const a = useMemo(() => assigns.find(x => x.id === id), [assigns, id]);

  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [remain, setRemain] = useState<number | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submittedRef = useRef(false);

  const snap = (a?.exam_snapshot ?? {}) as { title?: string; questions?: SnapQ[]; time_limit_minutes?: number | null; max_attempts?: number | null; pass_score?: number; total_points?: number; show_results?: boolean };
  const questions = useMemo(() => (snap.questions ?? []).slice().sort((x, y) => x.sort_order - y.sort_order), [snap.questions]);

  // Init or resume attempt
  useEffect(() => {
    if (!a || !uid) return;
    const mine = attempts.filter(t => t.exam_assignment_id === a.id && t.user_id === uid);
    const inProgress = mine.find(t => t.status === "in_progress");
    if (inProgress) {
      setAttemptId(inProgress.id);
      setAnswers((inProgress.answers || {}) as Record<string, string | string[]>);
      if (snap.time_limit_minutes) {
        const elapsed = Math.floor((Date.now() - new Date(inProgress.started_at).getTime()) / 1000);
        setRemain(Math.max(0, snap.time_limit_minutes * 60 - elapsed));
      }
      return;
    }
    const used = mine.length;
    if (snap.max_attempts && used >= snap.max_attempts) { toast.error("Bạn đã dùng hết số lần làm"); nav({ to: "/my-assignments" }); return; }
    // create new attempt
    (async () => {
      // We need the inserted id; useMutation.mutateAsync returns void in this codebase, so use direct supabase as fallback
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase.from("exam_attempts").insert({
        exam_assignment_id: a.id, user_id: uid, org_id: a.org_id,
        attempt_number: used + 1, status: "in_progress", answers: {},
      }).select("*").single();
      if (error) { toast.error(error.message); return; }
      setAttemptId(data.id);
      if (snap.time_limit_minutes) setRemain(snap.time_limit_minutes * 60);
    })();
  }, [a, uid, attempts.length]);

  // Countdown
  useEffect(() => {
    if (remain == null) return;
    if (remain <= 0) { autoSubmit(); return; }
    const t = setInterval(() => setRemain(r => (r == null ? r : r - 1)), 1000);
    return () => clearInterval(t);
  }, [remain]);

  // Auto-save answers debounced
  useEffect(() => {
    if (!attemptId) return;
    const t = setTimeout(async () => {
      const { supabase } = await import("@/integrations/supabase/client");
      await supabase.from("exam_attempts").update({ answers }).eq("id", attemptId);
    }, 800);
    return () => clearTimeout(t);
  }, [answers, attemptId]);

  function setAns(q: SnapQ, value: string | string[]) {
    setAnswers(prev => ({ ...prev, [q.id]: value }));
  }
  function toggleMulti(q: SnapQ, opt: string) {
    setAnswers(prev => {
      const cur = (prev[q.id] as string[]) || [];
      return { ...prev, [q.id]: cur.includes(opt) ? cur.filter(o => o !== opt) : [...cur, opt] };
    });
  }

  async function doSubmit(auto: boolean) {
    if (submittedRef.current || !attemptId || !a) return;
    submittedRef.current = true;
    setSubmitting(true);
    let earned = 0;
    for (const q of questions) {
      const ans = answers[q.id];
      const correct = q.correct_answers || [];
      let ok = false;
      if (q.type === "multiple") {
        const a1 = (Array.isArray(ans) ? ans : []).map(String).sort();
        const c1 = correct.map(String).sort();
        ok = a1.length === c1.length && a1.every((v, i) => v === c1[i]);
      } else {
        ok = String(ans ?? "") === String(correct[0] ?? "");
      }
      if (ok) earned += q.points || 0;
    }
    const totalPoints = snap.total_points || questions.reduce((s, q) => s + (q.points || 0), 0) || 1;
    const scorePct = Math.round((earned / totalPoints) * 100);
    const passed = scorePct >= (snap.pass_score ?? 0);
    const { supabase } = await import("@/integrations/supabase/client");
    await supabase.from("exam_attempts").update({
      answers, status: "submitted", submitted_at: new Date().toISOString(),
      score: earned, passed,
    }).eq("id", attemptId);
    if (auto) toast.warning("Hết giờ — bài đã được tự động nộp");
    else toast.success(snap.show_results === false ? "Đã nộp bài thành công" : `Điểm: ${earned}/${totalPoints} (${scorePct}%)`);
    if (snap.show_results === false) nav({ to: "/my-assignments" });
    else nav({ to: "/my-assignments/$id/result/$employeeId", params: { id: a.id, employeeId: uid! } });
  }
  function autoSubmit() { doSubmit(true); }

  if (!a) return <PageContainer title="Không tìm thấy bài"><Button asChild variant="outline"><Link to="/my-assignments">Quay lại</Link></Button></PageContainer>;

  const mm = remain == null ? null : String(Math.floor(remain / 60)).padStart(2, "0");
  const ss = remain == null ? null : String(remain % 60).padStart(2, "0");
  const lowTime = remain != null && remain < 60;

  return (
    <PageContainer
      title={snap.title || "Làm bài kiểm tra"}
      breadcrumbs={[{ title: "Bài kiểm tra của tôi", path: "/my-assignments" }, { title: "Làm bài" }]}
      actions={remain != null && (
        <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-mono font-semibold ${lowTime ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
          {lowTime ? <AlertTriangle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
          {mm}:{ss}
        </div>
      )}
    >
      {questions.length === 0 && <Card className="p-8 text-center text-sm text-muted-foreground">Bài kiểm tra chưa có câu hỏi.</Card>}
      <div className="space-y-3">
        {questions.map((q, idx) => (
          <Card key={q.id} className="space-y-3 p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="text-sm"><span className="mr-2 font-semibold text-primary">Câu {idx + 1}.</span>{q.title}</div>
              <span className="text-xs text-muted-foreground">{q.points}đ</span>
            </div>
            {q.type === "multiple" ? (
              <div className="space-y-2">
                {q.options.map((opt, i) => (
                  <label key={i} className="flex items-center gap-2 rounded border p-2 hover:bg-muted/40">
                    <Checkbox checked={((answers[q.id] as string[]) || []).includes(String(i))} onCheckedChange={() => toggleMulti(q, String(i))} />
                    <span className="text-sm">{opt}</span>
                  </label>
                ))}
              </div>
            ) : (
              <RadioGroup value={String(answers[q.id] ?? "")} onValueChange={(v) => setAns(q, v)}>
                {q.options.map((opt, i) => (
                  <Label key={i} className="flex items-center gap-2 rounded border p-2 hover:bg-muted/40">
                    <RadioGroupItem value={String(i)} />
                    <span className="text-sm">{opt}</span>
                  </Label>
                ))}
              </RadioGroup>
            )}
          </Card>
        ))}
      </div>
      <div className="sticky bottom-4 mt-4 flex justify-end gap-2 rounded-xl border bg-background/95 p-3 backdrop-blur">
        <Button variant="outline" asChild><Link to="/my-assignments">Tạm thoát</Link></Button>
        <Button onClick={() => doSubmit(false)} disabled={submitting || !attemptId}>{submitting ? "Đang nộp..." : "Nộp bài"}</Button>
      </div>
    </PageContainer>
  );
}
