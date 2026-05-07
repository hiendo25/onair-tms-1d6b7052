import { createFileRoute, Link } from "@tanstack/react-router";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_app/my-learning-paths/phase/$id")({
  head: () => ({ meta: [{ title: "Giai đoạn lộ trình — OnAir LMS" }] }),
  component: Phase,
});
function Phase() {
  const { id } = Route.useParams();
  return (
    <PageContainer title={`Giai đoạn ${id}: Cơ bản`} breadcrumbs={[{ title: "Lộ trình", path: "/my-learning-paths" }, { title: `Giai đoạn ${id}` }]}>
      <Card className="mb-4"><CardContent className="p-5">
        <div className="flex justify-between text-sm mb-2"><span>Tiến độ</span><span className="font-medium">2/5 lớp</span></div>
        <Progress value={40}/>
      </CardContent></Card>
      <div className="space-y-3">
        {Array.from({length:5}).map((_,i)=>(
          <Card key={i}><CardHeader><CardTitle className="text-base">Lớp {i+1}: Bài học #{i+1}</CardTitle></CardHeader>
            <CardContent className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">{i<2?"Đã hoàn thành":"Chưa bắt đầu"}</div>
              <Button size="sm" asChild><Link to="/my-learning-paths/learning-screen/$courseId" params={{courseId:String(i+1)}}>{i<2?"Xem lại":"Bắt đầu"}</Link></Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
