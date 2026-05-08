import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Plus, Trash2, GripVertical } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import {
  useSurveys, useSurveyMutations, useSurveyQuestions, useSurveyQuestionMutations,
  useSurveyAssignments, type DBSurvey, type DBSurveyQuestion,
} from "@/lib/data-hooks";
import { SURVEY_CATEGORY, SURVEY_QUESTION_TYPE } from "@/lib/admin-options";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/lib/org-context";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/admin/surveys/$id/edit")({
  head: () => ({ meta: [{ title: "Tạo khảo sát — OnAir TMS" }] }),
  component: Page,
});

type LocalQuestion = {
  id?: string;
  type: string;
  content: string;
  options: string[];
  correct_answer: number[] | string | null;
  required: boolean;
  order_index: number;
};

function defaultOptionsFor(type: string): string[] {
  if (type === "single" || type === "multiple" || type === "dropdown") return ["", "", "", ""];
  if (type === "yes_no") return ["Có", "Không"];
  if (type === "sorting") return ["", ""];
  return [];
}

function Page() {
  const { id } = Route.useParams();
  const isNew = id === "new";
  const nav = useNavigate();
  const { orgId } = useOrg();
  const { data: rows = [] } = useSurveys();
  const { data: dbQs = [] } = useSurveyQuestions();
  const { data: assigns = [] } = useSurveyAssignments();
  const m = useSurveyMutations();
  const qm = useSurveyQuestionMutations();
  const existing = useMemo(() => rows.find(r => r.id === id), [rows, id]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("training");
  const [questions, setQuestions] = useState<LocalQuestion[]>([]);

  // Determine if this survey is "in-progress" (has assignment past start date)
  const isStarted = useMemo(() => {
    if (!existing) return false;
    const a = assigns.find(x => x.survey_id === existing.id);
    return !!(a && a.start_date && new Date(a.start_date) <= new Date());
  }, [assigns, existing]);

  useEffect(() => {
    if (existing) {
      setTitle(existing.title);
      setDescription(existing.description);
      setCategory(existing.category || "training");
      const mine = dbQs.filter(q => q.survey_id === existing.id).sort((a, b) => a.order_index - b.order_index);
      setQuestions(mine.map(q => ({
        id: q.id, type: q.type, content: q.content,
        options: Array.isArray(q.options) ? (q.options as string[]) : [],
        correct_answer: q.correct_answer as number[] | string | null,
        required: q.required, order_index: q.order_index,
      })));
    }
  }, [existing, dbQs]);

  function addQuestion() {
    setQuestions(prev => [...prev, {
      type: "single", content: "", options: defaultOptionsFor("single"),
      correct_answer: null, required: true, order_index: prev.length,
    }]);
  }

  function updateQ(i: number, patch: Partial<LocalQuestion>) {
    setQuestions(prev => prev.map((q, idx) => {
      if (idx !== i) return q;
      const next = { ...q, ...patch };
      if (patch.type && patch.type !== q.type) {
        next.options = defaultOptionsFor(patch.type);
        next.correct_answer = null;
      }
      return next;
    }));
  }

  function removeQ(i: number) {
    setQuestions(prev => prev.filter((_, idx) => idx !== i).map((x, idx) => ({ ...x, order_index: idx })));
  }

  function validate(publish: boolean): string | null {
    if (!title.trim()) return "Tên khảo sát là bắt buộc";
    if (title.length > 200) return "Tên khảo sát tối đa 200 ký tự";
    if (!category) return "Vui lòng chọn lĩnh vực";
    if (publish && questions.length === 0) return "Cần có ít nhất 1 câu hỏi";
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.content.trim()) return `Câu ${i + 1}: chưa nhập nội dung`;
      if (["single", "multiple", "dropdown", "sorting"].includes(q.type)) {
        const valid = q.options.filter(o => o.trim());
        if (valid.length < 2) return `Câu ${i + 1}: cần ≥ 2 đáp án`;
      }
      if (q.type === "single" && (q.correct_answer == null)) return `Câu ${i + 1}: chọn 1 đáp án đúng`;
      if (q.type === "multiple" && (!Array.isArray(q.correct_answer) || (q.correct_answer as number[]).length === 0)) return `Câu ${i + 1}: chọn ≥ 1 đáp án đúng`;
      if (q.type === "yes_no" && q.correct_answer == null) return `Câu ${i + 1}: chọn đáp án đúng`;
    }
    return null;
  }

  async function save(publish: boolean) {
    const err = validate(publish);
    if (err) return toast.error(err);

    const payload: Partial<DBSurvey> = {
      title: title.trim(), description, category, type: "general",
      status: publish ? "active" : "draft",
      anonymous: false, target_count: 0,
    };

    let surveyId = existing?.id;
    let nextVersion = existing?.version ?? 1;

    if (isNew) {
      payload.code = `SV-${Date.now().toString().slice(-6)}`;
      payload.version = 1;
      // Create then re-fetch by code to get id
      await m.create.mutateAsync(payload);
      const { data } = await supabase.from("surveys").select("id").eq("org_id", orgId).eq("code", payload.code as string).maybeSingle();
      surveyId = (data as { id?: string } | null)?.id;
    } else {
      // If started: bump version and snapshot the previous version
      if (isStarted) {
        nextVersion = (existing!.version || 1) + 1;
        const snap = {
          survey: { title: existing!.title, description: existing!.description, category: existing!.category, version: existing!.version },
          questions: dbQs.filter(q => q.survey_id === existing!.id),
        };
        await supabase.from("survey_versions").insert({
          survey_id: existing!.id, org_id: orgId, version: existing!.version || 1,
          snapshot: snap as never, change_note: "Cập nhật sau khi đã bắt đầu",
        } as never);
      }
      payload.version = nextVersion;
      await m.update.mutateAsync({ id: existing!.id, ...payload });
    }

    if (!surveyId) {
      toast.error("Không thể xác định khảo sát"); return;
    }

    // Replace questions: delete existing then insert new (simple strategy)
    const oldOnes = dbQs.filter(q => q.survey_id === surveyId);
    for (const o of oldOnes) await qm.remove.mutateAsync(o.id);
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const validOpts = q.options.filter(o => o.trim());
      await qm.create.mutateAsync({
        survey_id: surveyId, type: q.type, content: q.content.trim(),
        options: validOpts as unknown as DBSurveyQuestion["options"],
        correct_answer: q.correct_answer as DBSurveyQuestion["correct_answer"],
        required: q.required, order_index: i,
      });
    }

    toast.success(publish ? "Đã xuất bản khảo sát" : "Đã lưu nháp");
    nav({ to: "/admin/surveys" });
  }

  return (
    <PageContainer
      title={isNew ? "Tạo khảo sát" : "Chỉnh sửa khảo sát"}
      breadcrumbs={[{ title: "Khảo sát", path: "/admin/surveys" }, { title: isNew ? "Tạo khảo sát" : "Chỉnh sửa" }]}
    >
      {isStarted && (
        <Card className="border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
          Khảo sát đã đến thời gian làm. Khi lưu, hệ thống sẽ tạo phiên bản mới và không ảnh hưởng đến phản hồi đã có.
        </Card>
      )}

      <Card className="space-y-4 p-6">
        <div className="text-base font-semibold">Thông tin khảo sát</div>
        <div>
          <Label>Tên khảo sát <span className="text-destructive">*</span></Label>
          <Input value={title} onChange={e => setTitle(e.target.value)} maxLength={200} placeholder="Nhập tên khảo sát" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Lĩnh vực <span className="text-destructive">*</span></Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SURVEY_CATEGORY.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label>Mô tả</Label>
          <Textarea rows={4} value={description} onChange={e => setDescription(e.target.value)} placeholder="Nội dung mô tả..." />
        </div>
      </Card>

      <Card className="space-y-3 p-6">
        <div className="flex items-center justify-between">
          <div className="text-base font-semibold">Câu hỏi khảo sát</div>
          <Button size="sm" onClick={addQuestion}><Plus className="h-4 w-4" /> Thêm câu hỏi</Button>
        </div>

        {questions.length === 0 && (
          <div className="rounded border border-dashed p-8 text-center text-sm text-muted-foreground">
            Chưa có câu hỏi. Nhấn “Thêm câu hỏi” để bắt đầu.
          </div>
        )}

        <div className="space-y-3">
          {questions.map((q, i) => (
            <QuestionEditor
              key={q.id ?? `new-${i}`}
              index={i} value={q}
              onChange={(patch) => updateQ(i, patch)}
              onRemove={() => removeQ(i)}
            />
          ))}
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="outline" asChild><Link to="/admin/surveys"><ArrowLeft className="h-4 w-4" /> Huỷ</Link></Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => save(false)}>Lưu nháp</Button>
          <Button onClick={() => save(true)}>Xuất bản</Button>
        </div>
      </div>
    </PageContainer>
  );
}

