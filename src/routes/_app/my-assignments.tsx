import { createFileRoute } from "@tanstack/react-router";
import { Clock, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const MY_ASSIGNMENTS = [
  { id: "1", title: "Bài KT cuối khóa Onboarding", duration: 45, due: "2026-05-12 23:59", status: "todo", score: null },
  { id: "2", title: "Quiz tuần 3 - Sales Excellence", duration: 20, due: "2026-05-08 18:00", status: "todo", score: null },
  { id: "3", title: "Bài tự luận - Lãnh đạo", duration: 90, due: "2026-04-30 23:59", status: "doing", score: null },
  { id: "4", title: "ATLĐ - Kiểm tra giữa kỳ", duration: 60, due: "2026-04-15", status: "done", score: 92 },
  { id: "5", title: "Excel - bài tập tổng hợp", duration: 60, due: "2026-04-02", status: "done", score: 78 },
];

export const Route = createFileRoute("/_app/my-assignments")({
  head: () => ({ meta: [{ title: "Bài kiểm tra của tôi — OnAir LMS" }] }),
  component: () => (
    <PageContainer
      title="Bài kiểm tra của tôi"
      breadcrumbs={[{ title: "Học tập" }, { title: "Bài kiểm tra" }]}
    >
      <Tabs defaultValue="todo">
        <TabsList>
          <TabsTrigger value="todo">Cần làm</TabsTrigger>
          <TabsTrigger value="doing">Đang làm</TabsTrigger>
          <TabsTrigger value="done">Đã hoàn thành</TabsTrigger>
        </TabsList>

        {(["todo", "doing", "done"] as const).map(s => (
          <TabsContent key={s} value={s}>
            <div className="space-y-3">
              {MY_ASSIGNMENTS.filter(a => a.status === s).map(a => (
                <Card key={a.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        a.status === "done" ? "bg-emerald-100 text-emerald-700" :
                        a.status === "doing" ? "bg-amber-100 text-amber-700" :
                        "bg-blue-100 text-blue-700"
                      }`}>
                        {a.status === "done" ? <CheckCircle2 className="h-5 w-5" /> :
                         a.status === "doing" ? <AlertCircle className="h-5 w-5" /> :
                         <FileText className="h-5 w-5" />}
                      </div>
                      <div>
                        <h3 className="font-medium">{a.title}</h3>
                        <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{a.duration} phút</span>
                          <span>Hạn: {a.due}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {a.score !== null && (
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">{a.score} điểm</Badge>
                      )}
                      <Button size="sm" variant={a.status === "done" ? "outline" : "default"}>
                        {a.status === "done" ? "Xem kết quả" : a.status === "doing" ? "Tiếp tục làm" : "Bắt đầu"}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              {MY_ASSIGNMENTS.filter(a => a.status === s).length === 0 && (
                <Card className="p-8 text-center text-sm text-muted-foreground">Không có bài kiểm tra nào.</Card>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </PageContainer>
  ),
});
