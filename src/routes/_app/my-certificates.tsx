import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Award, Download, Maximize2 } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_app/my-certificates")({
  head: () => ({ meta: [{ title: "Chứng nhận của tôi — OnAir TMS" }] }),
  component: Page,
});

type Issued = {
  id: string;
  certificate_id: string;
  certificate_title: string;
  recipient_name: string;
  issued_at: string;
  expires_at: string | null;
  status: string;
  template_snapshot: {
    title?: string;
    frame_url?: string;
    content?: {
      heading?: string;
      awarded_to_label?: string;
      description?: string;
      issue_date_label?: string;
      expire_date_label?: string;
    };
  };
};

const DEFAULT = {
  heading: "CHỨNG NHẬN HOÀN THÀNH",
  awarded_to_label: "Chứng nhận này được trao cho",
  description: "Hoàn thành xuất sắc chương trình",
  issue_date_label: "Ngày phát hành",
  expire_date_label: "Ngày hết hạn",
};

function Render({ cert, big = false }: { cert: Issued; big?: boolean }) {
  const c = { ...DEFAULT, ...(cert.template_snapshot?.content || {}) };
  const frame = cert.template_snapshot?.frame_url;
  const issued = new Date(cert.issued_at).toLocaleDateString("vi-VN");
  const expire = cert.expires_at ? new Date(cert.expires_at).toLocaleDateString("vi-VN") : "Vô thời hạn";
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md border bg-white">
      {frame ? (
        <img src={frame} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-2 border-2 border-amber-300/60 rounded" />
      )}
      <div className={`relative h-full flex flex-col items-center justify-center text-center ${big ? "px-10 py-6" : "px-3 py-2"}`}>
        <h3 className={`font-serif font-bold text-amber-700 ${big ? "text-3xl" : "text-[11px]"}`}>{c.heading}</h3>
        {big && <p className="text-xs italic text-slate-600 mt-2">{c.awarded_to_label}</p>}
        <p className={`font-serif italic text-slate-800 ${big ? "text-3xl my-3" : "text-sm my-1"}`}>{cert.recipient_name || "[Họ và tên]"}</p>
        {big && <p className="text-sm text-slate-600">{c.description}</p>}
        <div className={`mt-auto pt-2 flex w-full justify-between ${big ? "text-xs" : "text-[8px]"} text-slate-500`}>
          <div>{c.issue_date_label}: {issued}</div>
          <div>{c.expire_date_label}: {expire}</div>
        </div>
      </div>
    </div>
  );
}

function Page() {
  const { user } = useAuth();
  const [preview, setPreview] = useState<Issued | null>(null);
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["my-certificates", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_certificates")
        .select("*")
        .eq("user_id", user!.id)
        .order("issued_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as Issued[];
    },
  });

  function download(cert: Issued) {
    const url = cert.template_snapshot?.frame_url;
    if (!url) return;
    const a = document.createElement("a");
    a.href = url; a.download = `${cert.certificate_title}.png`; a.target = "_blank"; a.click();
  }

  return (
    <PageContainer title="Chứng nhận của tôi" breadcrumbs={[{ title: "Thư viện" }, { title: "Chứng nhận" }]}>
      {isLoading ? (
        <div className="text-sm text-muted-foreground py-8 text-center">Đang tải...</div>
      ) : rows.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          <Award className="h-10 w-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm">Bạn chưa có chứng nhận nào</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rows.map((c) => (
            <Card key={c.id} className="overflow-hidden p-3 space-y-2 hover:shadow-md transition">
              <Render cert={c} />
              <div>
                <div className="text-sm font-medium truncate">{c.certificate_title}</div>
                <div className="text-xs text-muted-foreground">Cấp ngày: {new Date(c.issued_at).toLocaleDateString("vi-VN")}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button size="sm" variant="outline" onClick={() => setPreview(c)}><Maximize2 className="h-3.5 w-3.5 mr-1" /> Xem</Button>
                <Button size="sm" onClick={() => download(c)}><Download className="h-3.5 w-3.5 mr-1" /> Tải</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!preview} onOpenChange={(v) => !v && setPreview(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>{preview?.certificate_title}</DialogTitle></DialogHeader>
          {preview && <Render cert={preview} big />}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
