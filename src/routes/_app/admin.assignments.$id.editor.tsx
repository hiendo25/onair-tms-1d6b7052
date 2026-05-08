import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Plus, Trash2, Search } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useAssignments, useAssignmentMutations, useQuestions, useExamQuestions, useExamQuestionMutations,
  type DBAssignment,
} from "@/lib/data-hooks";
import { ASSIGNMENT_STATUS } from "@/lib/admin-options";
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
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [timeLimit, setTimeLimit] = useState<number | "">(30);
  const [maxAttempts, setMaxAttempts] = useState<number | "">(1);
  const [passScore, setPassScore] = useState(70);
  const [shuffleQ, setShuffleQ] = useState(false);
  const [shuffleA, setShuffleA] = useState(false);
  const [showResults, setShowResults] = useState(true);
  const [status, setStatus] = useState("draft");
  const [picked, setPicked] = useState<{ question_id: string; points: number; sort_order: number }[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (existing) {
      setTitle(existing.title); setCode(existing.code); setDescription(existing.description);
      setTimeLimit(existing.time_limit_minutes ?? "");
      setMaxAttempts(existing.max_attempts ?? "");
      setPassScore(existing.pass_score);
      setShuffleQ(existing.shuffle_questions); setShuffleA(existing.shuffle_answers);
      setShowResults(existing.show_results); setStatus(existing.status);
    }
  }, [existing]);

  useEffect(() => {
    if (!isNew && existing) {
      const mine = links.filter(l => l.assignment_id === existing.id)
        .sort((a, b) => a.sort_order - b.sort_order);
      setPicked(mine.map(l => ({ question_id: l.question_id, points: l.points, sort_order: l.sort_order })));
    }
  }, [links, existing, isNew]);

  const totalPoints = picked.reduce((s, p) => s + (p.points || 0), 0);
  const overLimit = totalPoints > 100;

  async function save() {
    if (!title.trim()) return toast.error("Tên bài là bắt buộc");
    if (!code.trim()) return toast.error("Mã bài là bắt buộc");
    if (overLimit) return toast.error("Tổng điểm vượt quá 100");
    const payload: Partial<DBAssignment> = {
      title: title.trim(), code: code.trim(), description, type: "quiz",
      time_limit_minutes: timeLimit === "" ? null : Number(timeLimit),
      max_attempts: maxAttempts === "" ? null : Number(maxAttempts),
      pass_score: passScore, shuffle_questions: shuffleQ, shuffle_answers: shuffleA,
      show_results: showResults, status, total_questions: picked.length,
      total_points: totalPoints,
    };
    let targetId = existing?.id;
    if (isNew) {
      await am.create.mutateAsync(payload);
      // need fresh id; refetched rows aren't directly returned. Skip linking here; user can re-edit to add questions.
      toast.success("Đã tạo. Mở lại bản ghi để thêm câu hỏi.");
      nav({ to: "/admin/assignments" });
      return;
    } else {
      await am.update.mutateAsync({ id: existing!.id, ...payload });
    }
    if (targetId) {
      // Replace links: delete old then insert new
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
      breadcrumbs={[{ title: "Bài kiểm tra" }, { title: "Ngân hàng bài KT", path: "/admin/assignments" }, { title: isNew ? "Tạo" : "Sửa" }]}
      actions={<Button variant="outline" asChild><Link to="/admin/assignments"><ArrowLeft className="h-4 w-4" /> Quay lại</Link></Button>}
    >
      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Thông tin</TabsTrigger>
          <TabsTrigger value="questions">Câu hỏi ({picked.length}) — {totalPoints}/100đ</TabsTrigger>
          <TabsTrigger value="settings">Thiết lập</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card className="space-y-4 p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div><Label>Tên bài kiểm tra *</Label><Input value={title} onChange={e => setTitle(e.target.value)} maxLength={200} /></div>
              <div><Label>Mã bài *</Label><Input value={code} onChange={e => setCode(e.target.value)} maxLength={50} /></div>
            </div>
            <div><Label>Mô tả</Label><Textarea rows={4} value={description} onChange={e => setDescription(e.target.value)} maxLength={1000} /></div>
          </Card>
        </TabsContent>

        <TabsContent value="questions">
          <Card className="space-y-3 p-5">
            <div className="flex items-center justify-between">
              <div className="text-sm">Tổng câu: <strong>{picked.length}</strong> · Tổng điểm: <strong className={overLimit ? "text-destructive" : ""}>{totalPoints}</strong>/100</div>
              <Button size="sm" onClick={() => setPickerOpen(true)} disabled={isNew}><Plus className="h-4 w-4" /> Thêm câu hỏi</Button>
            </div>
            {isNew && <div className="rounded border border-dashed p-3 text-sm text-muted-foreground">Lưu thông tin trước, sau đó mở lại để thêm câu hỏi.</div>}
            {overLimit && <div className="rounded border border-destructive/40 bg-destructive/10 p-2 text-sm text-destructive">Tổng điểm vượt 100. Hãy điều chỉnh.</div>}
            <div className="space-y-2">
              {picked.map((p, idx) => {
                const q = bank.find(b => b.id === p.question_id);
                return (
                  <div key={p.question_id} className="flex items-center gap-2 rounded border p-2">
                    <span className="text-xs text-muted-foreground w-6">#{idx + 1}</span>
                    <div className="flex-1 truncate text-sm">{q?.title || q?.question || "(Câu hỏi đã xoá)"}</div>
                    <Badge variant="outline">{q?.type}</Badge>
                    <Input type="number" className="w-20" min={1} max={100} value={p.points}
                      onChange={e => setPicked(prev => prev.map((x, i) => i === idx ? { ...x, points: Number(e.target.value) || 0 } : x))} />
                    <Button size="icon" variant="ghost" onClick={() => setPicked(prev => prev.filter((_, i) => i !== idx).map((x, i) => ({ ...x, sort_order: i })))}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="grid gap-4 p-5 sm:grid-cols-2">
            <div><Label>Thời gian (phút)</Label><Input type="number" min={1} value={timeLimit} onChange={e => setTimeLimit(e.target.value === "" ? "" : Number(e.target.value))} /></div>
            <div><Label>Số lần làm tối đa</Label><Input type="number" min={1} value={maxAttempts} onChange={e => setMaxAttempts(e.target.value === "" ? "" : Number(e.target.value))} /></div>
            <div><Label>Điểm đạt (%)</Label><Input type="number" min={0} max={100} value={passScore} onChange={e => setPassScore(Number(e.target.value))} /></div>
            <div><Label>Trạng thái</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ASSIGNMENT_STATUS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <label className="flex items-center justify-between rounded border p-2"><span>Trộn câu hỏi</span><Switch checked={shuffleQ} onCheckedChange={setShuffleQ} /></label>
            <label className="flex items-center justify-between rounded border p-2"><span>Trộn đáp án</span><Switch checked={shuffleA} onCheckedChange={setShuffleA} /></label>
            <label className="flex items-center justify-between rounded border p-2 sm:col-span-2"><span>Hiển thị kết quả sau khi nộp</span><Switch checked={showResults} onCheckedChange={setShowResults} /></label>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2">
        <Button variant="outline" asChild><Link to="/admin/assignments">Huỷ</Link></Button>
        <Button onClick={save} disabled={overLimit}>Lưu</Button>
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
