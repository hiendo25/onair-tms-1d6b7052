import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search, Trash2, Sparkles } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { RowActions } from "@/components/admin/RowActions";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { useQuestions, useQuestionMutations, type DBQuestion } from "@/lib/data-hooks";
import { QUESTION_TYPE, DIFFICULTY } from "@/lib/admin-options";
import { AiSpinner } from "@/components/ai/AiSpinner";
import { aiGenerateQuestions, type AiQuestion } from "@/lib/ai-mock";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/admin/assignments/question-bank")({
  head: () => ({ meta: [{ title: "Ngân hàng câu hỏi — OnAir TMS" }] }),
  component: Page,
});

type FormState = {
  question: string;
  type: "single" | "multiple" | "true_false" | "essay";
  category: string;
  difficulty: "easy" | "medium" | "hard";
  points: number;
  options: string[];
  correct_answer: string; // for single/true_false: single value; for multiple: comma-separated indices
  explanation: string;
};

const EMPTY: FormState = {
  question: "",
  type: "single",
  category: "",
  difficulty: "medium",
  points: 1,
  options: ["", "", "", ""],
  correct_answer: "",
  explanation: "",
};

const labelOf = (arr: { value: string; label: string }[], v: string) =>
  arr.find((o) => o.value === v)?.label ?? v;

function difficultyBadge(d: string) {
  const cls =
    d === "easy" ? "bg-emerald-500" : d === "hard" ? "bg-rose-500" : "bg-amber-500";
  return <Badge className={cls}>{labelOf(DIFFICULTY, d)}</Badge>;
}

