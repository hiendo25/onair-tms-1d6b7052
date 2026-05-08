import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  useQuestions, useQuestionMutations, useQuestionFolders, type DBQuestion,
} from "@/lib/data-hooks";
import { QUESTION_TYPE, DIFFICULTY } from "@/lib/admin-options";
import { toast } from "sonner";

const search = z.object({ folder: z.string().optional().default("") });

export const Route = createFileRoute("/_app/admin/assignments/question-bank/$id/edit")({
  validateSearch: (input: Record<string, unknown>) => search.parse(input),
  head: () => ({ meta: [{ title: "Tạo câu hỏi — OnAir TMS" }] }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const { folder: folderQS } = Route.useSearch();
  const isNew = id === "new";
  const navigate = useNavigate();
  const { data: rows = [] } = useQuestions();
  const { data: folders = [] } = useQuestionFolders();
  const m = useQuestionMutations();
  const existing = useMemo(() => rows.find(r => r.id === id), [rows, id]);

  const [title, setTitle] = useState("");
  const [type, setType] = useState<"single" | "multiple" | "true_false">("single");
  const [difficulty, setDifficulty] = useState("medium");
  const [points, setPoints] = useState(1);
  const [folderId, setFolderId] = useState<string>(folderQS || "");
  const [category, setCategory] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [correct, setCorrect] = useState<number[]>([]);

  useEffect(() => {
    if (existing) {
      setTitle(existing.title || existing.question);
      setType((existing.type as "single" | "multiple" | "true_false") || "single");
      setDifficulty(existing.difficulty || "medium");
      setPoints(existing.points || 1);
      setFolderId(existing.folder_id || "");
      setCategory(existing.category || "");
      const opts = Array.isArray(existing.options) ? (existing.options as string[]) : [];
      setOptions(opts.length ? opts : ["", ""]);
      const cArr = Array.isArray(existing.correct_answers) ? existing.correct_answers : [];
      setCorrect(cArr.map(Number).filter(n => !Number.isNaN(n)));
    }
  }, [existing]);

  useEffect(() => {
    if (type === "true_false") {
      setOptions(["Đúng", "Sai"]);
      if (correct.length !== 1) setCorrect([0]);
    }
  }, [type]);

  function addOption() { setOptions(prev => [...prev, ""]); }
  function removeOption(i: number) {
    setOptions(prev => prev.filter((_, idx) => idx !== i));
    setCorrect(prev => prev.filter(c => c !== i).map(c => c > i ? c - 1 : c));
  }
  function toggleCorrect(i: number) {
    if (type === "multiple") {
      setCorrect(prev => prev.includes(i) ? prev.filter(c => c !== i) : [...prev, i]);
    } else {
      setCorrect([i]);
    }
  }

  async function save() {
    if (!title.trim()) return toast.error("Tên câu hỏi là bắt buộc");
    if (points < 1 || points > 100) return toast.error("Điểm phải từ 1 đến 100");
    const validOpts = options.filter(o => o.trim());
    if (validOpts.length < 2) return toast.error("Cần ít nhất 2 đáp án");
    if (correct.length === 0) return toast.error("Phải chọn ít nhất 1 đáp án đúng");

    const payload: Partial<DBQuestion> = {
      title: title.trim(),
      question: title.trim(),
      type,
      difficulty,
      points,
      folder_id: folderId || null,
      category,
      options: validOpts,
      correct_answer: String(correct[0] ?? ""),
      correct_answers: correct.map(String),
      status: "active",
    };
    if (isNew) await m.create.mutateAsync(payload);
    else await m.update.mutateAsync({ id, ...payload });
    navigate({ to: "/admin/assignments/question-bank" });
  }

  const readOnly = !isNew && existing?.status === "inactive";

  return (
    <PageContainer
      title={isNew ? "Tạo câu hỏi" : "Chỉnh sửa câu hỏi"}
      breadcrumbs={[{ title: "Bài kiểm tra" }, { title: "Ngân hàng câu hỏi", path: "/admin/assignments/question-bank" }, { title: isNew ? "Tạo" : "Sửa" }]}
      actions={
        <Button variant="outline" asChild><Link to="/admin/assignments/question-bank"><ArrowLeft className="h-4 w-4" /> Quay lại</Link></Button>
      }
    >
      {readOnly && (
        <Card className="border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
          Câu hỏi đang Ngưng sử dụng — chỉ đọc.
        </Card>
      )}
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card className="space-y-4 p-5">
          <div>
            <Label>Nội dung câu hỏi *</Label>
            <Textarea rows={3} disabled={readOnly} value={title} onChange={e => setTitle(e.target.value)} placeholder="Nhập nội dung câu hỏi" maxLength={500} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Loại câu hỏi *</Label>
              <Select value={type} onValueChange={v => setType(v as "single" | "multiple" | "true_false")} disabled={readOnly}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {QUESTION_TYPE.filter(o => o.value !== "essay").map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Điểm *</Label>
              <Input type="number" min={1} max={100} disabled={readOnly} value={points} onChange={e => setPoints(Number(e.target.value))} />
            </div>
          </div>

          <div>
            <Label>Đáp án</Label>
            <div className="space-y-2">
              {type === "multiple" ? (
                options.map((o, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Checkbox checked={correct.includes(i)} disabled={readOnly} onCheckedChange={() => toggleCorrect(i)} />
                    <Input value={o} disabled={readOnly} onChange={e => setOptions(prev => prev.map((x, idx) => idx === i ? e.target.value : x))} placeholder={`Đáp án ${i + 1}`} />
                    {options.length > 2 && !readOnly && <Button size="icon" variant="ghost" onClick={() => removeOption(i)}><Trash2 className="h-4 w-4" /></Button>}
                  </div>
                ))
              ) : (
                <RadioGroup value={String(correct[0] ?? "")} onValueChange={(v) => setCorrect([Number(v)])}>
                  {options.map((o, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <RadioGroupItem value={String(i)} disabled={readOnly} />
                      <Input value={o} disabled={readOnly || type === "true_false"} onChange={e => setOptions(prev => prev.map((x, idx) => idx === i ? e.target.value : x))} placeholder={`Đáp án ${i + 1}`} />
                      {type !== "true_false" && options.length > 2 && !readOnly && <Button size="icon" variant="ghost" onClick={() => removeOption(i)}><Trash2 className="h-4 w-4" /></Button>}
                    </div>
                  ))}
                </RadioGroup>
              )}
              {type !== "true_false" && !readOnly && (
                <Button size="sm" variant="outline" onClick={addOption}><Plus className="h-4 w-4" /> Thêm đáp án</Button>
              )}
            </div>
          </div>
        </Card>

        <Card className="space-y-4 p-5">
          <div className="text-sm font-semibold">Cấu hình</div>
          <div>
            <Label>Folder</Label>
            <Select value={folderId || "_none"} onValueChange={v => setFolderId(v === "_none" ? "" : v)} disabled={readOnly}>
              <SelectTrigger><SelectValue placeholder="Chọn folder" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">— Không thuộc folder —</SelectItem>
                {folders.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Lĩnh vực</Label>
            <Input disabled={readOnly} value={category} onChange={e => setCategory(e.target.value)} />
          </div>
          <div>
            <Label>Độ khó *</Label>
            <Select value={difficulty} onValueChange={setDifficulty} disabled={readOnly}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {DIFFICULTY.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </Card>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" asChild><Link to="/admin/assignments/question-bank">Quay lại</Link></Button>
        {!readOnly && <Button onClick={save}>Lưu</Button>}
      </div>
    </PageContainer>
  );
}
