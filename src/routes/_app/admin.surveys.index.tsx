import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Search, Plus, MoreVertical, Pencil, Trash2, BarChart3, Copy } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import {
  useSurveys, useSurveyMutations, useSurveyAssignments,
  useSurveyQuestions, useSurveyQuestionMutations,
} from "@/lib/data-hooks";
import { SURVEY_CATEGORY } from "@/lib/admin-options";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/admin/surveys/")({
  head: () => ({ meta: [{ title: "Danh sách khảo sát — OnAir TMS" }] }),
  component: Page,
});

function Page() {
  const { data: rows = [], isLoading } = useSurveys();
  const { data: questions = [] } = useSurveyQuestions();
  const { data: assigns = [] } = useSurveyAssignments();
  const m = useSurveyMutations();
  const qm = useSurveyQuestionMutations();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [delId, setDelId] = useState<string | null>(null);

  const filtered = useMemo(() => rows.filter(r => {
    if (cat !== "all" && r.category !== cat) return false;
    if (!q) return true;
    const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return norm(r.title).includes(norm(q));
  }), [rows, q, cat]);

  function questionCount(sid: string) {
    return questions.filter(qq => qq.survey_id === sid).length;
  }

  async function tryDelete(id: string) {
    const a = assigns.find(x => x.survey_id === id);
    if (a && a.start_date && new Date(a.start_date) <= new Date()) {
      toast.error("Khảo sát đã đến thời gian làm — không thể xoá");
      setDelId(null);
      return;
    }
    const qs = questions.filter(x => x.survey_id === id);
    for (const qq of qs) await qm.remove.mutateAsync(qq.id);
    await m.remove.mutateAsync(id);
    setDelId(null);
  }

  async function clone(id: string) {
    const src = rows.find(r => r.id === id);
    if (!src) return;
    await m.create.mutateAsync({
      title: `${src.title} (Bản sao)`, code: `${src.code}-COPY-${Date.now().toString().slice(-4)}`,
      description: src.description, type: src.type, category: src.category,
      anonymous: src.anonymous, status: "draft", target_count: 0, responses_count: 0, version: 1,
    });
    toast.success("Đã nhân bản");
  }

  return (
    <PageContainer
      title="Danh sách khảo sát"
      breadcrumbs={[{ title: "Khảo sát" }, { title: "Danh sách khảo sát" }]}
      actions={
        <Button onClick={() => nav({ to: "/admin/surveys/$id/edit", params: { id: "new" } })}>
          <Plus className="h-4 w-4" /> Tạo khảo sát
        </Button>
      }
    >
      <Card className="p-4">
        <div className="mb-4 flex flex-wrap gap-2">
          <div className="relative min-w-[240px] max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9 rounded-full" placeholder="Tìm kiếm khảo sát..." value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <Select value={cat} onValueChange={setCat}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Lĩnh vực" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả lĩnh vực</SelectItem>
              {SURVEY_CATEGORY.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">STT</TableHead>
              <TableHead>Tên khảo sát</TableHead>
              <TableHead>SL câu hỏi</TableHead>
              <TableHead>Người tạo</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="w-[180px] text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Đang tải...</TableCell></TableRow>}
            {!isLoading && filtered.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Không có khảo sát</TableCell></TableRow>}
            {filtered.map((r, idx) => (
              <TableRow key={r.id} className="group">
                <TableCell className="text-primary font-medium">{idx + 1}</TableCell>
                <TableCell className="font-medium text-primary">
                  <Link to="/admin/surveys/$id/edit" params={{ id: r.id }} className="hover:underline">{r.title}</Link>
                </TableCell>
                <TableCell>{questionCount(r.id)}</TableCell>
                <TableCell className="font-medium">Super Admin of OnAir TMS</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(r.created_at).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).replace(", ", " - ")}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="ghost" className="h-8 w-8" title="Nhân bản" onClick={() => clone(r.id)}><Copy className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" title="Xem báo cáo" asChild><Link to="/admin/surveys/$id/statistics" params={{ id: r.id }}><BarChart3 className="h-4 w-4" /></Link></Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" title="Chỉnh sửa" asChild><Link to="/admin/surveys/$id/edit" params={{ id: r.id }}><Pencil className="h-4 w-4" /></Link></Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" title="Xoá" onClick={() => setDelId(r.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      <ConfirmDelete
        open={!!delId} onOpenChange={(o) => !o && setDelId(null)}
        title="Xoá khảo sát" description="Hành động này sẽ xoá khảo sát và toàn bộ câu hỏi liên quan."
        onConfirm={() => { if (delId) tryDelete(delId); }}
      />
    </PageContainer>
  );
}
