import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Award, Search, Eye, Pencil, Trash2 } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MOCK_CERTIFICATES } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/admin/certificates")({
  head: () => ({ meta: [{ title: "Chứng nhận — OnAir LMS" }] }),
  component: () => (
    <PageContainer
      title="Quản lý chứng nhận"
      breadcrumbs={[{ title: "Chứng nhận" }]}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-[300px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Tìm kiếm" className="pl-9" />
        </div>
        <Button asChild size="sm">
          <Link to="/admin/certificates/create"><Plus className="h-4 w-4" />Tạo mẫu chứng nhận</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {MOCK_CERTIFICATES.map(c => (
          <Card key={c.id} className="group overflow-hidden p-0 transition-shadow hover:shadow-md">
            <div className="relative">
              <div className="relative flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-amber-50 to-amber-200">
                <div className="absolute inset-3 rounded border-2 border-amber-300/60" />
                <Award className="h-12 w-12 text-amber-600" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                <Button size="icon" variant="secondary" className="h-9 w-9 bg-white hover:bg-slate-100">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button asChild size="icon" variant="secondary" className="h-9 w-9 bg-white hover:bg-slate-100">
                  <Link to="/admin/certificates/edit/$id" params={{ id: c.id }}><Pencil className="h-4 w-4" /></Link>
                </Button>
                <Button size="icon" variant="secondary" className="h-9 w-9 bg-white text-red-600 hover:bg-slate-100">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-3">
              <h3 className="text-sm font-semibold leading-snug line-clamp-1">{c.name}</h3>
              <div className="mt-1 text-xs text-muted-foreground">Đã cấp: {c.issued}</div>
            </div>
          </Card>
        ))}
      </div>
    </PageContainer>
  ),
});
