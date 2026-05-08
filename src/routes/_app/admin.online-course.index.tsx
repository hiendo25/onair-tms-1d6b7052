import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useOnlineCourses, useOnlineCourseMutations, type DBOnlineCourse } from "@/lib/data-hooks";
import { RowActions } from "@/components/admin/RowActions";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { COURSE_STATUS } from "@/lib/admin-options";
import { exportCsv } from "@/lib/csv";
import { AiGenerateCourseButton } from "@/components/ai/AiGenerateCourseButton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/admin/online-course/")({
  head: () => ({ meta: [{ title: "Khoá học online — OnAir TMS" }] }),
  component: OnlineCoursePage,
});

const PAGE_SIZE = 10;

const statusLabel: Record<string, string> = {
  draft: "Nháp", published: "Đã xuất bản", unpublished: "Ngừng xuất bản",
};

function OnlineCoursePage() {
  const navigate = useNavigate();
  const { data: rows = [], isLoading } = useOnlineCourses();
  const m = useOnlineCourseMutations();

  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [delId, setDelId] = useState<string | null>(null);

  const cats = useMemo(
    () => Array.from(new Set(rows.map((r) => r.category).filter(Boolean))),
    [rows],
  );

  const filtered = useMemo(() => rows.filter((r) => {
    const m1 = !q || [r.title, r.code, r.author_name, r.category].some((x) => x?.toLowerCase().includes(q.toLowerCase()));
    return m1 && (category === "all" || r.category === category) && (status === "all" || r.status === status);
  }), [rows, q, category, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <PageContainer
      title="Danh sách khóa học"
      breadcrumbs={[{ title: "Quản lý khóa học" }, { title: "Danh sách khóa học" }]}
      actions={
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => exportCsv("online_courses.csv", rows)}><Download className="h-4 w-4" />Export</Button>
          <AiGenerateCourseButton />
          <Button size="sm" onClick={() => navigate({ to: "/admin/online-course/$id/editor", params: { id: "new" } })}>
            <Plus className="h-4 w-4" />Tạo khóa học
          </Button>
        </div>
      }
    >
      <Card className="p-4">
        <div className="mb-4 flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Tìm kiếm..." value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
          </div>
          <Select value={category} onValueChange={(v) => { setCategory(v); setPage(1); }}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Danh mục" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả danh mục</SelectItem>
              {cats.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              {COURSE_STATUS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">STT</TableHead>
              <TableHead>Tên khóa học</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Tác giả</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">Đang tải...</TableCell></TableRow>}
            {!isLoading && pageRows.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">Không có dữ liệu</TableCell></TableRow>}
            {pageRows.map((r, i) => (
              <TableRow key={r.id}>
                <TableCell className="text-muted-foreground">{(page - 1) * PAGE_SIZE + i + 1}</TableCell>
                <TableCell>
                  <Link to="/admin/online-course/$id" params={{ id: r.id }} className="font-medium hover:underline">{r.title}</Link>
                </TableCell>
                <TableCell>{r.category || "-"}</TableCell>
                <TableCell>
                  <Badge className={r.status === "published" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : r.status === "draft" ? "bg-slate-100 text-slate-700 hover:bg-slate-100" : "bg-orange-100 text-orange-700 hover:bg-orange-100"}>
                    {statusLabel[r.status] ?? r.status}
                  </Badge>
                </TableCell>
                <TableCell>{r.author_name || "-"}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {r.created_at ? new Date(r.created_at).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" }) : "-"}
                </TableCell>
                <TableCell>
                  <RowActions
                    onEdit={() => navigate({ to: "/admin/online-course/$id/editor", params: { id: r.id } })}
                    onDelete={() => setDelId(r.id)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filtered.length > PAGE_SIZE && (
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Hiển thị {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, filtered.length)} / {filtered.length}</span>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
              <span className="px-3">Trang {page}/{totalPages}</span>
              <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        )}
      </Card>

      <ConfirmDelete open={!!delId} onOpenChange={(v) => !v && setDelId(null)} onConfirm={async () => {
        if (!delId) return;
        // Block if used in classroom_courses or learning_path_stage_courses
        const [cc, lpsc] = await Promise.all([
          supabase.from("classroom_courses").select("id").eq("course_id", delId).limit(1),
          supabase.from("learning_path_stage_courses").select("id").eq("course_id", delId).limit(1),
        ]);
        if ((cc.data?.length ?? 0) > 0 || (lpsc.data?.length ?? 0) > 0) {
          toast.error("Khóa học đã được sử dụng, không thể xóa");
          setDelId(null);
          return;
        }
        await m.remove.mutateAsync(delId);
        setDelId(null);
      }} />
    </PageContainer>
  );
}
