import { createFileRoute } from "@tanstack/react-router";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_app/admin/surveys/$id/statistics")({
  head: () => ({ meta: [{ title: "Thống kê khảo sát — OnAir TMS" }] }),
  component: Stats,
});
function Stats() {
  const { id } = Route.useParams();
  return (
    <PageContainer title="Thống kê khảo sát" breadcrumbs={[{ title: "Khảo sát", path: "/admin/surveys" }, { title: `#${id}` }, { title: "Thống kê" }]}>
      <div className="grid gap-3 md:grid-cols-3 mb-4">
        {[["Phản hồi","128"],["Tỷ lệ","85%"],["Trung bình","4.2/5"]].map(([l,v])=>(
          <Card key={l}><CardContent className="p-4"><div className="text-xs text-muted-foreground">{l}</div><div className="text-lg font-semibold mt-1">{v}</div></CardContent></Card>
        ))}
      </div>
      <Card><CardHeader><CardTitle>Câu hỏi 1: Đánh giá khóa học?</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {[["Rất tốt",65],["Tốt",80],["Bình thường",30],["Chưa tốt",10]].map(([l,v])=>(
            <div key={l as string}><div className="flex justify-between text-sm mb-1"><span>{l}</span><span>{v as number}</span></div><Progress value={v as number}/></div>
          ))}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
