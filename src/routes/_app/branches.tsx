import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search, Upload, Download } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useBranches, useBranchMutations, type DBBranch } from "@/lib/data-hooks";
import { RowActions } from "@/components/admin/RowActions";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { ImportCsvDialog } from "@/components/admin/ImportCsvDialog";
import { exportCsv } from "@/lib/csv";

export const Route = createFileRoute("/_app/branches")({
  head: () => ({ meta: [{ title: "Chi nhánh — OnAir TMS" }] }),
  component: BranchesPage,
});

const empty: Partial<DBBranch> = { code: "", name: "", address: "", phone: "", manager: "", status: "active", employees: 0 };

function BranchesPage() {
  const { data: branches = [], isLoading } = useBranches();
  const { create, update, remove, bulkInsert } = useBranchMutations();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [editing, setEditing] = useState<Partial<DBBranch> | null>(null);
  const [delId, setDelId] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  const filtered = useMemo(() => branches.filter((b) => {
    const m = !q || [b.name, b.code, b.address, b.manager].some((x) => x?.toLowerCase().includes(q.toLowerCase()));
    const s = status === "all" || b.status === status;
    return m && s;
  }), [branches, q, status]);

  const save = async () => {
    if (!editing) return;
    if (editing.id) await update.mutateAsync(editing as DBBranch);
    else await create.mutateAsync(editing);
    setEditing(null);
  };

  return (
    <PageContainer
      title="Quản lý chi nhánh"
      breadcrumbs={[{ title: "Quản lý tổ chức" }, { title: "Chi nhánh" }]}
      actions={
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setImporting(true)}><Upload className="h-4 w-4" />Import</Button>
          <Button size="sm" variant="outline" onClick={() => exportCsv("branches.csv", branches)}><Download className="h-4 w-4" />Export</Button>
          <Button size="sm" onClick={() => setEditing(empty)}><Plus className="h-4 w-4" />Thêm chi nhánh</Button>
        </div>
      }
    >
      <Card className="p-4">
        <div className="mb-4 flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Tìm tên, mã, địa chỉ..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="active">Hoạt động</SelectItem>
              <SelectItem value="inactive">Ngưng</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên chi nhánh</TableHead>
              <TableHead>Mã</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Địa chỉ</TableHead>
              <TableHead>Quản lý</TableHead>
              <TableHead>NV</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">Đang tải...</TableCell></TableRow>}
            {!isLoading && filtered.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">Không có dữ liệu</TableCell></TableRow>}
            {filtered.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="font-medium">{b.name}</TableCell>
                <TableCell><Badge variant="outline">{b.code}</Badge></TableCell>
                <TableCell>
                  <Badge className={b.status === "active" ? "bg-emerald-500" : "bg-muted text-muted-foreground"}>
                    {b.status === "active" ? "Hoạt động" : "Ngưng"}
                  </Badge>
                </TableCell>
                <TableCell>{b.address || "-"}</TableCell>
                <TableCell>{b.manager || "-"}</TableCell>
                <TableCell>{b.employees}</TableCell>
                <TableCell><RowActions onEdit={() => setEditing(b)} onDelete={() => setDelId(b.id)} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing?.id ? "Sửa chi nhánh" : "Thêm chi nhánh"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="grid gap-3">
              {(["code", "name", "address", "phone", "manager"] as const).map((k) => (
                <div key={k} className="grid gap-1.5">
                  <Label className="capitalize">{k}</Label>
                  <Input value={(editing[k] as string) ?? ""} onChange={(e) => setEditing({ ...editing, [k]: e.target.value })} />
                </div>
              ))}
              <div className="grid gap-1.5">
                <Label>Trạng thái</Label>
                <Select value={editing.status ?? "active"} onValueChange={(v) => setEditing({ ...editing, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Hoạt động</SelectItem>
                    <SelectItem value="inactive">Ngưng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Huỷ</Button>
            <Button onClick={save} disabled={create.isPending || update.isPending}>Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDelete open={!!delId} onOpenChange={(v) => !v && setDelId(null)} onConfirm={async () => { if (delId) { await remove.mutateAsync(delId); setDelId(null); } }} />

      <ImportCsvDialog
        open={importing} onOpenChange={setImporting}
        title="Import chi nhánh từ CSV"
        sampleHeaders={["code", "name", "address", "phone", "manager", "status"]}
        onImport={async (rows) => {
          await bulkInsert.mutateAsync(rows.map((r) => ({
            code: r.code, name: r.name, address: r.address ?? "", phone: r.phone ?? "",
            manager: r.manager ?? "", status: r.status || "active", employees: Number(r.employees) || 0,
          })));
        }}
      />
    </PageContainer>
  );
}
