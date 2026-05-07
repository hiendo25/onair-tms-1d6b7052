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
import { useBranches, useBranchMutations, type DBBranch } from "@/lib/data-hooks";
import { RowActions } from "@/components/admin/RowActions";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { ImportCsvDialog } from "@/components/admin/ImportCsvDialog";
import { EntityFormDialog, type FieldDef } from "@/components/admin/EntityFormDialog";
import { branchSchema, type BranchForm } from "@/lib/admin-schemas";
import { STATUS_ACTIVE_INACTIVE, CODE_NOTE } from "@/lib/admin-options";
import { exportCsv } from "@/lib/csv";

export const Route = createFileRoute("/_app/branches")({
  head: () => ({ meta: [{ title: "Chi nhánh — OnAir TMS" }] }),
  component: BranchesPage,
});

const fields: FieldDef<BranchForm>[] = [
  { name: "name", label: "Tên chi nhánh", type: "text", required: true, placeholder: "Tên chi nhánh" },
  { name: "code", label: "Mã chi nhánh", type: "text", required: true, placeholder: "VD: HCM-01", note: CODE_NOTE },
  { name: "manager", label: "Người quản lý", type: "text", placeholder: "Họ tên người quản lý" },
  { name: "phone", label: "Số điện thoại", type: "tel", placeholder: "VD: 0901234567" },
  { name: "address", label: "Địa chỉ", type: "textarea", placeholder: "Địa chỉ chi nhánh", rows: 2 },
  { name: "status", label: "Trạng thái", type: "select", required: true, options: STATUS_ACTIVE_INACTIVE },
];
const defaults: BranchForm = { code: "", name: "", manager: "", phone: "", address: "", status: "active" };

function BranchesPage() {
  const { data: branches = [], isLoading } = useBranches();
  const { create, update, remove, bulkInsert } = useBranchMutations();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [editing, setEditing] = useState<DBBranch | null>(null);
  const [open, setOpen] = useState(false);
  const [delId, setDelId] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  const filtered = useMemo(() => branches.filter((b) => {
    const m = !q || [b.name, b.code, b.address, b.manager].some((x) => x?.toLowerCase().includes(q.toLowerCase()));
    const s = status === "all" || b.status === status;
    return m && s;
  }), [branches, q, status]);

  const submit = async (v: BranchForm) => {
    if (editing?.id) await update.mutateAsync({ ...v, id: editing.id, employees: editing.employees } as DBBranch);
    else await create.mutateAsync({ ...v, employees: 0 });
  };

  return (
    <PageContainer
      title="Quản lý chi nhánh"
      breadcrumbs={[{ title: "Quản lý tổ chức" }, { title: "Chi nhánh" }]}
      actions={
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setImporting(true)}><Upload className="h-4 w-4" />Import</Button>
          <Button size="sm" variant="outline" onClick={() => exportCsv("branches.csv", branches)}><Download className="h-4 w-4" />Export</Button>
          <Button size="sm" onClick={() => { setEditing(null); setOpen(true); }}><Plus className="h-4 w-4" />Thêm chi nhánh</Button>
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
              <SelectItem value="inactive">Ngưng hoạt động</SelectItem>
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
                    {b.status === "active" ? "Hoạt động" : "Ngưng hoạt động"}
                  </Badge>
                </TableCell>
                <TableCell>{b.address || "-"}</TableCell>
                <TableCell>{b.manager || "-"}</TableCell>
                <TableCell>{b.employees}</TableCell>
                <TableCell><RowActions onEdit={() => { setEditing(b); setOpen(true); }} onDelete={() => setDelId(b.id)} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <EntityFormDialog<BranchForm>
        open={open} onOpenChange={setOpen}
        title={editing ? "Sửa chi nhánh" : "Thêm chi nhánh"}
        schema={branchSchema} fields={fields} defaultValues={defaults}
        initialValues={editing ? { code: editing.code, name: editing.name, address: editing.address, phone: editing.phone, manager: editing.manager, status: editing.status as "active" | "inactive" } : undefined}
        onSubmit={submit} submitting={create.isPending || update.isPending}
      />

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
