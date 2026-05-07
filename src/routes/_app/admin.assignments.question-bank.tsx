import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search, Filter } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MOCK_QUESTIONS } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/admin/assignments/question-bank")({
  head: () => ({ meta: [{ title: "Ngân hàng câu hỏi — OnAir LMS" }] }),
  component: QuestionBankPage,
});

const TYPE_LABEL = { single: "Một đáp án", multiple: "Nhiều đáp án", essay: "Tự luận" } as const;

function QuestionBankPage() {
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("all");
  const cats = Array.from(new Set(MOCK_QUESTIONS.map(q => q.category)));
  const filtered = MOCK_QUESTIONS.filter(q =>
    (!search || q.content.toLowerCase().includes(search.toLowerCase())) &&
    (cat === "all" || q.category === cat)
  );
  return (
    <PageContainer
      title="Ngân hàng câu hỏi"
      breadcrumbs={[{ title: "Bài kiểm tra", path: "/admin/assignments" }, { title: "Ngân hàng câu hỏi" }]}
      actions={<Button size="sm"><Plus className="h-4 w-4" />Thêm câu hỏi</Button>}
    >
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm kiếm câu hỏi..." className="pl-9 bg-background" />
        </div>
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger className="w-44 bg-background"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả lĩnh vực</SelectItem>
            {cats.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm"><Filter className="h-4 w-4" />Lọc nâng cao</Button>
      </div>

      <div className="grid gap-3">
        {filtered.map((q, i) => (
          <Card key={q.id} className="p-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">{i + 1}</span>
              <div className="flex-1 space-y-2">
                <p className="text-sm leading-relaxed">{q.content}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-[10px]">{TYPE_LABEL[q.type]}</Badge>
                  <Badge variant="secondary" className="text-[10px]">{q.category}</Badge>
                  <Badge
                    className={`text-[10px] ${
                      q.difficulty === "Dễ" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" :
                      q.difficulty === "Trung bình" ? "bg-amber-100 text-amber-700 hover:bg-amber-100" :
                      "bg-rose-100 text-rose-700 hover:bg-rose-100"
                    }`}
                  >{q.difficulty}</Badge>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
