import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Plus, Award, Pencil, Trash2 } from "lucide-react";
import { useCertificates, useCertificateMutations, type DBCertificate } from "@/lib/data-hooks";
import { PageContainer } from "@/components/PageContainer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EntityFormDialog, type FieldDef } from "@/components/admin/EntityFormDialog";
import { certificateSchema, type CertificateForm } from "@/lib/admin-schemas";
import { STATUS_ACTIVE_INACTIVE, CODE_NOTE } from "@/lib/admin-options";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/_app/admin/certificates")({
  head: () => ({ meta: [{ title: "Quản lý chứng nhận — OnAir TMS" }] }),
  component: Page,
});

const formFields: FieldDef<CertificateForm>[] = [
  { name: "title", label: "Tên chứng nhận", type: "text", required: true, placeholder: "VD: Chứng nhận hoàn thành" },
  { name: "code", label: "Mã chứng nhận", type: "text", required: true, note: CODE_NOTE },
  { name: "description", label: "Mô tả", type: "textarea", rows: 3 },
  { name: "valid_months", label: "Thời hạn hiệu lực (tháng)", type: "number", required: true, placeholder: "VD: 12" },
  { name: "status", label: "Trạng thái", type: "select", required: true, options: STATUS_ACTIVE_INACTIVE },
];

const empty: CertificateForm = {
  code: "", title: "", description: "", template_url: "", valid_months: 12, status: "active",
};

function CertificatePreview({ title }: { title: string }) {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-gradient-to-br from-amber-50 via-white to-amber-50 border-[3px] border-amber-200">
      <div className="absolute inset-2 border-2 border-amber-400/60 rounded-sm" />
      <div className="absolute inset-3 border border-amber-300 rounded-sm" />
      {/* corners */}
      <div className="absolute top-1 left-1 h-6 w-6 border-t-4 border-l-4 border-amber-500 rounded-tl" />
      <div className="absolute top-1 right-1 h-6 w-6 border-t-4 border-r-4 border-amber-500 rounded-tr" />
      <div className="absolute bottom-1 left-1 h-6 w-6 border-b-4 border-l-4 border-amber-500 rounded-bl" />
      <div className="absolute bottom-1 right-1 h-6 w-6 border-b-4 border-r-4 border-amber-500 rounded-br" />

      <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
        <Award className="h-7 w-7 text-amber-600 mb-1" />
        <div className="text-[9px] uppercase tracking-[0.2em] text-amber-700 font-semibold">Certificate</div>
        <div className="text-[10px] text-slate-500 mt-0.5">of Achievement</div>
        <div className="my-2 h-px w-16 bg-amber-400" />
        <div className="text-xs font-serif italic text-slate-700">[Họ và tên]</div>
        <div className="mt-1.5 text-[9px] text-slate-500 line-clamp-2">{title}</div>
      </div>
    </div>
  );
}

function Page() {
  const { data: rows = [], isLoading } = useCertificates();
  const m = useCertificateMutations();
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState<{ open: boolean; row?: DBCertificate }>({ open: false });
  const [confirmDel, setConfirmDel] = useState<DBCertificate | null>(null);

  const filtered = useMemo(
    () => rows.filter((r) => r.title.toLowerCase().includes(search.toLowerCase()) || r.code.toLowerCase().includes(search.toLowerCase())),
    [rows, search],
  );

  const handleSubmit = async (values: CertificateForm) => {
    const payload = { ...values, valid_months: Number(values.valid_months) || 12 };
    if (dialog.row) {
      await m.update.mutateAsync({ id: dialog.row.id, ...payload } as any);
    } else {
      await m.create.mutateAsync({ ...payload, issued_count: 0 } as any);
    }
    setDialog({ open: false });
  };

  return (
    <PageContainer
      title="Quản lý chứng nhận"
      breadcrumbs={[{ title: "Chứng nhận" }]}
      actions={
        <Button onClick={() => setDialog({ open: true })}>
          <Plus className="h-4 w-4 mr-2" /> Tạo mẫu chứng nhận
        </Button>
      }
    >
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Tìm kiếm" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground py-8 text-center">Đang tải...</div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          <Award className="h-10 w-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm">Chưa có mẫu chứng nhận</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((r) => (
            <Card key={r.id} className="overflow-hidden group hover:shadow-md transition cursor-pointer p-3 space-y-2"
              onClick={() => setDialog({ open: true, row: r })}>
              {r.template_url ? (
                <div className="aspect-[4/3] w-full overflow-hidden rounded-md bg-muted">
                  <img src={r.template_url} alt={r.title} className="h-full w-full object-cover" />
                </div>
              ) : (
                <CertificatePreview title={r.title} />
              )}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{r.title}</div>
                  <div className="text-xs text-muted-foreground truncate">{r.code}</div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                  <Button size="icon" variant="ghost" className="h-7 w-7"
                    onClick={(e) => { e.stopPropagation(); setDialog({ open: true, row: r }); }}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-red-600"
                    onClick={(e) => { e.stopPropagation(); setConfirmDel(r); }}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <EntityFormDialog<CertificateForm>
        open={dialog.open}
        onOpenChange={(v) => setDialog({ open: v, row: v ? dialog.row : undefined })}
        title={dialog.row ? "Sửa mẫu chứng nhận" : "Tạo mẫu chứng nhận"}
        schema={certificateSchema}
        fields={formFields}
        defaultValues={empty as any}
        initialValues={dialog.row as any}
        onSubmit={handleSubmit}
        submitting={m.create.isPending || m.update.isPending}
      />

      <AlertDialog open={!!confirmDel} onOpenChange={(v) => !v && setConfirmDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá mẫu chứng nhận?</AlertDialogTitle>
            <AlertDialogDescription>Hành động này không thể hoàn tác. "{confirmDel?.title}" sẽ bị xoá.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Huỷ</AlertDialogCancel>
            <AlertDialogAction onClick={async () => { if (confirmDel) { await m.remove.mutateAsync(confirmDel.id); setConfirmDel(null); } }}>
              Xoá
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
