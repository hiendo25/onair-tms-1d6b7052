import { createFileRoute } from "@tanstack/react-router";
import { Award, Download } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCertificates } from "@/lib/data-hooks";

export const Route = createFileRoute("/_app/my-certificates")({
  head: () => ({ meta: [{ title: "Chứng nhận của tôi — OnAir TMS" }] }),
  component: Page,
});

function Page() {
  const { data: rows = [], isLoading } = useCertificates();
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
              {c.template_url ? (
                <div className="aspect-[4/3] w-full overflow-hidden rounded-md bg-muted">
                  <img src={c.template_url} alt={c.title} className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-gradient-to-br from-amber-50 via-white to-amber-50 border-[3px] border-amber-200">
                  <div className="absolute inset-2 border-2 border-amber-400/60 rounded-sm" />
                  <div className="absolute top-1 left-1 h-6 w-6 border-t-4 border-l-4 border-amber-500 rounded-tl" />
                  <div className="absolute top-1 right-1 h-6 w-6 border-t-4 border-r-4 border-amber-500 rounded-tr" />
                  <div className="absolute bottom-1 left-1 h-6 w-6 border-b-4 border-l-4 border-amber-500 rounded-bl" />
                  <div className="absolute bottom-1 right-1 h-6 w-6 border-b-4 border-r-4 border-amber-500 rounded-br" />
                  <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
                    <Award className="h-7 w-7 text-amber-600 mb-1" />
                    <div className="text-[9px] uppercase tracking-[0.2em] text-amber-700 font-semibold">Certificate</div>
                    <div className="my-2 h-px w-16 bg-amber-400" />
                    <div className="text-xs font-serif italic text-slate-700">[Họ và tên]</div>
                    <div className="mt-1 text-[9px] text-slate-500 line-clamp-2">{c.title}</div>
                  </div>
                </div>
              )}
              <div>
                <div className="text-sm font-medium truncate">{c.title}</div>
                <div className="text-xs text-muted-foreground truncate">{c.code}</div>
              </div>
              <Button size="sm" variant="outline" className="w-full">
                <Download className="h-3.5 w-3.5 mr-1.5" /> Tải xuống
              </Button>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
