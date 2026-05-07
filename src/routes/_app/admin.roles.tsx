import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search, Shield, Users, Download } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useRoles, useRoleMutations, type DBRole } from "@/lib/data-hooks";
import { RowActions } from "@/components/admin/RowActions";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { EntityFormDialog, type FieldDef } from "@/components/admin/EntityFormDialog";
import { roleSchema, type RoleForm } from "@/lib/admin-schemas";
import { CODE_NOTE } from "@/lib/admin-options";
import { exportCsv } from "@/lib/csv";

export const Route = createFileRoute("/_app/admin/roles")({
  head: () => ({ meta: [{ title: "Vai trò & phân quyền — OnAir TMS" }] }),
  component: RolesPage,
});

const fields: FieldDef<RoleForm>[] = [
  { name: "name", label: "Tên vai trò", type: "text", required: true, placeholder: "VD: Quản trị viên" },
  { name: "code", label: "Mã vai trò", type: "text", required: true, placeholder: "VD: ADMIN", note: CODE_NOTE },
  { name: "description", label: "Mô tả", type: "textarea", placeholder: "Mô tả phạm vi & quyền hạn", rows: 3 },
  { name: "permissions", label: "Số quyền", type: "number", required: true, placeholder: "0" },
];
const defaults: RoleForm = { code: "", name: "", description: "", permissions: 0 };

function RolesPage() {
  const { data: roles = [], isLoading } = useRoles();
  const { create, update, remove } = useRoleMutations();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<DBRole | null>(null);
  const [open, setOpen] = useState(false);
  const [delId, setDelId] = useState<string | null>(null);

  const filtered = useMemo(() => roles.filter((r) =>
    !q || [r.name, r.code, r.description].some((x) => x?.toLowerCase().includes(q.toLowerCase()))
  ), [roles, q]);

  const submit = async (v: RoleForm) => {
    if (editing?.id) await update.mutateAsync({ ...v, id: editing.id, users: editing.users } as DBRole);
    else await create.mutateAsync({ ...v, users: 0 });
  };

  return (
    <PageContainer
      title="Vai trò & phân quyền"
      breadcrumbs={[{ title: "Quản lý tổ chức" }, { title: "Vai trò" }]}
      actions={
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => exportCsv("roles.csv", roles)}><Download className="h-4 w-4" />Export</Button>
          <Button size="sm" onClick={() => { setEditing(null); setOpen(true); }}><Plus className="h-4 w-4" />Tạo vai trò</Button>
        </div>
      }
    >
      <div className="mb-4 relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Tìm vai trò..." value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {isLoading && <p className="text-muted-foreground">Đang tải...</p>}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((r) => (
          <Card key={r.id} className="transition-shadow hover:shadow-md">
            <CardContent className="space-y-3 p-5">
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Shield className="h-5 w-5" />
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="font-mono text-[10px]">{r.code}</Badge>
                  <RowActions onEdit={() => { setEditing(r); setOpen(true); }} onDelete={() => setDelId(r.id)} />
                </div>
              </div>
              <div>
                <h3 className="font-semibold">{r.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{r.description}</p>
              </div>
              <div className="flex items-center justify-between border-t pt-3 text-xs">
                <span className="text-muted-foreground">{r.permissions} quyền</span>
                <span className="flex items-center gap-1 text-muted-foreground"><Users className="h-3.5 w-3.5" />{r.users.toLocaleString("vi-VN")} người</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <EntityFormDialog<RoleForm>
        open={open} onOpenChange={setOpen}
        title={editing ? "Sửa vai trò" : "Tạo vai trò"}
        schema={roleSchema} fields={fields} defaultValues={defaults}
        initialValues={editing ? { code: editing.code, name: editing.name, description: editing.description, permissions: editing.permissions } : undefined}
        onSubmit={submit} submitting={create.isPending || update.isPending}
      />

      <ConfirmDelete open={!!delId} onOpenChange={(v) => !v && setDelId(null)} onConfirm={async () => { if (delId) { await remove.mutateAsync(delId); setDelId(null); } }} />
    </PageContainer>
  );
}
