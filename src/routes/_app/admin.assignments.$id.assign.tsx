import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Search } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  useAssignments, useEmployees, useExamQuestions, useQuestions,
  useExamAssignments, useExamAssignmentMutations,
} from "@/lib/data-hooks";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/admin/assignments/$id/assign")({
  head: () => ({ meta: [{ title: "Gán bài kiểm tra — OnAir TMS" }] }),
  component: AssignPage,
});

function AssignPage() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const { data: rows = [] } = useAssignments();
  const { data: links = [] } = useExamQuestions();
  const { data: bank = [] } = useQuestions();
  const { data: employees = [] } = useEmployees();
  const { data: existingAssigns = [] } = useExamAssignments();
  const m = useExamAssignmentMutations();

  const a = useMemo(() => rows.find(r => r.id === id), [rows, id]);
  const [deadline, setDeadline] = useState("");
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<Set<string>>(new Set());

  useEffect(() => { setSel(new Set()); }, [id]);

  if (!a) return <PageContainer title="Không tìm thấy bài KT"><Button asChild variant="outline"><Link to="/admin/assignments"><ArrowLeft className="h-4 w-4" />Quay lại</Link></Button></PageContainer>;
  const ax = a;

  const filtered = employees.filter(e => !q || e.name.toLowerCase().includes(q.toLowerCase()) || e.email.toLowerCase().includes(q.toLowerCase()));

  async function submit() {
    if (sel.size === 0) return toast.error("Chọn ít nhất 1 học viên");
    const myLinks = links.filter(l => l.assignment_id === ax.id);
    const snapshot = {
      title: ax.title, code: ax.code, description: ax.description,
      time_limit_minutes: ax.time_limit_minutes, max_attempts: ax.max_attempts,
      pass_score: ax.pass_score, total_points: ax.total_points,
      shuffle_questions: ax.shuffle_questions, shuffle_answers: ax.shuffle_answers,
      show_results: ax.show_results,
      questions: myLinks.map(l => {
        const q = bank.find(b => b.id === l.question_id);
        return q ? {
          id: q.id, title: q.title || q.question, type: q.type,
          options: q.options, correct_answers: q.correct_answers,
          points: l.points, sort_order: l.sort_order,
        } : null;
      }).filter(Boolean),
    };
    const ids = Array.from(sel);
    const userIds = employees.filter(e => ids.includes(e.id) && e.user_id).map(e => e.user_id as string);
    await m.create.mutateAsync({
      exam_id: ax.id, exam_snapshot: snapshot as never,
      audience: ids.map(eid => ({ type: "employee", id: eid })) as never,
      student_ids: userIds, deadline: deadline || null, status: "active",
      assigned_by: user?.id ?? null,
    });
    toast.success(`Đã gán cho ${ids.length} học viên`);
    nav({ to: "/admin/assignments/assigned" });
  }

  const myAssigns = existingAssigns.filter(x => x.exam_id === ax.id);

  return (
    <PageContainer
      title={`Gán: ${ax.title}`}
      breadcrumbs={[{ title: "Bài kiểm tra", path: "/admin/assignments" }, { title: ax.title, path: `/admin/assignments/${ax.id}` }, { title: "Gán" }]}
      actions={<Button variant="outline" asChild><Link to="/admin/assignments"><ArrowLeft className="h-4 w-4" /> Quay lại</Link></Button>}
    >
      <Card className="space-y-3 p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div><Label>Hạn nộp</Label><Input type="datetime-local" value={deadline} onChange={e => setDeadline(e.target.value)} /></div>
          <div className="text-sm text-muted-foreground self-end">Đã có <strong>{myAssigns.length}</strong> lần gán trước đó.</div>
        </div>
      </Card>

      <Card className="space-y-3 p-5">
        <div className="flex items-center justify-between">
          <div className="font-semibold text-sm">Chọn học viên ({sel.size}/{employees.length})</div>
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Tìm theo tên, email" value={q} onChange={e => setQ(e.target.value)} />
          </div>
        </div>
        <div className="max-h-[420px] space-y-1 overflow-y-auto">
          {filtered.map(e => (
            <label key={e.id} className="flex items-center gap-2 rounded border p-2 hover:bg-muted/40">
              <Checkbox checked={sel.has(e.id)} onCheckedChange={(v) => {
                setSel(prev => { const s = new Set(prev); v ? s.add(e.id) : s.delete(e.id); return s; });
              }} />
              <div className="flex-1"><div className="text-sm font-medium">{e.name}</div><div className="text-xs text-muted-foreground">{e.email} · {e.department}</div></div>
            </label>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" asChild><Link to="/admin/assignments">Huỷ</Link></Button>
          <Button onClick={submit}>Gán bài kiểm tra</Button>
        </div>
      </Card>
    </PageContainer>
  );
}
