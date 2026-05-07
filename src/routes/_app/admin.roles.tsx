import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search, Check, Minus, ChevronLeft, ChevronRight } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRoles, useRoleMutations, type DBRole } from "@/lib/data-hooks";
import { RowActions } from "@/components/admin/RowActions";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { EntityFormDialog, type FieldDef } from "@/components/admin/EntityFormDialog";
import { roleSchema, type RoleForm } from "@/lib/admin-schemas";
import { CODE_NOTE } from "@/lib/admin-options";

export const Route = createFileRoute("/_app/admin/roles")({
  head: () => ({ meta: [{ title: "Vai trò & phân quyền — OnAir TMS" }] }),
  component: RolesPage,
});

const PAGE_SIZE = 10;
const fields: FieldDef<RoleForm>[] = [
  { name: "name", label: "Tên vai trò", type: "text", required: true, placeholder: "VD: Quản trị viên" },
  { name: "code", label: "Mã vai trò", type: "text", required: true, placeholder: "VD: ADMIN", note: CODE_NOTE },
  { name: "description", label: "Mô tả", type: "textarea", placeholder: "Mô tả phạm vi & quyền hạn", rows: 3 },
  { name: "is_admin", label: "Quyền Quản trị viên", type: "switch", help: "Toàn quyền quản lý hệ thống" },
  { name: "is_instructor", label: "Quyền Giảng viên", type: "switch", help: "Tạo lớp, khoá học, bài kiểm tra" },
  { name: "is_student", label: "Quyền Học viên", type: "switch", help: "Tham gia lớp & học khoá học" },
];
const defaults: RoleForm = { code: "", name: "", description: "", is_admin: false, is_instructor: false, is_student: false };

function PermCell({ on }: { on: boolean }) {
  return on ? (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
      <Check className="h-3.5 w-3.5" />
    </span>
  ) : (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground">
      <Minus className="h-3.5 w-3.5" />
    </span>
  );
}

function RolesPage() {
  const { data: roles = [], isLoading } = useRoles();
  const { create, update, remove } = useRoleMutations();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<DBRole | null>(null);
  const [open, setOpen] = useState(false);
  const [delId, setDelId] = useState<string | null>(null);

  const filtered = useMemo(() => roles.filter((r) =>
    !q || [r.name, r.code, r.description].some((x) => x?.toLowerCase().includes(q.toLowerCase()))
  ), [roles, q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const submit = async (v: RoleForm) => {
    const permissions = [v.is_admin, v.is_instructor, v.is_student].filter(Boolean).length;
    if (editing?.id) await update.mutateAsync({ ...v, id: editing.id, users: editing.users, permissions } as DBRole);
    else await create.mutateAsync({ ...v, users: 0, permissions });
  };

  return (
    <PageContainer
      title="Vai trò & phân quyền"
      breadcrumbs={[{ title: "Quản lý tổ chức" }, { title: "Vai trò" }]}
      actions={
        <Button size="sm" onClick={() => { setEditing(null); setOpen(true); }}>
          <Plus className="h-4 w-4" />Tạo mới
        </Button>
      }
    >
      <Card className="p-4">
        <div className="mb-4 relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Tìm vai trò..." value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">STT</TableHead>
              <TableHead>Tên vai trò</TableHead>
              <TableHead>Mã</TableHead>
              <TableHead className="text-center">Quản trị viên</TableHead>
              <TableHead className="text-center">Giảng viên</TableHead>
              <TableHead className="text-center">Học viên</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">Đang tải...</TableCell></TableRow>}
            {!isLoading && pageRows.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">Không có dữ liệu</TableCell></TableRow>}
            {pageRows.map((r, i) => (
              <TableRow key={r.id}>
                <TableCell className="text-muted-foreground">{(page - 1) * PAGE_SIZE + i + 1}</TableCell>
                <TableCell>
                  <div className="font-medium">{r.name}</div>
                  {r.description && <div className="text-xs text-muted-foreground line-clamp-1">{r.description}</div>}
                </TableCell>
                <TableCell><Badge variant="outline" className="font-mono">{r.code}</Badge></TableCell>
                <TableCell className="text-center"><PermCell on={!!r.is_admin} /></TableCell>
                <TableCell className="text-center"><PermCell on={!!r.is_instructor} /></TableCell>
                <TableCell className="text-center"><PermCell on={!!r.is_student} /></TableCell>
                <TableCell><RowActions onEdit={() => { setEditing(r); setOpen(true); }} onDelete={() => setDelId(r.id)} /></TableCell>
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

      <EntityFormDialog<RoleForm>
        open={open} onOpenChange={setOpen}
        title={editing ? "Cập nhật vai trò" : "Tạo vai trò"}
        schema={roleSchema} fields={fields} defaultValues={defaults}
        initialValues={editing ? {
          code: editing.code, name: editing.name, description: editing.description,
          is_admin: !!editing.is_admin, is_instructor: !!editing.is_instructor, is_student: !!editing.is_student,
        } : undefined}
        onSubmit={submit} submitting={create.isPending || update.isPending}
      />

      <ConfirmDelete open={!!delId} onOpenChange={(v) => !v && setDelId(null)} onConfirm={async () => { if (delId) { await remove.mutateAsync(delId); setDelId(null); } }} />
    </PageContainer>
  );
}
