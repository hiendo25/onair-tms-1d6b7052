import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, PlayCircle } from "lucide-react";

export const Route = createFileRoute("/_app/my-learning-paths/learning-screen/$courseId")({
  head: () => ({ meta: [{ title: "Học lộ trình — OnAir LMS" }] }),
  component: LS,
});
function LS() {
  const { courseId } = Route.useParams();
  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <aside className="w-80 border-r bg-card overflow-y-auto p-3">
        <div className="font-semibold mb-2">Khóa #{courseId}</div>
        {[["Bài 1",true],["Bài 2",false],["Bài 3",false]].map(([t,done],i)=>(
          <button key={i} className="w-full flex items-center gap-2 p-2 rounded hover:bg-muted text-left text-sm">
            {done? <CheckCircle2 className="h-4 w-4 text-green-500"/>:<PlayCircle className="h-4 w-4"/>}{t as string}
          </button>
        ))}
      </aside>
      <main className="flex-1 p-6"><Card><CardContent className="aspect-video bg-black p-0 flex items-center justify-center text-white">Video</CardContent></Card>
        <div className="mt-4 flex justify-between"><Button variant="outline">Trước</Button><Button>Hoàn thành</Button></div>
      </main>
    </div>
  );
}
