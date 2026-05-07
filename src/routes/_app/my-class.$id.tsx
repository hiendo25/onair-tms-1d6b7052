import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { ArrowLeft, PlayCircle, FileText, ClipboardList, CheckCircle2, Clock, Users, Calendar } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MOCK_CLASSROOMS } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/my-class/$id")({
  loader: ({ params }) => {
    const c = MOCK_CLASSROOMS.find((x) => x.id === params.id);
    if (!c) throw notFound();
    return { classroom: c };
  },
  notFoundComponent: () => <PageContainer title="Không tìm thấy lớp"><Button asChild variant="outline"><Link to="/my-class"><ArrowLeft className="h-4 w-4" />Quay lại</Link></Button></PageContainer>,
  component: MyClassDetail,
});

const LESSONS = [
  { t: "Buổi 1: Giới thiệu khoá học", type: "video", d: "12 phút", done: true },
  { t: "Buổi 2: Khái niệm cơ bản", type: "video", d: "25 phút", done: true },
  { t: "Tài liệu - Hướng dẫn thực hành", type: "doc", d: "10 phút", done: true },
  { t: "Buổi 3: Tình huống thực tế", type: "video", d: "30 phút", done: false },
  { t: "Quiz cuối chương 1", type: "quiz", d: "15 phút", done: false },
  { t: "Buổi 4: Bài tập nâng cao", type: "video", d: "28 phút", done: false },
];

function MyClassDetail() {
  const { classroom: c } = Route.useLoaderData();

  return (
    <PageContainer
      title={c.name}
      breadcrumbs={[{ title: "Lớp học của tôi", path: "/my-class" }, { title: c.name }]}
    >
      <Card className="overflow-hidden">
        <div className="h-44" style={{ background: c.cover }} />
        <CardContent className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Badge variant="secondary">{c.code}</Badge>
              <h2 className="mt-2 font-display text-2xl font-semibold">{c.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">Giảng viên: {c.teacher}</p>
              <div className="mt-4 flex flex-wrap gap-5 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />{c.startDate} → {c.endDate}</span>
                <span className="flex items-center gap-1.5"><Users className="h-4 w-4" />{c.students} học viên</span>
                <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{c.type === "online" ? "Trực tuyến" : c.type === "offline" ? "Trực tiếp" : "Kết hợp"}</span>
              </div>
            </div>
            <div className="text-center">
              <div className="font-display text-4xl font-semibold text-primary">{c.progress}%</div>
              <div className="mt-1 text-xs text-muted-foreground">Tiến độ của bạn</div>
              <Progress value={c.progress} className="mt-2 h-2 w-44" />
              <Button className="mt-3 w-full bg-gradient-vibrant">Tiếp tục học</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="lessons">
        <TabsList>
          <TabsTrigger value="lessons">Bài học</TabsTrigger>
          <TabsTrigger value="assignments">Bài kiểm tra</TabsTrigger>
          <TabsTrigger value="materials">Tài liệu</TabsTrigger>
          <TabsTrigger value="discussion">Thảo luận</TabsTrigger>
        </TabsList>

        <TabsContent value="lessons">
          <Card>
            <div className="divide-y">
              {LESSONS.map((l, i) => {
                const Icon = l.type === "video" ? PlayCircle : l.type === "quiz" ? ClipboardList : FileText;
                return (
                  <div key={i} className="flex items-center gap-4 p-4 hover:bg-muted/40">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${l.done ? "bg-success/15 text-success" : "bg-primary/10 text-primary"}`}>
                      {l.done ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{l.t}</div>
                      <div className="text-xs text-muted-foreground capitalize">{l.type === "video" ? "Video" : l.type === "quiz" ? "Bài kiểm tra" : "Tài liệu"} · {l.d}</div>
                    </div>
                    <Button variant={l.done ? "outline" : "default"} size="sm">{l.done ? "Xem lại" : "Bắt đầu"}</Button>
                  </div>
                );
              })}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="assignments">
          <Card>
            <div className="divide-y">
              {[
                { t: "Quiz tuần 1", status: "done", score: "85/100" },
                { t: "Quiz tuần 2", status: "due", score: null },
                { t: "Bài kiểm tra cuối khoá", status: "locked", score: null },
              ].map((a, i) => (
                <div key={i} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <ClipboardList className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium">{a.t}</div>
                      <div className="text-xs text-muted-foreground">{a.status === "done" ? `Đã nộp · ${a.score}` : a.status === "due" ? "Hạn: 30/04/2026" : "Chưa mở khóa"}</div>
                    </div>
                  </div>
                  <Button size="sm" variant={a.status === "done" ? "outline" : a.status === "due" ? "default" : "ghost"} disabled={a.status === "locked"} asChild={a.status === "due"}>
                    {a.status === "due" ? <Link to="/my-assignments/$id/submit" params={{ id: "1" }}>Làm bài</Link> : <span>{a.status === "done" ? "Xem kết quả" : "Khóa"}</span>}
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="materials"><Card><CardContent className="p-8 text-center text-muted-foreground">Tài liệu sẽ hiển thị tại đây.</CardContent></Card></TabsContent>
        <TabsContent value="discussion"><Card><CardContent className="p-8 text-center text-muted-foreground">Diễn đàn thảo luận của lớp.</CardContent></Card></TabsContent>
      </Tabs>
    </PageContainer>
  );
}
