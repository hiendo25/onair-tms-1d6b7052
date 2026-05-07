import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, CheckCircle2, PlayCircle } from "lucide-react";

export const Route = createFileRoute("/_app/class-room/$slug/learning-screen/$courseId")({
  head: () => ({ meta: [{ title: "Học — OnAir LMS" }] }),
  component: LS,
});
function LS() {
  const { slug, courseId } = Route.useParams();
  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <aside className="w-80 border-r bg-card overflow-y-auto">
        <div className="p-4 border-b">
          <Button variant="ghost" size="sm" asChild className="mb-2"><Link to="/class-room/$slug" params={{slug}}><ChevronLeft className="h-4 w-4"/>Quay lại</Link></Button>
          <div className="font-semibold">React Cơ bản</div>
          <div className="text-xs text-muted-foreground">Khóa #{courseId}</div>
        </div>
        <div className="p-2 space-y-1">
          {[["Giới thiệu",true],["JSX",true],["Component",false],["Props & State",false],["Hooks",false]].map(([t,done],i)=>(
            <button key={i} className="w-full flex items-center gap-2 p-2 rounded hover:bg-muted text-left text-sm">
              {done ? <CheckCircle2 className="h-4 w-4 text-green-500"/> : <PlayCircle className="h-4 w-4 text-muted-foreground"/>}
              <span className={done?"text-muted-foreground":""}>{t as string}</span>
            </button>
          ))}
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-6">
        <Card><CardContent className="p-0 aspect-video bg-black flex items-center justify-center text-white">Video player</CardContent></Card>
        <h1 className="text-xl font-semibold mt-4">Bài học: Component</h1>
        <p className="text-sm text-muted-foreground mt-2">Mô tả bài học và tài liệu đính kèm.</p>
        <div className="flex justify-between mt-6">
          <Button variant="outline">Bài trước</Button>
          <Button>Đánh dấu hoàn thành</Button>
        </div>
      </main>
    </div>
  );
}
