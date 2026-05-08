import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Plus, Award, Pencil, Trash2, Maximize2, Download } from "lucide-react";
import { useCertificates, useCertificateMutations, type DBCertificate, type CertificateContent } from "@/lib/data-hooks";
import { PageContainer } from "@/components/PageContainer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/admin/certificates")({
  head: () => ({ meta: [{ title: "Quản lý chứng nhận — OnAir TMS" }] }),
  component: Page,
});

const DEFAULT_CONTENT: CertificateContent = {
  heading: "CHỨNG NHẬN HOÀN THÀNH",
  awarded_to_label: "Chứng nhận này được trao cho",
  description: "Hoàn thành xuất sắc chương trình",
  issue_date_label: "Ngày phát hành",
  expire_date_label: "Ngày hết hạn",
};

function CertCard({ cert, big = false }: { cert: DBCertificate; big?: boolean }) {
  const c = { ...DEFAULT_CONTENT, ...(cert.content || {}) };
  return (
    <div className={`relative w-full overflow-hidden rounded-md border bg-white ${big ? "aspect-[4/3]" : "aspect-[4/3]"}`}>
      {cert.frame_url ? (
        <img src={cert.frame_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-2 border-2 border-amber-300/60 rounded" />
      )}
      <div className={`relative h-full flex flex-col items-center justify-center text-center ${big ? "px-10 py-6" : "px-3 py-2"}`}>
        <div className={`uppercase tracking-wider text-slate-500 ${big ? "text-xs mb-1" : "text-[7px]"}`}>[Tổ chức]</div>
        <h3 className={`font-serif font-bold text-amber-700 ${big ? "text-3xl" : "text-[11px]"}`}>{c.heading}</h3>
        {big && <p className="text-xs italic text-slate-600 mt-2">{c.awarded_to_label}</p>}
        <p className={`font-serif italic text-slate-800 ${big ? "text-3xl my-3" : "text-[10px] my-1"}`}>[Họ và tên]</p>
        {big && <p className="text-sm text-slate-600">{c.description}</p>}
        <div className={`inline-block rounded bg-amber-700 text-white ${big ? "px-3 py-1 text-xs mt-2" : "px-1 py-0.5 text-[7px] mt-0.5"}`}>[Tên lớp học]</div>
      </div>
    </div>
  );
}

function Page() {
  const { data: rows = [], isLoading } = useCertificates();
  const m = useCertificateMutations();
  const nav = useNavigate();
  const [search, setSearch] = useState("");
  const [preview, setPreview] = useState<DBCertificate | null>(null);
  const [confirmDel, setConfirmDel] = useState<DBCertificate | null>(null);

  const filtered = useMemo(
    () => rows.filter((r) => r.title.toLowerCase().includes(search.toLowerCase())),
    [rows, search],
  );

  function download(cert: DBCertificate) {
    if (cert.frame_url) {
      const a = document.createElement("a");
      a.href = cert.frame_url; a.download = `${cert.title}.png`; a.target = "_blank";
      a.click();
    } else {
      toast.info("Mẫu chưa có ảnh khung để tải");
    }
  }

  return (
    <PageContainer
      title="Chứng nhận"
      breadcrumbs={[{ title: "Thi đua & xếp hạng" }, { title: "Chứng nhận" }]}
      actions={
        <Button asChild>
          <Link to="/admin/certificates/edit/$id" params={{ id: "new" }}>
            <Plus className="h-4 w-4 mr-2" /> Tạo mẫu chứng nhận
          </Link>
        </Button>
      }
    >
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Tìm kiếm" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 rounded-full" />
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
            <Card key={r.id} className="overflow-hidden group p-3 space-y-2">
              <div className="relative">
                <CertCard cert={r} />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5">
                  <Button size="icon" variant="secondary" className="h-8 w-8" title="Xem phóng to" onClick={() => setPreview(r)}><Maximize2 className="h-4 w-4" /></Button>
                  <Button size="icon" variant="secondary" className="h-8 w-8" title="Tải về" onClick={() => download(r)}><Download className="h-4 w-4" /></Button>
                  <Button size="icon" variant="secondary" className="h-8 w-8" title="Chỉnh sửa" onClick={() => nav({ to: "/admin/certificates/edit/$id", params: { id: r.id } })}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="destructive" className="h-8 w-8" title="Xoá" onClick={() => setConfirmDel(r)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
              <div className="text-sm font-medium text-center truncate">{r.title}</div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!preview} onOpenChange={(v) => !v && setPreview(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>{preview?.title}</DialogTitle></DialogHeader>
          {preview && <CertCard cert={preview} big />}
        </DialogContent>
      </Dialog>

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
