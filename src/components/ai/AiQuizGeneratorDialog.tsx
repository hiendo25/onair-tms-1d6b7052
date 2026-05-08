import { useState } from "react";
import { Sparkles, CheckCircle2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { AiSpinner } from "@/components/ai/AiSpinner";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/lib/org-context";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type QuizQuestion = {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
  difficulty: string;
};

type Props = {
  lessonTitle: string;
  lessonContent?: string;
  open: boolean;
  onClose: () => void;
};

const DIFF_LABEL: Record<string, string> = { easy: "Dễ", medium: "Trung bình", hard: "Khó" };
const DIFF_CLS: Record<string, string> = {
  easy: "bg-emerald-100 text-emerald-700",
  medium: "bg-amber-100 text-amber-700",
  hard: "bg-rose-100 text-rose-700",
};

export function AiQuizGeneratorDialog({ lessonTitle, lessonContent, open, onClose }: Props) {
  const { orgId } = useOrg();
  const qc = useQueryClient();
  const [count, setCount] = useState<"5" | "8" | "10">("8");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  function reset() {
    setQuestions([]); setSelected(new Set()); setLoading(false); setSaving(false);
  }

  async function generate() {
    setLoading(true);
    setQuestions([]);
    setSelected(new Set());
    try {
      const { data: res, error: fnErr } = await supabase.functions.invoke("ai-generate-quiz", {
        body: { lessonTitle, content: lessonContent ?? "", count: Number(count) },
      });
      if (fnErr) throw fnErr;
      const qs = (res as { questions: QuizQuestion[] }).questions;
      setQuestions(qs);
      setSelected(new Set(qs.map((_, i) => i)));
    } catch {
      toast.error("Không thể sinh câu hỏi. Thử lại nhé.");
    } finally {
      setLoading(false);
    }
  }

  function toggleSelect(i: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  async function saveToBank() {
    const toSave = questions.filter((_, i) => selected.has(i));
    if (!toSave.length) { toast.error("Chưa chọn câu hỏi nào."); return; }
    setSaving(true);
    try {
      const rows = toSave.map((q) => ({
        org_id: orgId,
        question: q.question,
        type: "single",
        options: q.options,
        answer: q.options[q.correct_index],
        explanation: q.explanation,
        difficulty: q.difficulty,
        points: q.difficulty === "hard" ? 3 : q.difficulty === "medium" ? 2 : 1,
        status: "active",
        tags: [lessonTitle],
      }));
      const { error } = await supabase.from("question_bank").insert(rows);
      if (error) throw error;
      toast.success(`Đã lưu ${toSave.length} câu hỏi vào ngân hàng.`);
      qc.invalidateQueries({ queryKey: ["question_bank"] });
      onClose(); reset();
    } catch (e) {
      toast.error("Lưu thất bại: " + (e instanceof Error ? e.message : "Unknown"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { onClose(); reset(); } }}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-600" /> Sinh câu hỏi từ bài học bằng AI
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {questions.length === 0 && !loading && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                AI sẽ tạo câu hỏi trắc nghiệm dựa trên nội dung bài <span className="font-medium">"{lessonTitle}"</span>.
                Sau đó bạn chọn câu muốn lưu vào ngân hàng.
              </p>
              <div className="flex items-center gap-3">
                <Label>Số câu hỏi</Label>
                <Select value={count} onValueChange={(v) => setCount(v as typeof count)}>
                  <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 câu</SelectItem>
                    <SelectItem value="8">8 câu</SelectItem>
                    <SelectItem value="10">10 câu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {loading && <AiSpinner label="Đang tạo câu hỏi..." />}

          {questions.length > 0 && !loading && (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{questions.length} câu hỏi · Đã chọn {selected.size}</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setSelected(new Set(questions.map((_, i) => i)))}>Chọn tất cả</Button>
                  <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>Bỏ chọn</Button>
                </div>
              </div>
              <div className="space-y-3">
                {questions.map((q, i) => (
                  <div
                    key={i}
                    onClick={() => toggleSelect(i)}
                    className={`rounded-lg border p-3 cursor-pointer transition ${selected.has(i) ? "border-violet-400 bg-violet-50/50" : "hover:bg-muted/40"}`}
                  >
                    <div className="flex items-start gap-2">
                      <div className={`mt-0.5 h-4 w-4 rounded border-2 shrink-0 flex items-center justify-center ${selected.has(i) ? "border-violet-600 bg-violet-600" : "border-slate-300"}`}>
                        {selected.has(i) && <CheckCircle2 className="h-3 w-3 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="font-medium text-sm">{i + 1}. {q.question}</span>
                          <Badge className={DIFF_CLS[q.difficulty] ?? ""}>{DIFF_LABEL[q.difficulty] ?? q.difficulty}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          {q.options.map((opt, oi) => (
                            <div key={oi} className={`text-xs px-2 py-1 rounded ${oi === q.correct_index ? "bg-emerald-100 text-emerald-700 font-medium" : "text-muted-foreground"}`}>
                              {String.fromCharCode(65 + oi)}. {opt}
                              {oi === q.correct_index && " ✓"}
                            </div>
                          ))}
                        </div>
                        {q.explanation && (
                          <p className="text-xs text-muted-foreground mt-1.5 italic">💡 {q.explanation}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <DialogFooter className="border-t pt-3 mt-2">
          <Button variant="outline" onClick={() => { onClose(); reset(); }}>Hủy</Button>
          {questions.length === 0 ? (
            <Button onClick={generate} disabled={loading}>
              <Sparkles className="h-4 w-4 mr-1.5" /> Sinh câu hỏi
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={generate} disabled={loading}>Sinh lại</Button>
              <Button onClick={saveToBank} disabled={saving || selected.size === 0}>
                <Plus className="h-4 w-4 mr-1.5" />
                {saving ? "Đang lưu..." : `Lưu ${selected.size} câu vào ngân hàng`}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
