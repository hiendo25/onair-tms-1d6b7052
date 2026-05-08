import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { CheckCircle2, AlertCircle, Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type QType = "single" | "multiple" | "yes_no" | "rating" | "essay" | "dropdown" | "sorting" | "vote";

type Question = {
  id: string;
  type: QType;
  content: string;
  options: unknown;
  required: boolean;
  order_index: number;
};

type Survey = {
  id: string;
  title: string;
  description: string;
  anonymous: boolean;
  status: string;
  start_date: string | null;
  end_date: string | null;
};

type AnswerValue = string | string[] | null;

export const Route = createFileRoute("/surveys/$id/submit")({
  head: () => ({ meta: [{ title: "Khảo sát — OnAir TMS" }] }),
  validateSearch: (s: Record<string, unknown>) => ({
    assignmentId: typeof s.assignmentId === "string" ? s.assignmentId : undefined,
  }),
  component: SubmitPage,
});

function normalizeOptions(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((o) => {
    if (typeof o === "string") return o;
    if (o && typeof o === "object") {
      const r = o as Record<string, unknown>;
      if ("value" in r) return String(r.value);
      if ("label" in r) return String(r.label);
    }
    return String(o);
  });
}

function SubmitPage() {
  const { id } = Route.useParams();
  const { assignmentId } = useSearch({ from: "/surveys/$id/submit" });
  const nav = useNavigate();
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["survey-submit", id],
    queryFn: async () => {
      const [s, q] = await Promise.all([
        supabase.from("surveys")
          .select("id,title,description,anonymous,status,start_date,end_date")
          .eq("id", id).maybeSingle(),
        supabase.from("survey_questions")
          .select("id,type,content,options,required,order_index")
          .eq("survey_id", id).order("order_index"),
      ]);
      if (s.error) throw s.error;
      if (!s.data) throw new Error("Không tìm thấy khảo sát");
      if (q.error) throw q.error;
      return { survey: s.data as Survey, questions: (q.data ?? []) as Question[] };
    },
  });

  const survey = data?.survey;
  const questions = data?.questions ?? [];

  const completed = useMemo(
    () => questions.filter((q) => {
      const v = answers[q.id];
      if (v === null || v === undefined) return false;
      if (typeof v === "string") return v.trim() !== "";
      if (Array.isArray(v)) return v.length > 0;
      return true;
    }).length,
    [answers, questions],
  );
  const progress = questions.length ? Math.round((completed / questions.length) * 100) : 0;

  const setAnswer = (qid: string, v: AnswerValue) => {
    setAnswers((p) => ({ ...p, [qid]: v }));
    setErrors((p) => {
      if (!p[qid]) return p;
      const n = { ...p }; delete n[qid]; return n;
    });
  };

  function validateLocal(): boolean {
    const e: Record<string, string> = {};
    for (const q of questions) {
      const v = answers[q.id];
      const empty = v === null || v === undefined || (typeof v === "string" && v.trim() === "") || (Array.isArray(v) && v.length === 0);
      if (q.required && empty) e[q.id] = "Câu hỏi bắt buộc";
    }
    setErrors(e);
    if (Object.keys(e).length) {
      const firstId = Object.keys(e)[0];
      document.getElementById(`q-${firstId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      toast.error("Vui lòng trả lời các câu hỏi bắt buộc");
    }
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!survey) return;
    if (!validateLocal()) return;
    setSubmitting(true);
    try {
      const { data: result, error: fnErr } = await supabase.functions.invoke("submit-survey", {
        body: { surveyId: id, assignmentId, answers },
      });
      if (fnErr) {
        // functions.invoke surfaces non-2xx as error with context
        const ctx = (fnErr as { context?: { json?: () => Promise<{ error?: string; fieldErrors?: Record<string, string> }> } }).context;
        let msg = fnErr.message || "Gửi không thành công";
        try {
          const body = await ctx?.json?.();
          if (body?.fieldErrors) setErrors(body.fieldErrors);
          if (body?.error) msg = body.error;
        } catch { /* ignore parse */ }
        toast.error(msg);
        return;
      }
      if (result?.error) {
        if (result.fieldErrors) setErrors(result.fieldErrors);
        toast.error(result.error);
        return;
      }
      toast.success("Đã gửi khảo sát");
      nav({ to: "/surveys/$id/submit/thank-you", params: { id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi không xác định");
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <Centered>
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </Centered>
    );
  }

  if (error || !survey) {
    return (
      <Centered>
        <Card className="w-full max-w-md p-6 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-destructive" />
          <h1 className="mt-3 text-lg font-semibold">Không tải được khảo sát</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "Khảo sát không tồn tại hoặc bạn không có quyền truy cập."}
          </p>
          <Button asChild variant="outline" className="mt-4"><Link to="/dashboard">Về trang chủ</Link></Button>
        </Card>
      </Centered>
    );
  }

  if (survey.status !== "active") {
    return (
      <Centered>
        <Card className="w-full max-w-md p-6 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-amber-500" />
          <h1 className="mt-3 text-lg font-semibold">Khảo sát đã đóng</h1>
          <Button asChild variant="outline" className="mt-4"><Link to="/dashboard">Về trang chủ</Link></Button>
        </Card>
      </Centered>
    );
  }

  if (questions.length === 0) {
    return (
      <Centered>
        <Card className="w-full max-w-md p-6 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-amber-500" />
          <h1 className="mt-3 text-lg font-semibold">Khảo sát chưa có câu hỏi</h1>
          <Button asChild variant="outline" className="mt-4"><Link to="/dashboard">Về trang chủ</Link></Button>
        </Card>
      </Centered>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40 py-8">
      <div className="mx-auto max-w-2xl space-y-4 px-4">
        <Card className="p-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-primary" />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold">{survey.title}</h1>
                {survey.anonymous && <Badge variant="secondary">Ẩn danh</Badge>}
              </div>
              {survey.description && (
                <p className="mt-1 text-sm text-muted-foreground">{survey.description}</p>
              )}
            </div>
          </div>
          <Progress value={progress} className="mt-4 h-1.5" />
          <div className="mt-1 text-xs text-muted-foreground">
            {completed} / {questions.length} câu đã trả lời
          </div>
        </Card>

        {questions.map((q, i) => (
          <Card key={q.id} id={`q-${q.id}`} className="p-6">
            <Label className="text-base font-medium">
              Câu {i + 1}. {q.content}
              {q.required && <span className="ml-1 text-destructive">*</span>}
            </Label>
            <div className="mt-3">
              <QuestionField q={q} value={answers[q.id] ?? null} onChange={(v) => setAnswer(q.id, v)} />
            </div>
            {errors[q.id] && (
              <p className="mt-2 text-sm text-destructive">{errors[q.id]}</p>
            )}
          </Card>
        ))}

        <div className="flex justify-between gap-2 pb-8">
          <Button asChild variant="outline" disabled={submitting}>
            <Link to="/dashboard">Huỷ</Link>
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Gửi khảo sát
          </Button>
        </div>
      </div>
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      {children}
    </div>
  );
}

function QuestionField({
  q, value, onChange,
}: {
  q: Question;
  value: AnswerValue;
  onChange: (v: AnswerValue) => void;
}) {
  const opts = useMemo(() => normalizeOptions(q.options), [q.options]);

  switch (q.type) {
    case "single":
    case "vote":
      return (
        <RadioGroup value={typeof value === "string" ? value : ""} onValueChange={(v) => onChange(v)} className="space-y-2">
          {opts.map((o) => (
            <label key={o} className="flex cursor-pointer items-center gap-2 rounded-md border p-3 hover:bg-muted">
              <RadioGroupItem value={o} id={`${q.id}-${o}`} />
              <span className="text-sm">{o}</span>
            </label>
          ))}
        </RadioGroup>
      );

    case "multiple": {
      const arr = Array.isArray(value) ? value : [];
      return (
        <div className="space-y-2">
          {opts.map((o) => {
            const checked = arr.includes(o);
            return (
              <label key={o} className="flex cursor-pointer items-center gap-2 rounded-md border p-3 hover:bg-muted">
                <Checkbox
                  checked={checked}
                  onCheckedChange={(c) => {
                    onChange(c ? [...arr, o] : arr.filter((x) => x !== o));
                  }}
                />
                <span className="text-sm">{o}</span>
              </label>
            );
          })}
        </div>
      );
    }

    case "yes_no":
      return (
        <RadioGroup value={typeof value === "string" ? value : ""} onValueChange={(v) => onChange(v)} className="flex gap-3">
          {[{ v: "yes", l: "Có" }, { v: "no", l: "Không" }].map((o) => (
            <label key={o.v} className="flex flex-1 cursor-pointer items-center gap-2 rounded-md border p-3 hover:bg-muted">
              <RadioGroupItem value={o.v} id={`${q.id}-${o.v}`} />
              <span className="text-sm">{o.l}</span>
            </label>
          ))}
        </RadioGroup>
      );

    case "rating": {
      const cur = Number(typeof value === "string" ? value : 0);
      return (
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange(String(n))}
              className="rounded p-1 transition hover:bg-muted"
              aria-label={`${n} sao`}
            >
              <Star className={`h-7 w-7 ${n <= cur ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
            </button>
          ))}
          <span className="ml-2 text-sm text-muted-foreground">{cur || 0}/5</span>
        </div>
      );
    }

    case "dropdown":
      return (
        <Select value={typeof value === "string" ? value : ""} onValueChange={(v) => onChange(v)}>
          <SelectTrigger><SelectValue placeholder="Chọn một mục..." /></SelectTrigger>
          <SelectContent>
            {opts.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
          </SelectContent>
        </Select>
      );

    case "essay":
      return (
        <Textarea
          rows={4}
          maxLength={5000}
          placeholder="Nhập câu trả lời..."
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case "sorting":
      return <SortingField q={q} opts={opts} value={Array.isArray(value) ? value : opts} onChange={onChange} />;

    default:
      return (
        <Input
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Nhập câu trả lời..."
        />
      );
  }
}

function SortingField({
  q, opts, value, onChange,
}: {
  q: Question;
  opts: string[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  // Initialize to opts order on first mount if value is empty
  useEffect(() => {
    if (value.length === 0 && opts.length > 0) onChange([...opts]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const items = value.length ? value : opts;

  function move(idx: number, dir: -1 | 1) {
    const j = idx + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[idx], next[j]] = [next[j], next[idx]];
    onChange(next);
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">Dùng nút ↑ ↓ để sắp xếp theo thứ tự ưu tiên.</p>
      {items.map((o, i) => (
        <div key={`${q.id}-${o}-${i}`} className="flex items-center gap-2 rounded-md border p-3">
          <span className="w-6 text-sm font-medium text-muted-foreground">{i + 1}.</span>
          <span className="flex-1 text-sm">{o}</span>
          <Button type="button" size="icon" variant="ghost" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Lên">↑</Button>
          <Button type="button" size="icon" variant="ghost" disabled={i === items.length - 1} onClick={() => move(i, 1)} aria-label="Xuống">↓</Button>
        </div>
      ))}
    </div>
  );
}
