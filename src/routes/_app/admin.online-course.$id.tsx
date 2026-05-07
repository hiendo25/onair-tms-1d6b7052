import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { ArrowLeft, Pencil, Star, Users, Clock, BookOpen, PlayCircle, FileText, ClipboardList } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MOCK_COURSES } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/admin/online-course/$id")({
  loader: ({ params }) => {
    const course = MOCK_COURSES.find((c) => c.id === params.id);
    if (!course) throw notFound();
    return { course };
  },
  notFoundComponent: () => <PageContainer title="Không tìm thấy khoá học"><Button asChild variant="outline"><Link to="/admin/online-course"><ArrowLeft className="h-4 w-4" />Quay lại</Link></Button></PageContainer>,
  component: CourseDetail,
});

const SECTIONS = [
  { title: "Chương 1: Giới thiệu", lessons: [{ t: "Tổng quan khóa học", type: "video", d: "8 phút" }, { t: "Mục tiêu học tập", type: "doc", d: "5 phút" }] },
  { title: "Chương 2: Kiến thức nền tảng", lessons: [{ t: "Khái niệm cốt lõi", type: "video", d: "15 phút" }, { t: "Ví dụ thực tế", type: "video", d: "12 phút" }, { t: "Tài liệu tham khảo", type: "doc", d: "10 phút" }] },
  { title: "Chương 3: Thực hành", lessons: [{ t: "Bài tập 1", type: "quiz", d: "20 phút" }, { t: "Bài tập 2", type: "quiz", d: "25 phút" }] },
  { title: "Chương 4: Kiểm tra cuối khóa", lessons: [{ t: "Bài kiểm tra tổng hợp", type: "quiz", d: "45 phút" }] },
];

function CourseDetail() {
  const { course } = Route.useLoaderData();
  return (
    <PageContainer
      title={course.title}
      breadcrumbs={[{ title: "Khóa học", path: "/admin/online-course" }, { title: course.title }]}
      actions={<Button size="sm"><Pencil className="h-4 w-4" />Chỉnh sửa</Button>}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="overflow-hidden">
          <div className="h-48" style={{ background: course.cover }} />
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{course.code}</Badge>
              <Badge variant="outline">{course.level}</Badge>
              <Badge variant="outline">{course.category}</Badge>
            </div>
            <h2 className="mt-3 font-display text-2xl font-semibold">{course.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{course.description}</p>
            <div className="mt-4 flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Star className="h-4 w-4 fill-warning text-warning" />{course.rating}</span>
              <span className="flex items-center gap-1.5"><Users className="h-4 w-4" />{course.enrolled} học viên</span>
              <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{course.duration}</span>
              <span className="flex items-center gap-1.5"><BookOpen className="h-4 w-4" />{course.lessons} bài học</span>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Hành động nhanh</CardTitle></CardHeader>
            <CardContent className="grid gap-2">
              <Button className="w-full" variant="outline">Xuất bản khóa học</Button>
              <Button className="w-full" variant="outline">Gán cho lớp học</Button>
              <Button className="w-full" variant="outline">Sao chép khóa học</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Cài đặt</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <Row label="Thời lượng" value={course.duration} />
              <Row label="Số bài học" value={String(course.lessons)} />
              <Row label="Cấp độ" value={course.level} />
              <Row label="Danh mục" value={course.category} />
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="curriculum">
        <TabsList>
          <TabsTrigger value="curriculum">Nội dung khoá học</TabsTrigger>
          <TabsTrigger value="learners">Học viên</TabsTrigger>
          <TabsTrigger value="reviews">Đánh giá</TabsTrigger>
        </TabsList>
        <TabsContent value="curriculum">
          <Card>
            <CardContent className="p-2">
              <Accordion type="multiple" defaultValue={["s-0"]}>
                {SECTIONS.map((s, i) => (
                  <AccordionItem key={i} value={`s-${i}`}>
                    <AccordionTrigger className="px-4">
                      <div className="flex flex-1 items-center justify-between pr-4">
                        <span className="font-medium">{s.title}</span>
                        <span className="text-xs text-muted-foreground">{s.lessons.length} bài</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-2">
                      <div className="divide-y rounded-md border">
                        {s.lessons.map((l, li) => {
                          const Icon = l.type === "video" ? PlayCircle : l.type === "quiz" ? ClipboardList : FileText;
                          return (
                            <div key={li} className="flex items-center gap-3 p-3 text-sm">
                              <Icon className="h-4 w-4 text-primary" />
                              <span className="flex-1">{l.t}</span>
                              <span className="text-xs text-muted-foreground">{l.d}</span>
                            </div>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="learners"><Card><CardContent className="p-8 text-center text-muted-foreground">Danh sách học viên đăng ký khóa học.</CardContent></Card></TabsContent>
        <TabsContent value="reviews"><Card><CardContent className="p-8 text-center text-muted-foreground">Đánh giá từ học viên.</CardContent></Card></TabsContent>
      </Tabs>
    </PageContainer>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span>{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
