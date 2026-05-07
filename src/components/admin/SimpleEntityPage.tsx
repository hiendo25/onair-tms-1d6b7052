import { useMemo, useState, type ReactNode } from "react";
import { Plus, Search, Upload, Download } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { RowActions } from "@/components/admin/RowActions";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { ImportCsvDialog } from "@/components/admin/ImportCsvDialog";
import { exportCsv } from "@/lib/csv";

export type Field = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "number" | "select" | "date" | "switch";
  options?: { value: string; label: string }[];
  placeholder?: string;
};
export type Column<T> = { key: keyof T & string; label: string; render?: (row: T) => ReactNode };

export type FilterConfig = {
  key: string;
  placeholder: string;
  options: { value: string; label: string }[];
  match: (row: any, value: string) => boolean;
};

export function SimpleEntityPage<T extends { id: string; [k: string]: any }>(props: {
  title: string;
  breadcrumbs: { title: string }[];
  rows: T[];
  isLoading?: boolean;
  columns: Column<T>[];
  searchKeys: (keyof T & string)[];
  filters?: FilterConfig[];
  fields: Field[];
  emptyValues: Partial<T>;
  onCreate: (v: Partial<T>) => Promise<void> | void;
  onUpdate: (v: Partial<T> & { id: string }) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
  onBulkInsert?: (rows: Partial<T>[]) => Promise<void> | void;
  csvHeaders?: string[];
  csvFilename?: string;
}) {
  const [q, setQ] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>(
    Object.fromEntries((props.filters ?? []).map((f) => [f.key, "all"]))
  );
  const [editing, setEditing] = useState<Partial<T> | null>(null);
  const [delId, setDelId] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  const filtered = useMemo(() => props.rows.filter((row) => {
    if (q && !props.searchKeys.some((k) => String(row[k] ?? "").toLowerCase().includes(q.toLowerCase()))) return false;
    for (const f of props.filters ?? []) {
      const v = filterValues[f.key];
      if (v && v !== "all" && !f.match(row, v)) return false;
    }
    return true;
  }), [props.rows, q, filterValues, props.filters, props.searchKeys]);

  const save = async () => {
    if (!editing) return;
    if (editing.id) await props.onUpdate(editing as T);
    else await props.onCreate(editing);
    setEditing(null);
  };

  return (
    <PageContainer
      title={props.title}
      breadcrumbs={props.breadcrumbs}
      actions={
        <div className="flex gap-2">
          {props.onBulkInsert && <Button size="sm" variant="outline" onClick={() => setImporting(true)}><Upload className="h-4 w-4" />Import</Button>}
          <Button size="sm" variant="outline" onClick={() => {
            const headers = props.csvHeaders ?? props.fields.map((f) => f.key);
            const slim = props.rows.map((r) => Object.fromEntries(headers.map((h) => [h, (r as any)[h] ?? ""])));
            exportCsv(props.csvFilename ?? "export.csv", slim);
          }}><Download className="h-4 w-4" />Export</Button>
          <Button size="sm" onClick={() => setEditing(props.emptyValues)}><Plus className="h-4 w-4" />Thêm mới</Button>
        </div>
      }
    >
      <Card className="p-4">
        <div className="mb-4 flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Tìm kiếm..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          {(props.filters ?? []).map((f) => (
            <Select key={f.key} value={filterValues[f.key]} onValueChange={(v) => setFilterValues({ ...filterValues, [f.key]: v })}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder={f.placeholder} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{f.placeholder}</SelectItem>
                {f.options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          ))}
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              {props.columns.map((c) => <TableHead key={c.key}>{c.label}</TableHead>)}
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {props.isLoading && <TableRow><TableCell colSpan={props.columns.length + 1} className="text-center text-muted-foreground">Đang tải...</TableCell></TableRow>}
            {!props.isLoading && filtered.length === 0 && <TableRow><TableCell colSpan={props.columns.length + 1} className="text-center text-muted-foreground">Không có dữ liệu</TableCell></TableRow>}
            {filtered.map((row) => (
              <TableRow key={row.id}>
                {props.columns.map((c) => (
                  <TableCell key={c.key}>{c.render ? c.render(row) : (row[c.key] ?? "-")}</TableCell>
                ))}
                <TableCell><RowActions onEdit={() => setEditing(row)} onDelete={() => setDelId(row.id)} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? "Chỉnh sửa" : "Thêm mới"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="grid gap-3">
              {props.fields.map((f) => {
                const val = (editing as any)[f.key];
                const set = (v: any) => setEditing({ ...editing, [f.key]: v });
                return (
                  <div key={f.key} className="grid gap-1.5">
                    <Label>{f.label}</Label>
                    {f.type === "textarea" && <Textarea value={val ?? ""} onChange={(e) => set(e.target.value)} />}
                    {f.type === "number" && <Input type="number" value={val ?? 0} onChange={(e) => set(Number(e.target.value))} />}
                    {f.type === "select" && (
                      <Select value={String(val ?? "")} onValueChange={set}>
                        <SelectTrigger><SelectValue placeholder={f.placeholder} /></SelectTrigger>
                        <SelectContent>{f.options!.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                      </Select>
                    )}
                    {f.type === "date" && <Input type="date" value={val ?? ""} onChange={(e) => set(e.target.value)} />}
                    {(!f.type || f.type === "text") && <Input value={val ?? ""} onChange={(e) => set(e.target.value)} placeholder={f.placeholder} />}
                  </div>
                );
              })}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Huỷ</Button>
            <Button onClick={save}>Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDelete open={!!delId} onOpenChange={(v) => !v && setDelId(null)} onConfirm={async () => { if (delId) { await props.onDelete(delId); setDelId(null); } }} />

      {props.onBulkInsert && (
        <ImportCsvDialog
          open={importing} onOpenChange={setImporting}
          title="Import từ CSV"
          sampleHeaders={props.csvHeaders ?? props.fields.map((f) => f.key)}
          onImport={async (rows) => { await props.onBulkInsert!(rows as Partial<T>[]); }}
        />
      )}
    </PageContainer>
  );
}

export function StatusBadge({ value }: { value: string }) {
  const map: Record<string, string> = {
    active: "bg-emerald-500", published: "bg-emerald-500", upcoming: "bg-blue-500",
    draft: "bg-muted text-muted-foreground", inactive: "bg-muted text-muted-foreground",
    completed: "bg-purple-500",
  };
  const labels: Record<string, string> = {
    active: "Hoạt động", published: "Đã xuất bản", upcoming: "Sắp diễn ra",
    draft: "Nháp", inactive: "Ngưng", completed: "Hoàn thành",
  };
  return <Badge className={map[value] ?? "bg-muted text-muted-foreground"}>{labels[value] ?? value}</Badge>;
}
