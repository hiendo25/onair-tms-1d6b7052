import { createFileRoute, Link } from "@tanstack/react-router";
import { GraduationCap, X, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/class-room/cd/$slug/$sessionId")({
  head: () => ({ meta: [{ title: "Lớp học trực tiếp — OnAir LMS" }] }),
  component: KioskPage,
});

function KioskPage() {
  const { slug, sessionId } = Route.useParams();
  return (
    <div className="flex h-screen flex-col bg-slate-950 text-white">
      <header className="flex items-center justify-between border-b border-white/10 bg-slate-900/80 px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold">{slug} — Phiên #{sessionId}</div>
            <div className="text-xs text-white/60">Giảng viên: Trần Thị Mai</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-rose-500 hover:bg-rose-500">
            <span className="mr-1 h-1.5 w-1.5 animate-pulse rounded-full bg-white" />LIVE
          </Badge>
          <span className="flex items-center gap-1 text-xs text-white/70"><Users className="h-3.5 w-3.5" />28 / 30</span>
          <span className="flex items-center gap-1 text-xs text-white/70"><Clock className="h-3.5 w-3.5" />01:24:08</span>
          <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/10">
            <Link to="/dashboard"><X className="h-4 w-4" /></Link>
          </Button>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60">
            <GraduationCap className="h-16 w-16 text-white" />
          </div>
          <div className="mt-4 text-lg font-semibold">Đang phát trực tiếp</div>
          <div className="text-sm text-white/60">Buổi học sẽ bắt đầu khi giảng viên sẵn sàng</div>
        </div>
      </main>
    </div>
  );
}
