import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { aiWriteCourseDescription } from "@/lib/ai-mock";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/admin/online-course/$id/edit")({
  head: () => ({ meta: [{ title: "Chỉnh sửa môn học — OnAir TMS" }] }),
  component: EditCourse,
});

function EditCourse() {
  const { id } = Route.useParams();
  const [name, setName] = useState("React Cơ bản");
  const [description, setDescription] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  async function writeDesc() {
    if (!name.trim()) {
      toast.error("Vui lòng nhập tên môn trước");
      return;
    }
    setAiLoading(true);
    try {
      const text = await aiWriteCourseDescription(name);
      setDescription(text);
      toast.success("AI đã soạn xong mô tả");
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <PageContainer title="Chỉnh sửa môn học" breadcrumbs={[{ title: "Môn học", path: "/admin/online-course" }, { title: `#${id}` }, { title: "Sửa" }]}>
      <Card><CardHeader><CardTitle>Thông tin</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div><Label>Tên môn</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><Label>Slug</Label><Input defaultValue="react-co-ban" /></div>
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-1.5">
              <Label>Mô tả</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={writeDesc}
                disabled={aiLoading}
                className="border-violet-300 text-violet-700 hover:bg-violet-50"
              >
                <Sparkles className={`h-3.5 w-3.5 mr-1 ${aiLoading ? "animate-pulse" : ""}`} />
                {aiLoading ? "Để mình xem qua nhé..." : "Giúp tôi viết mô tả"}
              </Button>
            </div>
            <Textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả khóa học..."
            />
          </div>
          <div className="md:col-span-2 flex justify-end gap-2"><Button variant="outline">Hủy</Button><Button>Lưu</Button></div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