function QuestionEditor({ index, value, onChange, onRemove }: {
  index: number; value: LocalQuestion;
  onChange: (patch: Partial<LocalQuestion>) => void; onRemove: () => void;
}) {
  const showOptions = ["single", "multiple", "yes_no", "dropdown", "sorting"].includes(value.type);
  const editableOptions = value.type !== "yes_no";

  function setOption(i: number, v: string) {
    const next = [...value.options]; next[i] = v;
    onChange({ options: next });
  }
  function addOption() { onChange({ options: [...value.options, ""] }); }
  function removeOption(i: number) {
    const correct = value.correct_answer;
    let nextCorrect = correct;
    if (Array.isArray(correct)) nextCorrect = (correct as number[]).filter(c => c !== i).map(c => c > i ? c - 1 : c);
    else if (typeof correct === "number" && correct === i) nextCorrect = null;
    onChange({ options: value.options.filter((_, idx) => idx !== i), correct_answer: nextCorrect as number[] | string | null });
  }

  return (
    <div className="rounded-lg border p-4">
      <div className="mb-3 flex items-start gap-2">
        <GripVertical className="mt-2 h-4 w-4 text-muted-foreground" />
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline">Câu {index + 1}</Badge>
            <Select value={value.type} onValueChange={(v) => onChange({ type: v })}>
              <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {SURVEY_QUESTION_TYPE.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <label className="ml-auto flex items-center gap-2 text-sm">
              <Switch checked={value.required} onCheckedChange={(v) => onChange({ required: v })} /> Bắt buộc
            </label>
            <Button size="icon" variant="ghost" onClick={onRemove}><Trash2 className="h-4 w-4 text-destructive" /></Button>
          </div>

          <Textarea rows={2} value={value.content} placeholder="Nhập nội dung câu hỏi"
            onChange={e => onChange({ content: e.target.value })} />

          {showOptions && (
            <div className="space-y-2">
              {value.type === "single" || value.type === "yes_no" ? (
                <RadioGroup
                  value={Array.isArray(value.correct_answer) && value.correct_answer.length ? String((value.correct_answer as number[])[0]) : ""}
                  onValueChange={(v) => onChange({ correct_answer: [Number(v)] as unknown as number[] })}
                >
                  {value.options.map((o, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <RadioGroupItem value={String(i)} />
                      <Input value={o} disabled={!editableOptions}
                        onChange={e => setOption(i, e.target.value)}
                        placeholder={`Đáp án ${i + 1}`} />
                      {editableOptions && value.options.length > 2 && (
                        <Button size="icon" variant="ghost" onClick={() => removeOption(i)}><Trash2 className="h-4 w-4" /></Button>
                      )}
                    </div>
                  ))}
                </RadioGroup>
              ) : value.type === "multiple" ? (
                value.options.map((o, i) => {
                  const arr = Array.isArray(value.correct_answer) ? (value.correct_answer as number[]) : [];
                  const checked = arr.includes(i);
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <Checkbox checked={checked} onCheckedChange={(v) => {
                        const next = v ? [...arr, i] : arr.filter(c => c !== i);
                        onChange({ correct_answer: next });
                      }} />
                      <Input value={o} onChange={e => setOption(i, e.target.value)} placeholder={`Đáp án ${i + 1}`} />
                      {value.options.length > 2 && (
                        <Button size="icon" variant="ghost" onClick={() => removeOption(i)}><Trash2 className="h-4 w-4" /></Button>
                      )}
                    </div>
                  );
                })
              ) : (
                value.options.map((o, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-6 text-center text-xs text-muted-foreground">#{i + 1}</span>
                    <Input value={o} onChange={e => setOption(i, e.target.value)} placeholder={`Lựa chọn ${i + 1}`} />
                    {value.options.length > 2 && (
                      <Button size="icon" variant="ghost" onClick={() => removeOption(i)}><Trash2 className="h-4 w-4" /></Button>
                    )}
                  </div>
                ))
              )}
              {editableOptions && (
                <Button size="sm" variant="outline" onClick={addOption}><Plus className="h-4 w-4" /> Thêm đáp án</Button>
              )}
            </div>
          )}

          {value.type === "rating" && (
            <div className="text-sm text-muted-foreground">Học viên sẽ chọn thang điểm 1–5.</div>
          )}
          {value.type === "essay" && (
            <div className="text-sm text-muted-foreground">Học viên trả lời tự luận.</div>
          )}
          {value.type === "vote" && (
            <div className="text-sm text-muted-foreground">Câu hỏi bình chọn — không có đáp án đúng.</div>
          )}
        </div>
      </div>
    </div>
  );
}
