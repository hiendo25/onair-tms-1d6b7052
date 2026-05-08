import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Plus, Trash2, Search, Upload } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  useAssignments, useAssignmentMutations, useQuestions, useExamQuestions, useExamQuestionMutations,
  type DBAssignment,
} from "@/lib/data-hooks";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/admin/assignments/$id/editor")({
  head: () => ({ meta: [{ title: "Tạo/Sửa bài kiểm tra — OnAir TMS" }] }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const isNew = id === "new";
  const nav = useNavigate();
  const { data: rows = [] } = useAssignments();
  const { data: bank = [] } = useQuestions();
  const { data: links = [] } = useExamQuestions();
  const am = useAssignmentMutations();
  const lm = useExamQuestionMutations();
  const existing = useMemo(() => rows.find(r => r.id === id), [rows, id]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeLimit, setTimeLimit] = useState<number | "">(45);
  const [noTimeLimit, setNoTimeLimit] = useState(false);
  const [passScore, setPassScore] = useState<number | "">(80);
  const [shuffleQ, setShuffleQ] = useState(true);
  const [shuffleA, setShuffleA] = useState(false);
  const [hideAnswers, setHideAnswers] = useState(false);
  const [picked, setPicked] = useState<{ question_id: string; points: number; sort_order: number }[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (existing) {
      setTitle(existing.title); setDescription(existing.description);
      setTimeLimit(existing.time_limit_minutes ?? "");
      setNoTimeLimit(existing.time_limit_minutes == null);
      setPassScore(existing.pass_score);
      setShuffleQ(existing.shuffle_questions); setShuffleA(existing.shuffle_answers);
      setHideAnswers(!existing.show_results);
    }
  }, [existing]);

  useEffect(() => {
    if (!isNew && existing) {
      const mine = links.filter(l => l.assignment_id === existing.id).sort((a, b) => a.sort_order - b.sort_order);
      setPicked(mine.map(l => ({ question_id: l.question_id, points: l.points, sort_order: l.sort_order })));
    }
  }, [links, existing, isNew]);

  const totalPoints = picked.reduce((s, p) => s + (p.points || 0), 0);
  const overLimit = totalPoints > 100;

  async function save() {
    if (!title.trim()) return toast.error("Tên bài kiểm tra là bắt buộc");
    if (!description.trim()) return toast.error("Mô tả là bắt buộc");
    if (overLimit) return toast.error("Tổng điểm vượt quá 100");
    const payload: Partial<DBAssignment> = {
      title: title.trim(),
      code: existing?.code || `EX-${Date.now().toString().slice(-6)}`,
      description, type: "quiz",
      time_limit_minutes: noTimeLimit || timeLimit === "" ? null : Number(timeLimit),
      max_attempts: existing?.max_attempts ?? 1,
      pass_score: passScore === "" ? 0 : Number(passScore),
      shuffle_questions: shuffleQ, shuffle_answers: shuffleA,
      show_results: !hideAnswers, status: existing?.status || "draft",
      total_questions: picked.length, total_points: totalPoints,
    };
    let targetId = existing?.id;
    if (isNew) {
      await am.create.mutateAsync(payload);
      toast.success("Đã tạo. Mở lại để chọn câu hỏi.");
      nav({ to: "/admin/assignments" });
      return;
    }
    await am.update.mutateAsync({ id: existing!.id, ...payload });
    if (targetId) {
      const old = links.filter(l => l.assignment_id === targetId);
      for (const o of old) await lm.remove.mutateAsync(o.id);
      for (const p of picked) {
        await lm.create.mutateAsync({ assignment_id: targetId, question_id: p.question_id, points: p.points, sort_order: p.sort_order });
      }
    }
    toast.success("Đã lưu");
    nav({ to: "/admin/assignments" });
  }

  return (
    <PageContainer
      title={isNew ? "Tạo bài kiểm tra" : `Sửa: ${existing?.title ?? ""}`}
      breadcrumbs={[{ title: "Bài kiểm tra", path: "/admin/assignments" }, { title: isNew ? "Tạo bài kiểm tra" : "Sửa bài kiểm tra" }]}
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        {/* MAIN */}
        <Card className="space-y-5 p-6">
          <div>
            <Label>Tên bài kiểm tra <span className="text-destructive">*</span></Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} maxLength={100} placeholder="Nhập tên bài kiểm tra" />
            <div className="mt-1 text-xs text-muted-foreground">Tối đa 100 ký tự</div>
          </div>
          <div>
            <Label>Mô tả <span className="text-destructive">*</span></Label>
            <Textarea rows={5} value={description} onChange={e => setDescription(e.target.value)} maxLength={500} placeholder="Nhập mô tả bài kiểm tra" />
            <div className="mt-1 text-xs text-muted-foreground">Tối đa 500 ký tự</div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label>Chọn câu hỏi <span className="text-destructive">*</span></Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled><Upload className="h-4 w-4" /> Import câu hỏi</Button>
                <Button size="sm" onClick={() => setPickerOpen(true)} disabled={isNew}>Chọn câu hỏi ({picked.length})</Button>
              </div>
            </div>
            {isNew && <div className="rounded border border-dashed p-3 text-sm text-muted-foreground">Lưu thông tin trước, sau đó mở lại để chọn câu hỏi.</div>}
            {overLimit && <div className="rounded border border-destructive/40 bg-destructive/10 p-2 text-sm text-destructive">Tổng điểm vượt 100. Hãy điều chỉnh.</div>}
            <div className="mt-2 space-y-2">
              {picked.map((p, idx) => {
                const q = bank.find(b => b.id === p.question_id);
                return (
                  <div key={p.question_id} className="flex items-center gap-2 rounded border p-2">
                    <span className="w-6 text-xs text-muted-foreground">#{idx + 1}</span>
                    <div className="flex-1 truncate text-sm">{q?.title || q?.question || "(Đã xoá)"}</div>
                    <Input type="number" className="w-20" min={1} max={100} value={p.points}
                      onChange={e => setPicked(prev => prev.map((x, i) => i === idx ? { ...x, points: Number(e.target.value) || 0 } : x))} />
                    <Button size="icon" variant="ghost" onClick={() => setPicked(prev => prev.filter((_, i) => i !== idx).map((x, i) => ({ ...x, sort_order: i })))}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Thời gian làm bài (phút) <span className="text-destructive">*</span></Label>
              <Input type="number" min={1} placeholder="45" disabled={noTimeLimit}
                value={timeLimit} onChange={e => setTimeLimit(e.target.value === "" ? "" : Number(e.target.value))} />
            </div>
            <div>
              <Label>Điểm đạt tối thiểu <span className="text-destructive">*</span></Label>
              <Input type="number" min={0} max={100} placeholder="80"
                value={passScore} onChange={e => setPassScore(e.target.value === "" ? "" : Number(e.target.value))} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={noTimeLimit} onCheckedChange={(v) => setNoTimeLimit(!!v)} />
            <span>Không giới hạn thời gian</span>
          </label>
        </Card>

        {/* SIDE */}
        <div className="space-y-4">
          <Card className="space-y-3 p-5">
            <div className="font-semibold">Cấu hình</div>
            <label className="flex items-center gap-2 text-sm"><Checkbox checked={shuffleQ} onCheckedChange={(v) => setShuffleQ(!!v)} /> <span>Xáo trộn câu hỏi</span></label>
            <label className="flex items-center gap-2 text-sm"><Checkbox checked={shuffleA} onCheckedChange={(v) => setShuffleA(!!v)} /> <span>Xáo trộn đáp án</span></label>
            <label className="flex items-center gap-2 text-sm"><Checkbox checked={hideAnswers} onCheckedChange={(v) => setHideAnswers(!!v)} /> <span>Ẩn đáp án đúng khi xem kết quả</span></label>
          </Card>
          <Card className="space-y-2 p-5">
            <div className="font-semibold">Thông tin tóm tắt</div>
            <SumRow label="Số câu hỏi" value={String(picked.length)} />
            <SumRow label="Tổng điểm" value={String(totalPoints)} danger={overLimit} />
            <SumRow label="Thời gian (phút)" value={noTimeLimit ? "Không giới hạn" : (timeLimit === "" ? "--" : String(timeLimit))} />
            <SumRow label="Điểm đạt tối thiểu" value={passScore === "" ? "--" : String(passScore)} />
          </Card>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Button variant="outline" asChild><Link to="/admin/assignments"><ArrowLeft className="h-4 w-4" /> Huỷ</Link></Button>
        <Button onClick={save} disabled={overLimit}>Xác nhận</Button>
      </div>

      <QuestionPicker open={pickerOpen} onOpenChange={setPickerOpen}
        bank={bank.filter(b => b.status !== "inactive")}
        excludeIds={new Set(picked.map(p => p.question_id))}
        onPick={(ids) => {
          setPicked(prev => {
            const start = prev.length;
            const additions = ids.map((qid, i) => {
              const q = bank.find(b => b.id === qid);
              return { question_id: qid, points: q?.points ?? 1, sort_order: start + i };
            });
            return [...prev, ...additions];
          });
        }} />
    </PageContainer>
  );
}

function SumRow({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-medium ${danger ? "text-destructive" : ""}`}>{value}</span>
    </div>
  );
}

function QuestionPicker({ open, onOpenChange, bank, excludeIds, onPick }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  bank: { id: string; title: string; question: string; type: string; difficulty: string; points: number }[];
  excludeIds: Set<string>;
  onPick: (ids: string[]) => void;
}) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<Set<string>>(new Set());
  useEffect(() => { if (!open) { setSel(new Set()); setQ(""); } }, [open]);
  const list = bank.filter(b => !excludeIds.has(b.id) && (!q || (b.title || b.question).toLowerCase().includes(q.toLowerCase())));
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Chọn câu hỏi từ ngân hàng</DialogTitle></DialogHeader>
        <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Tìm câu hỏi..." value={q} onChange={e => setQ(e.target.value)} /></div>
        <div className="max-h-[400px] space-y-1 overflow-y-auto">
          {list.length === 0 && <div className="p-6 text-center text-sm text-muted-foreground">Không có câu hỏi khả dụng</div>}
          {list.map(b => (
            <label key={b.id} className="flex items-center gap-2 rounded border p-2 hover:bg-muted/40">
              <Checkbox checked={sel.has(b.id)} onCheckedChange={(v) => {
                setSel(prev => { const s = new Set(prev); v ? s.add(b.id) : s.delete(b.id); return s; });
              }} />
              <div className="flex-1 truncate text-sm">{b.title || b.question}</div>
              <Badge variant="outline">{b.type}</Badge>
              <Badge variant="secondary">{b.points}đ</Badge>
            </label>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Huỷ</Button>
          <Button disabled={sel.size === 0} onClick={() => { onPick(Array.from(sel)); onOpenChange(false); }}>Thêm {sel.size} câu</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

void Plus;
