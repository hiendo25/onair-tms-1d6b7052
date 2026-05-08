import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Plus, Search, Copy, Users, Pencil, Trash2, Eye, MoreVertical, HelpCircle, Clock, Star, UserPlus2, FileQuestion } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { useAssignments, useAssignmentMutations, useExamQuestions } from "@/lib/data-hooks";
import { ASSIGNMENT_STATUS } from "@/lib/admin-options";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/admin/assignments/")({
  head: () => ({ meta: [{ title: "Ngân hàng bài kiểm tra — OnAir TMS" }] }),
  component: Page,
});

function Page() {
  const { data: rows = [], isLoading } = useAssignments();
  const { data: links = [] } = useExamQuestions();
  const m = useAssignmentMutations();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [delId, setDelId] = useState<string | null>(null);

  const filtered = useMemo(() =>
    rows.filter(r =>
      (status === "all" || r.status === status) &&
      (category === "all" || r.type === category) &&
      (!q || r.title.toLowerCase().includes(q.toLowerCase()) || r.code.toLowerCase().includes(q.toLowerCase()))
    ), [rows, q, status, category]);

  async function clone(id: string) {
    const src = rows.find(r => r.id === id);
    if (!src) return;
    await m.create.mutateAsync({
      title: `${src.title} (Bản sao)`, code: `${src.code}-COPY-${Date.now().toString().slice(-4)}`,
      description: src.description, type: src.type, deadline: src.deadline,
      total_questions: src.total_questions, total_points: src.total_points, pass_score: src.pass_score,
      time_limit_minutes: src.time_limit_minutes, max_attempts: src.max_attempts,
      shuffle_questions: src.shuffle_questions, shuffle_answers: src.shuffle_answers,
      show_results: src.show_results, status: "draft",
    });
    toast.success("Đã nhân bản bài kiểm tra");
  }

  return (
    <PageContainer
      title="Ngân hàng bài kiểm tra"
      breadcrumbs={[{ title: "Bài kiểm tra" }, { title: "Ngân hàng bài KT" }]}
    >
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div className="text-base font-semibold">Tổng bài kiểm tra ({filtered.length})</div>
        </div>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9 bg-background" placeholder="Tìm kiếm" value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Tất cả các lĩnh vực" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả các lĩnh vực</SelectItem>
              <SelectItem value="quiz">Trắc nghiệm</SelectItem>
              <SelectItem value="exam">Bài thi</SelectItem>
              <SelectItem value="homework">Bài tập</SelectItem>
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Đang sử dụng" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              {ASSIGNMENT_STATUS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="ml-auto">
            <Button onClick={() => nav({ to: "/admin/assignments/$id/editor", params: { id: "new" } })}>
              <Plus className="h-4 w-4" /> Tạo bài kiểm tra mới
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-sm text-muted-foreground">Đang tải...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">Chưa có bài kiểm tra nào</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map(r => {
              const qCount = links.filter(l => l.assignment_id === r.id).length || r.total_questions;
              return (
                <Card key={r.id} className="group flex flex-col overflow-hidden p-0 transition-shadow hover:shadow-md">
                  <Link to="/admin/assignments/$id" params={{ id: r.id }} className="relative flex h-32 items-center justify-center bg-blue-50">
                    <FileQuestion className="h-12 w-12 text-blue-400" />
                    <Link
                      to="/admin/assignments/$id/assign"
                      params={{ id: r.id }}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm hover:bg-muted"
                      title="Gán học viên"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <UserPlus2 className="h-4 w-4 text-blue-600" />
                    </Link>
                  </Link>
                  <div className="flex flex-1 flex-col p-4">
                    <div className="mb-1 flex items-start justify-between gap-2">
                      <Link to="/admin/assignments/$id" params={{ id: r.id }} className="line-clamp-1 font-semibold hover:text-primary">
                        {r.title}
                      </Link>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-7 w-7 -mr-1"><MoreVertical className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild><Link to="/admin/assignments/$id" params={{ id: r.id }}><Eye className="h-4 w-4" /> Xem chi tiết</Link></DropdownMenuItem>
                          <DropdownMenuItem asChild><Link to="/admin/assignments/$id/editor" params={{ id: r.id }}><Pencil className="h-4 w-4" /> Chỉnh sửa</Link></DropdownMenuItem>
                          <DropdownMenuItem onClick={() => clone(r.id)}><Copy className="h-4 w-4" /> Nhân bản</DropdownMenuItem>
                          <DropdownMenuItem asChild><Link to="/admin/assignments/$id/assign" params={{ id: r.id }}><Users className="h-4 w-4" /> Gán học viên</Link></DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => setDelId(r.id)}><Trash2 className="h-4 w-4" /> Xoá</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="mb-3 line-clamp-2 min-h-[2.5rem] text-sm text-muted-foreground">{r.description || "—"}</div>
                    <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><HelpCircle className="h-3.5 w-3.5" /> {qCount} câu</span>
                      <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {r.time_limit_minutes ? `${r.time_limit_minutes} phút` : "--"}</span>
                      <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5" /> {r.total_points}/{Math.max(r.total_points, 100)} điểm</span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      <ConfirmDelete open={!!delId} onOpenChange={v => !v && setDelId(null)} onConfirm={async () => { if (delId) { await m.remove.mutateAsync(delId); setDelId(null); } }} />
    </PageContainer>
  );
}

// keep unused legacy badge import resolved
void Badge;