function Page() {
  const { data: rows = [], isLoading } = useQuestions();
  const m = useQuestionMutations();

  const [q, setQ] = useState("");
  const [fType, setFType] = useState("all");
  const [fCat, setFCat] = useState("all");
  const [fDiff, setFDiff] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<DBQuestion | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [delId, setDelId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // AI generation state
  const [aiOpen, setAiOpen] = useState(false);
  const [aiSource, setAiSource] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResults, setAiResults] = useState<AiQuestion[] | null>(null);
  const [aiSelected, setAiSelected] = useState<Set<number>>(new Set());
  const [aiSaving, setAiSaving] = useState(false);

  async function runAi() {
    if (!aiSource.trim()) {
      toast.error("Vui lòng nhập nội dung tham khảo");
      return;
    }
    setAiLoading(true);
    setAiResults(null);
    try {
      const out = await aiGenerateQuestions(aiSource, 10);
      setAiResults(out);
      setAiSelected(new Set(out.map((_, i) => i)));
    } finally {
      setAiLoading(false);
    }
  }

  async function saveSelected() {
    if (!aiResults) return;
    setAiSaving(true);
    try {
      const picks = aiResults.filter((_, i) => aiSelected.has(i));
      for (const q of picks) {
        await m.create.mutateAsync({
          question: q.question,
          type: "single",
          category: "AI tạo",
          difficulty: "medium",
          points: 1,
          options: q.options,
          correct_answer: String(q.correct_index),
          explanation: q.explanation,
          tags: ["ai-generated"],
        });
      }
      toast.success(`Đã thêm ${picks.length} câu hỏi vào ngân hàng`);
      setAiOpen(false);
      setAiResults(null);
      setAiSource("");
    } catch (e: any) {
      toast.error(e?.message ?? "Có gì đó chưa đúng, thử lại nhé.");
    } finally {
      setAiSaving(false);
    }
  }


  const categories = useMemo(
    () => Array.from(new Set(rows.map((r) => r.category).filter(Boolean))),
    [rows]
  );

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        if (q && !r.question.toLowerCase().includes(q.toLowerCase())) return false;
        if (fType !== "all" && r.type !== fType) return false;
        if (fCat !== "all" && r.category !== fCat) return false;
        if (fDiff !== "all" && r.difficulty !== fDiff) return false;
        return true;
      }),
    [rows, q, fType, fCat, fDiff]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setOpen(true);
  }

  function openEdit(r: DBQuestion) {
    setEditing(r);
    const opts = Array.isArray(r.options) ? (r.options as string[]) : [];
    setForm({
      question: r.question,
      type: (r.type as FormState["type"]) || "single",
      category: r.category || "",
      difficulty: (r.difficulty as FormState["difficulty"]) || "medium",
      points: r.points || 1,
      options: opts.length ? opts : ["", "", "", ""],
      correct_answer: r.correct_answer || "",
      explanation: r.explanation || "",
    });
    setOpen(true);
  }

  async function submit() {
    if (!form.question.trim()) return;
    setSubmitting(true);
    try {
      let payload: Partial<DBQuestion> = {
        question: form.question.trim(),
        type: form.type,
        category: form.category,
        difficulty: form.difficulty,
        points: Number(form.points) || 1,
        explanation: form.explanation,
        correct_answer: form.correct_answer,
        options: [],
        tags: [],
      };
      if (form.type === "single" || form.type === "multiple") {
        payload.options = form.options.filter((o) => o.trim().length > 0);
      } else if (form.type === "true_false") {
        payload.options = ["true", "false"];
      } else {
        payload.options = [];
        payload.correct_answer = form.explanation; // mẫu trả lời
      }
      if (editing) {
        await m.update.mutateAsync({ id: editing.id, ...payload });
      } else {
        await m.create.mutateAsync(payload);
      }
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageContainer
      title="Ngân hàng câu hỏi"
      breadcrumbs={[
        { title: "Đào tạo" },
        { title: "Bài kiểm tra" },
        { title: "Ngân hàng câu hỏi" },
      ]}
      actions={
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setAiOpen(true)}
            className="border-violet-300 text-violet-700 hover:bg-violet-50"
          >
            <Sparkles className="h-4 w-4" />
            Gợi ý câu hỏi từ nội dung này
          </Button>
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Tạo câu hỏi
          </Button>
        </div>
      }
    >
      <Card className="p-4">
        <div className="mb-4 flex flex-wrap gap-2">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Tìm kiếm nội dung câu hỏi..."
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <Select value={fType} onValueChange={(v) => { setFType(v); setPage(1); }}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Loại câu hỏi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại</SelectItem>
              {QUESTION_TYPE.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={fCat} onValueChange={(v) => { setFCat(v); setPage(1); }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Chủ đề" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả chủ đề</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={fDiff} onValueChange={(v) => { setFDiff(v); setPage(1); }}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Độ khó" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả độ khó</SelectItem>
              {DIFFICULTY.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nội dung câu hỏi</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Chủ đề</TableHead>
              <TableHead>Độ khó</TableHead>
              <TableHead>Điểm</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Đang tải...
                </TableCell>
              </TableRow>
            )}
            {!isLoading && paged.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Không có câu hỏi
                </TableCell>
              </TableRow>
            )}
            {paged.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  <span className="line-clamp-2 max-w-md">{r.question}</span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{labelOf(QUESTION_TYPE, r.type)}</Badge>
                </TableCell>
                <TableCell>{r.category || "-"}</TableCell>
                <TableCell>{difficultyBadge(r.difficulty)}</TableCell>
                <TableCell>{r.points}</TableCell>
                <TableCell>
                  <RowActions onEdit={() => openEdit(r)} onDelete={() => setDelId(r.id)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Số hàng mỗi trang</span>
            <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
              <SelectTrigger className="h-8 w-[80px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 50, 100].map((n) => (
                  <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span>{filtered.length} câu hỏi</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              Trước
            </Button>
            <span className="text-sm">Trang {page}/{totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              Sau
            </Button>
          </div>
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Chỉnh sửa câu hỏi" : "Tạo câu hỏi"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label>Loại câu hỏi *</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as FormState["type"], correct_answer: "" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {QUESTION_TYPE.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <Label>Nội dung câu hỏi *</Label>
              <Textarea
                rows={3}
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
                placeholder="Nhập nội dung câu hỏi"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Chủ đề</Label>
                <Input
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="VD: Kiến thức sản phẩm"
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Độ khó *</Label>
                <Select value={form.difficulty} onValueChange={(v) => setForm({ ...form, difficulty: v as FormState["difficulty"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DIFFICULTY.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-1.5 max-w-[160px]">
              <Label>Điểm *</Label>
              <Input
                type="number"
                step="0.1"
                min="0.1"
                value={form.points}
                onChange={(e) => setForm({ ...form, points: Number(e.target.value) })}
              />
            </div>

            {form.type === "single" && (
              <div className="grid gap-2">
                <Label>Đáp án (chọn 1 đáp án đúng)</Label>
                <RadioGroup
                  value={form.correct_answer}
                  onValueChange={(v) => setForm({ ...form, correct_answer: v })}
                >
                  {form.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <RadioGroupItem value={String(i)} id={`opt-${i}`} />
                      <Input
                        value={opt}
                        onChange={(e) => {
                          const next = [...form.options];
                          next[i] = e.target.value;
                          setForm({ ...form, options: next });
                        }}
                        placeholder={`Đáp án ${i + 1}`}
                      />
                      {form.options.length > 2 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const next = form.options.filter((_, idx) => idx !== i);
                            setForm({ ...form, options: next });
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </RadioGroup>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-fit"
                  onClick={() => setForm({ ...form, options: [...form.options, ""] })}
                >
                  <Plus className="h-4 w-4" /> Thêm đáp án
                </Button>
              </div>
            )}

            {form.type === "multiple" && (
              <div className="grid gap-2">
                <Label>Đáp án (chọn nhiều đáp án đúng)</Label>
                {form.options.map((opt, i) => {
                  const selected = (form.correct_answer || "")
                    .split(",")
                    .filter(Boolean);
                  const checked = selected.includes(String(i));
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(v) => {
                          const set = new Set(selected);
                          if (v) set.add(String(i));
                          else set.delete(String(i));
                          setForm({
                            ...form,
                            correct_answer: Array.from(set).sort().join(","),
                          });
                        }}
                      />
                      <Input
                        value={opt}
                        onChange={(e) => {
                          const next = [...form.options];
                          next[i] = e.target.value;
                          setForm({ ...form, options: next });
                        }}
                        placeholder={`Đáp án ${i + 1}`}
                      />
                      {form.options.length > 2 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const next = form.options.filter((_, idx) => idx !== i);
                            setForm({ ...form, options: next });
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-fit"
                  onClick={() => setForm({ ...form, options: [...form.options, ""] })}
                >
                  <Plus className="h-4 w-4" /> Thêm đáp án
                </Button>
              </div>
            )}

            {form.type === "true_false" && (
              <div className="grid gap-2">
                <Label>Đáp án đúng</Label>
                <RadioGroup
                  value={form.correct_answer}
                  onValueChange={(v) => setForm({ ...form, correct_answer: v })}
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="true" id="tf-true" />
                    <Label htmlFor="tf-true">Đúng</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="false" id="tf-false" />
                    <Label htmlFor="tf-false">Sai</Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {form.type === "essay" && (
              <div className="grid gap-1.5">
                <Label>Đáp án mẫu (không bắt buộc)</Label>
                <Textarea
                  rows={3}
                  value={form.correct_answer}
                  onChange={(e) => setForm({ ...form, correct_answer: e.target.value })}
                  placeholder="Đáp án mẫu giúp giảng viên chấm bài"
                />
              </div>
            )}

            <div className="grid gap-1.5">
              <Label>Giải thích</Label>
              <Textarea
                rows={2}
                value={form.explanation}
                onChange={(e) => setForm({ ...form, explanation: e.target.value })}
                placeholder="Hiển thị sau khi học viên trả lời"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Huỷ</Button>
            <Button onClick={submit} disabled={submitting}>
              {editing ? "Lưu thay đổi" : "Tạo câu hỏi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDelete
        open={!!delId}
        onOpenChange={(v) => !v && setDelId(null)}
        onConfirm={async () => {
          if (delId) {
            await m.remove.mutateAsync(delId);
            setDelId(null);
          }
        }}
      />

      {/* AI generation dialog */}
      <Dialog open={aiOpen} onOpenChange={(v) => { setAiOpen(v); if (!v) { setAiResults(null); } }}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-600" />
              Gợi ý câu hỏi từ nội dung này
            </DialogTitle>
            <DialogDescription>
              Dán nội dung tài liệu / SOP. AI sẽ tạo 10 câu trắc nghiệm — bạn chọn câu muốn lưu.
            </DialogDescription>
          </DialogHeader>

          {!aiResults && !aiLoading && (
            <div className="grid gap-3">
              <Label>Nội dung tham khảo</Label>
              <Textarea
                rows={8}
                placeholder="Dán SOP, mô tả khóa học, hoặc nội dung bài học vào đây..."
                value={aiSource}
                onChange={(e) => setAiSource(e.target.value)}
              />
            </div>
          )}

          {aiLoading && <AiSpinner label="Để mình xem qua nhé..." />}

          {aiResults && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  AI đã tạo {aiResults.length} câu — đã chọn {aiSelected.size}
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setAiSelected(new Set(aiResults.map((_, i) => i)))}>Chọn tất cả</Button>
                  <Button size="sm" variant="ghost" onClick={() => setAiSelected(new Set())}>Bỏ chọn</Button>
                </div>
              </div>
              <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                {aiResults.map((q, i) => {
                  const checked = aiSelected.has(i);
                  return (
                    <div key={i} className={`rounded-lg border p-3 ${checked ? "border-violet-300 bg-violet-50/50" : "border-slate-200"}`}>
                      <div className="flex gap-3">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(v) => {
                            const next = new Set(aiSelected);
                            if (v) next.add(i); else next.delete(i);
                            setAiSelected(next);
                          }}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{i + 1}. {q.question}</p>
                          <ul className="mt-2 space-y-0.5 text-sm">
                            {q.options.map((o, j) => (
                              <li key={j} className={j === q.correct_index ? "text-emerald-700 font-medium" : "text-slate-600"}>
                                {String.fromCharCode(65 + j)}. {o} {j === q.correct_index && "✓"}
                              </li>
                            ))}
                          </ul>
                          <p className="mt-2 text-xs text-muted-foreground italic">💡 {q.explanation}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setAiOpen(false)}>Đóng</Button>
            {!aiResults && (
              <Button onClick={runAi} disabled={aiLoading} className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white">
                <Sparkles className="h-4 w-4 mr-1.5" />
                {aiLoading ? "Đang tạo..." : "Tạo câu hỏi"}
              </Button>
            )}
            {aiResults && (
              <Button onClick={saveSelected} disabled={aiSaving || aiSelected.size === 0}>
                {aiSaving ? "Đang lưu..." : `Lưu ${aiSelected.size} câu vào ngân hàng`}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
