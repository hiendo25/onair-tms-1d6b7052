import { createFileRoute } from "@tanstack/react-router";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_app/admin/surveys/$id/submissions")({
  head: () => ({ meta: [{ title: "Trả lời khảo sát — OnAir TMS" }] }),
  component: Submission,
});
function Submission() {
  const { id } = Route.useParams();
  return (
    <PageContainer title="Trả lời khảo sát" breadcrumbs={[{ title: "Khảo sát", path: "/admin/surveys" }, { title: `#${id}` }, { title: "Trả lời" }]}>
      <Card><CardHeader><CardTitle>Khảo sát đầu khóa</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <div><Label className="font-medium">1. Bạn đánh giá khóa học?</Label>
            <RadioGroup className="mt-2">{["Rất tốt","Tốt","Bình thường"].map(o=>(
              <div key={o} className="flex items-center gap-2"><RadioGroupItem value={o} id={o}/><Label htmlFor={o}>{o}</Label></div>
            ))}</RadioGroup>
          </div>
          <div><Label className="font-medium">2. Góp ý thêm</Label><Textarea className="mt-2" rows={4}/></div>
          <div className="flex justify-end"><Button>Gửi</Button></div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
