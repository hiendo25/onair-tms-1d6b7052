import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search, Download, ChevronLeft, ChevronRight, BookOpen, ExternalLink } from "lucide-react";
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
import { EntityFormDialog, type FieldDef } from "@/components/admin/EntityFormDialog";
import { courseSchema, type CourseForm } from "@/lib/admin-schemas";
import { COURSE_LEVEL, COURSE_STATUS, CODE_NOTE } from "@/lib/admin-options";
import { exportCsv } from "@/lib/csv";
import { AiGenerateCourseButton } from "@/components/ai/AiGenerateCourseButton";

export const Route = createFileRoute("/_app/admin/online-course")({
  head: () => ({ meta: [{ title: "Khoá học online — OnAir TMS" }] }),
  component: OnlineCoursePage,
});

const PAGE_SIZE = 10;
const empty: CourseForm = {
  code: "", title: "", description: "", category: "", level: "beginner",
  duration_minutes: 0, instructor: "", cover_url: "", is_required: false, status: "draft",
};

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
  const [editing, setEditing] = useState<DBOnlineCourse | null>(null);
  const [open, setOpen] = useState(false);
  const [delId, setDelId] = useState<string | null>(null);

  const cats = useMemo(
    () => Array.from(new Set(rows.map((r) => r.category).filter(Boolean))),
    [rows],
  );

  const fields: FieldDef<CourseForm>[] = useMemo(() => [
    { name: "title", label: "Tên khoá học", type: "text", required: true, placeholder: "Tối đa 200 ký tự" },
    { name: "code", label: "Mã khoá học", type: "text", required: true, placeholder: "VD: ONB-01", note: CODE_NOTE },
    { name: "cover_url", label: "Thumbnail (URL ảnh)", type: "url", placeholder: "https://..." },
    { name: "description", label: "Mô tả", type: "textarea", required: true, rows: 4, placeholder: "Mô tả mục tiêu và nội dung khoá học" },
    {
      name: "category", label: "Danh mục", type: "select", required: true, placeholder: "Chọn / nhập danh mục",
      options: cats.length ? cats.map((c) => ({ value: c, label: c })) : [{ value: "Chung", label: "Chung" }],
    },
    { name: "level", label: "Cấp độ", type: "select", required: true, options: COURSE_LEVEL },
    { name: "duration_minutes", label: "Thời lượng (phút)", type: "number" },
    { name: "instructor", label: "Giảng viên", type: "text" },
    { name: "is_required", label: "Khoá học bắt buộc", type: "switch", help: "Bắt buộc tất cả nhân viên hoàn thành" },
    { name: "status", label: "Trạng thái", type: "select", required: true, options: COURSE_STATUS },
  ], [cats]);

  const filtered = useMemo(() => rows.filter((r) => {
    const m1 = !q || [r.title, r.code, r.instructor, r.category].some((x) => x?.toLowerCase().includes(q.toLowerCase()));
    return m1 && (category === "all" || r.category === category) && (status === "all" || r.status === status);
  }), [rows, q, category, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const submit = async (v: CourseForm) => {
    if (editing?.id) await m.update.mutateAsync({ ...v, id: editing.id, students_count: editing.students_count, lessons_count: editing.lessons_count } as DBOnlineCourse);
    else await m.create.mutateAsync({ ...v, students_count: 0, lessons_count: 0 });
  };

  return (
    <PageContainer
      title="Quản lý khoá học online"
      breadcrumbs={[{ title: "Đào tạo" }, { title: "Khoá học online" }]}
      actions={
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => exportCsv("online_courses.csv", rows)}><Download className="h-4 w-4" />Export</Button>
          <Button size="sm" onClick={() => { setEditing(null); setOpen(true); }}><Plus className="h-4 w-4" />Tạo khoá học</Button>
        </div>
      }
    >
      <Card className="p-4">
        <div className="mb-4 flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Tìm khoá học, mã, giảng viên..." value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
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
              <TableHead>Tên khoá học</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead className="text-center">Số bài học</TableHead>
              <TableHead>Bắt buộc</TableHead>
              <TableHead>Trạng thái</TableHead>
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
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-14 overflow-hidden rounded bg-muted">
                      {r.cover_url ? <img src={r.cover_url} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-muted-foreground"><BookOpen className="h-4 w-4" /></div>}
                    </div>
                    <div>
                      <Link to="/admin/online-course/$id" params={{ id: r.id }} className="font-medium hover:underline">{r.title}</Link>
                      <div className="text-xs text-muted-foreground">{r.code}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{r.category || "-"}</TableCell>
                <TableCell className="text-center">{r.lessons_count}</TableCell>
                <TableCell>{r.is_required ? <Badge className="bg-amber-500">Bắt buộc</Badge> : <span className="text-muted-foreground">-</span>}</TableCell>
                <TableCell>
                  <Badge className={r.status === "published" ? "bg-emerald-500" : r.status === "draft" ? "bg-muted text-muted-foreground" : "bg-orange-500"}>
                    {statusLabel[r.status] ?? r.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" onClick={() => navigate({ to: "/admin/online-course/$id", params: { id: r.id } })} title="Chi tiết"><ExternalLink className="h-4 w-4" /></Button>
                    <RowActions onEdit={() => { setEditing(r); setOpen(true); }} onDelete={() => setDelId(r.id)} />
                  </div>
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

      <EntityFormDialog<CourseForm>
        open={open} onOpenChange={setOpen}
        title={editing ? "Cập nhật khoá học" : "Tạo khoá học"}
        schema={courseSchema} fields={fields} defaultValues={empty} size="lg"
        initialValues={editing ? {
          code: editing.code, title: editing.title, description: editing.description, category: editing.category,
          level: (editing.level as CourseForm["level"]) || "beginner", duration_minutes: editing.duration_minutes,
          instructor: editing.instructor, cover_url: editing.cover_url,
          is_required: !!editing.is_required, status: (editing.status as CourseForm["status"]) || "draft",
        } : undefined}
        onSubmit={submit} submitting={m.create.isPending || m.update.isPending}
      />

      <ConfirmDelete open={!!delId} onOpenChange={(v) => !v && setDelId(null)} onConfirm={async () => { if (delId) { await m.remove.mutateAsync(delId); setDelId(null); } }} />
    </PageContainer>
  );
}
