import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search, Shield, Users, Download } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRoles, useRoleMutations, type DBRole } from "@/lib/data-hooks";
import { RowActions } from "@/components/admin/RowActions";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { exportCsv } from "@/lib/csv";

export const Route = createFileRoute("/_app/admin/roles")({
  head: () => ({ meta: [{ title: "Vai trò & phân quyền — OnAir TMS" }] }),
  component: RolesPage,
});

const empty: Partial<DBRole> = { code: "", name: "", description: "", permissions: 0, users: 0 };

function RolesPage() {
  const { data: roles = [], isLoading } = useRoles();
  const { create, update, remove } = useRoleMutations();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Partial<DBRole> | null>(null);
  const [delId, setDelId] = useState<string | null>(null);

  const filtered = useMemo(() => roles.filter((r) =>
    !q || [r.name, r.code, r.description].some((x) => x?.toLowerCase().includes(q.toLowerCase()))
  ), [roles, q]);

  const save = async () => {
    if (!editing) return;
    if (editing.id) await update.mutateAsync(editing as DBRole);
    else await create.mutateAsync(editing);
    setEditing(null);
  };

  return (
    <PageContainer
      title="Vai trò & phân quyền"
      breadcrumbs={[{ title: "Quản lý tổ chức" }, { title: "Vai trò" }]}
      actions={
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => exportCsv("roles.csv", roles)}><Download className="h-4 w-4" />Export</Button>
          <Button size="sm" onClick={() => setEditing(empty)}><Plus className="h-4 w-4" />Tạo vai trò</Button>
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
                  <RowActions onEdit={() => setEditing(r)} onDelete={() => setDelId(r.id)} />
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

      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing?.id ? "Sửa vai trò" : "Tạo vai trò"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="grid gap-3">
              <div className="grid gap-1.5"><Label>Mã</Label><Input value={editing.code ?? ""} onChange={(e) => setEditing({ ...editing, code: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>Tên</Label><Input value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>Mô tả</Label><Textarea value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>Số quyền</Label><Input type="number" value={editing.permissions ?? 0} onChange={(e) => setEditing({ ...editing, permissions: Number(e.target.value) })} /></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Huỷ</Button>
            <Button onClick={save} disabled={create.isPending || update.isPending}>Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDelete open={!!delId} onOpenChange={(v) => !v && setDelId(null)} onConfirm={async () => { if (delId) { await remove.mutateAsync(delId); setDelId(null); } }} />
    </PageContainer>
  );
}
