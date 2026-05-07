import { createFileRoute, Link } from "@tanstack/react-router";
import { GraduationCap, X, Volume2, Maximize, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/class-room/cd")({
  head: () => ({ meta: [{ title: "Lớp học trực tiếp — OnAir LMS" }] }),
  component: () => (
    <div className="flex h-screen flex-col bg-slate-950 text-white">
      <header className="flex items-center justify-between border-b border-white/10 bg-slate-900/80 px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold">Onboarding nhân viên Q4/2026 — Buổi 8</div>
            <div className="text-xs text-white/60">Giảng viên: Trần Thị Bích</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-rose-500 hover:bg-rose-500"><span className="mr-1 h-1.5 w-1.5 animate-pulse rounded-full bg-white" />LIVE</Badge>
          <span className="flex items-center gap-1 text-xs text-white/70"><Users className="h-3.5 w-3.5" />28 / 30</span>
          <span className="flex items-center gap-1 text-xs text-white/70"><Clock className="h-3.5 w-3.5" />01:24:08</span>
          <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/10">
            <Link to="/dashboard"><X className="h-4 w-4" /></Link>
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <main className="relative flex flex-1 items-center justify-center bg-slate-900">
          <div className="text-center">
            <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60">
              <GraduationCap className="h-16 w-16 text-white" />
            </div>
            <div className="mt-4 text-lg font-medium">Trần Thị Bích</div>
            <div className="text-sm text-white/60">Đang chia sẻ màn hình…</div>
          </div>
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-slate-800/90 px-4 py-2 backdrop-blur">
            <Button variant="ghost" size="icon" className="h-9 w-9 text-white hover:bg-white/10"><Volume2 className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-white hover:bg-white/10"><Maximize className="h-4 w-4" /></Button>
            <Button variant="destructive" size="sm">Rời phòng</Button>
          </div>
        </main>

        <aside className="w-72 border-l border-white/10 bg-slate-900/60 p-4">
          <div className="text-xs uppercase text-white/50">Chat</div>
          <div className="mt-3 space-y-3 text-sm">
            <div><div className="text-xs text-white/50">Bích (GV)</div><div>Chào cả lớp, mình bắt đầu nhé!</div></div>
            <div><div className="text-xs text-white/50">Hà</div><div>Em đã sẵn sàng ạ</div></div>
            <div><div className="text-xs text-white/50">Cường</div><div>Slide có gửi lại không cô?</div></div>
          </div>
        </aside>
      </div>
    </div>
  ),
});
