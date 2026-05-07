import { createFileRoute } from "@tanstack/react-router";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_app/admin/assignments/$id/submit/$employeeId")({
  head: () => ({ meta: [{ title: "Nộp bài KT — OnAir LMS" }] }),
  component: Submit,
});
function Submit() {
  const { id, employeeId } = Route.useParams();
  return (
    <PageContainer title="Nộp bài kiểm tra" breadcrumbs={[{ title: "Bài kiểm tra", path: "/admin/assignments" }, { title: `#${id}` }, { title: `HV ${employeeId}` }]}>
      <Card><CardHeader><CardTitle>Câu hỏi</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {Array.from({length:3}).map((_,i)=>(
            <div key={i} className="space-y-2"><div className="font-medium">Câu {i+1}: ?</div><Textarea rows={3} /></div>
          ))}
          <div className="flex justify-end"><Button>Nộp bài</Button></div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
